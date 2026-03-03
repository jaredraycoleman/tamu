declare global {
	namespace App {
		interface Platform {
			env: {
				DB: D1Database;
				GOOGLE_CLIENT_ID: string;
				GOOGLE_CLIENT_SECRET: string;
				APP_URL: string;
				JWT_SECRET: string;
			};
		}
		interface Locals {
			user: {
				id: string;
				email: string;
				name: string;
				picture: string;
			} | null;
		}
	}
}

export {};
