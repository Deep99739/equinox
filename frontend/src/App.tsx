

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ChatPage from './pages/Chat/ChatPage';
import './App.css';
import { Navbar } from './components/Navbar/Navbar';
import SignedInNavbar from './components/Navbar/SignedInNavbar';
import HomePage from './pages/Home/HomePage';
import AgentsPage from './pages/Agents/AgentsPage';
import SettingsPage from './pages/Settings/SettingsPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/agents" element={<AgentsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}




function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
