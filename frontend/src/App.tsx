import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatPage from './pages/Chat/ChatPage';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/Home/HomePage';
import AgentsPage from './pages/Agents/AgentsPage';
import SettingsPage from './pages/Settings/SettingsPage';



function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
