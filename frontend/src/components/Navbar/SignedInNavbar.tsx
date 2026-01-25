
import React from 'react';
import { Link } from 'react-router-dom';
import './SignedNavbar.css'; // This is correct, but ensure the file exists and is named correctly

export default function SignedInNavbar({ onSignOut }: { onSignOut?: () => void }) {
    return (
        <nav className="navbar">
            <div className="navbar-links">
                <Link className="navbar-link" to="/chat">Chat</Link>
                <Link className="navbar-link" to="/agents">Agents</Link>
                <Link className="navbar-link" to="/settings">Settings</Link>
                <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit', padding: 0 }} onClick={onSignOut}>Sign Out</button>
            </div>
        </nav>
    );
}
