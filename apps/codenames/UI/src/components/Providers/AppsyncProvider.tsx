import React, { createContext, useContext, ReactNode } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Amplify } from 'aws-amplify';
import {config} from '../../security/cognito_auth'
import type {V6Client} from "@aws-amplify/api-graphql";

interface GameContextType {
    client: V6Client<never, any>
}

const AppsyncContext = createContext<GameContextType | undefined>(undefined);

interface AppsyncProviderProps {
    children: ReactNode;
}

export const AppsyncProvider = ({ children }: AppsyncProviderProps) => {
    Amplify.configure({Auth: config.Auth})
    const client = generateClient(config.API.GraphQL);

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

