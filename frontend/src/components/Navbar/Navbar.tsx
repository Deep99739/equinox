import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
    return (
        <nav className="navbar">
       
            <div className="navbar-links">
                <Link className="navbar-link" to="/">Home</Link>
                <Link className="navbar-link" to="/chat">Chat</Link>
                <Link className="navbar-link" to="/agents">Agents</Link>
            </div>
        </nav>
    );
}