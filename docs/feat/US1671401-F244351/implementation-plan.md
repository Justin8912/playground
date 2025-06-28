# Implementation Plan: Review Notes Feature

This implementation plan outlines the approach to creating a "Review" notes notebook feature for the Joplin plugin. The feature will generate review notes from existing notes when the user opens Joplin.

## Milestone 1: Setup Plugin Infrastructure for Review Note Generation

Leverage the existing hello world plugin structure at `joplin-plugin` and enhance it with the necessary infrastructure for review note generation. Use Joplin's plugin API to handle application startup.

**Expected outcome:** The plugin can detect when Joplin is opened using the official plugin API and has the infrastructure in place to begin working with notes. The plugin's architecture will be designed to support future expansion for LLM integration.

- Enhance the existing plugin structure to handle review note generation
- Set up logic in the plugin's `onStart` function to trigger review note generation when Joplin starts
- Create pure utility functions for interacting with the Joplin Data API
- Implement non-blocking execution using promises to ensure Joplin remains usable during review note generation

## Milestone 2: Notebook Management

Implement functionality to check for and create the "Reviews" notebook structure. This ensures that all review notes have an appropriate location based on the original note's hierarchy.

**Expected outcome:** The plugin can verify if a "Reviews" notebook exists at the top level and create it if needed. It can also replicate the necessary notebook hierarchy for organizing review notes.

- Create function to check for the existence of the "Reviews" notebook
- Implement function to create the "Reviews" notebook if it doesn't exist
- Develop functionality to determine the original note's notebook hierarchy
- Create functionality to replicate the notebook hierarchy within the "Reviews" notebook

## Milestone 3: Random Note Selection and Content Extraction with Filtering Framework

Develop functionality to randomly select a note from the user's collection and extract its content for review note generation. Design this system with future filtering capabilities in mind.

**Expected outcome:** The plugin can retrieve a list of available notes, randomly select one, and extract its content including text, formatting, and any relevant metadata. The architecture supports adding filtering options in future updates.

- Implement function to retrieve all notes from Joplin using the Data API
- Create a filter-ready abstraction layer that will allow for future notebook/note filtering
- Design a composable random selection mechanism that can accommodate future filter criteria
- Develop content extraction functionality to get the note's complete content
- Add error handling for cases where note content cannot be retrieved
- Create interfaces and types that will support future filtering implementation

## Milestone 4: Review Note Creation

Create functionality to generate a review note based on the selected original note, place it in the appropriate location within the "Reviews" notebook hierarchy, and ensure proper naming and content.

**Expected outcome:** The plugin can create a review note that contains the content from the randomly selected note and place it in the correct location within the "Reviews" notebook structure.

- Implement functionality to create a new note in the target notebook
- Develop mechanism to copy content from original note to review note
- Create function to determine appropriate title and metadata for the review note
- Add error handling for note creation failures

## Milestone 5: Integration and Testing

Integrate all components and ensure the complete flow works correctly from Joplin startup to review note creation. Test with various note scenarios and notebook hierarchies using the Joplin plugin API functionality.

**Expected outcome:** The full feature works reliably when Joplin starts, creating appropriate review notes without blocking the user interface, fully leveraging the Joplin plugin API.

- Connect all components into a complete workflow using proper event handling
- Implement comprehensive logging through Joplin's plugin console interface
- Test with various notebook structures and note formats to ensure compatibility
- Optimize performance to minimize impact on Joplin startup time
- Ensure the system handles edge cases gracefully
- Document extension points for future enhancement (particularly for filtering options)
