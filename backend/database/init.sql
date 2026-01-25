-- Equinox Database Initialization Script
-- PostgreSQL 16 (Neon Cloud)
-- Using TEXT instead of VARCHAR for flexibility

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email               TEXT UNIQUE NOT NULL,
    name                TEXT NOT NULL,
    avatar_url          TEXT,
    
    -- Gamification
    wellness_xp         INTEGER DEFAULT 0,
    wellness_level      INTEGER DEFAULT 1,
    
    -- Metadata
    timezone            TEXT DEFAULT 'Asia/Kolkata',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(wellness_level DESC);

-- ============================================
-- TABLE 2: user_profiles
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Physical Stats
    age                     INTEGER CHECK (age > 0 AND age < 150),
    height_cm               DECIMAL(5,2),
    weight_kg               DECIMAL(5,2),
    biological_sex          TEXT,
    
    -- Fitness Profile
    fitness_level           TEXT DEFAULT 'beginner' CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
    fitness_goal            TEXT DEFAULT 'general_fitness' CHECK (fitness_goal IN ('lose_weight', 'build_muscle', 'improve_energy', 'reduce_stress', 'general_fitness')),
    preferred_workout_time  TEXT DEFAULT 'flexible' CHECK (preferred_workout_time IN ('morning', 'afternoon', 'evening', 'flexible')),
    workout_preferences     JSONB DEFAULT '[]',
    
    -- Personalized Thresholds
    optimal_sleep_hours     DECIMAL(3,1) DEFAULT 8.0,
    optimal_bedtime         TIME DEFAULT '23:00',
    optimal_wake_time       TIME DEFAULT '07:00',
    energy_peak_hours       JSONB DEFAULT '["09:00", "10:00", "11:00"]',
    
    -- Preferences
    motivation_style        TEXT DEFAULT 'balanced' CHECK (motivation_style IN ('tough_love', 'gentle', 'balanced')),
    notification_enabled    BOOLEAN DEFAULT TRUE,
    daily_checkin_time      TIME DEFAULT '08:00',
    
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);

-- ============================================
-- TABLE 3: health_logs
-- ============================================
CREATE TABLE IF NOT EXISTS health_logs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    date                DATE NOT NULL,
    
    -- Sleep Metrics
    sleep_hours         DECIMAL(4,2) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    sleep_quality       INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    bed_time            TIME,
    wake_time           TIME,
    sleep_interruptions INTEGER DEFAULT 0,
    
    -- Energy & Vitality
    energy_level        INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    morning_energy      INTEGER CHECK (morning_energy >= 1 AND morning_energy <= 10),
    afternoon_energy    INTEGER CHECK (afternoon_energy >= 1 AND afternoon_energy <= 10),
    evening_energy      INTEGER CHECK (evening_energy >= 1 AND evening_energy <= 10),
    
    -- Stress & Mental
    stress_level        INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    anxiety_level       INTEGER CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
    mood_score          INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    focus_level         INTEGER CHECK (focus_level >= 1 AND focus_level <= 10),
    
    -- Physical Activity
    activity_minutes    INTEGER DEFAULT 0,
    steps               INTEGER DEFAULT 0,
    workout_completed   BOOLEAN DEFAULT FALSE,
    workout_type        TEXT,
    workout_intensity   TEXT,
    
    -- Nutrition & Hydration
    water_glasses       INTEGER DEFAULT 0,
    caffeine_cups       INTEGER DEFAULT 0,
    alcohol_units       INTEGER DEFAULT 0,
    meal_quality        INTEGER CHECK (meal_quality >= 1 AND meal_quality <= 5),
    
    -- Calculated Fields
    readiness_score     INTEGER CHECK (readiness_score >= 0 AND readiness_score <= 100),
    sleep_debt_hours    DECIMAL(5,2) DEFAULT 0,
    recovery_score      INTEGER CHECK (recovery_score >= 0 AND recovery_score <= 100),
    
    -- Metadata
    notes               TEXT,
    source              TEXT DEFAULT 'manual',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_health_logs_user_date ON health_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_health_logs_readiness ON health_logs(user_id, readiness_score);

-- ============================================
-- TABLE 4: mood_entries
-- ============================================
CREATE TABLE IF NOT EXISTS mood_entries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    
    logged_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Mood Data
    mood_score      INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    emotions        JSONB DEFAULT '[]',
    energy_snapshot INTEGER CHECK (energy_snapshot >= 1 AND energy_snapshot <= 10),
    
    -- Context
    trigger         TEXT,
    location        TEXT,
    activity        TEXT,
    
    -- Journaling
    gratitude_note  TEXT,
    journal_entry   TEXT,
    
    -- Analysis
    sentiment_score DECIMAL(3,2),
    
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mood_entries_user ON mood_entries(user_id, logged_at DESC);

-- ============================================
-- TABLE 5: workouts
-- ============================================
CREATE TABLE IF NOT EXISTS workouts (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Scheduling
    scheduled_date          DATE NOT NULL,
    scheduled_time          TIME,
    
    -- Workout Details
    type                    TEXT NOT NULL,
    name                    TEXT,
    description             TEXT,
    duration_mins           INTEGER NOT NULL,
    intensity               TEXT CHECK (intensity IN ('low', 'moderate', 'high', 'recovery')),
    
    -- Exercise List
    exercises               JSONB DEFAULT '[]',
    
    -- Recommendation Context
    recommended_for_readiness INTEGER,
    recommendation_reasoning  TEXT,
    
    -- Completion
    status                  TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'skipped', 'modified')),
    completed_at            TIMESTAMP WITH TIME ZONE,
    actual_duration         INTEGER,
    actual_intensity        TEXT,
    
    -- Feedback
    difficulty_rating       INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    enjoyment_rating        INTEGER CHECK (enjoyment_rating >= 1 AND enjoyment_rating <= 5),
    feedback_notes          TEXT,
    would_do_again          BOOLEAN,
    
    -- XP Earned
    xp_earned               INTEGER DEFAULT 0,
    
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, scheduled_date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_status ON workouts(user_id, status);

-- ============================================
-- TABLE 6: streaks
-- ============================================
CREATE TABLE IF NOT EXISTS streaks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    
    type            TEXT NOT NULL,
    current_count   INTEGER DEFAULT 0,
    best_count      INTEGER DEFAULT 0,
    
    last_updated    DATE,
    started_at      DATE,
    
    UNIQUE(user_id, type)
);

CREATE INDEX IF NOT EXISTS idx_streaks_user ON streaks(user_id);

-- ============================================
-- TABLE 7: achievements
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    
    type            TEXT NOT NULL,
    name            TEXT NOT NULL,
    description     TEXT,
    icon            TEXT,
    
    earned_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    xp_awarded      INTEGER DEFAULT 0,
    
    extra_data      JSONB,
    
    UNIQUE(user_id, type)
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id, earned_at DESC);

-- ============================================
-- TABLE 8: agent_signals
-- ============================================
CREATE TABLE IF NOT EXISTS agent_signals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    
    from_agent      TEXT NOT NULL,
    to_agent        TEXT NOT NULL,
    signal_type     TEXT NOT NULL,
    priority        TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    
    payload         JSONB NOT NULL,
    
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed       BOOLEAN DEFAULT FALSE,
    processed_at    TIMESTAMP WITH TIME ZONE,
    response        JSONB,
    
    expires_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_signals_pending ON agent_signals(to_agent, processed, priority) WHERE NOT processed;
CREATE INDEX IF NOT EXISTS idx_signals_user ON agent_signals(user_id, created_at DESC);

-- ============================================
-- TABLE 9: wellness_forecasts
-- ============================================
CREATE TABLE IF NOT EXISTS wellness_forecasts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    
    forecast_date   DATE NOT NULL,
    generated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Predictions
    predicted_readiness     INTEGER,
    predicted_energy_curve  JSONB,
    predicted_sleep_need    DECIMAL(3,1),
    
    -- Recommendations
    recommended_bedtime     TIME,
    recommended_workout     JSONB,
    risk_factors            JSONB,
    
    -- Accuracy Tracking
    actual_readiness        INTEGER,
    accuracy_score          DECIMAL(5,2),
    
    UNIQUE(user_id, forecast_date)
);

CREATE INDEX IF NOT EXISTS idx_forecasts_user_date ON wellness_forecasts(user_id, forecast_date DESC);

-- ============================================
-- INSERT TEST USER
-- ============================================
INSERT INTO users (id, email, name, timezone) VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'test@equinox.com', 'Test User', 'Asia/Kolkata')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_profiles (user_id, age, fitness_level, fitness_goal) VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 25, 'intermediate', 'improve_energy')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO streaks (user_id, type, current_count, best_count) VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'daily_logging', 0, 0),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'good_sleep', 0, 0),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'high_readiness', 0, 0),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'workout_completed', 0, 0)
ON CONFLICT (user_id, type) DO NOTHING;
