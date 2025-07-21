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
  },
  llmApiKey: '',
  llmApiEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
  knowledgeControlTag: ''
};

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
      public: false,
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

    // The filter criteria is stored as a JSON string since Joplin
    // settings don't support complex objects directly
    'filterCriteria': {
      value: JSON.stringify(config.filterCriteria),
      type: SettingItemType.String,
      section: SECTION_NAME,
      public: false,
      label: 'Filter Criteria',
      description: 'JSON configuration for note filtering'
    },

    'llmApiKey': {
      value: config.llmApiKey,
      type: SettingItemType.String,
      section: SECTION_NAME,
      public: true,
      secure: true,
      label: 'LLM API Key',
      description: 'API key for accessing the LLM service (OpenRouter.ai)'
    },

    'llmApiEndpoint': {
      value: config.llmApiEndpoint,
      type: SettingItemType.String,
      section: SECTION_NAME,
      public: true,
      label: 'LLM API Endpoint',
      description: 'API endpoint for the LLM service'
    },

    'knowledgeControlTag': {
      value: config.knowledgeControlTag,
      type: SettingItemType.String,
      section: SECTION_NAME,
      isEnum: true,
      public: true,
      label: 'External Knowledge Tag',
      description: 'Notes with this tag will allow the LLM to use external knowledge beyond the note content',
      options: await getTagOptions()
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
      'excludedTag',
      'llmApiKey',
      'llmApiEndpoint',
      'knowledgeControlTag'
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

      const notebookNames = excludedNotebooksStr
        .split(',')
        .map(id=>id.trim().toLowerCase())
        .filter(name => name.length > 0);
      
      // Update the filter criteria with the notebook IDs
      if (notebookNames.length > 0) {
        filterCriteria.excludeNotebookIds = notebookNames;
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
      filterCriteria,
      llmApiKey: values.llmApiKey as string || DEFAULT_CONFIG.llmApiKey,
      llmApiEndpoint: values.llmApiEndpoint as string || DEFAULT_CONFIG.llmApiEndpoint,
      knowledgeControlTag: values.knowledgeControlTag as string || DEFAULT_CONFIG.knowledgeControlTag
    };
  } catch (error) {
    console.error('Error getting review notes config:', error);
    return DEFAULT_CONFIG;
  }
};

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
