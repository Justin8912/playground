import React, {type FC} from 'react';
import {BoardView} from './BoardView';
import {useCardProvider, useGame, useUser} from './Providers/providers';
import {Role} from "../types/user";
import "./LoadBoardView.css"
import {LogoutButton} from "./LogoutButton";

export const LoadBoardView: FC = () => {
    const {cards} = useCardProvider()
    const { setRole, role, clearUser } = useUser();
    const {ruleset, clearGame} = useGame()

    if (!role) {
        return <div>Refresh</div>
    }
    return (
        <div>
            <div className={"view-selector"}>
            {
                ((role === "owner" || role === "playerview") && (ruleset.toLowerCase() === "multiplayer")) &&
                    <>
                        <button onClick={() => {setRole(Role.Owner)}}>Owner View</button>
                        <button onClick={() => {setRole(Role.PlayerView)}}>Player View</button>
                    </>
            }
                <button onClick={() => {clearUser(); clearGame();}}>Leave Game</button>
                <LogoutButton/>
            </div>
            {
                cards?.length > 0 && <BoardView cards={cards}/>
            }
        </div>
    );
}