# Testing the Notebook Exclusion UI

## Building the Plugin for Testing

To build and test the plugin, follow these steps:

```bash
# Navigate to the plugin directory
cd /Users/justin.stendara/Documents/Random/playground/joplin-plugin

# Build the plugin
npm run dist
```

This will create the plugin package in the `publish` directory.

## Installing the Plugin in Joplin

1. Open Joplin
2. Go to Tools > Options
3. Select "Plugins" tab
4. Click "Install from file"
5. Navigate to `/Users/justin.stendara/Documents/Random/playground/joplin-plugin/publish/com.justin.llm.study.guide.jpl`
6. Select the file and click "Open"

## Debugging

If the UI doesn't appear or behaves unexpectedly:

1. **Check the Developer Console**: 
   - In Joplin, go to Help > Toggle Developer Tools
   - Look for any error messages related to the plugin

2. **Verify File Inclusion**:
   - Check if the CSS and JS files are properly included in the plugin package
   - You can extract the .jpl file (it's a tar archive) to verify

3. **Test Dialog Creation**:
   - Verify that the dialog is being created by adding console.log statements
   - Check if clicking the menu item triggers the dialog display function

## Common Issues and Solutions

1. **Files Not Found**: 
   - Ensure the paths in `notebookSelectionUi.ts` match where the files are located
   - Check that the files are included in the webpack build

2. **Dialog Not Showing**:
   - Verify the command is properly registered
   - Check for errors in the console

3. **No Notebooks Displayed**:
   - Check that the notebook fetching functions are working
   - Add console.log statements to debug data retrieval

4. **Changes Not Persisting**:
   - Verify that the form data is being processed correctly
   - Check that the configuration service is updating properly
