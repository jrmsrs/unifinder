<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Card, Badge, Alert } from 'flowbite-svelte';
  import { Info, Check, Bell, BellOff } from 'lucide-svelte';
  import { notifications, unreadCount, notificationActions } from '$lib/stores/notifications';
  import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '$lib/api/notifications';
  import type { Notification } from '$lib/api/notifications';

  let { data } = $props();
  let { session, initialNotifications } = $derived(data);

  let showOnlyUnread = $state(false);
  let loading = $state(false);

  // Carrega notificações iniciais do servidor
  onMount(() => {
    if (initialNotifications && initialNotifications.length > 0) {
      notifications.set(initialNotifications);
    } else if (session?.access_token) {
      // Busca notificações se não vieram do servidor
      fetchNotifications();
    }
  });

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
  const color = 'blue';

  // Filtra notificações baseado no estado
  const filteredNotifications = $derived(
    $notifications.filter((notification) => !showOnlyUnread || !notification.delivered)
  );

  // Ordena por created_at (mais recentes primeiro)
  const sortedNotifications = $derived(
    [...filteredNotifications].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
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
</script>

<svelte:head>
  <title>Notificações - UniFinder</title>
</svelte:head>

<!-- Mobile First Layout -->
<div class="min-h-screen bg-gray-50 lg:hidden dark:bg-gray-900">
  <!-- Header Mobile -->
  <div class="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Notificações</h1>
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
  </div>

  <!-- Filtros Mobile -->
  <div class="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
    <div class="flex gap-2">
      <Button
        color={showOnlyUnread ? 'blue' : 'light'}
        size="sm"
        onclick={() => (showOnlyUnread = !showOnlyUnread)}
        class="flex flex-1 items-center justify-center gap-2"
      >
        {#if showOnlyUnread}
          <BellOff class="h-4 w-4" />
          <span>Apenas não lidas</span>
        {:else}
          <Bell class="h-4 w-4" />
          <span>Todas</span>
        {/if}
      </Button>
    </div>
  </div>

  <!-- Lista de notificações -->
  <div class="px-4 py-4">
    {#if sortedNotifications.length === 0}
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
            class="rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 dark:border-gray-700 dark:bg-gray-800 {notification.delivered
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

<!-- Desktop Layout (hidden on mobile) -->
<div class="hidden lg:block">
  <div class="container mx-auto max-w-2xl px-4 py-6">
    <!-- Desktop Header -->
    <div class="mb-6">
      <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Notificações</h1>
      <p class="text-sm text-gray-600 dark:text-gray-400">Gerencie suas notificações e mantenha-se atualizado</p>
    </div>

    <!-- Desktop Stats -->
    <div class="mb-4 flex items-center gap-3">
      <Badge color="blue" size="small">
        {sortedNotifications.length} notificaç{sortedNotifications.length !== 1 ? 'ões' : 'ão'}
      </Badge>
      {#if $unreadCount > 0}
        <Badge color="red" size="small">
          {$unreadCount} não lida{$unreadCount !== 1 ? 's' : ''}
        </Badge>
      {/if}
    </div>

    <!-- Desktop Controls -->
    <div class="mb-4 flex flex-wrap gap-2">
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

      {#if $unreadCount > 0}
        <Button color="green" size="sm" onclick={markAllAsRead} class="flex items-center gap-2">
          <Check class="h-4 w-4" />
          Marcar todas como lidas
        </Button>
      {/if}
    </div>

    <!-- Desktop List -->
    {#if sortedNotifications.length === 0}
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
                          Lida
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
