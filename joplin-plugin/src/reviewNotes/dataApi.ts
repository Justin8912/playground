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
    let allNotes = [];
    let response = await joplin.data.get(['notes'], { fields: 'id,title,body,parent_id' });
    allNotes.push(...response.items);

    let responsePage = 1;
    // The joplin.data.get endpoint is paginated, so we need to loop through all pages
    while (response.has_more) {
      responsePage += 1;
      response = await joplin.data.get(['notes'], { fields: 'id,title,body,parent_id', page: responsePage});
      allNotes.push(...response.items);
    }

    const notes = await Promise.all(allNotes.map(async note => {
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

export const getNotebookHierarchy = async (): Promise<NotebookInfo[]> => {
  const allNotebooks = await getAllNotebooks();
  const notebookMap = new Map<string, NotebookInfo>();

  // Create a map of notebooks by their IDs
  allNotebooks.forEach(notebook => {
    notebookMap.set(notebook.id, {
      id: notebook.id,
      title: notebook.title,
      parent_id: notebook.parent_id,
      children: []
    });
  });

  // Build the hierarchy
  const hierarchy: NotebookInfo[] = [];
  notebookMap.forEach(notebook => {
    if (notebook.parent_id) {
      const parent = notebookMap.get(notebook.parent_id);
      if (parent) {
        parent.children?.push(notebook);
      }
    } else {
      hierarchy.push(notebook);
    }
  });

  return hierarchy;
};

/**
 * Check if a note has a specific tag
 * 
 * @param noteInfo The note to check
 * @param tagName The name of the tag to check for
 * @returns True if the note has the tag, false otherwise
 */
export const hasTag = (noteInfo: NoteInfo, tagName: string): boolean => {
  if (!tagName || !noteInfo.tags || noteInfo.tags.length === 0) {
    return false;
  }
  
  return noteInfo.tags.some(tag => tag.toLowerCase() === tagName.toLowerCase());
};

/**
 * Check if a note allows external knowledge based on its tags
 * 
 * @param noteInfo The note to check
 * @param knowledgeControlTag The tag that enables external knowledge
 * @returns True if external knowledge is allowed for this note
 */
export const allowsExternalKnowledge = async (noteInfo: NoteInfo, knowledgeControlTag: string): Promise<boolean> => {
  if (!knowledgeControlTag) {
    return false;
  }
  noteInfo.tags = await getNoteTags(noteInfo.id);
  
  return hasTag(noteInfo, knowledgeControlTag);
};
