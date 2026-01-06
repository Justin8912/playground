import React, {type FC, ReactElement, useEffect} from "react";
import {GameInitializer} from "./GameInitializer";
import {TeamSelector} from "./TeamSelector";
import {LoadBoardView} from "./LoadBoardView";
import {CardProvider, useGame, useUser} from "./Providers/providers";
import { signInWithRedirect, signOut } from 'aws-amplify/auth';
import { fetchAuthSession } from "aws-amplify/auth";

function login() {
    signInWithRedirect();
}

function logout() {
    signOut();
}


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
    const {gameId} = useGame();
    const {role} = useUser();

    useEffect(() => {
        const handleLogin = async () => {
            const session = await fetchAuthSession()
            if (!session.tokens) {
                login();
            }
        }

        handleLogin();
    }, [])

    const CurrentView = () => {
        return (
            <>
                {(getAppState(gameId, role) === AppState.GAME_INIT) && (
                    <>
                        <button onClick={() => logout()}>Log out</button>
                        <GameInitializer />
                    </>
                )}
                {(getAppState(gameId, role) === AppState.TEAM_SELECT) && (
                    <>
                        <button onClick={() => logout()}>Log out</button>
                        <TeamSelector />
                    </>
                )}
                {(getAppState(gameId, role) === AppState.BOARD_VIEW) && (
                    <>
                        <button onClick={() => logout()}>Log out</button>
                        <CardProvider>
                            <LoadBoardView />
                        </CardProvider>
                    </>
                )}
            </>
        )
    }

    return (
        <CurrentView />
    )
}