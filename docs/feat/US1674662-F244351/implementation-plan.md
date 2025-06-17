# Implementation Plan for US1674662: Note Summarization with LLM

This plan outlines the implementation strategy for adding LLM-powered summarization to the Joplin plugin. The work is broken down into discrete, testable milestones that align with the existing codebase structure.

## Milestone 1: Extend Configuration Service

Enhance the existing `configService.ts` to include settings for LLM API integration. The current implementation already has a robust configuration system with settings registration, retrieval, and UI integration.

**Expected outcome:** The configuration service will be extended to include API key and endpoint settings, with proper secure storage and integration with the existing settings UI.

- Extend the `ReviewsConfig` interface in `types.ts` to include LLM-related settings (API key, endpoint, enable/disable toggle)
- Add the new settings to the `registerSettings` function in `configService.ts`
- Update the `getConfig()` function to retrieve and process the LLM-related settings
- Use `secure: true` property for the API key setting to ensure it's stored securely
- Integrate with the existing "Review Notes" settings tab for a consistent user experience

## Milestone 2: Data Extraction Service

Implement the `dataExtractionService.ts` in the existing AiService directory to handle parsing of note content and link extraction. This will build on the existing DataApi functions for retrieving notes.

**Expected outcome:** A utility that can analyze notes, extract content, and properly categorize links for LLM processing.

- Implement the `dataExtractionService.ts` file in the AiService directory
- Create functions to detect and filter internal Joplin links (`[...](:/some_id)` and `[...](#some_id)`)
- Add functions to extract external links that should be sent to the LLM
- Integrate with existing `DataApi` module for retrieving note content
- Add utility to clean and prepare note content for LLM processing:
  - Strip any HTML/markdown formatting that might confuse the LLM
  - Normalize text encoding and handle special characters
  - Remove redundant whitespace, line breaks, and formatting artifacts
  - Extract essential text content from complex note structures
  - Structure the content in a format optimized for LLM comprehension

## Milestone 3: Summary Service Implementation

Implement the `summaryService.ts` file in the AiService directory to handle communication with the OpenRouter.ai API, based on the existing proof of concept in `poc.js` and following the OpenRouter.ai documentation.

**Expected outcome:** A robust service for LLM communication with proper error handling and response processing that leverages the OpenRouter.ai platform.

- Implement the `summaryService.ts` file in the AiService directory
- Create functions for API communication using OpenRouter.ai's API structure:
  - Use the chat completions endpoint (`/api/v1/chat/completions`)
  - Format requests with proper authentication headers
  - Implement message structure with role and content fields
  - Specify the `deepseek/deepseek-r1-0528:free` model as used in the POC
- Process OpenRouter.ai specific response formats:
  - Extract content from the `choices[0].message.content` structure
  - Handle any platform-specific metadata or rate limiting
- Add error handling for OpenRouter.ai specific error codes and response formats
- Implement retry logic for temporary failures and rate limiting
- Include logging for debugging and monitoring API interactions

## Milestone 4: AI Template Implementation

Develop the `aiTemplate.md` file in the AiService directory to provide a consistent format for LLM prompts.

**Expected outcome:** A well-structured template that guides the LLM in generating consistent summaries with all required sections.

- Implement the `aiTemplate.md` with the required format
- Create utility functions in the summary service to use this template
- Ensure the template includes all required sections (title, brief summary, key takeaways, comprehensive summary)
- Create functions to combine note content with the template

## Milestone 5: Update Review Service

Enhance the existing `reviewService.ts` to incorporate LLM summarization instead of simply copying note content.

**Expected outcome:** The review service will use the new LLM capabilities to generate meaningful summaries of notes and their linked resources.

- Update `generateReviewNote()` function to use LLM for summarization
- Integrate the data extraction service for content preparation
- Add the template service for prompt generation
- Implement the summary service for generating summaries
- Enhance error handling and progress reporting

## Milestone 6: Tag-Based Knowledge Control

Enhance the existing filtering capabilities to support tags that control LLM knowledge boundaries.

**Expected outcome:** A system that allows users to control whether the LLM uses external knowledge via note tagging.

- Extend the `FilterCriteria` interface in `types.ts` to include knowledge control tags
- Add tag detection functions in the DataApi module
- Create utility to modify LLM prompts based on detected tags
- Add a dropdown setting in the existing Joplin settings UI for tag selection

## Milestone 7: Testing and Refinement

Comprehensive testing of the summarization functionality and refinement based on results.

**Expected outcome:** A thoroughly tested system with any identified issues resolved.

- Create unit tests for all new components
- Test integration with existing functionality
- Perform end-to-end testing with various note types and content
- Optimize performance where needed
- Refine error handling and user feedback
