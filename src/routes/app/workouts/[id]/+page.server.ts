import { nanoid } from '$lib/server/auth';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	const db = platform!.env.DB;
	const userId = locals.user!.id;

	const workout = await db
		.prepare('SELECT * FROM workouts WHERE id = ? AND user_id = ?')
		.bind(params.id, userId)
		.first();

	if (!workout) error(404, 'Workout not found');

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

	// Get latest progression suggestions for exercises in this workout
	const exerciseIds = exercises.results.map((e) => e.exercise_id);
	let progressions: Record<string, any> = {};

	if (exerciseIds.length > 0) {
		const placeholders = exerciseIds.map(() => '?').join(',');
		const progResults = await db
			.prepare(
				`SELECT p.* FROM progressions p
				 INNER JOIN (
				   SELECT exercise_id, MAX(created_at) as max_created
				   FROM progressions WHERE user_id = ? AND exercise_id IN (${placeholders})
				   GROUP BY exercise_id
				 ) latest ON p.exercise_id = latest.exercise_id AND p.created_at = latest.max_created
				 WHERE p.user_id = ?`
			)
			.bind(userId, ...exerciseIds, userId)
			.all();

		for (const p of progResults.results) {
			progressions[p.exercise_id as string] = p;
		}
	}

	// Get all available exercises for the picker
	const availableExercises = await db
		.prepare(
			`SELECT * FROM exercises
			 WHERE user_id IS NULL OR user_id = ?
			 ORDER BY muscle_group, name`
		)
		.bind(userId)
		.all();

	return {
		workout,
		exercises: exercises.results,
		progressions,
		availableExercises: availableExercises.results
	};
};

export const actions: Actions = {
	addExercise: async ({ request, params, platform }) => {
		const db = platform!.env.DB;
		const data = await request.formData();
		const exerciseId = data.get('exercise_id') as string;

		if (!exerciseId) return fail(400, { error: 'Exercise required' });

		// Get exercise to determine defaults
		const exercise = await db
			.prepare('SELECT * FROM exercises WHERE id = ?')
			.bind(exerciseId)
			.first();

		if (!exercise) return fail(400, { error: 'Exercise not found' });

		const isCompound = exercise.movement_type === 'compound';

		// Get next sort order
		const last = await db
			.prepare('SELECT MAX(sort_order) as max_order FROM workout_exercises WHERE workout_id = ?')
			.bind(params.id)
			.first<{ max_order: number | null }>();

		const sortOrder = (last?.max_order ?? -1) + 1;

		await db
			.prepare(
				`INSERT INTO workout_exercises (id, workout_id, exercise_id, sort_order, target_sets, target_reps_min, target_reps_max, rest_seconds)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				nanoid('we_'),
				params.id,
				exerciseId,
				sortOrder,
				isCompound ? 4 : 3,
				isCompound ? 8 : 8,
				isCompound ? 10 : 12,
				isCompound ? 150 : 90
			)
			.run();

		return { success: true };
	},

	removeExercise: async ({ request, params, platform }) => {
		const db = platform!.env.DB;
		const data = await request.formData();
		const weId = data.get('we_id') as string;

		await db
			.prepare('DELETE FROM workout_exercises WHERE id = ? AND workout_id = ?')
			.bind(weId, params.id)
			.run();

		return { success: true };
	}
};
