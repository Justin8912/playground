import joplin from 'api';
import { SettingItemType } from 'api/types';
import { FilterCriteria, ReviewsConfig, NotebookInfo } from './types';
import * as DataApi from './dataApi';

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
 * Generate a text listing of all available notebooks for reference
 */
const generateNotebookList = async (): Promise<string> => {
  try {
    const notebooks = await DataApi.getAllNotebooks();
    
    if (notebooks.length === 0) {
      return "No notebooks found in your Joplin database";
    }
    
    // Create a simple indented list of notebooks
    const notebookMap = new Map<string, NotebookInfo[]>();
    
    // Group notebooks by parent_id
    notebooks.forEach(notebook => {
      const parentId = notebook.parent_id || 'root';
      if (!notebookMap.has(parentId)) {
        notebookMap.set(parentId, []);
      }
      notebookMap.get(parentId)?.push(notebook);
    });
    
    // Build the text representation
    const lines: string[] = ['Available notebooks:'];
    
    // Add root notebooks first
    const rootNotebooks = notebookMap.get('root') || [];
    rootNotebooks.forEach(notebook => {
      lines.push(`- ${notebook.title}`);
      addChildNotebooks(notebook.id, 1);
    });
    
    // Helper function to add child notebooks recursively with indentation
    function addChildNotebooks(parentId: string, depth: number) {
      const children = notebookMap.get(parentId) || [];
      children.forEach(child => {
        lines.push(`${' '.repeat(depth * 2)}- ${child.title}`);
        addChildNotebooks(child.id, depth + 1);
      });
    }
    
    return lines.join('\n');
  } catch (error) {
    console.error('Error generating notebook list:', error);
    return "Error retrieving notebooks";
  }
};

/**
 * Generate a human-readable summary of what's being excluded from review
 */
const generateExclusionSummary = async (criteria: FilterCriteria): Promise<string> => {
  const parts: string[] = [];
  
  // Get notebook names for excluded notebook IDs
  if (criteria.excludeNotebookIds && criteria.excludeNotebookIds.length > 0) {
    const allNotebooks = await DataApi.getAllNotebooks();
    const notebookMap = new Map<string, string>();
    
    allNotebooks.forEach(nb => {
      notebookMap.set(nb.id, nb.title);
    });
    
    const notebookNames = criteria.excludeNotebookIds
      .map(id => notebookMap.get(id) || id);
      
    parts.push(`Excluded notebooks: ${notebookNames.join(', ')}`);
  }
  
  // Add excluded tags
  if (criteria.excludeTags && criteria.excludeTags.length > 0) {
    parts.push(`Excluded tags: ${criteria.excludeTags.join(', ')}`);
  }
  
  // If nothing is excluded, show a message indicating that
  if (parts.length === 0) {
    return "No exclusions configured - all notes are eligible for review";
  }
  
  return parts.join("\n");
};

/**
 * Get all available tags for the dropdown selection
 */
const getTagOptions = async (): Promise<Record<string, string>> => {
  const tags = await DataApi.getAllTags();
  const options: Record<string, string> = {
    '': '-- None --'  // Default empty option
  };
  
  tags.forEach(tag => {
    options[tag.title] = tag.title;
  });
  
  return options;
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

  const config = await getConfig();
  // Register settings
  await joplin.settings.registerSettings({
    'reviewsNotebookName': {
      value: config.reviewsNotebookName,
      type: SettingItemType.String,
      section: SECTION_NAME,
      public: true,
      label: 'Reviews Notebook Name',
      description: 'Name of the notebook where review notes will be stored'
    },

    'filterEnabled': {
      value: config.filterEnabled,
      type: SettingItemType.Bool,
      section: SECTION_NAME,
      public: true,
      label: 'Enable Note Filtering',
      description: 'Enable filtering of notes for review generation'
    },

    'excludedNotebooks': {
      value: config.filterCriteria.excludeNotebookIds?.join(',') || '',
      type: SettingItemType.String,
      section: SECTION_NAME,
      public: true,
      label: 'Excluded Notebooks',
      description: 'Comma-separated list of notebook names to exclude from review notes generation'
    },

    'excludedTag': {
      value: config.filterCriteria.excludeTags?.length ? config.filterCriteria.excludeTags[0] : '',
      type: SettingItemType.String,
      section: SECTION_NAME,
      isEnum: true,
      public: true,
      label: 'Exclude Notes with Tag',
      description: 'Notes with this tag will be excluded from review notes generation',
      options: await getTagOptions()
    },

    'exclusionSummary': {
      value: await generateExclusionSummary(config.filterCriteria),
      type: SettingItemType.String,
      section: SECTION_NAME,
      public: true,
      label: 'Current Exclusions',
      description: 'Summary of notebooks and tags currently excluded from review',
      advanced: false
    },
    
    'availableNotebooks': {
      value: await generateNotebookList(),
      type: SettingItemType.String,
      section: SECTION_NAME,
      public: true,
      label: 'Available Notebooks',
      description: 'List of all available notebooks for reference',
      advanced: false
    },

    // The filter criteria is stored as a JSON string since Joplin
    // settings don't support complex objects directly
    'filterCriteria': {
      value: JSON.stringify(config.filterCriteria),
      type: SettingItemType.String,
      section: SECTION_NAME,
      public: false,
      label: 'Filter Criteria',
      description: 'JSON configuration for note filtering'
    }
  });
};

export const getConfig = async (): Promise<ReviewsConfig> => {
  try {
    const values = await joplin.settings.values([
      'reviewsNotebookName', 
      'filterEnabled', 
      'filterCriteria', 
      'excludedNotebooks',
      'excludedTag'
    ]);
    
    let filterCriteria: FilterCriteria;
    try {
      filterCriteria = JSON.parse(values.filterCriteria as string);
      
      // Get reviews notebook name from config
      const reviewsNotebookName = values.reviewsNotebookName as string || DEFAULT_CONFIG.reviewsNotebookName;
      
      // Process the excluded notebooks from UI setting
      const excludedNotebooksStr = values.excludedNotebooks as string || '';
      
      // Process the excluded tag from UI setting
      const excludedTag = values.excludedTag as string || '';
      
      // Combine Reviews notebook with user-specified notebooks
      const notebookNames = [
        reviewsNotebookName, // Always include the Reviews notebook
        ...(excludedNotebooksStr && excludedNotebooksStr.trim() ? 
          excludedNotebooksStr
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0 && name.toLowerCase() !== reviewsNotebookName.toLowerCase()) // Avoid duplicates
          : [])
      ];
      
      // Update the filter criteria with the notebook IDs
      if (notebookNames.length > 0) {
        const notebookIds = await DataApi.getNotebookIdsByNames(notebookNames);
        filterCriteria.excludeNotebookIds = notebookIds;
      }
      
      // Update the filter criteria with the excluded tag
      if (excludedTag && excludedTag.trim()) {
        filterCriteria.excludeTags = [excludedTag.trim()];
      } else {
        filterCriteria.excludeTags = [];
      }
    } catch (error) {
      console.error('Error parsing filter criteria, using defaults:', error);
      filterCriteria = DEFAULT_CONFIG.filterCriteria;
    }

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
    await joplin.settings.setValue('filterCriteria', JSON.stringify(filterCriteria));
    
    // Update the excludedNotebooks setting for UI consistency
    if (filterCriteria.excludeNotebookIds && filterCriteria.excludeNotebookIds.length > 0) {
      // Get notebook names from IDs
      const allNotebooks = await DataApi.getAllNotebooks();
      const notebookMap = new Map<string, string>();
      
      allNotebooks.forEach(nb => {
        notebookMap.set(nb.id, nb.title);
      });
      
      const notebookNames = filterCriteria.excludeNotebookIds
        .map(id => notebookMap.get(id) || id)
        .join(',');
      
      await joplin.settings.setValue('excludedNotebooks', notebookNames);
    } else {
      await joplin.settings.setValue('excludedNotebooks', '');
    }
    
    // Update the excludedTag setting for UI consistency
    if (filterCriteria.excludeTags && filterCriteria.excludeTags.length > 0) {
      await joplin.settings.setValue('excludedTag', filterCriteria.excludeTags[0]);
    } else {
      await joplin.settings.setValue('excludedTag', '');
    }
    
    // Update the exclusion summary
    const summary = await generateExclusionSummary(filterCriteria);
    await joplin.settings.setValue('exclusionSummary', summary);
  } catch (error) {
    console.error('Error saving filter criteria:', error);
  }
};

export const setFilterEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await joplin.settings.setValue('filterEnabled', enabled);
  } catch (error) {
    console.error('Error setting filter enabled state:', error);
  }
};

export const validateFilterCriteria = (criteria: FilterCriteria): boolean => {
  const isValidStringArray = (arr?: string[]): boolean => 
    arr === undefined || (Array.isArray(arr) && arr.every(item => typeof item === 'string'));
  
  return isValidStringArray(criteria.notebookIds) && 
         isValidStringArray(criteria.excludeNotebookIds) &&
         isValidStringArray(criteria.noteIds) &&
         isValidStringArray(criteria.excludeNoteIds) &&
         isValidStringArray(criteria.tags) &&
         isValidStringArray(criteria.excludeTags);
};

export const initConfig = async (): Promise<ReviewsConfig> => {
  await registerSettings();
  return await getConfig();
};
