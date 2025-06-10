/**
 * Configuration service for the Review Notes feature
 */

import joplin from 'api';
import { ReviewsConfig } from './types';

const DEFAULT_CONFIG: ReviewsConfig = {
  reviewsNotebookName: 'Reviews'
};

/**
 * Gets the plugin settings
 */
export const getConfig = async (): Promise<ReviewsConfig> => {
  try {
    // In the future, these could be stored in the plugin settings
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('Error getting review notes config:', error);
    return DEFAULT_CONFIG;
  }
};

/**
 * Initializes the config for the review notes feature
 */
export const initConfig = async (): Promise<void> => {
  // In the future, we can add settings for:
  // - Custom notebook name
  // - Filtering options
  // - Schedule for review note generation
  
  // For now, we just use the defaults
  return Promise.resolve();
};
