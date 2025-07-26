<script lang="ts">
	import '../app.css';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, DarkMode } from 'flowbite-svelte';
	import { scale } from 'svelte/transition';
	import { onMount } from 'svelte';

	let { children } = $props();

	async function detectSWUpdate() {
		const registration = await navigator.serviceWorker.ready;

		registration.addEventListener('updatefound', () => {
			const installingWorker = registration.installing;
			installingWorker?.addEventListener('statechange', () => {
				if (installingWorker.state === 'installed') {
					if (confirm('A new version of the app is available. Do you want to refresh?')) {
						installingWorker.postMessage({ type: 'SKIP_WAITING' });
						window.location.reload();
					}
				}
			});
		});
	}

	onMount(() => {
		if ('serviceWorker' in navigator) {
			detectSWUpdate();
		}
	});
</script>

<!-- 	<h1 class="text-3xl font-bold md:text-4xl">Flowbite Test</h1> -->
<svelte:head>
	<title>Flowbite Test</title>
</svelte:head>

<div
	class="min-h-[100svh] bg-white text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-white"
>
	<Navbar>
		<NavBrand href="/">
			<img src="icon.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo" />
			<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white"
				>Flowbite</span
			>
		</NavBrand>
		<NavHamburger />
		<NavUl
			transition={scale}
			transitionParams={{ start: 0.8, duration: 200 }}
			class="w-11/12 not-md:mx-auto [&>*]:text-center [&>ul]:items-center [&>ul>li]:w-full md:[&>ul>li]:w-auto"
		>
			<NavLi href="/">Home</NavLi>
			<NavLi href="/about">About</NavLi>
			<div class="not-md:w-full">
				<DarkMode
					class="flex w-full content-center rounded-sm md:rounded-full [&>*]:mx-auto [&>*]:w-min"
				/>
			</div>
		</NavUl>
	</Navbar>
	<main class="container mx-auto p-4">
		{@render children()}
	</main>
</div>
