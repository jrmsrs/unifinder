<script lang="ts">
	let { children } = $props();
</script>

<main class="relative container mx-auto p-4">
	{@render children()}
</main>
