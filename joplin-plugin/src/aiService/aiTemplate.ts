import { NoteInfo } from '../reviewNotes/types';

export const DEFAULT_KNOWLEDGE_CONTROL = `IMPORTANT: You should use ONLY the information contained in the note and any links explicitly provided in the note content. DO NOT use any external knowledge or resources beyond what is explicitly provided in the input. Your summary should be based solely on the information contained in the note and its linked references.`;
export const EXTERNAL_KNOWLEDGE_CONTROL = `You may use your own knowledge to provide additional context or insights related to the topic, especially when clarifying technical concepts or providing broader context. However, ensure that the main summary focuses primarily on the content provided.`;
const DEFAULT_ADDITIONAL_RESOURCES = ``;

export const getPromptTemplate = (note: NoteInfo, allowExternalKnowledge: boolean) => `
I will provide you notes, articles, and potentially references to other content, and I would like you to generate a summary of all the content provided.

${allowExternalKnowledge ? EXTERNAL_KNOWLEDGE_CONTROL : DEFAULT_KNOWLEDGE_CONTROL}

In the case that the content is about code, please summarize the code and provide snippets where necessary using code blocks with proper syntax highlighting.

If the note contains technical terminology or specialized concepts, please explain them in a way that is both accurate and accessible.

IMPORTANT: Format your entire response using Markdown syntax for better readability and structure.

Please use the following format for your response:

# ${note.title || 'Untitled Note'}

## Main Concepts

Here you will describe the overarching idea that is encompassed between all the shared resources/notes. Focus on the core themes and the primary purpose of the content.

## Key Takeaways

The important points, things to keep an eye out for. List these as bullet points for easy reference:
- First key point
- Second key point
- etc.

## Detailed Summary

A comprehensive summary of all the notes that captures the essential information. This should include:
- The context and background
- The major ideas and their relationships
- Any significant examples or use cases
- Technical details where relevant

${DEFAULT_ADDITIONAL_RESOURCES}
`;
