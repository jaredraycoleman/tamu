<script lang="ts">
	import { goto } from '$app/navigation';

	let { data } = $props();

	interface LoggedSet {
		workout_exercise_id: string;
		exercise_id: string;
		set_number: number;
		weight: number | null;
		reps: number;
		difficulty: string;
	}

	// Session state
	let currentExerciseIdx = $state(0);
	let loggedSets = $state<LoggedSet[]>([]);
	let isComplete = $state(false);
	let saving = $state(false);

	// Current set input
	let weight = $state<number | null>(0);
	let reps = $state(8);
	let difficulty = $state<string>('moderate');

	// Timer state
	let showTimer = $state(false);
	let timerSeconds = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | null = null;

	let exercises = $derived(data.exercises);

	let currentExercise = $derived(exercises[currentExerciseIdx]);
	let currentSetNumber = $derived(() => {
		const done = loggedSets.filter(
			(s) => s.workout_exercise_id === currentExercise?.id
		).length;
		return done + 1;
	});
	let currentExerciseSets = $derived(() => {
		if (!currentExercise) return [];
		return loggedSets.filter((s) => s.workout_exercise_id === currentExercise.id);
	});
	let totalSetsTarget = $derived(() =>
		exercises.reduce((sum: number, e: any) => sum + (e.target_sets as number), 0)
	);
	let totalSetsLogged = $derived(() => loggedSets.length);
	let progressPercent = $derived(() => {
		const target = totalSetsTarget();
		return target > 0 ? Math.round((totalSetsLogged() / target) * 100) : 0;
	});

	// Initialize weight/reps from progression or last session or defaults
	$effect(() => {
		if (!currentExercise) return;
		const exId = currentExercise.exercise_id as string;
		const prog = data.progressions[exId];
		const last = data.lastSets[exId];

		if (prog?.suggested_weight != null) {
			weight = prog.suggested_weight;
			reps = prog.suggested_reps_min ?? currentExercise.target_reps_min;
		} else if (last?.[0]) {
			weight = last[0].weight;
			reps = last[0].reps;
		} else {
			weight = currentExercise.equipment === 'bodyweight' ? null : 0;
			reps = currentExercise.target_reps_min as number;
		}
		difficulty = 'moderate';
	});

	function logSet() {
		if (!currentExercise) return;

		loggedSets = [...loggedSets, {
			workout_exercise_id: currentExercise.id as string,
			exercise_id: currentExercise.exercise_id as string,
			set_number: currentSetNumber(),
			weight,
			reps,
			difficulty
		}];

		const setsForExercise = currentExerciseSets().length;
		const targetSets = currentExercise.target_sets as number;

		if (setsForExercise >= targetSets) {
			// All sets done for this exercise
			if (currentExerciseIdx < exercises.length - 1) {
				currentExerciseIdx++;
			} else {
				isComplete = true;
			}
		} else {
			// Start rest timer
			startTimer(currentExercise.rest_seconds as number);
		}
	}

	function startTimer(seconds: number) {
		showTimer = true;
		timerSeconds = seconds;
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = setInterval(() => {
			timerSeconds--;
			if (timerSeconds <= 0) {
				clearInterval(timerInterval!);
				timerInterval = null;
				if (typeof navigator !== 'undefined' && navigator.vibrate) {
					navigator.vibrate([200, 100, 200]);
				}
				// Auto-dismiss after 3 seconds
				setTimeout(() => { showTimer = false; }, 3000);
			}
		}, 1000);
	}

	function skipRest() {
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = null;
		showTimer = false;
	}

	function formatTime(seconds: number): string {
		const m = Math.floor(Math.abs(seconds) / 60);
		const s = Math.abs(seconds) % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	async function saveSession() {
		saving = true;
		try {
			const res = await fetch('/api/session/complete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					workout_id: data.workout.id,
					sets: loggedSets,
					exercises: exercises.map((e: any) => ({
						exercise_id: e.exercise_id,
						target_reps_min: e.target_reps_min,
						target_reps_max: e.target_reps_max
					}))
				})
			});
			if (res.ok) {
				goto('/app');
			}
		} finally {
			saving = false;
		}
	}

	function discard() {
		goto(`/app/workouts/${data.workout.id}`);
	}

	function adjustWeight(delta: number) {
		if (weight == null) return;
		weight = Math.max(0, weight + delta);
	}

	const difficultyOptions = [
		{ value: 'easy', label: 'Easy', emoji: '\u{1f60a}', cls: 'badge-easy' },
		{ value: 'moderate', label: 'Moderate', emoji: '\u{1f624}', cls: 'badge-moderate' },
		{ value: 'hard', label: 'Hard', emoji: '\u{1f975}', cls: 'badge-hard' },
		{ value: 'failed', label: 'Failed', emoji: '\u274c', cls: 'badge-failed' }
	];
</script>

<svelte:head>
	<title>Session — Tamu</title>
</svelte:head>

{#if isComplete}
	<div class="completion">
		<div class="completion-icon">&#x1f389;</div>
		<h1>Workout Complete!</h1>
		<p class="mono">{loggedSets.length} sets logged</p>
		<div class="completion-actions">
			<button class="btn btn-primary btn-full" onclick={saveSession} disabled={saving}>
				{saving ? 'Saving...' : 'Save & Exit'}
			</button>
			<button class="btn btn-ghost btn-full" onclick={discard}>Discard</button>
		</div>
	</div>
{:else if currentExercise}
	<!-- Progress bar -->
	<div class="progress-bar-container">
		<div class="progress-bar" style="width: {progressPercent()}%"></div>
	</div>

	{#if showTimer}
		<!-- Rest timer overlay -->
		<div class="timer-overlay">
			<p class="timer-label">Rest</p>
			<div class="timer-display mono" class:timer-warning={timerSeconds <= 10 && timerSeconds > 0}>
				{#if timerSeconds <= 0}
					<span class="timer-go">GO!</span>
				{:else}
					{formatTime(timerSeconds)}
				{/if}
			</div>
			<button class="btn btn-ghost skip-btn" onclick={skipRest}>Skip Rest &rarr;</button>
		</div>
	{:else}
		<!-- Current exercise header -->
		<div class="exercise-header">
			<div class="exercise-position mono">{currentExerciseIdx + 1} / {exercises.length}</div>
			<h2 class="exercise-name">{currentExercise.name}</h2>
			<div class="exercise-meta">
				<span class="tag">{currentExercise.muscle_group}</span>
				<span class="tag">{currentExercise.equipment}</span>
			</div>
		</div>

		<!-- Set dots -->
		<div class="set-dots">
			{#each Array(currentExercise.target_sets) as _, i}
				{@const setNum = i + 1}
				{@const isDone = currentExerciseSets().some((s) => s.set_number === setNum)}
				{@const isCurrent = setNum === currentSetNumber()}
				<div
					class="set-dot"
					class:done={isDone}
					class:current={isCurrent}
				>
					{setNum}
				</div>
			{/each}
		</div>

		<!-- Weight stepper -->
		{#if currentExercise.equipment !== 'bodyweight'}
			<div class="stepper-group">
				<label class="stepper-label" for="weight-input">Weight (lbs)</label>
				<div class="stepper">
					<button class="stepper-btn" onclick={() => adjustWeight(-5)}>-5</button>
					<input
						id="weight-input"
						type="number"
						class="stepper-input mono"
						inputmode="decimal"
						bind:value={weight}
						step="2.5"
						min="0"
					/>
					<button class="stepper-btn" onclick={() => adjustWeight(5)}>+5</button>
				</div>
			</div>
		{/if}

		<!-- Reps stepper -->
		<div class="stepper-group">
			<label class="stepper-label" for="reps-input">Reps</label>
			<div class="stepper">
				<button class="stepper-btn" onclick={() => reps = Math.max(0, reps - 1)}>-1</button>
				<input
					id="reps-input"
					type="number"
					class="stepper-input mono"
					inputmode="numeric"
					bind:value={reps}
					min="0"
				/>
				<button class="stepper-btn" onclick={() => reps++}>+1</button>
			</div>
		</div>

		<!-- Difficulty selector -->
		<div class="difficulty-group">
			<span class="stepper-label">Difficulty</span>
			<div class="difficulty-buttons">
				{#each difficultyOptions as opt}
					<button
						class="difficulty-btn {opt.cls}"
						class:selected={difficulty === opt.value}
						onclick={() => difficulty = opt.value}
					>
						<span class="diff-emoji">{opt.emoji}</span>
						<span class="diff-label">{opt.label}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Log button -->
		<button class="btn btn-primary btn-full log-btn" onclick={logSet}>
			Log Set &rarr;
		</button>

		<!-- Previously logged sets -->
		{#if currentExerciseSets().length > 0}
			<div class="logged-sets">
				<h4 class="text-muted logged-title">Logged Sets</h4>
				{#each currentExerciseSets() as s}
					<div class="logged-set">
						<span class="mono set-num">Set {s.set_number}</span>
						<span class="mono">{s.weight != null ? `${s.weight}lb` : 'BW'} &times; {s.reps}</span>
						<span class="tag {`badge-${s.difficulty}`}">{s.difficulty}</span>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
{/if}

<style>
	.progress-bar-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: var(--border);
		z-index: 200;
	}

	.progress-bar {
		height: 100%;
		background: var(--accent);
		transition: width 0.3s ease;
	}

	.exercise-header {
		text-align: center;
		margin: 24px 0 20px;
	}

	.exercise-position {
		font-size: 13px;
		color: var(--text-dim);
		margin-bottom: 8px;
	}

	.exercise-name {
		font-size: 22px;
		font-weight: 700;
		margin-bottom: 10px;
	}

	.exercise-meta {
		display: flex;
		justify-content: center;
		gap: 8px;
	}

	.set-dots {
		display: flex;
		justify-content: center;
		gap: 10px;
		margin-bottom: 28px;
	}

	.set-dot {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 13px;
		font-weight: 600;
		font-family: var(--font-mono);
		border: 2px solid var(--border);
		color: var(--text-dim);
	}

	.set-dot.current {
		border-color: var(--accent);
		color: var(--accent);
	}

	.set-dot.done {
		background: var(--accent);
		border-color: var(--accent);
		color: #fff;
	}

	.stepper-group {
		margin-bottom: 20px;
	}

	.stepper-label {
		display: block;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-muted);
		margin-bottom: 8px;
	}

	.stepper {
		display: flex;
		align-items: center;
		gap: 0;
	}

	.stepper-btn {
		width: 56px;
		height: 56px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		color: var(--text);
		font-size: 16px;
		font-weight: 700;
		font-family: var(--font-mono);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stepper-btn:first-child {
		border-radius: var(--radius-sm) 0 0 var(--radius-sm);
	}

	.stepper-btn:last-child {
		border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
	}

	.stepper-btn:active {
		background: var(--bg-card-hover);
	}

	.stepper-input {
		flex: 1;
		height: 56px;
		text-align: center;
		font-size: 24px;
		font-weight: 700;
		background: var(--bg-input);
		border: 1px solid var(--border);
		border-left: none;
		border-right: none;
		color: var(--text);
		outline: none;
	}

	.stepper-input::-webkit-inner-spin-button,
	.stepper-input::-webkit-outer-spin-button {
		-webkit-appearance: none;
	}

	.stepper-input {
		-moz-appearance: textfield;
	}

	.difficulty-group {
		margin-bottom: 24px;
	}

	.difficulty-buttons {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
	}

	.difficulty-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 12px 4px;
		border-radius: var(--radius-sm);
		border: 2px solid transparent;
		transition: border-color 0.15s;
	}

	.difficulty-btn.selected {
		border-color: currentColor;
	}

	.diff-emoji {
		font-size: 20px;
	}

	.diff-label {
		font-size: 11px;
		font-weight: 600;
	}

	.log-btn {
		margin-bottom: 24px;
		font-size: 17px;
		padding: 16px 24px;
	}

	.logged-sets {
		margin-bottom: 24px;
	}

	.logged-title {
		font-size: 13px;
		font-weight: 600;
		margin-bottom: 10px;
	}

	.logged-set {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 0;
		border-bottom: 1px solid var(--border);
		font-size: 14px;
	}

	.set-num {
		color: var(--text-dim);
		font-size: 12px;
		min-width: 44px;
	}

	/* Timer */
	.timer-overlay {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		text-align: center;
	}

	.timer-label {
		font-size: 16px;
		color: var(--text-muted);
		margin-bottom: 16px;
		font-weight: 500;
	}

	.timer-display {
		font-size: 72px;
		font-weight: 700;
		margin-bottom: 32px;
		transition: color 0.3s;
	}

	.timer-warning {
		color: var(--yellow);
	}

	.timer-go {
		color: var(--green);
		animation: pulse 0.6s infinite alternate;
	}

	@keyframes pulse {
		from { opacity: 0.6; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1.05); }
	}

	.skip-btn {
		font-size: 15px;
	}

	/* Completion */
	.completion {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 70vh;
		text-align: center;
	}

	.completion-icon {
		font-size: 64px;
		margin-bottom: 16px;
	}

	.completion h1 {
		font-size: 28px;
		margin-bottom: 8px;
	}

	.completion p {
		color: var(--text-muted);
		font-size: 18px;
		margin-bottom: 32px;
	}

	.completion-actions {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
</style>
