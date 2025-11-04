<script lang="ts">
  import type { Notification } from '$lib/api/sse';
  import { notificationSSEService } from '$lib/api/sse';
  import { notificationActions, notifications } from '$lib/stores/notifications';
  import { onDestroy } from 'svelte';
  import NotificationToast from './NotificationToast.svelte';

  interface Props {
    session: any;
  }

  let { session }: Props = $props();

  let removeListener: (() => void) | null = $state(null);
  let isListenerAdded = $state(false);

  // Conecta ao SSE quando o componente é montado ou a sessão muda
  $effect(() => {
    if (session?.access_token) {
      // Conecta ao SSE apenas se o usuário estiver autenticado
      notificationSSEService.connect(session.access_token);

      // Adiciona listener para novas notificações apenas uma vez
      if (!isListenerAdded) {
        removeListener = notificationSSEService.addListener((notification: Notification) => {
          notificationActions.addNotification(notification);
        });
        isListenerAdded = true;
      }
    } else {
      // Desconecta se não há sessão
      notificationSSEService.disconnect();
      if (removeListener) {
        removeListener();
        removeListener = null;
        isListenerAdded = false;
      }
    }
  });

  onDestroy(() => {
    // Limpa listeners quando o componente é destruído
    if (removeListener) {
      removeListener();
    }
  });

  function handleCloseNotification(notificationId: string) {
    notificationActions.removeNotification(notificationId);
  }
</script>

<!-- Container fixo - Mobile First -->
<div class="fixed top-4 right-4 left-4 z-50 space-y-2 sm:right-4 sm:left-auto sm:max-w-sm">
  {#each $notifications.slice(0, 3) as notification (notification.id)}
    <NotificationToast {notification} onClose={() => handleCloseNotification(notification.id)} />
  {/each}
</div>
