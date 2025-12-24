import React from 'react';
import './App.css'
import { AppsyncProvider, UserProvider, GameProvider } from './components/Providers/providers';
import { Router } from './components/Router';
import {CookieProvider} from "./components/Providers/CookieProvider";

const App = () => {
    return (
        <AppsyncProvider>
            <CookieProvider>
                <GameProvider>
                    <UserProvider>
                        <Router />
                    </UserProvider>
                </GameProvider>
            </CookieProvider>
        </AppsyncProvider>
    );
}

export default App
