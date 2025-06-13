import joplin from 'api';
import { NoteInfo, NotebookInfo } from './types';

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

export const getAllNotes = async (): Promise<NoteInfo[]> => {
  try {
    const response = await joplin.data.get(['notes'], { fields: 'id,title,body,parent_id' });
    const notes = await Promise.all(response.items.map(async note => {
      const tags = await getNoteTags(note.id);
      return {
        id: note.id,
        title: note.title,
        body: note.body,
        parent_id: note.parent_id,
        tags: tags
      };
    }));
    
    return notes;
  } catch (error) {
    console.error('Error getting all notes:', error);
    return [];
  }
};

export const getNoteById = async (noteId: string): Promise<NoteInfo | null> => {
  try {
    const note = await joplin.data.get(['notes', noteId], { fields: 'id,title,body,parent_id' });
    const tags = await getNoteTags(note.id);
    
    return {
      id: note.id,
      title: note.title,
      body: note.body,
      parent_id: note.parent_id,
      tags: tags
    };
  } catch (error) {
    console.error(`Error getting note with ID "${noteId}":`, error);
    return null;
  }
};

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

export const getAllTags = async (): Promise<{ id: string, title: string }[]> => {
  try {
    const response = await joplin.data.get(['tags']);
    return response.items.map(tag => ({
      id: tag.id,
      title: tag.title
    }));
  } catch (error) {
    console.error('Error getting all tags:', error);
    return [];
  }
};

export const getNoteTags = async (noteId: string): Promise<string[]> => {
  try {
    const response = await joplin.data.get(['notes', noteId, 'tags']);
    return response.items.map(tag => tag.title);
  } catch (error) {
    console.error(`Error getting tags for note ${noteId}:`, error);
    return [];
  }
};

/**
 * Get notebook IDs by their names
 * @param notebookNames Array of notebook names to convert to IDs
 * @returns Array of notebook IDs that were found
 */
export const getNotebookIdsByNames = async (notebookNames: string[]): Promise<string[]> => {
  try {
    const allNotebooks = await getAllNotebooks();
    const notebookMap = new Map<string, string>();
    
    // Create a map of notebook titles to IDs
    allNotebooks.forEach(notebook => {
      notebookMap.set(notebook.title.toLowerCase(), notebook.id);
    });
    
    // Look up each notebook name and get its ID
    return notebookNames
      .map(name => notebookMap.get(name.toLowerCase()))
      .filter((id): id is string => id !== undefined);
  } catch (error) {
    console.error('Error getting notebook IDs by names:', error);
    return [];
  }
};
