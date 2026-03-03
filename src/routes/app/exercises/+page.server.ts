import { nanoid } from '$lib/server/auth';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = platform!.env.DB;
	const userId = locals.user!.id;

	const exercises = await db
		.prepare(
			`SELECT * FROM exercises
			 WHERE user_id IS NULL OR user_id = ?
			 ORDER BY muscle_group, name`
		)
		.bind(userId)
		.all();

	return { exercises: exercises.results, userId };
};

export const actions: Actions = {
	create: async ({ request, locals, platform }) => {
		const db = platform!.env.DB;
		const userId = locals.user!.id;
		const data = await request.formData();

		const name = data.get('name') as string;
		const muscleGroup = data.get('muscle_group') as string;
		const equipment = data.get('equipment') as string;
		const movementType = data.get('movement_type') as string;
		const description = (data.get('description') as string) || null;

		if (!name?.trim() || !muscleGroup || !equipment || !movementType) {
			return fail(400, { error: 'All fields are required' });
		}

		await db
			.prepare(
				`INSERT INTO exercises (id, user_id, name, muscle_group, equipment, movement_type, description)
				 VALUES (?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(nanoid('ex_'), userId, name.trim(), muscleGroup, equipment, movementType, description)
			.run();

		return { success: true };
	},

	delete: async ({ request, locals, platform }) => {
		const db = platform!.env.DB;
		const userId = locals.user!.id;
		const data = await request.formData();
		const id = data.get('id') as string;

		// Only allow deleting user-created exercises
		await db
			.prepare('DELETE FROM exercises WHERE id = ? AND user_id = ?')
			.bind(id, userId)
			.run();

		return { success: true };
	}
};
