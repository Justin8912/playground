import React, {type FC} from 'react';
import {BoardView} from './BoardView';
import {useCardProvider, useUser} from './Providers/providers';
import {Role} from "../types/user";
import "./LoadBoardView.css"

export const LoadBoardView: FC = () => {
    const {cards} = useCardProvider()
    const { setRole, role } = useUser();

    console.log("Here is your role: ", role);
    return (
        <div>
            {
                (role === "owner" || role === "playerview") &&
                    <div className={"view-selector"}>
                        <button onClick={() => {setRole(Role.Owner)}}>Owner View</button>
                        <button onClick={() => {setRole(Role.PlayerView)}}>Player View</button>
                    </div>
            }
            <BoardView cards={cards}/>
        </div>
    );
}