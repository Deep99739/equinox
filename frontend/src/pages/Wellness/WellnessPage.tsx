// src/pages/Wellness/WellnessPage.tsx
import { useEffect, useState, type FormEvent } from 'react';
import SignedInNavbar from '../../components/Navbar/SignedInNavbar';
import {
    logHealth,
    getTodayHealth,
    getReadiness
} from '../../api/healthApi';
import type {
    HealthLogInput,
    HealthLogResponse,
    ReadinessResponse
} from '../../api/healthApi';
import './WellnessPage.css';
import { getUserEmail, signOut } from '../../utils/authUtils';

export default function WellnessPage() {
    const userEmail = getUserEmail();
    const [todayLog, setTodayLog] = useState<HealthLogResponse | null>(null);
    const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Form state - Morning defaults (activity/hydration logged throughout day)
    const [formData, setFormData] = useState<HealthLogInput>({
        user_email: userEmail || undefined,
        sleep_hours: 7,
        sleep_quality: 7,
        energy_level: 7,
        stress_level: 5,
        mood_score: 7,
        activity_minutes: 0,
        steps: 0,
        water_glasses: 0,
        caffeine_cups: 0,
        notes: '',
    });

    const handleSignOut = () => {
        void signOut();
    };

    // Fetch today's log and readiness on mount
    useEffect(() => {
        async function fetchData() {
            if (!userEmail) {
                setIsLoading(false);
                return;
            }
            try {
                const [log, score] = await Promise.all([
                    getTodayHealth(userEmail),
                    getReadiness(userEmail)
                ]);
                setTodayLog(log);
                setReadiness(score);

                // Pre-fill form if log exists
                if (log) {
                    setFormData({
                        user_email: userEmail,
                        sleep_hours: log.sleep_hours || 7,
                        sleep_quality: log.sleep_quality || 7,
                        energy_level: log.energy_level,
                        stress_level: log.stress_level,
                        mood_score: log.mood_score,
                        activity_minutes: log.activity_minutes || 0,
                        steps: log.steps || 0,
                        water_glasses: log.water_glasses || 0,
                        caffeine_cups: log.caffeine_cups || 0,
                        notes: log.notes || '',
                    });
                }
            } catch (err) {
                console.error('Error fetching wellness data:', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [userEmail]);

    const handleSliderChange = (field: keyof HealthLogInput, value: number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleInputChange = (field: keyof HealthLogInput, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMsg('');
        setErrorMsg('');

        try {
            const log = await logHealth(formData);
            setTodayLog(log);

            // Refresh readiness
            const score = await getReadiness(userEmail);
            setReadiness(score);

            setSuccessMsg('Health logged successfully! 🎉');
        } catch (err) {
            console.error('Error logging health:', err);
            setErrorMsg('Failed to log health. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <SignedInNavbar onSignOut={handleSignOut} />
                <div className="wellness-page">
                    <div className="wellness-container">
                        <div className="loading-container">Loading wellness data...</div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <SignedInNavbar onSignOut={handleSignOut} />
            <div className="wellness-page">
                <div className="wellness-container">
                    <div className="wellness-header">
                        <h1>Daily Wellness</h1>
                        <p>Track your health to unlock personalized insights</p>
                    </div>

                    {/* Readiness Score Card (if logged) */}
                    {readiness && (
                        <div className="readiness-card">
                            <div className="readiness-score">
                                <div className={`score-circle ${readiness.zone}`}>
                                    {readiness.score}
                                    <span>{readiness.zone}</span>
                                </div>
                                <div className="readiness-info">
                                    <h3>Today's Readiness</h3>
                                    <p>{readiness.summary}</p>
                                    <div className="suggestions">
                                        {readiness.suggestions.map((s, i) => (
                                            <span key={i} className="suggestion-tag">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Health Logging Form */}
                    <div className="health-form-card">
                        <h2>{todayLog ? 'Update Today\'s Log' : 'Log Today\'s Health'}</h2>

                        {successMsg && <div className="success-message">{successMsg}</div>}
                        {errorMsg && <div className="error-message">{errorMsg}</div>}

                        <form onSubmit={handleSubmit}>
                            {/* Morning Check-In Section */}
                            <div className="form-section">
                                <h3>Sleep</h3>
                                <p className="section-hint">How did you sleep last night?</p>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Hours Slept</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="24"
                                            step="0.5"
                                            value={formData.sleep_hours}
                                            onChange={(e) => handleInputChange('sleep_hours', parseFloat(e.target.value) || 0)}
                                            placeholder="7.5"
                                        />
                                    </div>
                                    <div className="slider-group">
                                        <div className="slider-header">
                                            <label>Sleep Quality</label>
                                            <span className="slider-value">{formData.sleep_quality}/10</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={formData.sleep_quality}
                                            onChange={(e) => handleSliderChange('sleep_quality', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Energy & Mood</h3>
                                <p className="section-hint">How are you feeling right now?</p>
                                <div className="form-row">
                                    <div className="slider-group">
                                        <div className="slider-header">
                                            <label>Energy Level</label>
                                            <span className="slider-value">{formData.energy_level}/10</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={formData.energy_level}
                                            onChange={(e) => handleSliderChange('energy_level', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="slider-group">
                                        <div className="slider-header">
                                            <label>Stress Level</label>
                                            <span className="slider-value">{formData.stress_level}/10</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={formData.stress_level}
                                            onChange={(e) => handleSliderChange('stress_level', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="slider-group">
                                        <div className="slider-header">
                                            <label>Mood</label>
                                            <span className="slider-value">{formData.mood_score}/10</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={formData.mood_score}
                                            onChange={(e) => handleSliderChange('mood_score', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Daily Tracking Section - Update Throughout Day */}
                            <div className="form-section daily-tracking">
                                <h3>Activity</h3>
                                <p className="section-hint">Update these throughout the day</p>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Activity Minutes</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.activity_minutes || ''}
                                            onChange={(e) => handleInputChange('activity_minutes', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Steps</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.steps || ''}
                                            onChange={(e) => handleInputChange('steps', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section daily-tracking">
                                <h3>Nutrition</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Water (glasses)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.water_glasses || ''}
                                            onChange={(e) => handleInputChange('water_glasses', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Caffeine (cups)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.caffeine_cups || ''}
                                            onChange={(e) => handleInputChange('caffeine_cups', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="form-section">
                                <h3>Notes</h3>
                                <div className="form-group">
                                    <textarea
                                        rows={3}
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        placeholder="How are you feeling today? Any notes..."
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : (todayLog ? 'Update Log' : 'Log Health')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            </div >
        </>
    );
}
