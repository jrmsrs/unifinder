<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import FloatingSpin from '$lib/components/FloatingSpin.svelte';
	import Header from '$lib/components/Header.svelte';
	import AppContent from '$lib/components/AppContent.svelte';
	import MainContainer from '$lib/components/MainContainer.svelte';

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	async function detectSWUpdate() {
		const registration = await navigator.serviceWorker.ready;

		registration.addEventListener('updatefound', () => {
			const installingWorker = registration.installing;
			installingWorker?.addEventListener('statechange', () => {
				if (installingWorker.state === 'installed') {
					if (confirm('Uma nova versão do UniFinder está disponível. Deseja atualizar?')) {
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
<AppContent>
	<Header session={data.session} />
	<MainContainer>
		{@render children()}
	</MainContainer>
</AppContent>
