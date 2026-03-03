-- Tamu Database Schema

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    picture TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    equipment TEXT NOT NULL,
    movement_type TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#ff6b35',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS workout_exercises (
    id TEXT PRIMARY KEY,
    workout_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    target_sets INTEGER NOT NULL DEFAULT 3,
    target_reps_min INTEGER NOT NULL DEFAULT 8,
    target_reps_max INTEGER NOT NULL DEFAULT 12,
    rest_seconds INTEGER NOT NULL DEFAULT 120,
    notes TEXT,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    workout_id TEXT NOT NULL,
    started_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (workout_id) REFERENCES workouts(id)
);

CREATE TABLE IF NOT EXISTS set_logs (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    workout_exercise_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    weight REAL,
    reps INTEGER NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'moderate',
    completed_at TEXT DEFAULT (datetime('now')),
    notes TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

CREATE TABLE IF NOT EXISTS progressions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    suggested_weight REAL,
    suggested_reps_min INTEGER,
    suggested_reps_max INTEGER,
    reason TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    applied INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exercises_user ON exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_workouts_user ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_workout ON sessions(workout_id);
CREATE INDEX IF NOT EXISTS idx_set_logs_session ON set_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_set_logs_exercise ON set_logs(exercise_id);
CREATE INDEX IF NOT EXISTS idx_progressions_user_exercise ON progressions(user_id, exercise_id);
