import React, { useState } from 'react';
import './SettingsPage.css';
import SignedInNavbar from '../../components/Navbar/SignedInNavbar';

export default function SettingsPage() {
    const handleSignOut = () => {
        localStorage.removeItem('signedIn');
        window.location.href = '/';
    };
    const [googleConnected, setGoogleConnected] = useState(true);
    const [outlookConnected, setOutlookConnected] = useState(false);
    const [stravaConnected, setStravaConnected] = useState(false);

    return (
        <>
            <SignedInNavbar onSignOut={handleSignOut} />
            <div className="settingspage">
                <div className="settingspage-content">
                    <h1 className="settingspage-title">Apps Connected</h1>
                    <div className="apps-list">
                        <div className="app-toggle">
                            <span className="app-name">Google</span>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={googleConnected}
                                    onChange={() => setGoogleConnected(!googleConnected)}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                        <div className="app-toggle">
                            <span className="app-name">Outlook</span>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={outlookConnected}
                                    onChange={() => setOutlookConnected(!outlookConnected)}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                        <div className="app-toggle">
                            <span className="app-name">Strava</span>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={stravaConnected}
                                    onChange={() => setStravaConnected(!stravaConnected)}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}