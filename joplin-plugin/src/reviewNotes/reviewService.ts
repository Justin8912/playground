/**
 * Service for handling the review notes generation functionality
 */

import { FilterCriteria, NoteInfo, NotebookInfo } from './types';
import * as DataApi from './dataApi';

/**
 * Ensures that the Reviews notebook exists, creating it if necessary.
 * @returns The ID of the Reviews notebook
 */
export const ensureReviewsNotebookExists = async (
  reviewsNotebookName = 'Reviews'
): Promise<string | null> => {
  // Check if Reviews notebook already exists
  const existingNotebook = await DataApi.getNotebookByTitle(reviewsNotebookName);
  
  if (existingNotebook) {
    return existingNotebook.id;
  }
  
  // Create it if it doesn't exist
  const createdNotebook = await DataApi.createNotebook(reviewsNotebookName);
  return createdNotebook?.id || null;
};

/**
 * Gets the notebook structure/path for a note
 */
export const getNotebookPathForNote = async (
  noteParentId: string,
  allNotebooks?: NotebookInfo[]
): Promise<NotebookInfo[]> => {
  // Get all notebooks if not provided
  if (!allNotebooks) {
    allNotebooks = await DataApi.getAllNotebooks();
  }
  
  const path: NotebookInfo[] = [];
  let currentNotebookId = noteParentId;
  
  // Loop until we reach the root (notebook with no parent)
  while (currentNotebookId) {
    const notebook = allNotebooks.find(n => n.id === currentNotebookId);
    if (!notebook) break;
    
    path.unshift(notebook); // Add to beginning of array
    currentNotebookId = notebook.parent_id;
  }
  
  return path;
};

/**
 * Creates the necessary notebook structure in the Reviews notebook
 * to mirror the original note's notebook hierarchy
 */
export const createReviewsNotebookStructure = async (
  reviewsNotebookId: string,
  originalNotePath: NotebookInfo[]
): Promise<string> => {
  let parentId = reviewsNotebookId;
  
  // Skip the root notebook in the original path and recreate the hierarchy
  // under the Reviews notebook
  for (const notebook of originalNotePath) {
    // Check if this notebook already exists under the current parent
    const existingNotebooks = await DataApi.getAllNotebooks();
    const matchingNotebook = existingNotebooks.find(n => 
      n.parent_id === parentId && 
      n.title === notebook.title
    );
    
    if (matchingNotebook) {
      parentId = matchingNotebook.id;
    } else {
      // Create the notebook if it doesn't exist
      const newNotebook = await DataApi.createNotebook(notebook.title, parentId);
      if (newNotebook) {
        parentId = newNotebook.id;
      } else {
        throw new Error(`Failed to create notebook ${notebook.title} under parent ${parentId}`);
      }
    }
  }
  
  return parentId;
};

/**
 * Selects a random note from all available notes.
 * In the future, this will apply filtering based on user preferences.
 */
export const selectRandomNote = async (
  filterCriteria?: FilterCriteria
): Promise<NoteInfo | null> => {
  // Currently, we just select a random note from all notes
  // In the future, this will apply filtering based on the criteria
  const allNotes = await DataApi.getAllNotes();
  
  if (!allNotes || allNotes.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * allNotes.length);
  return allNotes[randomIndex];
};

/**
 * Creates a review note based on the provided note
 */
export const createReviewNote = async (
  originalNote: NoteInfo,
  targetNotebookId: string
): Promise<NoteInfo | null> => {
  try {
    // Use the same title for the review note
    const reviewNote = await DataApi.createNote(
      originalNote.title, 
      originalNote.body, 
      targetNotebookId
    );
    
    return reviewNote;
  } catch (error) {
    console.error('Error creating review note:', error);
    return null;
  }
};

/**
 * Generates a review note from a randomly selected note
 */
export const generateReviewNote = async (
  reviewsNotebookName = 'Reviews',
  filterCriteria?: FilterCriteria
): Promise<NoteInfo | null> => {
  try {
    // Step 1: Ensure Reviews notebook exists
    const reviewsNotebookId = await ensureReviewsNotebookExists(reviewsNotebookName);
    if (!reviewsNotebookId) {
      throw new Error('Could not find or create Reviews notebook');
    }
    
    // Step 2: Select a random note
    const selectedNote = await selectRandomNote(filterCriteria);
    if (!selectedNote) {
      throw new Error('No notes available for review');
    }
    
    // Step 3: Get the notebook path for the selected note
    const notebookPath = await getNotebookPathForNote(selectedNote.parent_id);
    
    // Step 4: Create the notebook structure in the Reviews notebook
    const targetNotebookId = await createReviewsNotebookStructure(
      reviewsNotebookId,
      notebookPath
    );
    
    // Step 5: Create the review note in the target notebook
    const reviewNote = await createReviewNote(selectedNote, targetNotebookId);
    
    return reviewNote;
  } catch (error) {
    console.error('Error generating review note:', error);
    return null;
  }
};
