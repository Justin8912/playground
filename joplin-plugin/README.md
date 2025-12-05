# Review Notes Feature

## Overview

The Review Notes feature automatically generates review notes from existing notes when Joplin starts. It creates a hierarchical structure within a dedicated "Reviews" notebook that mirrors your original notebook organization.

## Key Features

- **Automatic Review Generation**: Creates review notes when Joplin starts
- **Maintains Hierarchy**: Preserves your notebook organization within the Reviews notebook
- **Non-blocking Operation**: Operates in the background without affecting Joplin's performance
- **Manual Generation**: Manually create review notes using the Tools menu

## How It Works

1. When Joplin starts, the plugin randomly selects a note from your collection
2. It checks if a "Reviews" notebook exists at the top level, and creates it if needed
3. It replicates the original note's notebook hierarchy within the "Reviews" notebook
4. It creates a review note containing the same content as the original note
5. It shows a brief notification and automatically navigates to the newly created review note

## Future Enhancements

In future versions, this feature will be enhanced to:
- Allow filtering of which notes to include in review selection
- Use LLMs to generate intelligent summaries of notes
- Support customization of review generation frequency and parameters

## Technical Implementation

The feature is implemented using a functional programming approach with these key components:

- **Startup Handling**: Uses Joplin's `onStart` function to trigger review generation when the app opens
- **Data Access**: Pure utility functions for interacting with Joplin's Data API
- **Review Service**: Core functionality for generating review notes
- **Configuration Service**: Settings management for the feature

## Manual Trigger

You can manually trigger the creation of a review note by:
1. Going to Tools > Review Notes > Generate Review Note
2. Using the keyboard shortcut Ctrl+Shift+R (or Cmd+Shift+R on macOS)
