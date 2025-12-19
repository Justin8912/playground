import React from 'react';
import './App.css'
import { AppsyncProvider, UserProvider, GameProvider } from './components/Providers/providers';
import { Router } from './components/Router';

const App = () => {
    return (
        <AppsyncProvider>
            <GameProvider>
                <UserProvider>
                    <Router />
                </UserProvider>
            </GameProvider>
        </AppsyncProvider>
    );
}

export default App
