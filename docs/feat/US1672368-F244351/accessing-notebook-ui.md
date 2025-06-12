# How to Access the Notebook Exclusion UI

The notebook exclusion UI can be accessed through the Joplin interface using the following methods:

## Method 1: Using the Menu

1. In Joplin, click on the "Tools" menu
2. Look for the "Review Notes" submenu 
3. Click on "Configure Review Note Filters"
4. A dialog will appear showing all available notebooks with checkboxes

## Method 2: Using the Command Palette

1. Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (macOS) to open the command palette
2. Start typing "Configure Review Note Filters"
3. Select the command when it appears
4. The notebook selection dialog will open

## Using the UI

The notebook selection dialog provides the following features:

1. **Select All / Clear All**: Buttons at the top allow you to quickly select or deselect all notebooks
2. **Individual Selection**: Check or uncheck individual notebooks to exclude them from the review process
3. **Hierarchical Display**: Notebooks are shown with indentation to reflect their hierarchy
4. **Save/Cancel**: Click "Save" to apply your selections or "Cancel" to discard changes

## What Happens When You Save?

When you click "Save":
1. Your notebook selections are stored in the plugin's configuration
2. The next time review notes are generated, notes from the excluded notebooks will not be included
3. The setting persists across Joplin restarts

You can change these exclusion settings at any time by opening the dialog again.
