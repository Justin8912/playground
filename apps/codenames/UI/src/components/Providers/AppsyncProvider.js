import React, { createContext, useContext } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Amplify } from 'aws-amplify';
import config from '../../security/aws-exports.js';
const AppsyncContext = createContext(undefined);
export function buildAmplifyClient(config) {
    Amplify.configure(config);
    return generateClient();
}
export const AppsyncProvider = ({ children }) => {
    const client = buildAmplifyClient(config);
    return (React.createElement(AppsyncContext.Provider, { value: { client } }, children));
};
export const useAppsync = () => {
    const context = useContext(AppsyncContext);
    if (context === undefined) {
        throw new Error('useAppsync must be used within an AppsyncProvider');
    }
    return context;
};
