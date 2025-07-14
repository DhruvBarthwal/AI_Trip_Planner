import React from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import {Routes, Route} from 'react-router-dom'
import CreateTrip from './pages/CreateTrip'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/createTrip" element={<CreateTrip/>}/>
    </Routes>
  )
}

export default App