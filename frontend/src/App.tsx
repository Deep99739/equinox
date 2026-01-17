import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


function App() {
  const [count, setCount] = useState(0)
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
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button style={{marginLeft: 8}} onClick={testBackend}>
          Test Backend Connection
        </button>
        {backendMsg && (
          <p style={{marginTop: 10}}>Backend says: {backendMsg}</p>
        )}
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
