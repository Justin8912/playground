import { useState } from 'react'
import {BoardView} from './components/BoardView';
import {type Card} from './types';
import {initializeCardArray} from './utility/initializer';
import './App.css'

function App() {
  const cards: Card[][] = initializeCardArray();
  return (
    <>
      <BoardView cards={cards}/>
    </>
  )
}

export default App
