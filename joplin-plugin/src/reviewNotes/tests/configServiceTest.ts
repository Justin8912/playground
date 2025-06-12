// This is a manual test file for verifying the notebook filtering functionality
import joplin from 'api';
import { getConfig, saveFilterCriteria } from '../configService';
import * as DataApi from '../dataApi';
import { FilterCriteria } from '../types';

/**
 * Test the notebook exclusion functionality
 * This can be run manually to verify the feature works
 */
export const testNotebookExclusion = async (): Promise<void> => {
  console.log('Testing notebook exclusion functionality...');
  
  // 1. Get all notebooks to display for reference
  const allNotebooks = await DataApi.getAllNotebooks();
  console.log('Available notebooks:', allNotebooks.map(nb => ({ id: nb.id, title: nb.title })));
  
  // 2. Test setting excluded notebooks by name
  const testNotebookNames = allNotebooks.slice(0, 2).map(nb => nb.title);
  console.log('Setting these notebooks to be excluded:', testNotebookNames);
  
  // Update the settings
  await joplin.settings.setValue('excludedNotebooks', testNotebookNames.join(','));
  
  // 3. Get the config and verify the IDs were set correctly
  const config = await getConfig();
  console.log('Excluded notebook IDs after update:', config.filterCriteria.excludeNotebookIds);
  
  // 4. Test saving filter criteria and verify it updates the setting
  const testCriteria: FilterCriteria = {
    ...config.filterCriteria,
    excludeNotebookIds: [allNotebooks[2]?.id, allNotebooks[3]?.id].filter(Boolean)
  };
  
  await saveFilterCriteria(testCriteria);
  
  // 5. Check the value of the excludedNotebooks setting
  const excludedNotebooksStr = await joplin.settings.value('excludedNotebooks') as string;
  console.log('Excluded notebooks setting after saveFilterCriteria:', excludedNotebooksStr);
  
  // 6. Get config again to verify full round-trip
  const updatedConfig = await getConfig();
  console.log('Final config state:', updatedConfig);
};
