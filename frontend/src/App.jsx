//import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Index from './pages/Index'
function App() {

  return (
   <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/index" element={<Index />} />
   </Routes>
  )
}

export default App
