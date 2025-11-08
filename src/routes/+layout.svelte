<script lang="ts">
  import { invalidate } from '$app/navigation';
  import NotificationModal from '$lib/components/NotificationModal.svelte';
  import NotificationPoller from '$lib/components/NotificationPoller.svelte';
  import AppContent from '$lib/components/template/AppContent.svelte';
  import FloatingSpin from '$lib/components/template/FloatingSpin.svelte';
  import Header from '$lib/components/template/header/Header.svelte';
  import MainContainer from '$lib/components/template/MainContainer.svelte';
  import Seo from 'sk-seo';
  import { onMount } from 'svelte';
  import '../app.css';

  let openNotifys = $state(false);

  let { data, children } = $props();
  let { session, supabase } = $derived(data);

  onMount(() => {
    // Monitora mudanças no estado de autenticação
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth');
      }
    });

    let updateFoundHandler: (() => void) | null = null;
    let stateChangeHandler: (() => void) | null = null;

    /** Detecta atualizações do Service Worker */
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

    // Cleanup: remove listeners e subscriptions ao desmontar
    return () => {
      data.subscription.unsubscribe();
      if (updateFoundHandler && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.removeEventListener('updatefound', updateFoundHandler!);
        });
      }
    };
  });
</script>

<Seo />
<FloatingSpin />
<AppContent>
  <Header session={data.session} bind:openNotifys />
  <MainContainer>
    {@render children()}
  </MainContainer>
</AppContent>

<!-- Polling de notificações (apenas para usuários autenticados) -->
{#if data.session}
  <NotificationPoller session={data.session} />
{/if}

<!-- Modal de notificações -->
<NotificationModal bind:open={openNotifys} session={data.session} />
