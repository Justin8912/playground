import React from 'react';
import './App.css'
import {getGameById} from "./backend/queries";
import {LoadBoardView} from "./components/ApolloLoader";

const App = () => {
  console.log("app")
    return (
    <>
      <LoadBoardView query={getGameById} variables={{"id": "68ff7b2a1cb39ffff730c967"}} />
    </>
  )
}

export default App
