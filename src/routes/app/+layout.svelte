<script lang="ts">
	import { page } from '$app/stores';

	let { children, data } = $props();

	const tabs = [
		{ href: '/app', label: 'Workouts', icon: 'dumbbell' },
		{ href: '/app/exercises', label: 'Exercises', icon: 'list' },
		{ href: '/app/history', label: 'History', icon: 'clock' }
	] as const;

	function isActive(href: string, pathname: string): boolean {
		if (href === '/app') return pathname === '/app';
		return pathname.startsWith(href);
	}
</script>

<div class="app-shell">
	<main class="app-main">
		<div class="container">
			{@render children()}
		</div>
	</main>

	{#if !$page.url.pathname.includes('/session/')}
		<nav class="bottom-nav">
			{#each tabs as tab}
				<a
					href={tab.href}
					class="nav-tab"
					class:active={isActive(tab.href, $page.url.pathname)}
				>
					<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						{#if tab.icon === 'dumbbell'}
							<path d="M6.5 6.5h11M6.5 17.5h11M3 10h3v4H3zM18 10h3v4h-3zM6 8h2v8H6zM16 8h2v8h-2z" />
						{:else if tab.icon === 'list'}
							<line x1="8" y1="6" x2="21" y2="6" />
							<line x1="8" y1="12" x2="21" y2="12" />
							<line x1="8" y1="18" x2="21" y2="18" />
							<line x1="3" y1="6" x2="3.01" y2="6" />
							<line x1="3" y1="12" x2="3.01" y2="12" />
							<line x1="3" y1="18" x2="3.01" y2="18" />
						{:else if tab.icon === 'clock'}
							<circle cx="12" cy="12" r="10" />
							<polyline points="12 6 12 12 16 14" />
						{/if}
					</svg>
					<span class="nav-label">{tab.label}</span>
				</a>
			{/each}
		</nav>
	{/if}
</div>

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
	}

	.app-main {
		flex: 1;
		padding-top: 16px;
		padding-bottom: calc(72px + var(--safe-bottom));
	}

	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		background: var(--bg-card);
		border-top: 1px solid var(--border);
		padding-bottom: var(--safe-bottom);
		z-index: 100;
	}

	.nav-tab {
		flex: 1;
		max-width: 160px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 10px 0;
		color: var(--text-dim);
		text-decoration: none;
		transition: color 0.15s;
		min-height: 56px;
	}

	.nav-tab.active {
		color: var(--accent);
	}

	.nav-icon {
		width: 22px;
		height: 22px;
	}

	.nav-label {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.02em;
	}
</style>
