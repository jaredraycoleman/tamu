export interface SetData {
	weight: number | null;
	reps: number;
	difficulty: 'easy' | 'moderate' | 'hard' | 'failed';
}

export interface HistoryEntry {
	avg_weight: number | null;
	avg_reps: number;
	avg_difficulty: number;
	date: string;
}

export interface Targets {
	target_reps_min: number;
	target_reps_max: number;
}

export interface ProgressionResult {
	suggested_weight: number | null;
	suggested_reps_min: number;
	suggested_reps_max: number;
	reason: string;
}

const DIFFICULTY_SCORES: Record<string, number> = {
	easy: 1,
	moderate: 2,
	hard: 3,
	failed: 4
};

function getIncrement(weight: number | null): number {
	if (weight == null || weight <= 20) return 2.5;
	return 5;
}

function analyzeTrend(history: HistoryEntry[]): 'improving' | 'declining' | 'stable' {
	if (history.length < 3) return 'stable';
	const recent = history.slice(-3);
	const repsTrend = recent[2].avg_reps - recent[0].avg_reps;
	const diffTrend = recent[2].avg_difficulty - recent[0].avg_difficulty;

	if (repsTrend > 0 && diffTrend <= 0) return 'improving';
	if (repsTrend < 0 && diffTrend > 0) return 'declining';
	return 'stable';
}

export function computeProgression(
	recentSets: SetData[],
	history: HistoryEntry[],
	targets: Targets
): ProgressionResult {
	if (recentSets.length === 0) {
		return {
			suggested_weight: null,
			suggested_reps_min: targets.target_reps_min,
			suggested_reps_max: targets.target_reps_max,
			reason: 'No sets logged yet.'
		};
	}

	const avgDifficulty =
		recentSets.reduce((sum, s) => sum + DIFFICULTY_SCORES[s.difficulty], 0) / recentSets.length;
	const avgReps = recentSets.reduce((sum, s) => sum + s.reps, 0) / recentSets.length;
	const currentWeight = recentSets[0].weight;
	const increment = getIncrement(currentWeight);
	const trend = analyzeTrend(history);

	const hittingReps = avgReps >= targets.target_reps_min;
	const toppedOut = avgReps >= targets.target_reps_max;

	// Failed
	if (avgDifficulty >= 3.5) {
		const newWeight = currentWeight != null ? Math.max(0, currentWeight - increment) : null;
		return {
			suggested_weight: newWeight,
			suggested_reps_min: targets.target_reps_min,
			suggested_reps_max: targets.target_reps_max,
			reason: `Sets felt like failures. Reduce weight by ${increment} lbs and rebuild.`
		};
	}

	// Easy
	if (avgDifficulty <= 1.5) {
		if (toppedOut) {
			const newWeight = currentWeight != null ? currentWeight + increment : null;
			return {
				suggested_weight: newWeight,
				suggested_reps_min: targets.target_reps_min,
				suggested_reps_max: targets.target_reps_max,
				reason: `Felt easy and hit ${Math.round(avgReps)} reps. Time to increase weight by ${increment} lbs.`
			};
		}
		return {
			suggested_weight: currentWeight,
			suggested_reps_min: targets.target_reps_min,
			suggested_reps_max: targets.target_reps_max,
			reason: `Felt easy. Push for more reps at the same weight before increasing.`
		};
	}

	// Moderate
	if (avgDifficulty <= 2.5) {
		if (toppedOut && trend === 'improving') {
			const newWeight = currentWeight != null ? currentWeight + increment : null;
			return {
				suggested_weight: newWeight,
				suggested_reps_min: targets.target_reps_min,
				suggested_reps_max: targets.target_reps_max,
				reason: `Topped out reps with improving trend. Increase weight by ${increment} lbs.`
			};
		}
		return {
			suggested_weight: currentWeight,
			suggested_reps_min: targets.target_reps_min,
			suggested_reps_max: targets.target_reps_max,
			reason: `Good effort at moderate difficulty. Keep building at this weight.`
		};
	}

	// Hard
	if (hittingReps) {
		return {
			suggested_weight: currentWeight,
			suggested_reps_min: targets.target_reps_min,
			suggested_reps_max: targets.target_reps_max,
			reason: `Hitting reps but it's hard. Hold weight until it feels moderate.`
		};
	}

	if (trend === 'declining') {
		const newWeight = currentWeight != null ? Math.max(0, currentWeight - increment) : null;
		return {
			suggested_weight: newWeight,
			suggested_reps_min: targets.target_reps_min,
			suggested_reps_max: targets.target_reps_max,
			reason: `Missing reps with declining trend. Consider reducing weight by ${increment} lbs.`
		};
	}

	return {
		suggested_weight: currentWeight,
		suggested_reps_min: targets.target_reps_min,
		suggested_reps_max: targets.target_reps_max,
		reason: `Hard session but no clear trend. Give it another session at this weight.`
	};
}
