import { NoteInfo } from '../reviewNotes/types';
import { prepareNoteForLlm } from './dataExtractionService';
import { getConfig } from '../reviewNotes/configService';
import { getPromptTemplate } from './aiTemplate';
import { allowsExternalKnowledge } from '../reviewNotes/dataApi';

// TODO: add image support for uploaded images: https://openrouter.ai/docs/features/images-and-pdfs

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
  maxTokens: 20000,
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
  const config = await getConfig();
  if (!config.llmApiKey) {
    throw new Error('LLM API key not configured. Please add your API key in the Review Notes settings.');
  }
  
  // Prepare the note content for LLM processing
  const processedContent = await prepareNoteForLlm(note, {
    includeLinkedContent: mergedOptions.includeLinkedContent
  });
  
  // Get the prompt template with variables applied
  // Check if this note allows external knowledge based on its tags
  const { knowledgeControlTag } = config;


  // Check if external knowledge is allowed for this note based on its tags
  const allowExternalKnowledge = await allowsExternalKnowledge(note, knowledgeControlTag);
  
  // Get the appropriate prompt template
  const promptTemplate = getPromptTemplate(note, allowExternalKnowledge);
  
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