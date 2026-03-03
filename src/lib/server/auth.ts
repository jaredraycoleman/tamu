const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64url(data: Uint8Array): string {
	let binary = '';
	for (const byte of data) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str: string): Uint8Array {
	str = str.replace(/-/g, '+').replace(/_/g, '/');
	while (str.length % 4) str += '=';
	const binary = atob(str);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

async function getKey(secret: string): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign', 'verify']
	);
}

export interface JWTPayload {
	sub: string;
	email: string;
	name: string;
	picture: string;
	exp: number;
	iat: number;
}

export async function signJWT(payload: Omit<JWTPayload, 'exp' | 'iat'>, secret: string): Promise<string> {
	const header = { alg: 'HS256', typ: 'JWT' };
	const now = Math.floor(Date.now() / 1000);
	const fullPayload: JWTPayload = { ...payload, iat: now, exp: now + 7 * 24 * 60 * 60 };

	const headerB64 = base64url(encoder.encode(JSON.stringify(header)));
	const payloadB64 = base64url(encoder.encode(JSON.stringify(fullPayload)));
	const signingInput = `${headerB64}.${payloadB64}`;

	const key = await getKey(secret);
	const signature = new Uint8Array(
		await crypto.subtle.sign('HMAC', key, encoder.encode(signingInput))
	);

	return `${signingInput}.${base64url(signature)}`;
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
	const parts = token.split('.');
	if (parts.length !== 3) return null;

	const [headerB64, payloadB64, signatureB64] = parts;
	const signingInput = `${headerB64}.${payloadB64}`;

	const key = await getKey(secret);
	const signature = base64urlDecode(signatureB64);

	const valid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(signingInput));
	if (!valid) return null;

	const payload: JWTPayload = JSON.parse(decoder.decode(base64urlDecode(payloadB64)));
	if (payload.exp < Math.floor(Date.now() / 1000)) return null;

	return payload;
}

export function nanoid(prefix: string, size = 21): string {
	const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	const bytes = crypto.getRandomValues(new Uint8Array(size));
	let id = '';
	for (const byte of bytes) id += alphabet[byte % alphabet.length];
	return `${prefix}${id}`;
}
