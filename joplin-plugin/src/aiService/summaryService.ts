/**
 * Summary Service
 * 
 * Handles communication with the OpenRouter.ai API for generating
 * summaries of note content using LLM technology.
 */

import { NoteInfo } from '../reviewNotes/types';
import { ExtractedContent, prepareNoteForLlm } from './dataExtractionService';
import * as configService from '../reviewNotes/configService';

/**
 * Response format from OpenRouter API
 */
interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    index: number;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Configuration for the summary request
 */
export interface SummaryOptions {
  includeLinkedContent?: boolean;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * The default summary options
 */
const DEFAULT_SUMMARY_OPTIONS: SummaryOptions = {
  includeLinkedContent: true,
  temperature: 0.5,
  maxTokens: 2048,
  model: 'deepseek/deepseek-r1-0528:free'
};

/**
 * Maximum number of retry attempts for API calls
 */
const MAX_RETRIES = 3;

/**
 * Base delay for exponential backoff (in milliseconds)
 */
const BASE_RETRY_DELAY = 1000;

/**
 * Generate a summary for the given note using the LLM API
 * 
 * @param note The note to summarize
 * @param options Configuration options for the summary
 * @returns Promise containing the generated summary text
 */
export const generateSummary = async (
  note: NoteInfo,
  options: SummaryOptions = {}
): Promise<string> => {
  // Merge default options with provided options
  const mergedOptions = { ...DEFAULT_SUMMARY_OPTIONS, ...options };
  
  // Get the API configuration
  const config = await configService.getConfig();
  if (!config.llmApiKey) {
    throw new Error('LLM API key not configured. Please add your API key in the Review Notes settings.');
  }
  
  // Prepare the note content for LLM processing
  const processedContent = await prepareNoteForLlm(note, {
    includeLinkedContent: mergedOptions.includeLinkedContent
  });
  
  // Get the prompt template
  const promptTemplate = await getPromptTemplate();
  
  // Create the API request
  const response = await callOpenRouterApi(
    promptTemplate,
    processedContent,
    config.llmApiKey,
    config.llmApiEndpoint,
    mergedOptions
  );
  
  return extractSummaryFromResponse(response);
};

/**
 * Call the OpenRouter API with retry logic for temporary failures
 * 
 * @param promptTemplate The template for the prompt
 * @param noteContent The processed note content
 * @param apiKey The API key for authentication
 * @param apiEndpoint The API endpoint URL
 * @param options Summary options including model and parameters
 * @returns Promise containing the API response
 */
const callOpenRouterApi = async (
  promptTemplate: string,
  noteContent: string,
  apiKey: string,
  apiEndpoint: string,
  options: SummaryOptions
): Promise<OpenRouterResponse> => {
  let retryCount = 0;
  
  while (true) {
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: options.model,
          messages: [
            {
              role: 'user',
              content: `${promptTemplate}\n\nNOTE CONTENT:\n${noteContent}`
            }
          ],
          max_tokens: options.maxTokens,
          temperature: options.temperature
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific error cases
        if (response.status === 429) {
          // Rate limiting - retry with backoff
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            const delay = BASE_RETRY_DELAY * Math.pow(2, retryCount - 1);
            console.log(`Rate limited, retrying in ${delay}ms (attempt ${retryCount}/${MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        // For other errors, throw with details
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}\n${
            errorData.error?.message || JSON.stringify(errorData)
          }`
        );
      }
      
      return await response.json();
    } catch (error) {
      if (retryCount < MAX_RETRIES && isRetryableError(error)) {
        retryCount++;
        const delay = BASE_RETRY_DELAY * Math.pow(2, retryCount - 1);
        console.log(`Error occurred, retrying in ${delay}ms (attempt ${retryCount}/${MAX_RETRIES})...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

/**
 * Determine if an error is retryable (network errors, timeouts)
 * 
 * @param error The error to check
 * @returns True if the error is retryable
 */
const isRetryableError = (error: unknown): boolean => {
  if (error instanceof Error) {
    // Network errors, timeout errors are typically retryable
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('econnreset')
    );
  }
  return false;
};

/**
 * Extract the summary text from the API response
 * 
 * @param response The API response object
 * @returns The extracted summary text
 */
const extractSummaryFromResponse = (response: OpenRouterResponse): string => {
  if (!response.choices || response.choices.length === 0) {
    throw new Error('Invalid API response: No choices returned');
  }
  
  return response.choices[0].message.content.trim();
};

/**
 * Retrieve the prompt template from the aiTemplate.md file
 * or use the default template if the file is not available
 * 
 * @returns Promise containing the prompt template text
 */
export const getPromptTemplate = async (): Promise<string> => {
  try {
    // For now, using a default template
    // In the next milestone, we'll implement reading from aiTemplate.md
    return DEFAULT_PROMPT_TEMPLATE;
  } catch (error) {
    console.error('Failed to load AI template:', error);
    return DEFAULT_PROMPT_TEMPLATE;
  }
};

/**
 * Default prompt template to use when no template file is available
 */
const DEFAULT_PROMPT_TEMPLATE = `
I will provide you notes, articles, and potentially references to other content, and I would like you to generate a summary of all the content provided.

IMPORTANT: You should use ONLY the information contained in the note and any links explicitly provided in the note content. DO NOT use any external knowledge or resources beyond what is explicitly provided in the input. Your summary should be based solely on the information contained in the note and its linked references.

In the case that the content is about code, please summarize the code and provide snippets where necessary using code blocks.

Please use the following format for your response:

# Title
## Main Concepts

Here you will describe the overarching idea that is encompassed between all the shared resources/notes.

## Key details

The important points, things to keep an eye out for.

# Summary

A general summary of all the notes that captures the essential information.
`;
