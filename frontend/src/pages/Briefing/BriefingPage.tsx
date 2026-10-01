import { useState } from 'react';
import { getUserEmail, isAuthenticated, signOut } from '../../utils/authUtils';
import { generateBriefing, sendBriefingEmail, type BriefingResponse } from '../../api/briefingApi';
import { fetchTodos, type Todo } from '../../api/todosApi';
import SignedInNavbar from '../../components/Navbar/SignedInNavbar';
import './BriefingPage.css';

export default function BriefingPage() {
    const [briefing, setBriefing] = useState<BriefingResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailSent, setEmailSent] = useState(false);

    // Tasks state
    const [tasks, setTasks] = useState<Todo[]>([]);
    const [showTasks, setShowTasks] = useState(false);
    const [loadingTasks, setLoadingTasks] = useState(false);

    const userEmail = getUserEmail();
    const isLoggedIn = isAuthenticated();
    const unreadEmails = briefing?.unread_emails ?? briefing?.critical_emails ?? 0;

    const handleSignOut = () => {
        void signOut();
    };

    const handleGenerateBriefing = async () => {
        if (!userEmail) {
            setError('Please sign in to generate your briefing');
            return;
        }

        setLoading(true);
        setError(null);
        setEmailSent(false);
        setShowTasks(false);

        try {
            const data = await generateBriefing(userEmail);
            setBriefing(data);

            // Pre-fetch tasks if we have them
            if (data.tasks_count > 0) {
                fetchTasks();
            }
        } catch (err) {
            console.error('Briefing generation error:', err);
            setError('Failed to generate briefing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        if (!userEmail) return;
        setLoadingTasks(true);
        try {
            const data = await fetchTodos(userEmail);
            setTasks(data.filter(t => !t.completed));
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        } finally {
            setLoadingTasks(false);
        }
    };

    const handleSendEmail = async () => {
        if (!userEmail) return;

        setSendingEmail(true);
        setError(null);

        try {
            await sendBriefingEmail(userEmail);
            setEmailSent(true);
        } catch (err) {
            console.error('Email send error:', err);
            setError('Failed to send email. Please re-authenticate with Google.');
        } finally {
            setSendingEmail(false);
        }
    };

    return (
        <>
            <SignedInNavbar onSignOut={handleSignOut} />
            <div className="briefing-page">
                <div className="briefing-container">
                    <h1 className="briefing-page-title">Morning Briefing</h1>
                    <p className="briefing-page-subtitle">
                        Your daily summary combining wellness and productivity
                    </p>

                    {!briefing && (
                        <button
                            className="btn btn--primary btn-generate"
                            onClick={handleGenerateBriefing}
                            disabled={loading || !isLoggedIn}
                        >
                            {loading ? 'Generating...' : 'Generate Briefing'}
                        </button>
                    )}

                    {error && (
                        <div className="briefing-error">
                            <p>{error}</p>
                        </div>
                    )}

                    {emailSent && (
                        <div className="briefing-success">
                            <p>✅ Briefing sent to your email!</p>
                        </div>
                    )}

                    {briefing && (
                        <div className="briefing-card">
                            <h2 className="briefing-greeting">{briefing.greeting} 🌅</h2>

                            <div className="briefing-items">
                                {isLoggedIn && (
                                    <div className="briefing-item">
                                        <span className="briefing-icon">🌙</span>
                                        <span className="briefing-text">
                                            {briefing.sleep_score === null
                                                ? 'No sleep data logged today'
                                                : `Sleep Score: ${briefing.sleep_score}`}
                                        </span>
                                    </div>
                                )}

                                <div className="briefing-item">
                                    <span className="briefing-icon">📧</span>
                                    <span className="briefing-text">
                                        {unreadEmails} Recent Unread Email{unreadEmails !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div
                                    className="briefing-item clickable"
                                    onClick={() => setShowTasks(!showTasks)}
                                    style={{ cursor: 'pointer', borderBottom: showTasks ? 'none' : '' }}
                                >
                                    <span className="briefing-icon">✅</span>
                                    <span className="briefing-text">
                                        {briefing.schedule_updated
                                            ? `${briefing.tasks_count} Open Task${briefing.tasks_count !== 1 ? 's' : ''} (Click to ${showTasks ? 'hide' : 'view'})`
                                            : 'No open tasks'}
                                    </span>
                                </div>

                                {showTasks && (
                                    <div className="briefing-tasks-list" style={{
                                        padding: '0 1rem 1rem 3.5rem',
                                        marginTop: '-0.5rem',
                                        marginBottom: '1rem',
                                        borderBottom: '1px solid var(--color-border)'
                                    }}>
                                        {loadingTasks ? (
                                            <p className="text-secondary">Loading tasks...</p>
                                        ) : tasks.length > 0 ? (
                                            <ul style={{ listStyle: 'disk', paddingLeft: '1rem' }}>
                                                {tasks.map(task => (
                                                    <li key={task.id} style={{ marginBottom: '0.4rem', color: 'var(--color-text-secondary)' }}>
                                                        {task.text}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-secondary">No pending tasks found.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {briefing.summary && (
                                <div className="briefing-summary">
                                    <p>{briefing.summary}</p>
                                </div>
                            )}

                            <div className="briefing-actions">
                                <button
                                    className="btn btn--primary btn-send-email"
                                    onClick={handleSendEmail}
                                    disabled={sendingEmail || emailSent}
                                >
                                    {sendingEmail ? 'Sending...' : emailSent ? 'Email Sent ✓' : '📤 Send to Email'}
                                </button>
                                <button
                                    className="btn btn--secondary btn-new-briefing"
                                    onClick={handleGenerateBriefing}
                                    disabled={loading}
                                >
                                    Refresh Briefing
                                </button>
                            </div>
                        </div>
                    )}

                    {!isLoggedIn && !briefing && (
                        <div className="briefing-sign-in-prompt">
                            <p>Please sign in to view your daily briefing</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
