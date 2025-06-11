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
}

export interface FilterCriteria {
  notebookIds?: string[];
  excludeNotebookIds?: string[];
  tags?: string[];
  excludeTags?: string[];
}
