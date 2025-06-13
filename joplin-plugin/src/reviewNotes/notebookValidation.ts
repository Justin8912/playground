import * as DataApi from './dataApi';

/**
 * Validates a list of notebook names to ensure they exist in the Joplin database
 * 
 * @param notebookNames Array of notebook names to validate
 * @returns Object containing valid and invalid notebook names
 */
export const validateNotebookNames = async (notebookNames: string[]): Promise<{
  valid: string[];
  invalid: string[];
}> => {
  const allNotebooks = await DataApi.getAllNotebooks();
  const notebookTitles = new Set(allNotebooks.map(nb => nb.title.toLowerCase()));
  
  const valid: string[] = [];
  const invalid: string[] = [];
  
  notebookNames.forEach(name => {
    if (notebookTitles.has(name.toLowerCase())) {
      valid.push(name);
    } else {
      invalid.push(name);
    }
  });
  
  return { valid, invalid };
};
