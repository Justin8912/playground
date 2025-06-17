import { FilterCriteria, NoteInfo, NotebookInfo } from './types';
import * as DataApi from './dataApi';
import { selectRandomFilteredNote } from './filterUtils';
import { getConfig } from './configService';

export const ensureReviewsNotebookExists = async (
  reviewsNotebookName = 'Reviews'
): Promise<string | null> => {
  const existingNotebook = await DataApi.getNotebookByTitle(reviewsNotebookName);
  
  if (existingNotebook) {
    return existingNotebook.id;
  }
  
  const createdNotebook = await DataApi.createNotebook(reviewsNotebookName);
  return createdNotebook?.id || null;
};


export const getNotebookPathForNote = async (
  noteParentId: string,
  allNotebooks?: NotebookInfo[]
): Promise<NotebookInfo[]> => {
  if (!allNotebooks) {
    allNotebooks = await DataApi.getAllNotebooks();
  }
  
  const path: NotebookInfo[] = [];
  let currentNotebookId = noteParentId;
  
  while (currentNotebookId) {
    const notebook = allNotebooks.find(n => n.id === currentNotebookId);
    if (!notebook) break;
    
    path.unshift(notebook); 
    currentNotebookId = notebook.parent_id;
  }
  
  return path;
};

export const createReviewsNotebookStructure = async (
  reviewsNotebookId: string,
  originalNotePath: NotebookInfo[]
): Promise<string> => {
  let parentId = reviewsNotebookId;
  
  // Skip the root notebook in the original path and recreate the hierarchy
  // under the Reviews notebook
  const existingNotebooks = await DataApi.getAllNotebooks();
  for (const notebook of originalNotePath) {
    // Check if this notebook already exists under the current parent
    const matchingNotebook = existingNotebooks.find(n => 
      n.parent_id === parentId && 
      n.title === notebook.title
    );
    
    if (matchingNotebook) {
      parentId = matchingNotebook.id;
    } else {
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

export const createReviewNote = async (
  originalNote: NoteInfo,
  targetNotebookId: string
): Promise<NoteInfo | null> => {
  try {
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

export const generateReviewNote = async (
  reviewsNotebookName = 'Reviews',
  filterCriteria?: FilterCriteria
): Promise<NoteInfo | null> => {
  try {
    // Get config to check if filtering is enabled
    const config = await getConfig();

    // Step 1: Ensure Reviews notebook exists
    const reviewsNotebookId = await ensureReviewsNotebookExists(reviewsNotebookName);
    if (!reviewsNotebookId) {
      throw new Error('Could not find or create Reviews notebook');
    }
    
    // Step 2: Select a random note, using config filter criteria if enabled
    const selectedNote = await selectRandomFilteredNote(
      config.filterEnabled ? config.filterCriteria : filterCriteria
    );
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
