<script lang="ts">
	import { relativeDate } from '$lib/utils';

	let { data } = $props();
	let expandedSession = $state<string | null>(null);

	function toggleExpand(sessionId: string) {
		expandedSession = expandedSession === sessionId ? null : sessionId;
	}

	function groupSetsByExercise(sets: any[]) {
		const groups: Record<string, { name: string; sets: any[] }> = {};
		for (const s of sets) {
			const key = s.workout_exercise_id;
			if (!groups[key]) groups[key] = { name: s.exercise_name, sets: [] };
			groups[key].sets.push(s);
		}
		return Object.values(groups);
	}

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr + 'Z');
		return d.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>History — Tamu</title>
</svelte:head>

<div class="page-header">
	<h1>History</h1>
</div>

{#if data.sessions.length === 0}
	<div class="empty-state">
		<p class="text-muted">No completed workouts yet. Start your first one!</p>
	</div>
{/if}

<div class="session-list">
	{#each data.sessions as session}
		{@const details = data.sessionDetails[session.id] || []}
		<button
			class="session-card card"
			class:expanded={expandedSession === session.id}
			onclick={() => toggleExpand(session.id as string)}
		>
			<div class="session-header">
				<div class="session-color" style="background: {session.workout_color}"></div>
				<div class="session-info">
					<h3>{session.workout_name}</h3>
					<div class="session-meta">
						<span class="text-muted">{formatDate(session.started_at as string)}</span>
						<span class="text-muted">&middot;</span>
						<span class="mono text-muted">{session.total_sets} sets</span>
					</div>
					{#if data.sessionBests[session.id as string]}
						<p class="session-best">Best: {data.sessionBests[session.id as string]}</p>
					{/if}
				</div>
			</div>

			{#if expandedSession === session.id}
				<div class="session-details">
					{#each groupSetsByExercise(details) as group}
						<div class="detail-exercise">
							<h4>{group.name}</h4>
							{#each group.sets as s}
								<div class="detail-set">
									<span class="mono text-dim">Set {s.set_number}</span>
									<span class="mono">{s.weight != null ? `${s.weight}lb` : 'BW'} &times; {s.reps}</span>
									<span class="tag badge-{s.difficulty}">{s.difficulty}</span>
								</div>
							{/each}
						</div>
					{/each}
				</div>
			{/if}
		</button>
	{/each}
</div>

<style>
	.page-header {
		margin-bottom: 20px;
	}

	.page-header h1 {
		font-size: 28px;
		font-weight: 700;
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
	}

	.session-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.session-card {
		width: 100%;
		text-align: left;
		cursor: pointer;
		transition: background 0.15s;
	}

	.session-card:hover {
		background: var(--bg-card-hover);
	}

	.session-header {
		display: flex;
		gap: 14px;
	}

	.session-color {
		width: 4px;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.session-info {
		flex: 1;
	}

	.session-info h3 {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 4px;
	}

	.session-meta {
		display: flex;
		gap: 6px;
		font-size: 13px;
		margin-bottom: 4px;
	}

	.session-best {
		font-size: 13px;
		color: var(--accent);
		font-weight: 500;
	}

	.session-details {
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid var(--border);
	}

	.detail-exercise {
		margin-bottom: 16px;
	}

	.detail-exercise:last-child {
		margin-bottom: 0;
	}

	.detail-exercise h4 {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.detail-set {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 6px 0;
		font-size: 13px;
	}

	.text-dim {
		color: var(--text-dim);
	}
</style>
