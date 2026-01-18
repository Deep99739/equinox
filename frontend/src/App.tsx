import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatPage from './pages/Chat/ChatPage';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/Home/HomePage';
import AgentsPage from './pages/Agents/AgentsPage';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/agents" element={<AgentsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
