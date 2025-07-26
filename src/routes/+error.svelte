<script lang="ts">
	import { page } from '$app/state';
	import { Button } from 'flowbite-svelte';
	import { ArrowLeftOutline } from 'flowbite-svelte-icons';
</script>

<div class="flex min-h-screen flex-col items-center justify-center p-4 text-center">
	<h1 class="text-8xl font-black text-primary-600 dark:text-primary-500">{page.status}</h1>
	<p class="mt-4 mb-8 text-xl text-gray-500 dark:text-gray-400">
		{page.error?.message}
	</p>
	<a href="/">
		<Button size="lg">
			<ArrowLeftOutline class="me-2 h-5 w-5" />
			Voltar para a Página Inicial
		</Button>
	</a>
</div>
