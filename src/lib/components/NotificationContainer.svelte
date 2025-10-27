<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { notifications, notificationActions } from '$lib/stores/notifications';
  import { notificationSSEService } from '$lib/api/sse';
  import NotificationToast from './NotificationToast.svelte';
  import type { Notification } from '$lib/api/sse';

  interface Props {
    session: any;
  }

  let { session }: Props = $props();

  let removeListener: (() => void) | null = null;

  onMount(() => {
    if (session?.access_token && session?.user?.id) {
      // Conecta ao SSE apenas se o usuário estiver autenticado
      notificationSSEService.connect(session.access_token);

      // Adiciona listener para novas notificações
      removeListener = notificationSSEService.addListener((notification: Notification) => {
        notificationActions.addNotification(notification);
      });
    }
  });

  onDestroy(() => {
    // Remove listener e desconecta
    if (removeListener) {
      removeListener();
    }
    notificationSSEService.disconnect();
  });

  function handleCloseNotification(notificationId: string) {
    notificationActions.removeNotification(notificationId);
  }
</script>

<!-- Container fixo - Mobile First -->
<div class="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 space-y-2">
  {#each $notifications.slice(0, 3) as notification (notification.id)}
    <NotificationToast
      {notification}
      onClose={() => handleCloseNotification(notification.id)}
    />
  {/each}
</div>
