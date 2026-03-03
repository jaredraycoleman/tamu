import { nanoid } from '$lib/server/auth';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = platform!.env.DB;
	const userId = locals.user!.id;

	const workouts = await db
		.prepare(
			`SELECT w.*,
				(SELECT COUNT(*) FROM workout_exercises WHERE workout_id = w.id) as exercise_count,
				(SELECT MAX(s.started_at) FROM sessions s WHERE s.workout_id = w.id AND s.completed_at IS NOT NULL) as last_performed
			 FROM workouts w
			 WHERE w.user_id = ?
			 ORDER BY w.sort_order, w.created_at DESC`
		)
		.bind(userId)
		.all();

	return { workouts: workouts.results };
};

export const actions: Actions = {
	create: async ({ request, locals, platform }) => {
		const db = platform!.env.DB;
		const userId = locals.user!.id;
		const data = await request.formData();

		const name = data.get('name') as string;
		if (!name?.trim()) return fail(400, { error: 'Name is required' });

		const id = nanoid('w_');
		const description = (data.get('description') as string) || null;
		const color = (data.get('color') as string) || '#ff6b35';

		await db
			.prepare('INSERT INTO workouts (id, user_id, name, description, color) VALUES (?, ?, ?, ?, ?)')
			.bind(id, userId, name.trim(), description, color)
			.run();

		return { success: true };
	},

	delete: async ({ request, locals, platform }) => {
		const db = platform!.env.DB;
		const userId = locals.user!.id;
		const data = await request.formData();
		const id = data.get('id') as string;

		await db
			.prepare('DELETE FROM workouts WHERE id = ? AND user_id = ?')
			.bind(id, userId)
			.run();

		return { success: true };
	}
};
