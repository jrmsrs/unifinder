<script lang="ts">
  import { getNotifications } from '$lib/api/notifications';
  import { notificationActions, notifications } from '$lib/stores/notifications';
  import { onDestroy } from 'svelte';
  import NotificationToast from './NotificationToast.svelte';

  interface Props {
    session: any;
  }

  let { session }: Props = $props();

  let pollInterval: NodeJS.Timeout | null = $state(null);
  const POLL_INTERVAL_MS = 30000;

  /** Busca e sincroniza notificações do servidor */
  const fetchNotifications = async () => {
    if (!session?.access_token) return;

    try {
      const response = await getNotifications({ token: session.access_token, size: 50 });
      const serverNotifications = response.items || [];

      notifications.update((current) => {
        const serverMap = new Map(serverNotifications.map((n) => [n.id, n]));
        const currentMap = new Map(current.map((n) => [n.id, n]));

        // Atualiza notificações existentes com dados do servidor
        const updated = current.map((n) => serverMap.get(n.id) || n);

        // Adiciona novas notificações do servidor
        const newNotifications = serverNotifications.filter((n) => !currentMap.has(n.id));

        // Ordena por data (mais recentes primeiro) e limita a 50
        return [...updated, ...newNotifications]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 50);
      });
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  // Inicia/para polling baseado na sessão
  $effect(() => {
    if (session?.access_token) {
      fetchNotifications();
      pollInterval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    } else {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    }
  });

  // Cleanup ao desmontar
  onDestroy(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
  });

  function handleCloseNotification(notificationId: string) {
    notificationActions.removeNotification(notificationId);
  }
</script>

<!-- Container de toasts (máximo 3 visíveis, mobile-first) -->
<div class="fixed top-4 right-4 left-4 z-50 space-y-2 sm:right-4 sm:left-auto sm:max-w-sm">
  {#each $notifications.slice(0, 3) as notification (notification.id)}
    <NotificationToast {notification} onClose={() => handleCloseNotification(notification.id)} />
  {/each}
</div>
