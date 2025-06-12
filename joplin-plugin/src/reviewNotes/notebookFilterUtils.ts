/**
 * Notebook Filtering Utilities
 * 
 * Functional programming utilities for managing notebook exclusions.
 * Uses the existing configuration service for persistence.
 */

import { FilterCriteria, NotebookInfo } from './types';
import * as ConfigService from './configService';
import * as NotebookUtils from './notebookUtils';

/**
 * Adds a notebook to the exclusion list
 * 
 * @param notebookId Notebook ID to exclude
 * @param filterCriteria Current filter criteria
 * @returns Updated filter criteria with notebook excluded
 */
export const addNotebookToExclusion = (
  notebookId: string,
  filterCriteria: FilterCriteria
): FilterCriteria => {
  // Ensure we don't duplicate entries using immutable array operations
  const currentExclusions = filterCriteria.excludeNotebookIds || [];
  
  if (currentExclusions.includes(notebookId)) {
    return filterCriteria; // No change needed
  }
  
  // Create new filter criteria with the added exclusion
  return {
    ...filterCriteria,
    excludeNotebookIds: [...currentExclusions, notebookId]
  };
};

/**
 * Removes a notebook from the exclusion list
 * 
 * @param notebookId Notebook ID to remove from exclusion
 * @param filterCriteria Current filter criteria
 * @returns Updated filter criteria with notebook removed from exclusion
 */
export const removeNotebookFromExclusion = (
  notebookId: string,
  filterCriteria: FilterCriteria
): FilterCriteria => {
  const currentExclusions = filterCriteria.excludeNotebookIds || [];
  
  if (!currentExclusions.includes(notebookId)) {
    return filterCriteria; // No change needed
  }
  
  // Create new filter criteria with the exclusion removed
  return {
    ...filterCriteria,
    excludeNotebookIds: currentExclusions.filter(id => id !== notebookId)
  };
};

/**
 * Checks if a notebook is in the exclusion list
 * 
 * @param notebookId Notebook ID to check
 * @param filterCriteria Current filter criteria
 * @returns True if notebook is excluded
 */
export const isNotebookExcluded = (
  notebookId: string,
  filterCriteria: FilterCriteria
): boolean => {
  const excludedIds = filterCriteria.excludeNotebookIds || [];
  return excludedIds.includes(notebookId);
};

/**
 * Toggles a notebook's exclusion status
 * 
 * @param notebookId Notebook ID to toggle
 * @param filterCriteria Current filter criteria
 * @returns Updated filter criteria with notebook exclusion toggled
 */
export const toggleNotebookExclusion = (
  notebookId: string,
  filterCriteria: FilterCriteria
): FilterCriteria => {
  return isNotebookExcluded(notebookId, filterCriteria)
    ? removeNotebookFromExclusion(notebookId, filterCriteria)
    : addNotebookToExclusion(notebookId, filterCriteria);
};

/**
 * Gets the excluded status of notebooks including inheritance
 * 
 * @param notebooks List of all notebooks
 * @param filterCriteria Current filter criteria
 * @returns Map of notebook IDs to their effective exclusion status
 */
export const getEffectiveNotebookExclusions = (
  notebooks: NotebookInfo[],
  filterCriteria: FilterCriteria
): Record<string, boolean> => {
  const excludedIds = filterCriteria.excludeNotebookIds || [];
  const result: Record<string, boolean> = {};
  
  // Process each notebook to determine its effective exclusion status
  notebooks.forEach(notebook => {
    // A notebook is explicitly excluded if its ID is in the exclusion list
    const isExplicitlyExcluded = excludedIds.includes(notebook.id);
    
    // Check if any parent notebook is excluded (inheritance)
    const isParentExcluded = excludedIds.some(excludedId => 
      NotebookUtils.isNotebookChildOf(notebook.id, excludedId, notebooks)
    );
    
    // A notebook is effectively excluded if it's explicitly excluded or if any parent is excluded
    result[notebook.id] = isExplicitlyExcluded || isParentExcluded;
  });
  
  return result;
};

/**
 * Loads filter criteria from configuration
 * 
 * @returns Promise resolving to current filter criteria
 */
export const loadFilterCriteria = async (): Promise<FilterCriteria> => {
  const config = await ConfigService.getConfig();
  return config.filterCriteria;
};

/**
 * Saves updated filter criteria to configuration
 * 
 * @param filterCriteria Updated filter criteria
 * @returns Promise resolving when save is complete
 */
export const saveFilterCriteria = async (filterCriteria: FilterCriteria): Promise<void> => {
  await ConfigService.saveFilterCriteria(filterCriteria);
};

/**
 * Updates a notebook's exclusion status and saves to configuration
 * 
 * @param notebookId Notebook ID to update
 * @param excluded Whether the notebook should be excluded
 * @returns Promise resolving to the updated filter criteria
 */
export const updateNotebookExclusion = async (
  notebookId: string,
  excluded: boolean
): Promise<FilterCriteria> => {
  const currentCriteria = await loadFilterCriteria();
  
  const updatedCriteria = excluded
    ? addNotebookToExclusion(notebookId, currentCriteria)
    : removeNotebookFromExclusion(notebookId, currentCriteria);
    
  await saveFilterCriteria(updatedCriteria);
  return updatedCriteria;
};

/**
 * Gets a list of excluded notebook IDs from configuration
 * 
 * @returns Promise resolving to array of excluded notebook IDs
 */
export const getExcludedNotebookIds = async (): Promise<string[]> => {
  const criteria = await loadFilterCriteria();
  return criteria.excludeNotebookIds || [];
};
