<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Tamu</title>
</svelte:head>

{@render children()}
