import React from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import {Routes, Route} from 'react-router-dom'
import CreateTrip from './pages/CreateTrip'
import ViewTrip from './pages/view-trip/[tripId]/ViewTrip'
import MyTrip from './pages/MyTrip'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/createTrip" element={<CreateTrip/>}/>
      <Route path="/view-trip/:docId" element={<ViewTrip/>}/>
      <Route path='/my-trips' element={<MyTrip/>}/>
    </Routes>
  )
}

export default App