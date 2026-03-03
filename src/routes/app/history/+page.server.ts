import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = platform!.env.DB;
	const userId = locals.user!.id;

	const sessions = await db
		.prepare(
			`SELECT s.*, w.name as workout_name, w.color as workout_color,
				(SELECT COUNT(*) FROM set_logs WHERE session_id = s.id) as total_sets
			 FROM sessions s
			 JOIN workouts w ON s.workout_id = w.id
			 WHERE s.user_id = ? AND s.completed_at IS NOT NULL
			 ORDER BY s.started_at DESC
			 LIMIT 50`
		)
		.bind(userId)
		.all();

	// Get set details for each session and compute "best" summary
	const sessionDetails: Record<string, any[]> = {};
	const sessionBests: Record<string, string> = {};

	for (const session of sessions.results) {
		const sets = await db
			.prepare(
				`SELECT sl.*, e.name as exercise_name
				 FROM set_logs sl
				 JOIN exercises e ON sl.exercise_id = e.id
				 WHERE sl.session_id = ?
				 ORDER BY sl.workout_exercise_id, sl.set_number`
			)
			.bind(session.id)
			.all();

		sessionDetails[session.id as string] = sets.results;

		// Find "best" set (highest weight * reps)
		let best: any = null;
		let bestScore = 0;
		for (const s of sets.results) {
			const score = ((s.weight as number) || 0) * (s.reps as number);
			if (score > bestScore) {
				bestScore = score;
				best = s;
			}
		}
		if (best) {
			sessionBests[session.id as string] =
				`${best.exercise_name} ${best.weight || 'BW'}${best.weight ? 'lb' : ''} × ${best.reps}`;
		}
	}

	return { sessions: sessions.results, sessionDetails, sessionBests };
};
