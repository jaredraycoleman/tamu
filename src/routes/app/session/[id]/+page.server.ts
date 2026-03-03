import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	const db = platform!.env.DB;
	const userId = locals.user!.id;

	const workout = await db
		.prepare('SELECT * FROM workouts WHERE id = ? AND user_id = ?')
		.bind(params.id, userId)
		.first();

	if (!workout) {
		return { workout: null, exercises: [], lastSets: {}, progressions: {} };
	}

	const exercises = await db
		.prepare(
			`SELECT we.*, e.name, e.muscle_group, e.equipment, e.movement_type
			 FROM workout_exercises we
			 JOIN exercises e ON we.exercise_id = e.id
			 WHERE we.workout_id = ?
			 ORDER BY we.sort_order`
		)
		.bind(params.id)
		.all();

	// Get last session's set data for each exercise (for pre-filling)
	const lastSets: Record<string, any[]> = {};
	const progressions: Record<string, any> = {};

	for (const we of exercises.results) {
		// Last session's sets for this exercise
		const sets = await db
			.prepare(
				`SELECT sl.weight, sl.reps, sl.difficulty, sl.set_number
				 FROM set_logs sl
				 JOIN sessions s ON sl.session_id = s.id
				 WHERE sl.exercise_id = ? AND s.user_id = ? AND s.completed_at IS NOT NULL
				 ORDER BY s.started_at DESC, sl.set_number
				 LIMIT 10`
			)
			.bind(we.exercise_id, userId)
			.all();
		if (sets.results.length > 0) {
			lastSets[we.exercise_id as string] = sets.results;
		}

		// Latest progression
		const prog = await db
			.prepare(
				`SELECT * FROM progressions
				 WHERE user_id = ? AND exercise_id = ?
				 ORDER BY created_at DESC LIMIT 1`
			)
			.bind(userId, we.exercise_id)
			.first();
		if (prog) {
			progressions[we.exercise_id as string] = prog;
		}
	}

	return {
		workout,
		exercises: exercises.results,
		lastSets,
		progressions
	};
};
