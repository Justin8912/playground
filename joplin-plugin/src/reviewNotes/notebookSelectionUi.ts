/**
 * Notebook Selection UI
 * 
 * This module provides UI components for selecting notebooks to exclude from reviews.
 */

import joplin from 'api';
import { DialogResult, ViewHandle } from 'api/types';
import * as NotebookUtils from './notebookUtils';
import * as NotebookFilterUtils from './notebookFilterUtils';
import { NotebookInfo } from './types';

let dialogHandle: ViewHandle | null = null;

/**
 * Shows the notebook selection dialog
 */
export const showNotebookSelectionDialog = async (): Promise<void> => {
  try {
    // Create the dialog if it doesn't exist
    if (!dialogHandle) {
      dialogHandle = await joplin.views.dialogs.create('notebookSelectionDialog');
      // We only need to load the CSS file - JS functionality is provided inline
      await joplin.views.dialogs.addScript(dialogHandle, './reviewNotes/notebookSelectionDialog.css');
      
      // Set basic properties
      await joplin.views.dialogs.setButtons(dialogHandle, [
        {
          id: 'ok',
          title: 'Save'
        },
        {
          id: 'cancel',
          title: 'Cancel'
        }
      ]);
      
      await joplin.views.dialogs.setFitToContent(dialogHandle, false);
    }
    
    // Load notebooks and current exclusion list
    const notebooks = await NotebookUtils.getNotebooksHierarchy();
    console.log('loadedNotebooks', notebooks);
    const flattenedNotebooks = NotebookUtils.flattenNotebookTree(notebooks);
    console.log('flattenedNotebooks', flattenedNotebooks);
    const excludedIds = await NotebookFilterUtils.getExcludedNotebookIds();
    console.log('excludedIds', excludedIds);
    
    // Generate HTML for the dialog
    console.log(":generateSelectionDialogHtml");
    const html = generateSelectionDialogHtml(flattenedNotebooks, excludedIds);
    console.log("html: ", html);
    await joplin.views.dialogs.setHtml(dialogHandle, html);
    
    // Show dialog and handle result
    const result = await joplin.views.dialogs.open(dialogHandle);
    await handleDialogResult(result);
    
  } catch (error) {
    console.error('Error showing notebook selection dialog:', error);
  }
};

/**
 * Generates HTML for the notebook selection dialog
 */
const generateSelectionDialogHtml = (
  notebooks: (NotebookInfo & { depth: number })[],
  excludedIds: string[]
): string => {
  return `
    <div class="notebook-selection-container">
    <script>
      // Function to initialize the UI
      function initNotebookSelectionUI() {
        console.log('Initializing notebook selection UI');
        
        // Show notebook list and hide loading indicator
        var loadingIndicator = document.getElementById('loading-indicator');
        var notebookList = document.getElementById('notebook-list');
        
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (notebookList) notebookList.style.display = 'block';
        
        // Set up checkbox names for form submission
        var checkboxes = document.querySelectorAll('.notebook-checkbox');
        for (var i = 0; i < checkboxes.length; i++) {
          var checkbox = checkboxes[i];
          var notebookId = checkbox.getAttribute('data-notebook-id');
          if (notebookId) {
            checkbox.setAttribute('name', 'notebook_' + notebookId);
          }
        }
        
        console.log('UI initialization complete');
      }
      
      // Attach button event handlers using inline DOM scripting
      function setupButtonHandlers() {
        console.log('Setting up button handlers');
        
        // Manual init button
        var manualInitButton = document.getElementById('manual-init');
        if (manualInitButton) {
          manualInitButton.onclick = function() {
            console.log('Manual init clicked');
            initNotebookSelectionUI();
          };
        }
        
        // Select all button
        var selectAllButton = document.getElementById('select-all');
        if (selectAllButton) {
          selectAllButton.onclick = function() {
            console.log('Select all clicked');
            var checkboxes = document.querySelectorAll('.notebook-checkbox');
            for (var i = 0; i < checkboxes.length; i++) {
              checkboxes[i].checked = true;
            }
          };
        }
        
        // Clear all button
        var clearAllButton = document.getElementById('clear-all');
        if (clearAllButton) {
          clearAllButton.onclick = function() {
            console.log('Clear all clicked');
            var checkboxes = document.querySelectorAll('.notebook-checkbox');
            for (var i = 0; i < checkboxes.length; i++) {
              checkboxes[i].checked = false;
            }
          };
        }
      }
      
      // Execute initialization sequence
      
      // Try to initialize immediately
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setupButtonHandlers();
        initNotebookSelectionUI();
      } else {
        // Or wait for DOM content loaded
        document.addEventListener('DOMContentLoaded', function() {
          setupButtonHandlers();
          initNotebookSelectionUI();
        });
      }
      
      // Backup initialization with timeout
      setTimeout(function() {
        setupButtonHandlers();
        initNotebookSelectionUI();
      }, 500);
    </script>
      <div class="notebook-selection-header">
        <h3>Notebook Selection</h3>
        <p>Select notebooks to exclude from review note generation. Excluded notebooks will not have their notes included in review notes.</p>
      </div>
      
      <div class="loading-container" id="loading-indicator">
        <div class="loading-spinner"></div>
        <div>Loading notebooks...</div>
        <button type="button" id="manual-init" style="margin-top: 20px;" onClick="initNotebookSelectionUI()">Show Notebooks</button>
      </div>
      
      <div class="notebook-list-container" id="notebook-list" style="display: none;">
        <div class="notebook-list-actions">
          <button type="button" id="select-all">Select All</button>
          <button type="button" id="clear-all">Clear All</button>
        </div>
        
        <div class="notebook-list">
          ${notebooks.map(notebook => {
            const isExcluded = excludedIds.includes(notebook.id);
            const indentation = '&nbsp;'.repeat(notebook.depth * 4);
            
            return `
              <div class="notebook-item" data-depth="${notebook.depth}">
                <label class="notebook-label">
                  <span class="notebook-indent">${indentation}</span>
                  <input type="checkbox" 
                         class="notebook-checkbox" 
                         data-notebook-id="${notebook.id}"
                         ${isExcluded ? 'checked' : ''}
                  >
                  <span class="notebook-title">${notebook.title}</span>
                </label>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
};

/**
 * Handles the dialog result
 */
const handleDialogResult = async (result: DialogResult): Promise<void> => {
  // Only process if OK was clicked
  if (result.id !== 'ok') return;
  
  try {
    // Parse form data and update exclusion list
    const formData = result.formData || {};
    const excludeNotebookIds: string[] = [];
    
    for (const [key, value] of Object.entries(formData)) {
      if (key.startsWith('notebook_') && value === true) {
        const notebookId = key.replace('notebook_', '');
        excludeNotebookIds.push(notebookId);
      }
    }
    
    // Save the updated exclusion list
    const currentFilterCriteria = await NotebookFilterUtils.loadFilterCriteria();
    const updatedFilterCriteria = {
      ...currentFilterCriteria,
      excludeNotebookIds
    };
    
    await NotebookFilterUtils.saveFilterCriteria(updatedFilterCriteria);
    
  } catch (error) {
    console.error('Error handling dialog result:', error);
  }
};
