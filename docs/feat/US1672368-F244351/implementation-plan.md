# Implementation Plan for US1672368-F244351

## Overview

This implementation plan outlines the milestones for adding note filtering capabilities to the Joplin Review Notes plugin. The feature will allow users to specify which notebooks and notes are included in the review note generation process, giving them control over which content appears in their reviews.

## Milestones

## Milestone 1: Enhance Configuration Service

Expand the existing configuration service to handle filtering preferences and implement the settings schema for note and notebook filtering.

**Expected outcome:** An enhanced configuration system that can store and retrieve user preferences for note/notebook filtering with persistent storage.

- Update `ReviewsConfig` type to include filter preferences
- Implement settings schema with Joplin settings API
- Create functions to save and load filter settings
- Add validation for filter configuration
- Update default configuration

## Milestone 2: Create Simple Notebook Exclusion UI

Implement a simple text input field in the plugin settings menu that allows users to specify notebooks to exclude from the review process using comma-delineated values.

**Expected outcome:** A straightforward settings input that allows users to enter notebook names to be excluded from the review note generation process, with an elegant summary display showing both excluded notebooks and all available notebooks for reference.

- Add a text input field to plugin settings for notebook exclusion list
- Implement comma-delineation parsing for notebook names
- Create a visually appealing summary display of excluded notebooks
- Display a list of all available notebooks for easy reference
- Add validation for notebook name inputs
- Implement real-time feedback on notebook exclusion status

## Milestone 3: Implement Note Selection and Filtering Logic

Create the business logic to apply the user's filtering preferences when selecting notes for review generation.

**Expected outcome:** A robust filtering system that selects notes according to user-defined criteria when generating review notes.

- Enhance the `selectRandomNote` function to use filtering criteria
- Implement notebook inclusion/exclusion filtering
- Add support for tag-based filtering
- Create utility functions for filter criteria validation
- Implement filter matching algorithms using functional programming patterns

## Milestone 4: Enhance Plugin Menu and Command System

Update the plugin's menu system to provide quick access to filtering settings and status through dedicated commands and toolbar integration.

**Expected outcome:** An intuitive command system allowing users to view and modify note filtering settings directly from the Joplin application without navigating to the settings page.

- Add "Configure Filters" command to plugin menu
- Create a dialog for quick filter adjustments directly from the main UI
- Create a status display command to show current filter configuration
- Implement keyboard shortcuts for toggling filter state and viewing filter status
- Add visual indicator in the UI showing whether filtering is active

## Milestone 5: Performance Testing and Edge Case Validation

Implement comprehensive testing focused on performance with large notebook collections and handling of edge cases in the filtering system.

**Expected outcome:** A reliable and performant filtering system that correctly applies user preferences across all scenarios, with well-organized tests that are excluded from the production build.

- Expand existing tests directory structure with performance tests
- Create test fixtures for large notebook and note collections
- Implement benchmarking for filter operations with 1000+ notes
- Test memory usage optimization with cached filtering results
- Add specific tests for edge cases:
  - All notebooks excluded
  - Non-existent notebook names
  - Excluded tag applied to all notes
  - Notes with multiple tags when one is excluded
- Validate correct notebook hierarchy handling with complex nested structures

## Milestone 6: User Documentation and Usability Enhancements

Complete the implementation by adding comprehensive user documentation and enhancing usability aspects of the filtering system.

**Expected outcome:** A fully documented and user-friendly note filtering feature with clear guidance and intuitive controls.

- Update plugin README with filtering documentation and examples
- Create visual quick-start guide for filtering configuration
- Add inline help text and tooltips to explain filtering concepts
- Implement filter presets for common exclusion patterns
- Add filter statistics to show how many notes/notebooks are affected by current settings
- Improve error handling with meaningful feedback for invalid filter configurations
- Create interactive tutorial for new users (optional stretch goal)
