import React, { useState } from "react";
import { GameInitializer } from "./GameInitializer";
import { TeamSelector } from "./TeamSelector";
import { LoadBoardView } from "./LoadBoardView";
import { CardProvider } from "./Providers/providers";
var AppState;
(function (AppState) {
    AppState[AppState["GAME_INIT"] = 0] = "GAME_INIT";
    AppState[AppState["TEAM_SELECT"] = 1] = "TEAM_SELECT";
    AppState[AppState["BOARD_VIEW"] = 2] = "BOARD_VIEW";
})(AppState || (AppState = {}));
export const Router = () => {
    const [appState, setAppState] = useState(AppState.GAME_INIT);
    const handleGameCreated = () => {
        setAppState(AppState.TEAM_SELECT);
    };
    const handleTeamSelected = () => {
        setAppState(AppState.BOARD_VIEW);
    };
    const CurrentView = () => {
        return (React.createElement(React.Fragment, null,
            appState === AppState.GAME_INIT && (React.createElement(GameInitializer, { onGameCreated: handleGameCreated })),
            appState === AppState.TEAM_SELECT && (React.createElement(TeamSelector, { nextScreen: handleTeamSelected })),
            appState === AppState.BOARD_VIEW && (React.createElement(CardProvider, null,
                React.createElement(LoadBoardView, null)))));
    };
    return (React.createElement(CurrentView, null));
};
