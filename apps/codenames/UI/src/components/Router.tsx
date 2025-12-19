import React, {type FC, ReactElement, useState} from "react";
import {GameInitializer} from "./GameInitializer";
import {TeamSelector} from "./TeamSelector";
import {LoadBoardView} from "./LoadBoardView";
import { CardProvider } from "./Providers/providers";

enum AppState {
    GAME_INIT,
    TEAM_SELECT,
    BOARD_VIEW
}

export const Router: FC = (): ReactElement => {
    const [appState, setAppState] = useState<AppState>(AppState.GAME_INIT);

    const handleGameCreated = () => {
        setAppState(AppState.TEAM_SELECT);
    };

    const handleTeamSelected = () => {
        setAppState(AppState.BOARD_VIEW);
    };

    const CurrentView = () => {
        return (
            <>
                {appState === AppState.GAME_INIT && (
                    <GameInitializer onGameCreated={handleGameCreated} />
                )}
                {appState === AppState.TEAM_SELECT && (
                    <TeamSelector nextScreen={handleTeamSelected} />
                )}
                {appState === AppState.BOARD_VIEW && (
                    <CardProvider>
                        <LoadBoardView />
                    </CardProvider>
                )}
            </>
        )
    }

    return (
        <CurrentView />
    )
}