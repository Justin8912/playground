import React, {useState} from 'react';
import './App.css'
import {LoadBoardView, TeamSelector, UserProvider, GameProvider, GameInitializer} from "./components";

enum AppState {
  GAME_INIT,
  TEAM_SELECT,
  BOARD_VIEW
}

const App = () => {
    const [appState, setAppState] = useState<AppState>(AppState.GAME_INIT);

    const handleGameCreated = () => {
        setAppState(AppState.TEAM_SELECT);
    };

    const handleTeamSelected = () => {
        setAppState(AppState.BOARD_VIEW);
    };

    return (
        <GameProvider>
            <UserProvider>
                {appState === AppState.GAME_INIT && (
                    <GameInitializer onGameCreated={handleGameCreated} />
                )}
                {appState === AppState.TEAM_SELECT && (
                    <TeamSelector nextScreen={handleTeamSelected} />
                )}
                {appState === AppState.BOARD_VIEW && (
                    <LoadBoardView />
                )}
            </UserProvider>
        </GameProvider>
    );
}

export default App
