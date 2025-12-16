import { NoteInfo } from '../reviewNotes/types';

const DEFAULT_KNOWLEDGE_CONTROL =
`IMPORTANT: You SHOULD fetch information from the links provided AND use the note content  
together to generate a comprehensive summary. DO NOT use any external knowledge or resources (other 
than the links provided). Feel free to provide additional (or supporting) examples.
`

const EXTERNAL_KNOWLEDGE_CONTROL = `
You may use your own knowledge to provide additional context or insights related to the 
topic, especially when clarifying technical concepts or providing broader context. However, 
ensure that the main summary focuses primarily on the content provided.
`;

const IMPORTANT_INFORMATION = `
IMPORTANT: the purpose of this document is to summarize content provided in notes and articles.
Therefore, accuracy is key. UNDER NO CIRCUMSTANCES SHOULD YOU FABRICATE INFORMATION. IF YOU CANNOT
FIND INFORMATION IT IS OKAY TO TAKE LONGER TO RESPOND OR TO SAY "I DON'T KNOW"
`

const DEFAULT_ADDITIONAL_RESOURCES = ``;

export const getPromptTemplate = (note: NoteInfo, allowExternalKnowledge: boolean) => `
I will provide you notes, articles, and potentially references to other content, and I would like you to generate a summary of all the content provided.

${allowExternalKnowledge ? EXTERNAL_KNOWLEDGE_CONTROL : DEFAULT_KNOWLEDGE_CONTROL}

${IMPORTANT_INFORMATION}

In the case that the content is about code, please summarize the code and provide snippets where necessary using code blocks with proper syntax highlighting.

If the note contains technical terminology or specialized concepts, please explain them in a way that is both accurate and accessible.

IMPORTANT: Format your entire response using Markdown syntax for better readability and structure.

Please use the following format for your response:

# ${note.title || 'Untitled Note'}

## Resources used 

Note the resources used to generated this summary. 

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

Finish your response with the following line:
### El fin
`;
