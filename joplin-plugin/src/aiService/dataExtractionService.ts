/**
 * Data Extraction Service
 * 
 * Provides functionality for parsing note content, extracting links,
 * and cleaning text for optimal LLM processing.
 */
import { NoteInfo } from '../reviewNotes/types';
import * as DataApi from '../reviewNotes/dataApi';

export interface ExtractedContent {
  cleanText: string;
  internalLinks: LinkInfo[];
  externalLinks: LinkInfo[];
  tags: string[];
}

export interface LinkInfo {
  text: string;
  url: string;
  isJoplinLink: boolean;
  noteId?: string;
}

const JOPLIN_LINK_REGEX = /\[(.*?)\]\(:\/([a-zA-Z0-9]+)\)/g; // [text](:/noteId)
const EXTERNAL_LINK_REGEX = /\[(.*?)\]\(((?:https?|ftp):\/\/[^\s)]+)\)/g; // [text](https://example.com)
const BARE_URL_REGEX = /((?:https?|ftp):\/\/[^\s\])"'><]+)/g; // https://example.com

export const extractContent = async (note: NoteInfo): Promise<ExtractedContent> => {
  const noteContent = note.body || '';
  const internalLinks = extractInternalLinks(noteContent);
  const externalLinks = extractExternalLinks(noteContent);
  const cleanText = cleanNoteContent(noteContent);

  return {
    cleanText,
    internalLinks,
    externalLinks,
    tags: note.tags || []
  };
};

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
  return links;
};

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

export const prepareNoteForLlm = async (
  note: NoteInfo,
  options: { includeLinkedContent?: boolean } = {}
): Promise<string> => {
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
