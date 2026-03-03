<script lang="ts">
	import { enhance } from '$app/forms';
	import { MUSCLE_GROUPS } from '$lib/utils';

	let { data } = $props();
	let showPicker = $state(false);
	let filterMuscle = $state('');
	let searchQuery = $state('');

	let filteredExercises = $derived(() => {
		let list = data.availableExercises;
		if (filterMuscle) {
			list = list.filter((e: any) => e.muscle_group === filterMuscle);
		}
		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			list = list.filter((e: any) => e.name.toLowerCase().includes(q));
		}
		// Exclude already-added exercises
		const addedIds = new Set(data.exercises.map((e: any) => e.exercise_id));
		list = list.filter((e: any) => !addedIds.has(e.id));
		return list;
	});
</script>

<svelte:head>
	<title>{data.workout.name} — Tamu</title>
</svelte:head>

<div class="detail-header">
	<a href="/app" class="back-link">&larr; Workouts</a>
	<h1>{data.workout.name}</h1>
	{#if data.workout.description}
		<p class="text-muted">{data.workout.description}</p>
	{/if}
</div>

{#if data.exercises.length > 0}
	<a href="/app/session/{data.workout.id}" class="btn btn-primary btn-full start-btn">
		Start Workout
	</a>
{/if}

<div class="exercise-list">
	{#each data.exercises as we, i}
		<div class="exercise-card card">
			<div class="exercise-header">
				<span class="exercise-num mono">{i + 1}</span>
				<div class="exercise-info">
					<h3>{we.name}</h3>
					<div class="exercise-tags">
						<span class="tag">{we.muscle_group}</span>
						<span class="tag">{we.equipment}</span>
						<span class="tag">{we.movement_type}</span>
					</div>
				</div>
				<form method="POST" action="?/removeExercise" use:enhance>
					<input type="hidden" name="we_id" value={we.id} />
					<button type="submit" class="remove-btn" title="Remove">&times;</button>
				</form>
			</div>
			<div class="exercise-targets mono">
				{we.target_sets} &times; {we.target_reps_min}-{we.target_reps_max} reps &middot; {we.rest_seconds}s rest
			</div>

			{#if data.progressions[we.exercise_id]}
				{@const prog = data.progressions[we.exercise_id]}
				<div class="progression-card">
					<span class="prog-icon">&#x1f4a1;</span>
					<div class="prog-info">
						{#if prog.suggested_weight != null}
							<span class="mono prog-suggestion">{prog.suggested_weight}lb &times; {prog.suggested_reps_min}-{prog.suggested_reps_max}</span>
						{/if}
						<p class="prog-reason">{prog.reason}</p>
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>

<button class="btn btn-ghost btn-full add-btn" onclick={() => showPicker = !showPicker}>
	{showPicker ? 'Cancel' : '+ Add Exercise'}
</button>

{#if showPicker}
	<div class="picker card">
		<input
			type="text"
			placeholder="Search exercises..."
			class="input"
			bind:value={searchQuery}
		/>

		<div class="filter-chips">
			<button
				class="chip"
				class:active={filterMuscle === ''}
				onclick={() => filterMuscle = ''}
			>All</button>
			{#each MUSCLE_GROUPS as group}
				<button
					class="chip"
					class:active={filterMuscle === group}
					onclick={() => filterMuscle = group}
				>{group}</button>
			{/each}
		</div>

		<div class="picker-list">
			{#each filteredExercises() as exercise}
				<form method="POST" action="?/addExercise" use:enhance class="picker-item">
					<input type="hidden" name="exercise_id" value={exercise.id} />
					<div class="picker-item-info">
						<span class="picker-name">{exercise.name}</span>
						<span class="text-muted picker-meta">{exercise.muscle_group} &middot; {exercise.equipment}</span>
					</div>
					<button type="submit" class="add-exercise-btn">+</button>
				</form>
			{/each}
			{#if filteredExercises().length === 0}
				<p class="text-muted" style="text-align: center; padding: 20px;">No exercises found</p>
			{/if}
		</div>
	</div>
{/if}

<style>
	.detail-header {
		margin-bottom: 20px;
	}

	.back-link {
		font-size: 14px;
		color: var(--text-muted);
		display: inline-block;
		margin-bottom: 8px;
	}

	.detail-header h1 {
		font-size: 24px;
		font-weight: 700;
	}

	.start-btn {
		margin-bottom: 20px;
		text-decoration: none;
	}

	.exercise-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 16px;
	}

	.exercise-header {
		display: flex;
		align-items: flex-start;
		gap: 12px;
	}

	.exercise-num {
		font-size: 14px;
		font-weight: 700;
		color: var(--text-dim);
		min-width: 24px;
		padding-top: 2px;
	}

	.exercise-info {
		flex: 1;
	}

	.exercise-info h3 {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 6px;
	}

	.exercise-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.exercise-targets {
		font-size: 13px;
		color: var(--text-muted);
		margin-top: 10px;
		padding-left: 36px;
	}

	.remove-btn {
		font-size: 20px;
		color: var(--text-dim);
		padding: 4px 8px;
		line-height: 1;
	}

	.remove-btn:hover {
		color: var(--red);
	}

	.progression-card {
		display: flex;
		gap: 10px;
		margin-top: 10px;
		padding: 10px 12px;
		background: var(--accent-dim);
		border: 1px solid rgba(255, 107, 53, 0.25);
		border-radius: var(--radius-sm);
		margin-left: 36px;
	}

	.prog-icon {
		font-size: 18px;
		flex-shrink: 0;
	}

	.prog-suggestion {
		font-size: 14px;
		font-weight: 600;
		color: var(--accent);
		display: block;
		margin-bottom: 2px;
	}

	.prog-reason {
		font-size: 13px;
		color: var(--text-muted);
	}

	.add-btn {
		margin-bottom: 16px;
	}

	.picker {
		margin-bottom: 24px;
	}

	.input {
		width: 100%;
		padding: 12px 16px;
		background: var(--bg-input);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text);
		font-size: 16px;
		outline: none;
		margin-bottom: 12px;
	}

	.input:focus {
		border-color: var(--accent);
	}

	.filter-chips {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		padding-bottom: 12px;
		-webkit-overflow-scrolling: touch;
	}

	.filter-chips::-webkit-scrollbar {
		display: none;
	}

	.chip {
		flex-shrink: 0;
		padding: 6px 14px;
		border-radius: 20px;
		font-size: 13px;
		font-weight: 500;
		background: var(--bg-input);
		color: var(--text-muted);
		border: 1px solid var(--border);
		transition: all 0.15s;
		text-transform: capitalize;
	}

	.chip.active {
		background: var(--accent-dim);
		color: var(--accent);
		border-color: var(--accent);
	}

	.picker-list {
		max-height: 300px;
		overflow-y: auto;
	}

	.picker-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 0;
		border-bottom: 1px solid var(--border);
	}

	.picker-item:last-child {
		border-bottom: none;
	}

	.picker-name {
		font-size: 14px;
		font-weight: 500;
		display: block;
	}

	.picker-meta {
		font-size: 12px;
	}

	.add-exercise-btn {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--accent);
		color: #fff;
		font-size: 20px;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
</style>
