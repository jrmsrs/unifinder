<script lang="ts">
	let { children } = $props();
</script>

<div
	class="min-h-[100svh] bg-white text-primary-900 transition-colors duration-200 dark:bg-primary-900 dark:text-white"
>
	{@render children()}
</div>
