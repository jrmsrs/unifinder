<script lang="ts">
  import { goto } from '$app/navigation';
  import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '$lib/api/notifications';
  import { notificationActions, notifications, unreadCount } from '$lib/stores/notifications';
  import { Badge, Button, Modal } from 'flowbite-svelte';
  import { Bell, BellOff, Check, Info } from 'lucide-svelte';

  let { open = $bindable(), session = $bindable() } = $props();

  let showOnlyUnread = $state(false);
  let loading = $state(false);

  // Filtra e ordena notificações
  const filteredNotifications = $derived($notifications.filter((notification) => !showOnlyUnread || !notification.delivered));

  const sortedNotifications = $derived(
    [...filteredNotifications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  );

  /** Busca notificações do servidor */
  const fetchNotifications = async () => {
    if (!session?.access_token) return;
    loading = true;
    try {
      const response = await getNotifications({ token: session.access_token, size: 50 });
      notifications.set(response.items || []);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      loading = false;
    }
  };

  /** Marca notificação individual como lida */
  const markAsRead = async (notificationId: string) => {
    if (!session?.access_token) return;

    const success = await markNotificationAsRead(notificationId, session.access_token);

    if (success) {
      notificationActions.markAsRead(notificationId);
      await fetchNotifications();
    } else {
      console.error('Erro ao marcar notificação como lida');
      alert('Erro ao marcar notificação como lida. Tente novamente.');
    }
  };

  /** Marca todas as notificações como lidas */
  const markAllAsRead = async () => {
    if (!session?.access_token) return;

    const success = await markAllNotificationsAsRead(session.access_token);

    if (success) {
      notificationActions.markAllAsRead();
      await fetchNotifications();
    } else {
      console.error('Erro ao marcar todas as notificações como lidas');
      alert('Erro ao marcar todas as notificações como lidas. Tente novamente.');
    }
  };

  /** Formata timestamp para exibição relativa */
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp + 'Z');
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `há ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `há ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `há ${days} dia${days !== 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  /** Manipula o clique na notificação. Navega para a página de claims */
  const handleNotificationClick = async (notificationId: string, delivered: boolean) => {
    if (!delivered) {
      await markAsRead(notificationId);
    }
    open = false;
    await goto('/claims/');
  };

  // Carrega notificações ao abrir modal
  $effect(() => {
    if (open && session?.access_token) {
      fetchNotifications();
    }
  });
</script>

<Modal bind:open size="xl" class="w-full max-w-4xl" dismissable={true} outsideclose={true}>
  {#snippet header()}
    <div class="flex items-center justify-between gap-4">
      <div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Notificações</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {sortedNotifications.length} notificaç{sortedNotifications.length !== 1 ? 'ões' : 'ão'}
          {#if $unreadCount > 0}
            • {$unreadCount} não lida{$unreadCount !== 1 ? 's' : ''}
          {/if}
        </p>
      </div>
      <div class="flex items-center gap-2">
        {#if $unreadCount > 0}
          <Button color="green" size="xs" onclick={markAllAsRead} class="flex items-center gap-1">
            <Check class="h-3 w-3" />
            Marcar todas
          </Button>
        {/if}
      </div>
    </div>
  {/snippet}

  <div class="space-y-4">
    <!-- Filtro de visualização -->
    <div class="flex gap-2">
      <Button
        color={showOnlyUnread ? 'blue' : 'light'}
        size="sm"
        onclick={() => (showOnlyUnread = !showOnlyUnread)}
        class="flex items-center gap-2"
      >
        {#if showOnlyUnread}
          <BellOff class="h-4 w-4" />
          Mostrar todas
        {:else}
          <Bell class="h-4 w-4" />
          Apenas não lidas
        {/if}
      </Button>
    </div>

    <!-- Lista de notificações -->
    <div class="max-h-96 overflow-y-auto">
      {#if loading}
        <div class="flex items-center justify-center py-8">
          <div class="text-center">
            <div class="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Carregando notificações...</p>
          </div>
        </div>
      {:else if sortedNotifications.length === 0}
        <!-- Estado vazio -->
        <div class="py-12 text-center">
          <div class="flex flex-col items-center gap-4">
            <Bell class="h-16 w-16 text-gray-400" />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {showOnlyUnread ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
            </h3>
            <p class="max-w-sm text-sm text-gray-600 dark:text-gray-400">
              {showOnlyUnread
                ? 'Você leu todas as suas notificações. Novas notificações aparecerão aqui quando chegarem.'
                : 'Você ainda não recebeu nenhuma notificação. Elas aparecerão aqui quando chegarem.'}
            </p>
          </div>
        </div>
      {:else}
        <!-- Lista de notificações -->
        <div class="space-y-3">
          {#each sortedNotifications as notification (notification.id)}
            <a
              href="/claims/"
              onclick={(e) => {
                e.preventDefault();
                handleNotificationClick(notification.id, notification.delivered);
              }}
              class="
                mb-2 block cursor-pointer rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600
                transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400
                {notification.delivered ? 'opacity-75' : ''}
              "
            >
              <div class="flex items-start gap-3">
                <!-- Ícone da notificação -->
                <div class="mt-1 flex-shrink-0">
                  <Info class="h-5 w-5 text-blue-500" />
                </div>

                <!-- Conteúdo da notificação -->
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1">
                      <span class="mb-2 block text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </span>
                      <p class="text-xs text-gray-500 dark:text-gray-500">
                        {formatTimestamp(notification.created_at)}
                      </p>
                    </div>

                    <!-- Status e ações -->
                    <div class="flex flex-col items-end gap-2">
                      {#if !notification.delivered}
                        <Badge color="red" size="small">Não lida</Badge>
                      {/if}

                      <div class="flex gap-1">
                        {#if !notification.delivered}
                          <Button size="xs" color="green" onclick={() => markAsRead(notification.id)} class="flex items-center gap-1">
                            <Check class="h-3 w-3" />
                            Lida
                          </Button>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</Modal>
