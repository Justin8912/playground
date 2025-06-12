import { FilterCriteria, NoteInfo, NotebookInfo } from './types';
import * as DataApi from './dataApi';

// Helper function to check if a notebook is a descendant of another notebook
const isDescendantNotebook = (
  notebookId: string,
  potentialAncestorId: string,
  allNotebooks: NotebookInfo[]
): boolean => {
  // Get all child notebooks of the potential ancestor
  const childNotebooks = allNotebooks.filter(nb => nb.parent_id === potentialAncestorId);
  
  // If the notebook is a direct child, return true
  if (childNotebooks.some(child => child.id === notebookId)) return true;
  
  // Otherwise recursively check all children
  return childNotebooks.some(child => 
    isDescendantNotebook(notebookId, child.id, allNotebooks)
  );
};

// Check if a note should be included based on the filter criteria
export const noteMatchesFilterCriteria = (
  note: NoteInfo, 
  notebooks: NotebookInfo[],
  criteria: FilterCriteria
): boolean => {
  // If no criteria defined, include the note
  if (!criteria || 
      (!criteria.notebookIds?.length && 
       !criteria.excludeNotebookIds?.length &&
       !criteria.noteIds?.length &&
       !criteria.excludeNoteIds?.length &&
       !criteria.tags?.length &&
       !criteria.excludeTags?.length)) {
    return true;
  }
  
  // Direct note ID filtering (highest priority)
  if (criteria.noteIds?.length) {
    if (criteria.noteIds.includes(note.id)) return true;
    if (!criteria.notebookIds?.length) return false;
  }
  
  if (criteria.excludeNoteIds?.length) {
    if (criteria.excludeNoteIds.includes(note.id)) return false;
  }
  
  if (criteria.notebookIds?.length) {
    const isInIncludedNotebook = isNoteInNotebooks(note, notebooks, criteria.notebookIds);
    if (!isInIncludedNotebook) return false;
  }
  
  // Filter by excluded notebook ID
  if (criteria.excludeNotebookIds?.length) {
    // Check if the note is in any of the excluded notebooks
    // or is in any child notebooks of the excluded notebooks
    // or is in any parent notebooks of the excluded notebooks
    const isInExcludedNotebook = isNoteInNotebooks(note, notebooks, criteria.excludeNotebookIds);
    if (isInExcludedNotebook) return false;
  }
  
  // Future: tag filtering
  // This is prepared but we'll implement it in a later milestone
  
  return true;
};

// Check if a note is in any of the specified notebooks or their descendants
const isNoteInNotebooks = (
  note: NoteInfo, 
  allNotebooks: NotebookInfo[], 
  notebookIds: string[]
): boolean => {
  // Direct match: The note is directly in one of the specified notebooks
  if (notebookIds.includes(note.parent_id)) return true;
  
  // Get the full path of the note's notebook (check upward hierarchy)
  const getNotebookPath = (notebookId: string, path: string[] = []): string[] => {
    const notebook = allNotebooks.find(nb => nb.id === notebookId);
    if (!notebook) return path;
    
    // Add this notebook to the path
    const newPath = [notebook.id, ...path];
    
    // If this notebook has no parent, we've reached the root
    if (!notebook.parent_id) return newPath;
    
    // Continue up the tree
    return getNotebookPath(notebook.parent_id, newPath);
  };

  // Check if any notebook in the note's ancestry is in the specified list
  const isInAncestry = notebookIds.some(id => getNotebookPath(note.parent_id).includes(id));
  if (isInAncestry) return true;
  
  // Check downward in the hierarchy (is the note in a child of any excluded notebook?)
  const isChildOfExcludedNotebook = notebookIds.some(excludedId => {
    // Check if the note's parent is a descendant of this excluded notebook
    return isDescendantNotebook(note.parent_id, excludedId, allNotebooks);
  });
  
  return isChildOfExcludedNotebook;
};

export const applyFilterCriteria = (
  notes: NoteInfo[],
  notebooks: NotebookInfo[],
  criteria: FilterCriteria
): NoteInfo[] => {
  if (!criteria) return notes;
  
  return notes.filter(note => noteMatchesFilterCriteria(note, notebooks, criteria));
};

export const selectRandomFilteredNote = async (
  filterCriteria?: FilterCriteria
): Promise<NoteInfo | null> => {
  const allNotes = await DataApi.getAllNotes();
  const allNotebooks = await DataApi.getAllNotebooks();
  
  if (!allNotes || allNotes.length === 0) {
    return null;
  }
  
  const filteredNotes = filterCriteria ? 
    applyFilterCriteria(allNotes, allNotebooks, filterCriteria) : 
    allNotes;
    
  if (filteredNotes.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * filteredNotes.length);
  return filteredNotes[randomIndex];
};
