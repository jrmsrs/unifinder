<script lang="ts">
  import { invalidate } from '$app/navigation';
  import AppContent from '$lib/components/template/AppContent.svelte';
  import FloatingSpin from '$lib/components/template/FloatingSpin.svelte';
  import Header from '$lib/components/template/header/Header.svelte';
  import MainContainer from '$lib/components/template/MainContainer.svelte';
  import NotificationPoller from '$lib/components/NotificationPoller.svelte';
  import { onMount } from 'svelte';
  import Seo from 'sk-seo';
  import '../app.css';

  let { data, children } = $props();
  let { session, supabase } = $derived(data);

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth');
      }
    });

    let updateFoundHandler: (() => void) | null = null;
    let stateChangeHandler: (() => void) | null = null;

    async function detectSWUpdate() {
      if (!('serviceWorker' in navigator)) return;

      const registration = await navigator.serviceWorker.ready;

      updateFoundHandler = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          stateChangeHandler = () => {
            if (installingWorker.state === 'installed') {
              if (confirm('Uma nova versão do UniFinder está disponível. Deseja atualizar?')) {
                installingWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          };
          installingWorker.addEventListener('statechange', stateChangeHandler);
        }
      };

      registration.addEventListener('updatefound', updateFoundHandler);
    }

    detectSWUpdate();

    // Cleanup: remove todos os listeners e subscriptions
    return () => {
      data.subscription.unsubscribe();
      if (updateFoundHandler && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.removeEventListener('updatefound', updateFoundHandler!);
        });
      }
      // Note: stateChangeHandler é removido automaticamente quando o worker é destruído
    };
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

<!-- Poller de notificações em background -->
{#if data.session}
  <NotificationPoller session={data.session} />
{/if}
