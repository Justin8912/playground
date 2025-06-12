/**
 * Notebook Utilities
 * 
 * Functional programming utilities for notebook operations, leveraging existing data API functions.
 */

import * as DataApi from './dataApi';
import { NotebookInfo } from './types';

/**
 * Retrieves all notebooks and transforms them into a tree structure.
 * Uses pure functional programming patterns for data transformation.
 * 
 * @returns Promise resolving to array of all notebooks
 */
export const getNotebooksHierarchy = async (): Promise<NotebookInfo[]> => {
  try {
    // Use existing API function to get all notebooks
    const allNotebooks = await DataApi.getAllNotebooks();
    
    // Transform flat list into hierarchical structure
    return buildNotebookTree(allNotebooks);
  } catch (error) {
    console.error('Error getting notebook hierarchy:', error);
    return [];
  }
};

/**
 * Transforms a flat list of notebooks into a hierarchical tree structure
 * using a functional approach without mutation.
 * 
 * @param notebooks Flat array of notebooks
 * @returns Tree structure of notebooks
 */
export const buildNotebookTree = (notebooks: NotebookInfo[]): NotebookInfo[] => {
  // Create a map for quick lookup of notebooks by ID
  const notebookMap = notebooks.reduce((acc, notebook) => {
    acc[notebook.id] = { ...notebook, children: [] };
    return acc;
  }, {} as Record<string, NotebookInfo>);
  
  // Create the tree structure by adding children to their parents
  const rootNotebooks: NotebookInfo[] = [];
  
  // Process each notebook
  Object.values(notebookMap).forEach(notebook => {
    if (!notebook.parent_id) {
      // This is a root notebook
      rootNotebooks.push(notebook);
    } else if (notebookMap[notebook.parent_id]) {
      // This notebook has a parent in our map
      const parent = notebookMap[notebook.parent_id];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(notebook);
    } else {
      // Parent not found, treat as root
      rootNotebooks.push(notebook);
    }
  });
  
  return rootNotebooks;
};

/**
 * Flattens a hierarchical notebook tree back into a flat array,
 * with an optional depth property for UI display.
 * 
 * @param notebooks Hierarchical notebook structure
 * @param depth Current depth level (for recursion)
 * @returns Flat array of notebooks with depth information
 */
export const flattenNotebookTree = (
  notebooks: NotebookInfo[], 
  depth = 0
): (NotebookInfo & { depth: number })[] => {
  return notebooks.reduce((acc, notebook) => {
    const flatNotebook = { ...notebook, depth };
    
    acc.push(flatNotebook);
    
    if (notebook.children && notebook.children.length > 0) {
      acc.push(...flattenNotebookTree(notebook.children, depth + 1));
    }
    
    return acc;
  }, [] as (NotebookInfo & { depth: number })[]);
};

/**
 * Checks if a notebook is a child (or descendant) of another notebook.
 * 
 * @param childId ID of potential child notebook
 * @param parentId ID of potential parent notebook
 * @param notebooks Complete list of notebooks
 * @returns True if child is a descendant of parent
 */
export const isNotebookChildOf = (
  childId: string,
  parentId: string,
  notebooks: NotebookInfo[]
): boolean => {
  // Create a map for quick lookup
  const notebookMap = notebooks.reduce((acc, notebook) => {
    acc[notebook.id] = notebook;
    return acc;
  }, {} as Record<string, NotebookInfo>);
  
  let currentId = childId;
  
  // Follow the parent chain until we either find the target parent or reach the root
  while (currentId) {
    const notebook = notebookMap[currentId];
    if (!notebook) break;
    
    // If this notebook's parent is our target parent, return true
    if (notebook.parent_id === parentId) {
      return true;
    }
    
    // Move up to this notebook's parent
    currentId = notebook.parent_id;
  }
  
  return false;
};

/**
 * Finds all descendants of a notebook (children, grandchildren, etc.)
 * 
 * @param notebookId ID of the notebook
 * @param notebooks Complete list of notebooks
 * @returns Array of descendant notebook IDs including the original
 */
export const getNotebookDescendantIds = (
  notebookId: string,
  notebooks: NotebookInfo[]
): string[] => {
  // Start with the notebook itself
  const descendantIds = [notebookId];
  
  // Find direct children
  const children = notebooks.filter(notebook => notebook.parent_id === notebookId);
  
  // Add each child and their descendants recursively
  children.forEach(child => {
    descendantIds.push(...getNotebookDescendantIds(child.id, notebooks));
  });
  
  return descendantIds;
};
