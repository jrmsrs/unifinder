<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { AngleLeftOutline, AngleRightOutline } from 'flowbite-svelte-icons';
	let { right = false, carouselId } = $props();
</script>

<Button
	id={right ? 'scroll-right' : 'scroll-left'}
	class="h-64 w-20 rounded-none bg-transparent! focus-within:ring-0 {right
		? 'ps-12 pe-0'
		: 'ps-0 pe-12'} text-primary-500 hover:bg-primary-100 dark:text-primary-400 dark:hover:bg-primary-800"
	onclick={() => {
		const container = document.getElementById(carouselId);
		if (container) {
			container.scrollBy({
				left: right ? 256 + 16 : -256 - 16,
				behavior: 'smooth'
			});
		}
	}}
>
	{#if right}
		<AngleRightOutline class="my-0.5 h-6 w-6" />
	{:else}
		<AngleLeftOutline class="my-0.5 h-6 w-6" />
	{/if}
</Button>
