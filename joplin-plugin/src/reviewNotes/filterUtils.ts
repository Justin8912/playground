import { FilterCriteria, NoteInfo, NotebookInfo } from './types';
import * as DataApi from './dataApi';

// Type for the notebook hierarchy map
type NotebookHierarchyMap = {
  childToParentMap: Map<string, string>;
  ancestryPaths: Map<string, string[]>;
  descendantsMap: Map<string, Set<string>>;
};

/**
 * Build a complete notebook hierarchy map that shows:
 * 1. Child to parent relationships
 * 2. Full ancestry paths for each notebook
 * 3. All descendants of each notebook
 */
const buildNotebookHierarchyMap = (allNotebooks: NotebookInfo[]): NotebookHierarchyMap => {
  // Create a map of child notebook IDs to their parent notebook IDs
  const childToParentMap = new Map<string, string>();
  
  // Create a map of notebook IDs to their full ancestry path (from root to the notebook)
  const ancestryPaths = new Map<string, string[]>();
  
  // Create a map of notebook IDs to sets of their descendant notebook IDs
  const descendantsMap = new Map<string, Set<string>>();
  
  // Initialize all notebooks with empty descendant sets
  allNotebooks.forEach(notebook => {
    descendantsMap.set(notebook.id, new Set<string>());
    
    // Set up child-parent relationship
    if (notebook.parent_id) {
      childToParentMap.set(notebook.id, notebook.parent_id);
    }
  });
  
  // Helper function to get the full path from root to a notebook
  const getNotebookPath = (notebookId: string): string[] => {
    // Check if we've already calculated this path
    if (ancestryPaths.has(notebookId)) {
      return ancestryPaths.get(notebookId)!;
    }
    
    const notebook = allNotebooks.find(nb => nb.id === notebookId);
    if (!notebook) return [];
    
    if (!notebook.parent_id) {
      // This is a root notebook
      const path = [notebook.id];
      ancestryPaths.set(notebookId, path);
      return path;
    }
    
    // Get the parent's path and append this notebook
    const parentPath = getNotebookPath(notebook.parent_id);
    const path = [...parentPath, notebook.id];
    
    // Cache the calculated path
    ancestryPaths.set(notebookId, path);
    return path;
  };
  
  // Calculate all ancestry paths
  allNotebooks.forEach(notebook => {
    getNotebookPath(notebook.id);
  });
  
  // Build the descendantsMap by iterating through all notebooks
  allNotebooks.forEach(notebook => {
    if (notebook.parent_id) {
      // Add this notebook as a descendant to all its ancestors
      const ancestryPath = ancestryPaths.get(notebook.id) || [];
      
      // For each ancestor in the path (excluding the current notebook)
      ancestryPath.slice(0, -1).forEach(ancestorId => {
        const descendants = descendantsMap.get(ancestorId);
        if (descendants) {
          descendants.add(notebook.id);
        }
      });
    }
  });
  
  return { childToParentMap, ancestryPaths, descendantsMap };
};

// Helper function to check if a notebook is a descendant of another notebook
const isDescendantNotebook = (
  notebookId: string,
  potentialAncestorId: string,
  descendantsMap: Map<string, Set<string>>
): boolean => {
  const descendants = descendantsMap.get(potentialAncestorId);
  return descendants ? descendants.has(notebookId) : false;
};

// Check if a note is in any of the specified notebooks or their descendants
const isNoteInNotebooks = (
  note: NoteInfo,
  notebookIds: string[],
  hierarchyMap: NotebookHierarchyMap
): boolean => {
  const { ancestryPaths, descendantsMap } = hierarchyMap;
  
  // Direct match: The note is directly in one of the specified notebooks
  if (notebookIds.includes(note.parent_id)) return true;
  
  // Check if any notebook in the note's ancestry is in the specified list
  const notePath = ancestryPaths.get(note.parent_id) || [];
  const isInAncestry = notebookIds.some(id => notePath.includes(id));
  if (isInAncestry) return true;
  
  // Check downward in the hierarchy (is the note in a child of any excluded notebook?)
  const isChildOfExcludedNotebook = notebookIds.some(excludedId => {
    // Check if the note's parent is a descendant of this excluded notebook
    return isDescendantNotebook(note.parent_id, excludedId, descendantsMap);
  });
  
  return isChildOfExcludedNotebook;
};

// Check if a note should be included based on the filter criteria
export const noteMatchesFilterCriteria = (
  note: NoteInfo, 
  notebooks: NotebookInfo[],
  criteria: FilterCriteria,
  hierarchyMap?: NotebookHierarchyMap
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
  
  // Build hierarchy map if one wasn't provided
  const notebookHierarchy = hierarchyMap || buildNotebookHierarchyMap(notebooks);
  
  if (criteria.notebookIds?.length) {
    const isInIncludedNotebook = isNoteInNotebooks(note, criteria.notebookIds, notebookHierarchy);
    if (!isInIncludedNotebook) return false;
  }
  
  // Filter by excluded notebook ID
  if (criteria.excludeNotebookIds?.length) {
    // Check if the note is in any of the excluded notebooks
    // or is in any child notebooks of the excluded notebooks
    // or is in any parent notebooks of the excluded notebooks
    const isInExcludedNotebook = isNoteInNotebooks(note, criteria.excludeNotebookIds, notebookHierarchy);
    if (isInExcludedNotebook) return false;
  }
  
  // Future: tag filtering
  // This is prepared but we'll implement it in a later milestone
  
  return true;
};

export const applyFilterCriteria = (
  notes: NoteInfo[],
  notebooks: NotebookInfo[],
  criteria: FilterCriteria
): NoteInfo[] => {
  if (!criteria) return notes;
  
  // Build the notebook hierarchy map only once for the entire filtering operation
  const hierarchyMap = buildNotebookHierarchyMap(notebooks);
  
  return notes.filter(note => noteMatchesFilterCriteria(note, notebooks, criteria, hierarchyMap));
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
