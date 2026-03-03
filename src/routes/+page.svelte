<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Tamu — Workout Builder & Smart Progression</title>
</svelte:head>

<div class="landing">
	<div class="container">
		<header class="hero">
			<h1 class="logo">tamu</h1>
			<p class="tagline">Build workouts. Track sets. Get stronger.</p>
			<p class="subtitle">Smart progression suggestions inspired by spaced repetition</p>

			{#if data.authenticated}
				<a href="/app" class="btn btn-primary btn-full">Open App</a>
			{:else}
				<a href="/api/auth/login" class="btn btn-primary btn-full google-btn">
					<svg viewBox="0 0 24 24" width="20" height="20">
						<path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
						<path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
						<path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
						<path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
					</svg>
					Sign in with Google
				</a>
			{/if}
		</header>

		<section class="features">
			<div class="feature-card card">
				<div class="feature-icon">&#x1f3cb;&#xfe0f;</div>
				<h3>Build Workouts</h3>
				<p>Create custom routines from a library of 30+ exercises. Organize by push/pull/legs or however you like.</p>
			</div>
			<div class="feature-card card">
				<div class="feature-icon">&#x23f1;&#xfe0f;</div>
				<h3>Live Tracking</h3>
				<p>Log sets in real-time with rest timers, weight steppers, and difficulty ratings. Built for the gym floor.</p>
			</div>
			<div class="feature-card card">
				<div class="feature-icon">&#x1f4a1;</div>
				<h3>Smart Progression</h3>
				<p>Get intelligent suggestions for when to increase weight, add reps, or hold steady based on your performance trends.</p>
			</div>
		</section>
	</div>
</div>

<style>
	.landing {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 48px 0;
	}

	.hero {
		text-align: center;
		margin-bottom: 48px;
	}

	.logo {
		font-family: var(--font-mono);
		font-size: 48px;
		font-weight: 700;
		color: var(--accent);
		letter-spacing: -2px;
		margin-bottom: 12px;
	}

	.tagline {
		font-size: 20px;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.subtitle {
		color: var(--text-muted);
		font-size: 15px;
		margin-bottom: 32px;
	}

	.google-btn {
		text-decoration: none;
	}

	.features {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.feature-card {
		text-align: center;
		padding: 24px 20px;
	}

	.feature-icon {
		font-size: 32px;
		margin-bottom: 12px;
	}

	.feature-card h3 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.feature-card p {
		font-size: 14px;
		color: var(--text-muted);
		line-height: 1.5;
	}
</style>
