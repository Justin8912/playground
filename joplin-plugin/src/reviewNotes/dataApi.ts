/**
 * Utility functions for interacting with the Joplin Data API.
 * These are pure functional utilities that don't maintain state.
 */

import joplin from 'api';
import { NoteInfo, NotebookInfo } from './types';

/**
 * Gets a notebook by ID
 */
export const getNotebook = async (notebookId: string): Promise<NotebookInfo | null> => {
  try {
    const notebook = await joplin.data.get(['folders', notebookId]);
    return {
      id: notebook.id,
      title: notebook.title,
      parent_id: notebook.parent_id
    };
  } catch (error) {
    console.error(`Error getting notebook ${notebookId}:`, error);
    return null;
  }
};

/**
 * Gets all notebooks
 */
export const getAllNotebooks = async (): Promise<NotebookInfo[]> => {
  try {
    const response = await joplin.data.get(['folders']);
    return response.items.map(folder => ({
      id: folder.id,
      title: folder.title,
      parent_id: folder.parent_id
    }));
  } catch (error) {
    console.error('Error getting all notebooks:', error);
    return [];
  }
};

/**
 * Gets a notebook by its title
 */
export const getNotebookByTitle = async (title: string): Promise<NotebookInfo | null> => {
  try {
    const response = await joplin.data.get(['folders'], { query: title });
    const matchingFolder = response.items.find(folder => folder.title === title);
    
    if (!matchingFolder) return null;
    
    return {
      id: matchingFolder.id,
      title: matchingFolder.title,
      parent_id: matchingFolder.parent_id
    };
  } catch (error) {
    console.error(`Error getting notebook with title "${title}":`, error);
    return null;
  }
};

/**
 * Creates a new notebook
 */
export const createNotebook = async (title: string, parentId?: string): Promise<NotebookInfo | null> => {
  try {
    const data: { title: string; parent_id?: string } = { title };
    
    if (parentId) {
      data.parent_id = parentId;
    }
    
    const response = await joplin.data.post(['folders'], null, data);
    
    return {
      id: response.id,
      title: response.title,
      parent_id: response.parent_id
    };
  } catch (error) {
    console.error(`Error creating notebook "${title}":`, error);
    return null;
  }
};

/**
 * Gets all notes
 */
export const getAllNotes = async (): Promise<NoteInfo[]> => {
  try {
    const response = await joplin.data.get(['notes'], { fields: 'id,title,body,parent_id' });
    
    return response.items.map(note => ({
      id: note.id,
      title: note.title,
      body: note.body,
      parent_id: note.parent_id
    }));
  } catch (error) {
    console.error('Error getting all notes:', error);
    return [];
  }
};

/**
 * Gets a specific note by ID
 */
export const getNoteById = async (noteId: string): Promise<NoteInfo | null> => {
  try {
    const note = await joplin.data.get(['notes', noteId], { fields: 'id,title,body,parent_id' });
    
    return {
      id: note.id,
      title: note.title,
      body: note.body,
      parent_id: note.parent_id
    };
  } catch (error) {
    console.error(`Error getting note with ID "${noteId}":`, error);
    return null;
  }
};

/**
 * Creates a new note
 */
export const createNote = async (
  title: string, 
  body: string, 
  parentId: string
): Promise<NoteInfo | null> => {
  try {
    const response = await joplin.data.post(
      ['notes'], 
      null, 
      {
        title,
        body,
        parent_id: parentId
      }
    );
    
    return {
      id: response.id,
      title: response.title,
      body: response.body,
      parent_id: response.parent_id
    };
  } catch (error) {
    console.error(`Error creating note "${title}":`, error);
    return null;
  }
};
