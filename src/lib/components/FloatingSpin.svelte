<script lang="ts">
	import { Spinner, Modal } from 'flowbite-svelte';
	import { scale } from 'svelte/transition';
	// teste
	let loading = $props();
</script>

<Modal
	open={loading}
	dismissable={false}
	outsideclose={false}
	modal={true}
	class="h-48 w-48 rounded-3xl bg-primary-900/70! backdrop-blur-md backdrop:bg-primary-700/50 [&>*]:overflow-hidden"
	bodyClass="p-8"
	transition={scale}
>
	<Spinner class="h-full w-full" />
</Modal>
