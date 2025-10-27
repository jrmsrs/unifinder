<script lang="ts">
  import { invalidate } from '$app/navigation';
  import AppContent from '$lib/components/template/AppContent.svelte';
  import FloatingSpin from '$lib/components/template/FloatingSpin.svelte';
  import Header from '$lib/components/template/header/Header.svelte';
  import MainContainer from '$lib/components/template/MainContainer.svelte';
  import NotificationContainer from '$lib/components/NotificationContainer.svelte';
  import { onMount } from 'svelte';
  import Seo from 'sk-seo';
  import '../app.css';

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

<Seo />
<!-- handle title, seo headers at load() -->
<FloatingSpin />
<AppContent>
  <Header session={data.session} />
  <MainContainer>
    {@render children()}
  </MainContainer>
</AppContent>

<!-- Container de notificações toast -->
{#if data.session}
  <NotificationContainer session={data.session} />
{/if}
