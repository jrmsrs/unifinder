<script lang="ts">
	import '../app.css';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, DarkMode } from 'flowbite-svelte';
	import { scale } from 'svelte/transition';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import FloatingSpin from '$lib/components/FloatingSpin.svelte';

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

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
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});
		if ('serviceWorker' in navigator) {
			detectSWUpdate();
		}
		return () => data.subscription.unsubscribe();
	});
</script>

<svelte:head>
	<title>UniFinder</title>
</svelte:head>

<FloatingSpin />

<div
	class="min-h-[100svh] bg-white text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-white"
>
	<div class="sticky top-0 z-10">
		<Navbar class="bg-white dark:bg-gray-900">
			<NavBrand href="/">
				<img src="favicon.svg" class="me-3 h-6 sm:h-9" alt="UniFinder Logo" />
				<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white"
					>UniFinder</span
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
				{#if !data.session}
					<NavLi href="/auth">Login</NavLi>
				{:else}
					<NavLi href="/private">Perfil</NavLi>
					<NavLi href="/auth/logout">Logout</NavLi>
				{/if}
				<div class="not-md:w-full">
					<DarkMode
						class="flex w-full content-center rounded-sm md:rounded-full [&>*]:mx-auto [&>*]:w-min"
					/>
				</div>
			</NavUl>
		</Navbar>
	</div>
	<main class="relative container mx-auto p-4">
		{@render children()}
	</main>
</div>
