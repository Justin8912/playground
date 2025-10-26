import { useState } from 'react'
import './App.css'
import {getGameById} from "./backend/queries";
import {LoadBoardView} from "./components/ApolloLoader";

const App = () => {
  return (
    <>
      <LoadBoardView query={getGameById} variables={{"id": "68fe7aa02e5c160054c82517"}} />
    </>
  )
}

export default App
