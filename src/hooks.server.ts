import { redirect, type Handle } from '@sveltejs/kit';
import { verifyJWT } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('tamu_token');

	if (token) {
		const payload = await verifyJWT(token, event.platform!.env.JWT_SECRET);
		if (payload) {
			event.locals.user = {
				id: payload.sub,
				email: payload.email,
				name: payload.name,
				picture: payload.picture
			};
		} else {
			event.locals.user = null;
			event.cookies.delete('tamu_token', { path: '/' });
		}
	} else {
		event.locals.user = null;
	}

	// Protect /app routes
	if (event.url.pathname.startsWith('/app') && !event.locals.user) {
		redirect(302, '/login');
	}

	return resolve(event);
};
