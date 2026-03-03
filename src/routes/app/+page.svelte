<script lang="ts">
	import { enhance } from '$app/forms';
	import { relativeDate, PRESET_COLORS } from '$lib/utils';

	let { data } = $props();
	let showForm = $state(false);
	let selectedColor = $state(PRESET_COLORS[0]);
</script>

<svelte:head>
	<title>Workouts — Tamu</title>
</svelte:head>

<div class="page-header">
	<h1>Workouts</h1>
	<button class="btn btn-primary" onclick={() => showForm = !showForm}>
		{showForm ? 'Cancel' : '+ New'}
	</button>
</div>

{#if showForm}
	<form
		method="POST"
		action="?/create"
		use:enhance={() => {
			return async ({ update }) => {
				await update();
				showForm = false;
			};
		}}
		class="card new-workout-form"
	>
		<input type="text" name="name" placeholder="Workout name" required class="input" />
		<input type="text" name="description" placeholder="Description (optional)" class="input" />

		<div class="color-picker">
			{#each PRESET_COLORS as color}
				<button
					type="button"
					class="color-swatch"
					class:active={selectedColor === color}
					style="background: {color}"
					onclick={() => selectedColor = color}
					aria-label="Select color {color}"
				></button>
			{/each}
		</div>
		<input type="hidden" name="color" value={selectedColor} />

		<button type="submit" class="btn btn-primary btn-full">Create Workout</button>
	</form>
{/if}

{#if data.workouts.length === 0 && !showForm}
	<div class="empty-state">
		<p class="text-muted">No workouts yet. Create your first one!</p>
	</div>
{/if}

<div class="workout-list">
	{#each data.workouts as workout}
		<a href="/app/workouts/{workout.id}" class="workout-card card">
			<div class="color-bar" style="background: {workout.color}"></div>
			<div class="workout-info">
				<h3>{workout.name}</h3>
				{#if workout.description}
					<p class="text-muted workout-desc">{workout.description}</p>
				{/if}
				<div class="workout-meta">
					<span class="tag">{workout.exercise_count} exercises</span>
					<span class="text-muted meta-date">{relativeDate(workout.last_performed as string | null)}</span>
				</div>
			</div>
		</a>
	{/each}
</div>

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.page-header h1 {
		font-size: 28px;
		font-weight: 700;
	}

	.new-workout-form {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 20px;
	}

	.input {
		width: 100%;
		padding: 14px 16px;
		background: var(--bg-input);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text);
		font-size: 16px;
		outline: none;
		transition: border-color 0.15s;
	}

	.input:focus {
		border-color: var(--accent);
	}

	.color-picker {
		display: flex;
		gap: 10px;
	}

	.color-swatch {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 3px solid transparent;
		transition: border-color 0.15s;
	}

	.color-swatch.active {
		border-color: var(--text);
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
	}

	.workout-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.workout-card {
		display: flex;
		gap: 16px;
		text-decoration: none;
		color: inherit;
		transition: background 0.15s;
	}

	.workout-card:hover {
		background: var(--bg-card-hover);
	}

	.color-bar {
		width: 4px;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.workout-info {
		flex: 1;
		min-width: 0;
	}

	.workout-info h3 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 4px;
	}

	.workout-desc {
		font-size: 13px;
		margin-bottom: 8px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.workout-meta {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.meta-date {
		font-size: 12px;
	}
</style>
