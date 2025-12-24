import React, {type FC, ReactElement, useState} from "react";
import {GameInitializer} from "./GameInitializer";
import {TeamSelector} from "./TeamSelector";
import {LoadBoardView} from "./LoadBoardView";
import {CardProvider, useGame, useUser} from "./Providers/providers";

enum AppState {
    GAME_INIT,
    TEAM_SELECT,
    BOARD_VIEW
}

const getAppState = (gameId, role): AppState => {
    if (gameId && role) {
        return AppState.BOARD_VIEW;
    } else if (gameId && !role) {
        return AppState.TEAM_SELECT;
    } else {
        return AppState.GAME_INIT;
    }
}

export const Router: FC = (): ReactElement => {
    const [appState, setAppState] = useState<AppState>(AppState.GAME_INIT);
    const {gameId} = useGame();
    const {role, team} = useUser();

    const handleGameCreated = () => {
        setAppState(AppState.TEAM_SELECT);
    };

    const handleTeamSelected = () => {
        setAppState(AppState.BOARD_VIEW);
    };

    const CurrentView = () => {
        return (
            <>
                {(getAppState(gameId, role) === AppState.GAME_INIT) && (
                    <GameInitializer onGameCreated={handleGameCreated} />
                )}
                {(getAppState(gameId, role) === AppState.TEAM_SELECT) && (
                    <TeamSelector nextScreen={handleTeamSelected} />
                )}
                {(getAppState(gameId, role) === AppState.BOARD_VIEW) && (
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