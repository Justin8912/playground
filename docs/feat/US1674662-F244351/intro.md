# Introduction

We need to enhance the Joplin plugin to enable LLM-powered summarization of notes, making the review process simple and effective for users. Currently, the plugin just copies the content of notes, but we need to leverage an LLM to create concise, structured summaries based on the notes and their linked resources.

# Goal

The notes and resources will be sent to an LLM along with a template specifying the desired summary format. The LLM's response will be recorded to the summarized note, replacing the current implementation that simply copies the content of the original note. This will provide users with an easily digestible summary of their notes and attached resources.

# Context

This implementation is part of the larger Joplin plugin that provides users with a way to review their notes. We already have the basic plugin structure in place, and now we need to implement the core functionality of LLM-powered note summarization.

There is a proof of concept available for communication with the AI service, which we can leverage in our implementation. The plugin will need to parse notes for resources and links, filtering out certain internal Joplin links that shouldn't be sent to the LLM.

User settings will be required to configure the API key and endpoint for LLM interaction.

# Implementation guidelines

- Parse notes to separate content and external links for LLM processing
- Filter out internal Joplin links (formats: `[...](:/some_id)` and `[...](#some_id)`)
- Create a structured template for consistent summary formatting
- Allow users to configure API settings (key and endpoint)
- Add an option for users to tag notes with a self-specified tag that instructs the LLM whether to use external knowledge beyond the provided resources
- Follow functional programming patterns where appropriate
- Keep code DRY (Don't Repeat Yourself)
- Ensure error handling for API communication

# Acceptance Criteria

1. Notes are parsed to extract content and links before sending to the LLM
   - Internal Joplin links (`[...](:/some_id)` and `[...](#some_id)`) are filtered out
   - Other links are collected and sent together

2. A template is sent to the LLM to ensure consistent summary format with:
   - Note title
   - Brief note summary (3 sentences)
   - Key takeaways (bullet points of important concepts)
   - Comprehensive summary incorporating resources

3. Users can tag notes with a self-specified tag (selected from a dropdown of available tags) that controls whether the LLM should use external knowledge beyond the provided resources when generating summaries

4. LLM output is written to the summarized note

5. Plugin settings include:
   - API key for LLM interaction
   - API endpoint URL
