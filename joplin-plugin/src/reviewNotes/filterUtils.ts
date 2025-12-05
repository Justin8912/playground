import { FilterCriteria, NoteInfo, NotebookInfo } from './types';
import * as DataApi from './dataApi';

export const noteMatchesFilterCriteria = (
  note: NoteInfo,
  criteria: FilterCriteria,
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

  // Explicit note filtering - Not implemented yet
  // if (criteria.excludeNoteIds?.length) {
  //   if (criteria.excludeNoteIds.includes(note.id)) return false;
  // }

  // filter by excluded notebook ids - if the note's parent notebook is excluded, skip it
  if (criteria.excludeNotebookIds.some(excludedNotebookId => excludedNotebookId === note.parent_id)) return false;
  
  // Filter by tags - get note tags from the cache or load them
  if (criteria.excludeTags?.length) {
    const noteTags = note.tags || [];
    const hasExcludedTag = criteria.excludeTags.some(excludedTag => 
      noteTags.some(noteTag => noteTag.toLowerCase() === excludedTag.toLowerCase())
    );
    if (hasExcludedTag) return false;
  }

  return !criteria.excludeNotebookIds.includes(note.parent_id);
};

export const applyFilterCriteria = (
  notes: NoteInfo[],
  criteria: FilterCriteria
): NoteInfo[] => {
  if (!criteria) return notes;
  
  return notes.filter(note => noteMatchesFilterCriteria(note, criteria));
};

export const selectRandomFilteredNote = async (
  filterCriteria?: FilterCriteria
): Promise<NoteInfo | null> => {
  const allNotes = await DataApi.getAllNotes();
  
  if (!allNotes || allNotes.length === 0) {
    return null;
  }
  
  const filteredNotes = filterCriteria ? 
    applyFilterCriteria(allNotes, filterCriteria) :
    allNotes;
    
  if (filteredNotes.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * filteredNotes.length);
  return filteredNotes[randomIndex];
};
