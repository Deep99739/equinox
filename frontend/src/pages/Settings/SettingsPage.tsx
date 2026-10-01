import { useEffect, useState } from 'react';
import './SettingsPage.css';
import SignedInNavbar from '../../components/Navbar/SignedInNavbar';
import { fetchUserProfileByEmail } from '../../api/profileApi';
import { getUserEmail, signOut } from '../../utils/authUtils';
import { fetchConnections, handleGoogleSignIn } from '../../api/authApi';

export default function SettingsPage() {
    const userEmail = getUserEmail(); // Get email directly from localStorage

    const handleSignOut = () => {
        void signOut();
    };

    const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);

    // Profile state
    const [profile, setProfile] = useState<{ name: string; email: string; avatar_url?: string } | null>(null);
    const [loading, setLoading] = useState(Boolean(userEmail));

    useEffect(() => {
        if (userEmail) {
            fetchUserProfileByEmail(userEmail)
                .then(setProfile)
                .catch((err) => {
                    console.error('Profile fetch error:', err);
                    // Don't set error - we'll use localStorage email as fallback
                })
                .finally(() => setLoading(false));
        }
    }, [userEmail]);

    useEffect(() => {
        if (!userEmail) return;
        fetchConnections()
            .then(({ google }) => setGoogleConnected(google))
            .catch(() => setGoogleConnected(null));
    }, [userEmail]);

    // Extract name from email (before @) as fallback
    const displayName = profile?.name || userEmail?.split('@')[0] || 'User';
    const displayEmail = profile?.email || userEmail || 'Not available';

    return (
        <>
            <SignedInNavbar onSignOut={handleSignOut} />
            <div className="settingspage">
                <div className="settingspage-content">
                    <h1 className="settingspage-title">Profile</h1>
                    {loading ? (
                        <div className="profile-skeleton">
                            <div className="skeleton-avatar"></div>
                            <div className="skeleton-text"></div>
                            <div className="skeleton-text short"></div>
                        </div>
                    ) : (
                        <div className="profile-section">
                            {profile?.avatar_url && (
                                <img src={profile.avatar_url} alt="avatar" className="profile-avatar" />
                            )}
                            <div className="profile-info">
                                <div className="profile-row">
                                    <span className="profile-label">Name</span>
                                    <span className="profile-value">{displayName}</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">Email</span>
                                    <span className="profile-value">{displayEmail}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="settingspage-content">
                    <h1 className="settingspage-title">Integrations</h1>
                    <div className="apps-list">
                        <div className="app-toggle">
                            <span className="app-name">Google</span>
                            {googleConnected === null ? (
                                <span className="app-status">Status unavailable</span>
                            ) : googleConnected ? (
                                <span className="app-status">Connected</span>
                            ) : (
                                <button className="app-connect" onClick={handleGoogleSignIn}>Connect Google</button>
                            )}
                        </div>
                        <div className="app-toggle">
                            <span className="app-name">Outlook</span>
                            <span className="app-status">Coming soon</span>
                        </div>
                        <div className="app-toggle">
                            <span className="app-name">Strava</span>
                            <span className="app-status">Coming soon</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
