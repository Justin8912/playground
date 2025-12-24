import React, {type FC} from 'react';
import {BoardView} from './BoardView';
import {useCardProvider, useGame, useUser} from './Providers/providers';
import {Role} from "../types/user";
import "./LoadBoardView.css"

export const LoadBoardView: FC = () => {
    const {cards} = useCardProvider()
    const { setRole, role } = useUser();
    const {ruleset} = useGame()

    return (
        <div>
            {
                ((role === "owner" || role === "playerview") && (ruleset.toLowerCase() === "multiplayer")) &&
                    <div className={"view-selector"}>
                        <button onClick={() => {setRole(Role.Owner)}}>Owner View</button>
                        <button onClick={() => {setRole(Role.PlayerView)}}>Player View</button>
                    </div>
            }
            <BoardView cards={cards}/>
        </div>
    );
}