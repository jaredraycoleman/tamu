# Tamu — Workout Builder & Smart Progression Tracker

## Overview

Tamu is a mobile-first web app for building custom workout routines, tracking sets in real-time with rest timers, and getting intelligent progression suggestions inspired by spaced repetition. Users rate each set's difficulty (easy/moderate/hard/failed), and the app uses that subjective data alongside objective performance (weight × reps) to recommend when to increase weight, add reps, or hold steady.

The app is designed to complement a Supernatural VR fitness routine — users primarily need to track dumbbell/bodyweight strength training done 2-3 days per week alongside their VR cardio sessions.

## Tech Stack

- **Frontend**: SvelteKit (Svelte 5 with runes)
- **Hosting**: Cloudflare Pages
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: Google OAuth 2.0 (server-side flow with JWT stored in httpOnly cookie)
- **Adapter**: @sveltejs/adapter-cloudflare
- **Styling**: Plain CSS (no Tailwind), mobile-first, dark theme
- **No additional UI libraries** — keep it lean

## Design Direction

- **Mobile-first**: Max container width ~480px, large touch targets (min 48px), 16px font inputs to prevent iOS zoom
- **Dark theme**: Deep navy/charcoal background (#0a0a0f), warm orange accent (#ff6b35)
- **Typography**: DM Sans for body, JetBrains Mono for numbers/timer
- **Aesthetic**: Clean, utilitarian gym-app feel. No gradients or flashy effects. Cards with subtle borders, monospace numbers, clear hierarchy.
- **Bottom navigation**: 3 tabs — Workouts, Exercises, History
- **PWA-ready**: Add meta tags for mobile web app capability, theme-color, viewport-fit=cover, safe-area-inset handling

## Database Schema (D1)

### users
- `id` TEXT PRIMARY KEY — Google sub ID
- `email` TEXT NOT NULL UNIQUE
- `name` TEXT NOT NULL
- `picture` TEXT
- `created_at` TEXT DEFAULT datetime('now')
- `updated_at` TEXT DEFAULT datetime('now')

### exercises
Pre-loaded library + user-created exercises.
- `id` TEXT PRIMARY KEY — nanoid
- `user_id` TEXT nullable — NULL = system exercise, set = user-created
- `name` TEXT NOT NULL
- `muscle_group` TEXT NOT NULL — enum: chest, back, shoulders, biceps, triceps, quads, hamstrings, glutes, core, calves, full_body
- `equipment` TEXT NOT NULL — enum: dumbbell, barbell, bodyweight, cable, machine, band, kettlebell, other
- `movement_type` TEXT NOT NULL — compound or isolation
- `description` TEXT
- `created_at` TEXT

### workouts
Named routines (e.g., "Day A — Push").
- `id` TEXT PRIMARY KEY
- `user_id` TEXT NOT NULL (FK users)
- `name` TEXT NOT NULL
- `description` TEXT
- `color` TEXT DEFAULT '#ff6b35' — for UI card differentiation
- `sort_order` INTEGER DEFAULT 0
- `created_at`, `updated_at` TEXT

### workout_exercises
Exercises within a workout template, with target parameters.
- `id` TEXT PRIMARY KEY
- `workout_id` TEXT NOT NULL (FK workouts, CASCADE delete)
- `exercise_id` TEXT NOT NULL (FK exercises, RESTRICT delete)
- `sort_order` INTEGER NOT NULL DEFAULT 0
- `target_sets` INTEGER NOT NULL DEFAULT 3
- `target_reps_min` INTEGER NOT NULL DEFAULT 8
- `target_reps_max` INTEGER NOT NULL DEFAULT 12
- `rest_seconds` INTEGER NOT NULL DEFAULT 120
- `notes` TEXT

### sessions
Each time a workout is performed.
- `id` TEXT PRIMARY KEY
- `user_id` TEXT NOT NULL (FK users)
- `workout_id` TEXT NOT NULL (FK workouts)
- `started_at` TEXT DEFAULT datetime('now')
- `completed_at` TEXT
- `notes` TEXT

### set_logs
Actual performance data per set — the core tracking data.
- `id` TEXT PRIMARY KEY
- `session_id` TEXT NOT NULL (FK sessions, CASCADE delete)
- `workout_exercise_id` TEXT NOT NULL (FK workout_exercises)
- `exercise_id` TEXT NOT NULL — denormalized for easier history queries
- `set_number` INTEGER NOT NULL
- `weight` REAL nullable — NULL for bodyweight exercises
- `reps` INTEGER NOT NULL
- `difficulty` TEXT NOT NULL DEFAULT 'moderate' — easy, moderate, hard, failed
- `completed_at` TEXT DEFAULT datetime('now')
- `notes` TEXT

### progressions
Computed suggestions stored after each session.
- `id` TEXT PRIMARY KEY
- `user_id` TEXT NOT NULL (FK users)
- `exercise_id` TEXT NOT NULL (FK exercises)
- `suggested_weight` REAL
- `suggested_reps_min` INTEGER
- `suggested_reps_max` INTEGER
- `reason` TEXT — human-readable explanation shown to user
- `created_at` TEXT
- `applied` INTEGER DEFAULT 0

## Seed Data

Include a pre-loaded exercise library (~30-35 exercises) covering:
- **Chest**: DB bench press, incline DB press, DB flyes, push-ups, dips, decline push-ups
- **Back**: Pull-ups, chin-ups, single-arm DB row, bent-over DB row, band pull-apart
- **Shoulders**: DB overhead press, lateral raise, reverse DB flyes, front raise, DB shrugs
- **Biceps**: DB curl, hammer curl, incline curl, concentration curl
- **Triceps**: Overhead tricep extension, kickback, DB skullcrusher, diamond push-ups
- **Legs**: Goblet squat, DB lunges, DB Romanian deadlift, Bulgarian split squat, calf raises, sumo squat
- **Core**: Plank, DB Russian twist, hanging leg raise

System exercises have `user_id = NULL`. Users can also create custom exercises.

## Auth Flow

1. User clicks "Sign in with Google" → server redirects to Google OAuth consent screen
2. Google redirects back to `/api/auth/callback` with authorization code
3. Server exchanges code for tokens, fetches user info from Google
4. Server upserts user in D1
5. Server creates a JWT (HS256, 7-day expiry) containing `{ sub, email, name, picture }`
6. JWT stored in httpOnly, secure, sameSite=lax cookie named `Tamu_token`
7. SvelteKit hooks.server.js verifies JWT on every request and populates `event.locals.user`
8. All `/app/*` routes are protected — redirect to `/login` if no valid user

Use Web Crypto API for JWT signing/verification (no Node.js crypto). Generate IDs with a simple nanoid implementation using `crypto.getRandomValues`.

Environment variables (set in wrangler.toml and Cloudflare dashboard):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `APP_URL` (e.g., https://Tamu.yourdomain.com)
- `JWT_SECRET`

## App Pages & Routes

### `/` — Landing Page
- Logo, tagline ("Build workouts. Track sets. Get stronger."), subtitle about smart progression
- "Sign in with Google" button (or "Open App" if already authenticated)
- 3 feature cards: Build Workouts, Live Tracking, Smart Progression

### `/login` — Login Page
- Simple centered card with Google OAuth button

### `/app` — Workouts List (Tab 1)
- List of user's workout templates as cards
- Each card shows: name, color accent bar, exercise count, last performed date (relative: "Today", "3d ago", etc.)
- "New Workout" button opens inline form: name, description, color picker (6 preset colors)
- Tapping a workout card → `/app/workouts/[id]`

### `/app/workouts/[id]` — Workout Detail
- Shows workout name, description, and ordered list of exercises
- Each exercise card shows: order number, exercise name, muscle group/equipment/movement type tags, target sets × reps range, rest time
- If a progression suggestion exists for an exercise, show it as an accent-colored card with 💡 icon and the reason text
- "Start Workout" button at top → navigates to `/app/session/[id]`
- "Add Exercise" button at bottom → expands inline exercise picker with muscle group filter chips (horizontally scrollable) and a list of available exercises with a "+" button to add each
- When adding an exercise, auto-set sensible defaults: compound = 4 sets, 8-10 reps, 150s rest; isolation = 3 sets, 8-12 reps, 90s rest
- Ability to remove exercises (with confirmation or just a simple X button)

### `/app/session/[id]` — Live Workout Session (Core Experience)
This is the most important page. It should feel fast and minimal — the user is between sets at the gym.

**Layout:**
- Fixed progress bar at very top showing % of sets completed
- Current exercise name, position (e.g., "2 / 5"), muscle group and equipment tags
- Set indicator with dot visualization (filled = completed, ring = current, empty = remaining)

**Set logging flow:**
1. Show weight stepper (−5 / input / +5), reps stepper (−1 / input / +1)
2. Pre-fill weight and reps from: (a) progression suggestion if available, (b) last session's data, (c) fallback to target reps min
3. Difficulty selector: 4 buttons in a row — Easy 😊, Moderate 😤, Hard 🥵, Failed ❌. Default to Moderate. Selected state has a colored border.
4. "Log Set →" button

**After logging a set:**
- If more sets remain for this exercise → start rest timer (countdown from the exercise's rest_seconds)
- Timer shows in large monospace font, turns yellow at ≤10 seconds, shows "GO!" with pulse animation when done
- Vibrate on timer completion (navigator.vibrate if available)
- "Skip Rest →" ghost button to dismiss timer early
- If all sets done for exercise → auto-advance to next exercise
- If all exercises done → show completion screen

**Completion screen:**
- 🎉 icon, "Workout Complete!", total sets logged
- "Save & Exit" button → POST all logged sets to server, compute progressions, redirect to `/app`
- "Discard" ghost button

**Data saved on completion:**
- Create a session record
- Create set_log records for every logged set
- For each exercise, compute a new progression suggestion using the progression engine and store it in the progressions table

**Previously logged sets** for the current exercise should be visible below the input area, showing set number, weight × reps, and difficulty badge.

### `/app/exercises` — Exercise Library (Tab 2)
- Search input at top
- Horizontally scrollable muscle group filter chips
- Exercises grouped by muscle group with group headers showing count
- Each exercise shows name, equipment, movement type, and a "custom" badge if user-created
- "Custom" button in header opens inline creation form: name, muscle group (select), equipment (select), movement type (select), description (textarea)
- User-created exercises can be deleted; system exercises cannot

### `/app/history` — Session History (Tab 3)
- Reverse-chronological list of completed sessions
- Each entry shows: workout name (with color dot), date, total sets, and a summary like "Best: DB Bench 50lb × 10"
- Tapping a session → expanded view showing all exercises and their sets with weight/reps/difficulty
- Per-exercise history view: when tapping an exercise name anywhere in the app, show a mini chart or list of that exercise's progression over time (weight trend, rep trend)

## Progression Engine (Spaced Repetition Logic)

This is the key differentiator. After each session, for each exercise performed, compute a suggestion for next time based on:

**Inputs:**
- `recentSets`: The sets just logged (weight, reps, difficulty)
- `history`: Summary of last 4-6 sessions for this exercise (avg weight, avg reps, avg difficulty score, date)
- `targets`: The workout template's target sets/reps range

**Difficulty scoring:** easy=1, moderate=2, hard=3, failed=4

**Decision matrix:**
- Easy + hit top of rep range → **increase weight** by increment (2.5 lbs if weight ≤20, 5 lbs otherwise)
- Easy + in range but not topped out → **push for more reps** at same weight
- Moderate + topped out + improving trend → **increase weight**
- Moderate + in range → **hold steady**, keep building
- Hard + hitting reps → **hold weight**, wait until it feels moderate
- Hard + missing reps + declining trend → **suggest reducing weight** by one increment
- Hard + missing reps + no trend → **hold**, give it another session
- Failed → **reduce weight**

**Trend analysis:** Compare avg reps and avg difficulty over last 3 sessions. If reps increasing and difficulty stable/decreasing = "improving". If reps decreasing and difficulty increasing = "declining". Otherwise = "stable".

**Output:** `{ suggested_weight, suggested_reps_min, suggested_reps_max, reason, confidence }`

The `reason` is a human-readable string shown to the user, e.g., "Last session felt easy and you hit 10 reps across all sets. Time to increase weight by 5 lbs."

Store the suggestion in the `progressions` table so it's available when the user opens the workout detail page or starts a new session.

## Cloudflare Configuration

### wrangler.toml
```toml
name = "Tamu"
compatibility_date = "2024-12-01"
pages_build_output_dir = ".svelte-kit/cloudflare"

[[d1_databases]]
binding = "DB"
database_name = "Tamu-db"
database_id = "YOUR_DATABASE_ID_HERE"

[vars]
GOOGLE_CLIENT_ID = ""
GOOGLE_CLIENT_SECRET = ""
APP_URL = "http://localhost:5173"
JWT_SECRET = ""
```

### TypeScript Declarations (src/app.d.ts)
```typescript
declare namespace App {
  interface Platform {
    env: {
      DB: D1Database;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      APP_URL: string;
      JWT_SECRET: string;
    };
  }
  interface Locals {
    user: {
      id: string;
      email: string;
      name: string;
      picture: string;
    } | null;
  }
}
```

### Scripts (package.json)
```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "wrangler pages dev .svelte-kit/cloudflare",
    "deploy": "npm run build && wrangler pages deploy .svelte-kit/cloudflare",
    "db:migrate": "wrangler d1 execute Tamu-db --file=migrations/001_init.sql",
    "db:migrate:local": "wrangler d1 execute Tamu-db --local --file=migrations/001_init.sql",
    "db:seed": "wrangler d1 execute Tamu-db --file=migrations/002_seed_exercises.sql",
    "db:seed:local": "wrangler d1 execute Tamu-db --local --file=migrations/002_seed_exercises.sql"
  }
}
```

## Important Implementation Notes

1. **All IDs use nanoid** generated via `crypto.getRandomValues` — no npm dependency needed. Prefix IDs by type: `w_` for workouts, `we_` for workout_exercises, `ses_` for sessions, `sl_` for set_logs, `prog_` for progressions, `ex_` for exercises.

2. **JWT auth uses Web Crypto API** — no Node.js crypto. HS256 signing with `crypto.subtle.importKey` and `crypto.subtle.sign/verify`.

3. **D1 bindings** are accessed via `platform.env.DB` in SvelteKit server functions.

4. **Form actions** use SvelteKit's native form actions with `use:enhance` for progressive enhancement.

5. **The session page accumulates set data client-side** during the workout, then POSTs everything at once on completion. This avoids network dependency during the workout. The POST includes all set_log data as JSON plus the exercise metadata needed to compute progressions.

6. **Rest timer uses setInterval** on the client. Call `navigator.vibrate([200, 100, 200])` on completion if available.

7. **Stepper inputs** for weight and reps should have large touch targets. Weight increments by 5 (or 2.5), reps by 1. Use `inputmode="decimal"` for weight and `inputmode="numeric"` for reps to get appropriate mobile keyboards.

8. **The app should work well as an "Add to Home Screen" PWA** — include appropriate meta tags and consider a basic service worker for offline caching of the app shell.

9. **Multi-user support**: The schema supports multiple users. Each user only sees their own workouts, sessions, and custom exercises. System exercises (user_id IS NULL) are visible to everyone.

10. **No localStorage usage** — all persistent state goes through D1 via server actions. Client-side state (current session data) lives in Svelte 5 runes ($state).