import React from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import {Routes, Route} from 'react-router-dom'
import CreateTrip from './pages/CreateTrip'
import ViewTrip from './pages/view-trip/[tripId]/ViewTrip'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/createTrip" element={<CreateTrip/>}/>
      <Route path="/view-trip/:tripid" element={<ViewTrip/>}/>
    </Routes>
  )
}

export default App