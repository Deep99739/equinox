import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ChatPage from './pages/Chat/ChatPage';
import './App.css';
import Navbar from './components/Navbar/Navbar';


function Home() {
  const [backendMsg, setBackendMsg] = useState<string | null>(null);

  const testBackend = async () => {
    try {
      const res = await fetch('http://localhost:8001/ping');
      const data = await res.json();
      setBackendMsg(data.message);
    } catch (err) {
      setBackendMsg('Error connecting to backend');
    }
  };

  return (
    <>
      <h1>Equinox</h1>
      <div className="card">
        <button style={{ marginLeft: 8 }} onClick={testBackend}>
          Test Backend Connection
        </button>
        {backendMsg && (
          <p style={{ marginTop: 10 }}>Backend says: {backendMsg}</p>
        )}
     
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
