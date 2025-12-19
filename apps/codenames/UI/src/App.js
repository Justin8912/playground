import React from 'react';
import './App.css';
import { AppsyncProvider, UserProvider, GameProvider } from './components/Providers/providers';
import { Router } from './components/Router';
const App = () => {
    return (React.createElement(AppsyncProvider, null,
        React.createElement(GameProvider, null,
            React.createElement(UserProvider, null,
                React.createElement(Router, null)))));
};
export default App;
