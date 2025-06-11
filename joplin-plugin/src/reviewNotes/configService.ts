import { ReviewsConfig } from './types';

const DEFAULT_CONFIG: ReviewsConfig = {
  reviewsNotebookName: 'Reviews'
};

export const getConfig = async (): Promise<ReviewsConfig> => {
  try {
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('Error getting review notes config:', error);
    return DEFAULT_CONFIG;
  }
};

export const initConfig = async (): Promise<ReviewsConfig> => {
  return await getConfig()
};
