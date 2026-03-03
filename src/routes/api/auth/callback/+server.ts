import { redirect } from '@sveltejs/kit';
import { signJWT } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, platform, cookies }) => {
	const env = platform!.env;
	const code = url.searchParams.get('code');

	if (!code) {
		redirect(302, '/login?error=no_code');
	}

	// Exchange code for tokens
	const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			code,
			client_id: env.GOOGLE_CLIENT_ID,
			client_secret: env.GOOGLE_CLIENT_SECRET,
			redirect_uri: `${env.APP_URL}/api/auth/callback`,
			grant_type: 'authorization_code'
		})
	});

	if (!tokenRes.ok) {
		redirect(302, '/login?error=token_exchange');
	}

	const tokens = await tokenRes.json();

	// Fetch user info
	const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
		headers: { Authorization: `Bearer ${tokens.access_token}` }
	});

	if (!userRes.ok) {
		redirect(302, '/login?error=user_info');
	}

	const googleUser = await userRes.json();

	// Upsert user in D1
	await env.DB.prepare(
		`INSERT INTO users (id, email, name, picture) VALUES (?, ?, ?, ?)
		 ON CONFLICT(id) DO UPDATE SET email = excluded.email, name = excluded.name, picture = excluded.picture, updated_at = datetime('now')`
	)
		.bind(googleUser.id, googleUser.email, googleUser.name, googleUser.picture)
		.run();

	// Create JWT
	const jwt = await signJWT(
		{
			sub: googleUser.id,
			email: googleUser.email,
			name: googleUser.name,
			picture: googleUser.picture || ''
		},
		env.JWT_SECRET
	);

	cookies.set('tamu_token', jwt, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 7 * 24 * 60 * 60
	});

	redirect(302, '/app');
};
