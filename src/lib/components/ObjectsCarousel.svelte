<script lang="ts">
	import ObjectsCarouselScroll from './ObjectsCarouselScroll.svelte';

	import { Card } from 'flowbite-svelte';
	let { objects } = $props();
</script>

<div class="relative w-full">
	<div
		id="card-container"
		class="
				no-scrollbar flex gap-4 overflow-x-auto! scroll-smooth
				first:px-[calc(50vw-10rem)]
				sm:first:px-[calc(640px-50vw-10rem)]
				md:first:px-[calc(768px-50vw-10rem)]
				lg:first:px-[calc(1024px-50vw-10rem)]
				xl:first:px-[calc(1280px-50vw-10rem)]
				2xl:first:px-[calc(1536px-50vw-10rem)]
				[&>*]:min-h-64 [&>*]:min-w-64
			"
	>
		{#each objects as obj, i}
			<Card class="col-span-1 p-6">Card {i + 1}</Card>
		{/each}
		<div
			class="
				flex flex-row items-center justify-center rounded-lg bg-primary-300 dark:bg-primary-700
			"
		>
			Ver todos
		</div>
	</div>
	<div class="absolute top-1/2 left-0 -ml-7 -translate-y-1/2 bg-transparent">
		<ObjectsCarouselScroll />
	</div>
	<div class="absolute top-1/2 right-0 -mr-7 -translate-y-1/2 bg-transparent">
		<ObjectsCarouselScroll right />
	</div>
</div>
