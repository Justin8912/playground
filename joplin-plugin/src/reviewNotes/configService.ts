import joplin from 'api';
import { SettingItemType } from 'api/types';
import { FilterCriteria, ReviewsConfig } from './types';

const SECTION_NAME = 'reviewNotesSettings';

const DEFAULT_CONFIG: ReviewsConfig = {
  reviewsNotebookName: 'Reviews',
  filterEnabled: false,
  filterCriteria: {
    notebookIds: [],
    excludeNotebookIds: [],
    noteIds: [],
    excludeNoteIds: [],
    tags: [],
    excludeTags: []
  }
};

/**
 * Register plugin settings with Joplin
 */
export const registerSettings = async (): Promise<void> => {
  // Register settings section
  await joplin.settings.registerSection(SECTION_NAME, {
    label: 'Review Notes',
    iconName: 'fas fa-book',
    description: 'Settings for the Review Notes plugin'
  });

  // Register settings
  await joplin.settings.registerSettings({
    // Basic settings
    'reviewsNotebookName': {
      value: DEFAULT_CONFIG.reviewsNotebookName,
      type: SettingItemType.String,
      section: SECTION_NAME,
      public: true,
      label: 'Reviews Notebook Name',
      description: 'Name of the notebook where review notes will be stored'
    },

    // Filter settings
    'filterEnabled': {
      value: DEFAULT_CONFIG.filterEnabled,
      type: SettingItemType.Bool,
      section: SECTION_NAME,
      public: true,
      label: 'Enable Note Filtering',
      description: 'Enable filtering of notes for review generation'
    },

    // The filter criteria is stored as a JSON string since Joplin
    // settings don't support complex objects directly
    'filterCriteria': {
      value: JSON.stringify(DEFAULT_CONFIG.filterCriteria),
      type: SettingItemType.String,
      section: SECTION_NAME,
      public: false,
      label: 'Filter Criteria',
      description: 'JSON configuration for note filtering'
    }
  });
};

/**
 * Get the current configuration from Joplin settings
 */
export const getConfig = async (): Promise<ReviewsConfig> => {
  try {
    // Get all setting values at once
    const values = await joplin.settings.values(['reviewsNotebookName', 'filterEnabled', 'filterCriteria']);
    
    let filterCriteria: FilterCriteria;
    try {
      // Parse the JSON string storing filter criteria
      filterCriteria = JSON.parse(values.filterCriteria as string);
    } catch (error) {
      console.error('Error parsing filter criteria, using defaults:', error);
      filterCriteria = DEFAULT_CONFIG.filterCriteria;
    }

    // Return merged config
    return {
      reviewsNotebookName: values.reviewsNotebookName as string || DEFAULT_CONFIG.reviewsNotebookName,
      filterEnabled: !!values.filterEnabled,
      filterCriteria
    };
  } catch (error) {
    console.error('Error getting review notes config:', error);
    return DEFAULT_CONFIG;
  }
};

/**
 * Update filter criteria in settings
 */
export const saveFilterCriteria = async (filterCriteria: FilterCriteria): Promise<void> => {
  try {
    // Convert to JSON string for storage
    await joplin.settings.setValue('filterCriteria', JSON.stringify(filterCriteria));
  } catch (error) {
    console.error('Error saving filter criteria:', error);
  }
};

/**
 * Toggle filter enabled/disabled state
 */
export const setFilterEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await joplin.settings.setValue('filterEnabled', enabled);
  } catch (error) {
    console.error('Error setting filter enabled state:', error);
  }
};

/**
 * Validate filter criteria to ensure it's properly formatted
 */
export const validateFilterCriteria = (criteria: FilterCriteria): boolean => {
  // Basic validation rules
  const isValidStringArray = (arr?: string[]): boolean => 
    arr === undefined || (Array.isArray(arr) && arr.every(item => typeof item === 'string'));
  
  return isValidStringArray(criteria.notebookIds) && 
         isValidStringArray(criteria.excludeNotebookIds) &&
         isValidStringArray(criteria.noteIds) &&
         isValidStringArray(criteria.excludeNoteIds) &&
         isValidStringArray(criteria.tags) &&
         isValidStringArray(criteria.excludeTags);
};

/**
 * Initialize the configuration
 */
export const initConfig = async (): Promise<ReviewsConfig> => {
  await registerSettings();
  return await getConfig();
};
