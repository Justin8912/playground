/**
 * Data Extraction Service
 * 
 * Provides functionality for parsing note content, extracting links,
 * and cleaning text for optimal LLM processing.
 */
import { NoteInfo } from '../reviewNotes/types';
import * as DataApi from '../reviewNotes/dataApi';

/**
 * Represents the different types of extracted content
 */
export interface ExtractedContent {
  cleanText: string;         // The cleaned text content
  internalLinks: LinkInfo[]; // Internal Joplin links
  externalLinks: LinkInfo[]; // External web links
  tags: string[];            // Note tags
}

/**
 * Represents a link extracted from note content
 */
export interface LinkInfo {
  text: string;  // The link text/description
  url: string;   // The link URL/target
  isJoplinLink: boolean; // Whether this is an internal Joplin link
  noteId?: string; // For Joplin links, the target note ID
}

/**
 * Regular expressions for parsing different link types
 */
const JOPLIN_LINK_REGEX = /\[(.*?)\]\(:\/([a-zA-Z0-9]+)\)/g; // [text](:/noteId)
const JOPLIN_ANCHOR_REGEX = /\[(.*?)\]\(#([a-zA-Z0-9]+)\)/g; // [text](#anchor)
const EXTERNAL_LINK_REGEX = /\[(.*?)\]\(((?:https?|ftp):\/\/[^\s)]+)\)/g; // [text](https://example.com)
const BARE_URL_REGEX = /((?:https?|ftp):\/\/[^\s\])"'><]+)/g; // https://example.com

/**
 * Process a note and extract clean text, links, and other relevant information.
 * 
 * @param note The note to process
 * @returns Extracted content including clean text and links
 */
export const extractContent = async (note: NoteInfo): Promise<ExtractedContent> => {
  // Get the full note content if needed
  const noteContent = note.body || '';
  
  // Extract links from content
  const internalLinks = extractInternalLinks(noteContent);
  const externalLinks = extractExternalLinks(noteContent);
  
  // Get clean text with formatting removed
  const cleanText = cleanNoteContent(noteContent);
  
  return {
    cleanText,
    internalLinks,
    externalLinks,
    tags: note.tags || []
  };
};

/**
 * Extract internal Joplin links from note content.
 * This only extracts links to other notes ([text](:/noteId) format)
 * and ignores anchor links within the same note ([text](#anchor) format).
 * 
 * @param content The note content to parse
 * @returns Array of internal link information
 */
export const extractInternalLinks = (content: string): LinkInfo[] => {
  const links: LinkInfo[] = [];
  
  // Extract [text](:/noteId) format links
  let match;
  while ((match = JOPLIN_LINK_REGEX.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: `://${match[2]}`,
      isJoplinLink: true,
      noteId: match[2]
    });
  }
  
  // Reset regex lastIndex
  JOPLIN_LINK_REGEX.lastIndex = 0;
  
  // Note: We intentionally skip [text](#anchor) format links
  // as these are anchors within the same note and not relevant for LLM processing
  
  return links;
};

/**
 * Extract external web links from note content.
 * 
 * @param content The note content to parse
 * @returns Array of external link information
 */
export const extractExternalLinks = (content: string): LinkInfo[] => {
  const links: LinkInfo[] = [];
  
  // Extract [text](https://example.com) format links
  let match;
  while ((match = EXTERNAL_LINK_REGEX.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
      isJoplinLink: false
    });
  }
  
  // Reset regex lastIndex
  EXTERNAL_LINK_REGEX.lastIndex = 0;
  
  // Extract bare URLs (not in markdown link format)
  while ((match = BARE_URL_REGEX.exec(content)) !== null) {
    // Avoid duplicating URLs that were already part of a markdown link
    const url = match[1];
    if (!links.some(link => link.url === url)) {
      links.push({
        text: url,  // For bare URLs, text is the same as URL
        url: url,
        isJoplinLink: false
      });
    }
  }
  
  // Reset regex lastIndex
  BARE_URL_REGEX.lastIndex = 0;
  
  return links;
};

/**
 * Clean and normalize note content for LLM processing.
 * 
 * @param content The raw note content
 * @returns Cleaned text suitable for LLM processing
 */
export const cleanNoteContent = (content: string): string => {
  let cleanText = content;
  
  // Remove HTML tags
  cleanText = cleanText.replace(/<[^>]*>/g, ' ');
  
  // Convert markdown headings to plain text with emphasis
  cleanText = cleanText.replace(/^#+\s+(.*?)$/gm, '$1\n');
  
  // Convert markdown bold/italic to plain text
  cleanText = cleanText.replace(/(\*\*|__)(.*?)\1/g, '$2');
  cleanText = cleanText.replace(/(\*|_)(.*?)\1/g, '$2');
  
  // Replace all markdown links with just the text part (including anchor links)
  cleanText = cleanText.replace(/\[(.*?)\]\(.*?\)/g, '$1');
  
  // Preserve code blocks but format them consistently
  cleanText = cleanText.replace(/```(?:.*?)\n([\s\S]*?)```/g, '```\n$1\n```');
  cleanText = cleanText.replace(/`([^`]*)`/g, '$1');
  
  // Replace multiple newlines with a single newline
  cleanText = cleanText.replace(/\n{3,}/g, '\n\n');
  
  // Replace tabs and multiple spaces with a single space
  cleanText = cleanText.replace(/\t/g, ' ');
  cleanText = cleanText.replace(/[ ]{2,}/g, ' ');
  
  // Trim leading/trailing whitespace
  cleanText = cleanText.trim();
  
  return cleanText;
};

/**
 * Retrieve additional content from linked notes.
 * 
 * @param links Array of internal links to process
 * @returns Map of note IDs to their content
 */
export const fetchLinkedNoteContent = async (links: LinkInfo[]): Promise<Map<string, string>> => {
  const linkedContent = new Map<string, string>();
  
  // Extract unique note IDs from internal links
  const noteIds = links
    .filter(link => link.isJoplinLink && link.noteId)
    .map(link => link.noteId as string)
    .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates
  
  // Fetch each linked note
  await Promise.all(
    noteIds.map(async (noteId) => {
      try {
        const note = await DataApi.getNoteById(noteId);
        if (note) {
          // Clean the linked note content as well
          const cleanContent = cleanNoteContent(note.body);
          linkedContent.set(noteId, cleanContent);
        }
      } catch (error) {
        console.error(`Error fetching linked note ${noteId}:`, error);
      }
    })
  );
  
  return linkedContent;
};

/**
 * Prepare note content for LLM processing, including extracting important context.
 * 
 * @param note The note to process
 * @param options Optional processing options
 * @returns Processed content optimized for LLM input
 */
export const prepareNoteForLlm = async (
  note: NoteInfo,
  options: { includeLinkedContent?: boolean } = {}
): Promise<string> => {
  // Extract content from the note
  const extracted = await extractContent(note);
  
  // Start with the note's metadata and clean content
  let processedContent = `Title: ${note.title}\n\n${extracted.cleanText}`;
  
  // Add tags if available
  if (extracted.tags && extracted.tags.length > 0) {
    processedContent += `\n\nTags: ${extracted.tags.join(', ')}`;
  }
  
  // Add information about external links if they exist
  if (extracted.externalLinks.length > 0) {
    processedContent += '\n\nExternal references:';
    extracted.externalLinks.forEach(link => {
      processedContent += `\n- ${link.text}: ${link.url}`;
    });
  }
  
  // Optionally include content from linked notes
  if (options.includeLinkedContent && extracted.internalLinks.length > 0) {
    const linkedContent = await fetchLinkedNoteContent(extracted.internalLinks);
    
    if (linkedContent.size > 0) {
      processedContent += '\n\nContent from linked notes:';
      
      extracted.internalLinks.forEach(link => {
        if (link.noteId && linkedContent.has(link.noteId)) {
          processedContent += `\n\nFrom "${link.text}":\n${linkedContent.get(link.noteId)?.substring(0, 500)}...'`;
        }
      });
    }
  }
  
  return processedContent;
};
