export function relativeDate(dateStr: string | null): string {
	if (!dateStr) return 'Never';
	const date = new Date(dateStr + 'Z');
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return 'Today';
	if (diffDays === 1) return 'Yesterday';
	if (diffDays < 7) return `${diffDays}d ago`;
	if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
	return `${Math.floor(diffDays / 30)}mo ago`;
}

export const PRESET_COLORS = [
	'#ff6b35',
	'#4ade80',
	'#60a5fa',
	'#f87171',
	'#fbbf24',
	'#a78bfa'
] as const;

export const MUSCLE_GROUPS = [
	'chest', 'back', 'shoulders', 'biceps', 'triceps',
	'quads', 'hamstrings', 'glutes', 'core', 'calves', 'full_body'
] as const;

export const EQUIPMENT = [
	'dumbbell', 'barbell', 'bodyweight', 'cable', 'machine', 'band', 'kettlebell', 'other'
] as const;
