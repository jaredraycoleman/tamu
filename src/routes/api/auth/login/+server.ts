import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform }) => {
	const env = platform!.env;
	const params = new URLSearchParams({
		client_id: env.GOOGLE_CLIENT_ID,
		redirect_uri: `${env.APP_URL}/api/auth/callback`,
		response_type: 'code',
		scope: 'openid email profile',
		access_type: 'offline',
		prompt: 'consent'
	});

	redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};
