import { json } from '@sveltejs/kit';
import { nanoid } from '$lib/server/auth';
import { computeProgression } from '$lib/progression';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	const db = platform!.env.DB;
	const userId = locals.user!.id;

	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json();
	const { workout_id, sets, exercises } = body;

	// Create session
	const sessionId = nanoid('ses_');
	await db
		.prepare(
			`INSERT INTO sessions (id, user_id, workout_id, completed_at)
			 VALUES (?, ?, ?, datetime('now'))`
		)
		.bind(sessionId, userId, workout_id)
		.run();

	// Create set_log records
	for (const s of sets) {
		await db
			.prepare(
				`INSERT INTO set_logs (id, session_id, workout_exercise_id, exercise_id, set_number, weight, reps, difficulty)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				nanoid('sl_'),
				sessionId,
				s.workout_exercise_id,
				s.exercise_id,
				s.set_number,
				s.weight,
				s.reps,
				s.difficulty
			)
			.run();
	}

	// Compute progressions for each exercise
	const exerciseIds = [...new Set(exercises.map((e: any) => e.exercise_id))] as string[];

	for (const exerciseId of exerciseIds) {
		const exerciseMeta = exercises.find((e: any) => e.exercise_id === exerciseId);
		if (!exerciseMeta) continue;

		const recentSets = sets
			.filter((s: any) => s.exercise_id === exerciseId)
			.map((s: any) => ({
				weight: s.weight,
				reps: s.reps,
				difficulty: s.difficulty
			}));

		// Get history for last 6 sessions
		const historyRows = await db
			.prepare(
				`SELECT
					AVG(sl.weight) as avg_weight,
					AVG(sl.reps) as avg_reps,
					AVG(CASE sl.difficulty
						WHEN 'easy' THEN 1
						WHEN 'moderate' THEN 2
						WHEN 'hard' THEN 3
						WHEN 'failed' THEN 4
					END) as avg_difficulty,
					s.started_at as date
				 FROM set_logs sl
				 JOIN sessions s ON sl.session_id = s.id
				 WHERE sl.exercise_id = ? AND s.user_id = ? AND s.completed_at IS NOT NULL
				 GROUP BY s.id
				 ORDER BY s.started_at DESC
				 LIMIT 6`
			)
			.bind(exerciseId, userId)
			.all();

		const history = historyRows.results.map((r: any) => ({
			avg_weight: r.avg_weight,
			avg_reps: r.avg_reps,
			avg_difficulty: r.avg_difficulty,
			date: r.date
		}));

		const result = computeProgression(recentSets, history, {
			target_reps_min: exerciseMeta.target_reps_min,
			target_reps_max: exerciseMeta.target_reps_max
		});

		await db
			.prepare(
				`INSERT INTO progressions (id, user_id, exercise_id, suggested_weight, suggested_reps_min, suggested_reps_max, reason)
				 VALUES (?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				nanoid('prog_'),
				userId,
				exerciseId,
				result.suggested_weight,
				result.suggested_reps_min,
				result.suggested_reps_max,
				result.reason
			)
			.run();
	}

	return json({ success: true, session_id: sessionId });
};
