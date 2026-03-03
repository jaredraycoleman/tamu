<script lang="ts">
	import { enhance } from '$app/forms';
	import { MUSCLE_GROUPS, EQUIPMENT } from '$lib/utils';

	let { data } = $props();
	let showForm = $state(false);
	let filterMuscle = $state('');
	let searchQuery = $state('');

	let filteredExercises = $derived(() => {
		let list = data.exercises;
		if (filterMuscle) {
			list = list.filter((e: any) => e.muscle_group === filterMuscle);
		}
		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			list = list.filter((e: any) => e.name.toLowerCase().includes(q));
		}
		return list;
	});

	let grouped = $derived(() => {
		const groups: Record<string, any[]> = {};
		for (const e of filteredExercises()) {
			const g = e.muscle_group as string;
			if (!groups[g]) groups[g] = [];
			groups[g].push(e);
		}
		return groups;
	});
</script>

<svelte:head>
	<title>Exercises — Tamu</title>
</svelte:head>

<div class="page-header">
	<h1>Exercises</h1>
	<button class="btn btn-primary" onclick={() => showForm = !showForm}>
		{showForm ? 'Cancel' : '+ Custom'}
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
		class="card create-form"
	>
		<input type="text" name="name" placeholder="Exercise name" required class="input" />
		<select name="muscle_group" required class="input">
			<option value="" disabled selected>Muscle group</option>
			{#each MUSCLE_GROUPS as group}
				<option value={group}>{group}</option>
			{/each}
		</select>
		<select name="equipment" required class="input">
			<option value="" disabled selected>Equipment</option>
			{#each EQUIPMENT as eq}
				<option value={eq}>{eq}</option>
			{/each}
		</select>
		<select name="movement_type" required class="input">
			<option value="" disabled selected>Movement type</option>
			<option value="compound">compound</option>
			<option value="isolation">isolation</option>
		</select>
		<textarea name="description" placeholder="Description (optional)" class="input textarea"></textarea>
		<button type="submit" class="btn btn-primary btn-full">Create Exercise</button>
	</form>
{/if}

<input
	type="text"
	placeholder="Search exercises..."
	class="input search-input"
	bind:value={searchQuery}
/>

<div class="filter-chips">
	<button class="chip" class:active={filterMuscle === ''} onclick={() => filterMuscle = ''}>
		All
	</button>
	{#each MUSCLE_GROUPS as group}
		<button class="chip" class:active={filterMuscle === group} onclick={() => filterMuscle = group}>
			{group}
		</button>
	{/each}
</div>

{#each Object.entries(grouped()) as [group, exercises]}
	<div class="muscle-group">
		<h2 class="group-header">
			{group}
			<span class="group-count">{exercises.length}</span>
		</h2>
		{#each exercises as exercise}
			<div class="exercise-item">
				<div class="exercise-item-info">
					<span class="exercise-item-name">{exercise.name}</span>
					<div class="exercise-item-meta">
						<span class="tag">{exercise.equipment}</span>
						<span class="tag">{exercise.movement_type}</span>
						{#if exercise.user_id}
							<span class="tag custom-tag">custom</span>
						{/if}
					</div>
				</div>
				{#if exercise.user_id === data.userId}
					<form method="POST" action="?/delete" use:enhance>
						<input type="hidden" name="id" value={exercise.id} />
						<button type="submit" class="delete-btn" title="Delete">&times;</button>
					</form>
				{/if}
			</div>
		{/each}
	</div>
{/each}

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

	.create-form {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 20px;
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
		transition: border-color 0.15s;
	}

	.input:focus {
		border-color: var(--accent);
	}

	select.input {
		appearance: none;
		text-transform: capitalize;
	}

	.textarea {
		min-height: 80px;
		resize: vertical;
	}

	.search-input {
		margin-bottom: 12px;
	}

	.filter-chips {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		padding-bottom: 16px;
		-webkit-overflow-scrolling: touch;
	}

	.filter-chips::-webkit-scrollbar { display: none; }

	.chip {
		flex-shrink: 0;
		padding: 6px 14px;
		border-radius: 20px;
		font-size: 13px;
		font-weight: 500;
		background: var(--bg-input);
		color: var(--text-muted);
		border: 1px solid var(--border);
		text-transform: capitalize;
		transition: all 0.15s;
	}

	.chip.active {
		background: var(--accent-dim);
		color: var(--accent);
		border-color: var(--accent);
	}

	.muscle-group {
		margin-bottom: 24px;
	}

	.group-header {
		font-size: 14px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		margin-bottom: 8px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.group-count {
		font-size: 12px;
		background: var(--bg-input);
		padding: 2px 8px;
		border-radius: 10px;
		font-weight: 600;
	}

	.exercise-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 0;
		border-bottom: 1px solid var(--border);
	}

	.exercise-item:last-child {
		border-bottom: none;
	}

	.exercise-item-name {
		font-size: 15px;
		font-weight: 500;
		display: block;
		margin-bottom: 4px;
	}

	.exercise-item-meta {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.custom-tag {
		background: var(--accent-dim);
		color: var(--accent);
		border-color: rgba(255, 107, 53, 0.3);
	}

	.delete-btn {
		font-size: 20px;
		color: var(--text-dim);
		padding: 4px 8px;
	}

	.delete-btn:hover {
		color: var(--red);
	}
</style>
