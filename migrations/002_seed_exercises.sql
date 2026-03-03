-- Seed system exercises (user_id = NULL)

-- Chest
INSERT INTO exercises (id, user_id, name, muscle_group, equipment, movement_type, description) VALUES
('ex_db_bench', NULL, 'DB Bench Press', 'chest', 'dumbbell', 'compound', 'Flat dumbbell bench press'),
('ex_incline_db', NULL, 'Incline DB Press', 'chest', 'dumbbell', 'compound', 'Incline dumbbell press at 30-45 degrees'),
('ex_db_flyes', NULL, 'DB Flyes', 'chest', 'dumbbell', 'isolation', 'Flat dumbbell flyes'),
('ex_pushups', NULL, 'Push-ups', 'chest', 'bodyweight', 'compound', 'Standard push-ups'),
('ex_dips', NULL, 'Dips', 'chest', 'bodyweight', 'compound', 'Parallel bar dips or bench dips'),
('ex_decline_pushups', NULL, 'Decline Push-ups', 'chest', 'bodyweight', 'compound', 'Push-ups with feet elevated');

-- Back
INSERT INTO exercises (id, user_id, name, muscle_group, equipment, movement_type, description) VALUES
('ex_pullups', NULL, 'Pull-ups', 'back', 'bodyweight', 'compound', 'Overhand grip pull-ups'),
('ex_chinups', NULL, 'Chin-ups', 'back', 'bodyweight', 'compound', 'Underhand grip chin-ups'),
('ex_sa_db_row', NULL, 'Single-Arm DB Row', 'back', 'dumbbell', 'compound', 'One-arm dumbbell row with bench support'),
('ex_bo_db_row', NULL, 'Bent-Over DB Row', 'back', 'dumbbell', 'compound', 'Bent-over two-arm dumbbell row'),
('ex_band_pull', NULL, 'Band Pull-Apart', 'back', 'band', 'isolation', 'Resistance band pull-apart for rear delts and upper back');

-- Shoulders
INSERT INTO exercises (id, user_id, name, muscle_group, equipment, movement_type, description) VALUES
('ex_db_ohp', NULL, 'DB Overhead Press', 'shoulders', 'dumbbell', 'compound', 'Seated or standing dumbbell overhead press'),
('ex_lat_raise', NULL, 'Lateral Raise', 'shoulders', 'dumbbell', 'isolation', 'Dumbbell lateral raises'),
('ex_rev_flyes', NULL, 'Reverse DB Flyes', 'shoulders', 'dumbbell', 'isolation', 'Bent-over reverse dumbbell flyes'),
('ex_front_raise', NULL, 'Front Raise', 'shoulders', 'dumbbell', 'isolation', 'Dumbbell front raises'),
('ex_db_shrugs', NULL, 'DB Shrugs', 'shoulders', 'dumbbell', 'isolation', 'Dumbbell shrugs for traps');

-- Biceps
INSERT INTO exercises (id, user_id, name, muscle_group, equipment, movement_type, description) VALUES
('ex_db_curl', NULL, 'DB Curl', 'biceps', 'dumbbell', 'isolation', 'Standard dumbbell bicep curls'),
('ex_hammer_curl', NULL, 'Hammer Curl', 'biceps', 'dumbbell', 'isolation', 'Neutral grip dumbbell curls'),
('ex_incline_curl', NULL, 'Incline Curl', 'biceps', 'dumbbell', 'isolation', 'Incline bench dumbbell curls'),
('ex_conc_curl', NULL, 'Concentration Curl', 'biceps', 'dumbbell', 'isolation', 'Seated concentration curls');

-- Triceps
INSERT INTO exercises (id, user_id, name, muscle_group, equipment, movement_type, description) VALUES
('ex_oh_tri_ext', NULL, 'Overhead Tricep Extension', 'triceps', 'dumbbell', 'isolation', 'Overhead dumbbell tricep extension'),
('ex_kickback', NULL, 'Kickback', 'triceps', 'dumbbell', 'isolation', 'Dumbbell tricep kickback'),
('ex_db_skull', NULL, 'DB Skullcrusher', 'triceps', 'dumbbell', 'isolation', 'Dumbbell lying tricep extension'),
('ex_diamond_push', NULL, 'Diamond Push-ups', 'triceps', 'bodyweight', 'compound', 'Close-grip diamond push-ups');

-- Legs
INSERT INTO exercises (id, user_id, name, muscle_group, equipment, movement_type, description) VALUES
('ex_goblet_squat', NULL, 'Goblet Squat', 'quads', 'dumbbell', 'compound', 'Dumbbell goblet squat'),
('ex_db_lunges', NULL, 'DB Lunges', 'quads', 'dumbbell', 'compound', 'Dumbbell walking or stationary lunges'),
('ex_db_rdl', NULL, 'DB Romanian Deadlift', 'hamstrings', 'dumbbell', 'compound', 'Dumbbell Romanian deadlift'),
('ex_bss', NULL, 'Bulgarian Split Squat', 'quads', 'dumbbell', 'compound', 'Rear-foot elevated split squat with dumbbells'),
('ex_calf_raise', NULL, 'Calf Raises', 'calves', 'dumbbell', 'isolation', 'Standing dumbbell calf raises'),
('ex_sumo_squat', NULL, 'Sumo Squat', 'glutes', 'dumbbell', 'compound', 'Wide-stance dumbbell sumo squat');

-- Core
INSERT INTO exercises (id, user_id, name, muscle_group, equipment, movement_type, description) VALUES
('ex_plank', NULL, 'Plank', 'core', 'bodyweight', 'isolation', 'Standard forearm plank hold'),
('ex_russian_twist', NULL, 'DB Russian Twist', 'core', 'dumbbell', 'isolation', 'Seated dumbbell Russian twist'),
('ex_hanging_leg', NULL, 'Hanging Leg Raise', 'core', 'bodyweight', 'isolation', 'Hanging leg raises from a bar');
