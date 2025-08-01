<script lang="ts">
	import { Spinner, Modal } from 'flowbite-svelte';
	import { scale } from 'svelte/transition';
	import { navigating } from '$app/state';
</script>

{#if navigating.complete !== null}
	<Modal
		open={true}
		dismissable={false}
		outsideclose={false}
		modal={true}
		class="h-48 w-48 rounded-3xl bg-primary-700/10! backdrop-blur-md backdrop:bg-transparent [&>*]:overflow-hidden"
		bodyClass="p-8"
		transition={scale}
	>
		<Spinner class="h-full w-full" />
	</Modal>
{/if}
