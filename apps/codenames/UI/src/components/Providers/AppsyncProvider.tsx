import React, { createContext, useContext, ReactNode } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Amplify } from 'aws-amplify';
import config from '../../security/aws-exports.js';
import type {V6Client} from "@aws-amplify/api-graphql";

interface GameContextType {
    client: V6Client<never, any>
}

const AppsyncContext = createContext<GameContextType | undefined>(undefined);

interface AppsyncProviderProps {
    children: ReactNode;
}

export function buildAmplifyClient(config: any): V6Client<never, any> {
    Amplify.configure(config);
    return generateClient();
}

export const AppsyncProvider = ({ children }: AppsyncProviderProps) => {
    const client = buildAmplifyClient(config);

    return (
        <AppsyncContext.Provider value={{ client }}>
            {children}
        </AppsyncContext.Provider>
    );
};

export const useAppsync = () => {
    const context = useContext(AppsyncContext);
    if (context === undefined) {
        throw new Error('useAppsync must be used within an AppsyncProvider');
    }
    return context;
};

