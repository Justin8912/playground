import React, {useState} from 'react';
import './App.css'
import {LoadBoardView, TeamSelector, UserProvider} from "./components";

const App = () => {
    const [viewBoard, setViewBoard] = useState(false);

    const nextScreen = () => {
        setViewBoard(true);
    }
    return (
    <UserProvider>
        {viewBoard ?
            <LoadBoardView variables={{"id": "68ff7b2a1cb39ffff730c967"}} />
            :
            <TeamSelector nextScreen={nextScreen}/>
        }
    </UserProvider>
  )
}

export default App
