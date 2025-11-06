<script lang="ts">
  import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '$lib/api/notifications';
  import { notificationActions, notifications, unreadCount } from '$lib/stores/notifications';
  import { Badge, Button, Modal } from 'flowbite-svelte';
  import { Bell, BellOff, Check, Info, X } from 'lucide-svelte';

  let { open = $bindable(), session = $bindable() } = $props();

  let showOnlyUnread = $state(false);
  let loading = $state(false);

  // Busca notificações do servidor
  async function fetchNotifications() {
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
  }

  // Usar apenas ícone e cor informativos
  const Icon = Info;

  // Filtra notificações baseado no estado
  const filteredNotifications = $derived($notifications.filter((notification) => !showOnlyUnread || !notification.delivered));

  // Ordena por created_at (mais recentes primeiro)
  const sortedNotifications = $derived(
    [...filteredNotifications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  );

  async function markAsRead(notificationId: string) {
    if (!session?.access_token) return;

    // Chama a API primeiro
    const success = await markNotificationAsRead(notificationId, session.access_token);

    if (success) {
      // Atualiza localmente após sucesso
      notificationActions.markAsRead(notificationId);

      // Recarrega notificações do servidor para sincronizar
      await fetchNotifications();
    } else {
      console.error('Erro ao marcar notificação como lida');
      alert('Erro ao marcar notificação como lida. Tente novamente.');
    }
  }

  async function markAllAsRead() {
    if (!session?.access_token) return;

    // Chama a API primeiro
    const success = await markAllNotificationsAsRead(session.access_token);

    if (success) {
      // Atualiza localmente após sucesso
      notificationActions.markAllAsRead();

      // Recarrega notificações do servidor para sincronizar
      await fetchNotifications();
    } else {
      console.error('Erro ao marcar todas as notificações como lidas');
      alert('Erro ao marcar todas as notificações como lidas. Tente novamente.');
    }
  }

  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `há ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `há ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else if (diffInHours < 168) {
      // 7 dias
      const days = Math.floor(diffInHours / 24);
      return `há ${days} dia${days !== 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  }

  // Carrega notificações quando o modal abre
  $effect(() => {
    if (open && session?.access_token) {
      fetchNotifications();
    }
  });
</script>

<Modal bind:open size="xl" class="w-full max-w-4xl" dismissable={true} outsideclose={true}>
  <!-- <div slot="header" class="flex items-center justify-between"> -->
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
            <span class="hidden sm:inline">Marcar todas</span>
          </Button>
        {/if}
      </div>
    </div>
  {/snippet}

  <div class="space-y-4">
    <!-- Filtros -->
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
        <div class="space-y-3">
          {#each sortedNotifications as notification (notification.id)}
            <div
              class="rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 {notification.delivered
                ? 'opacity-75'
                : ''}"
            >
              <div class="flex items-start gap-3">
                <!-- Ícone -->
                <div class="mt-1 flex-shrink-0">
                  <Icon class="h-5 w-5 text-blue-500" />
                </div>

                <!-- Conteúdo -->
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1">
                      <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
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
                            <span class="hidden sm:inline">Lida</span>
                          </Button>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</Modal>
