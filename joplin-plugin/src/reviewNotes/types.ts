export interface NoteInfo {
  id: string;
  title: string;
  body: string;
  parent_id: string;
  notebook_path?: string[];
}

export interface NotebookInfo {
  id: string;
  title: string;
  parent_id: string;
  children?: NotebookInfo[];
}

export interface ReviewsConfig {
  reviewsNotebookName: string;
  filterEnabled: boolean;
  filterCriteria: FilterCriteria;
}

export interface FilterCriteria {
  notebookIds?: string[];
  excludeNotebookIds?: string[];
  noteIds?: string[];
  excludeNoteIds?: string[];
  tags?: string[];
  excludeTags?: string[];
}

export enum FilterMode {
  INCLUDE = 'include',
  EXCLUDE = 'exclude',
}

export interface NotebookFilterEntry {
  id: string;
  title: string;
  mode: FilterMode;
}
