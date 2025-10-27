<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Card, Badge, Alert } from 'flowbite-svelte';
  import { 
    Info, 
    Check, 
    Trash2,
    Bell,
    BellOff
  } from 'lucide-svelte';
  import { 
    notifications, 
    unreadCount, 
    notificationActions 
  } from '$lib/stores/notifications';
  import type { Notification } from '$lib/api/sse';

  let showOnlyUnread = $state(false);

  // Usar apenas ícone e cor informativos
  const Icon = Info;
  const color = 'blue';

  // Filtra notificações baseado no estado
  const filteredNotifications = $derived($notifications.filter(notification => 
    !showOnlyUnread || !notification.read
  ));

  // Ordena por timestamp (mais recentes primeiro)
  const sortedNotifications = $derived([...filteredNotifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ));

  function markAsRead(notificationId: string) {
    notificationActions.markAsRead(notificationId);
  }

  function markAllAsRead() {
    notificationActions.markAllAsRead();
  }

  function removeNotification(notificationId: string) {
    notificationActions.removeNotification(notificationId);
  }

  function clearAll() {
    if (confirm('Tem certeza que deseja limpar todas as notificações?')) {
      notificationActions.clearAll();
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
    } else if (diffInHours < 168) { // 7 dias
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
<div class="min-h-screen bg-gray-50 dark:bg-gray-900 lg:hidden">
  <!-- Header Mobile -->
  <div class="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          Notificações
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {sortedNotifications.length} notificação{sortedNotifications.length !== 1 ? 'ões' : ''}
          {#if $unreadCount > 0}
            • {$unreadCount} não lida{$unreadCount !== 1 ? 's' : ''}
          {/if}
        </p>
      </div>
      <div class="flex items-center gap-2">
        {#if $unreadCount > 0}
          <Button
            color="green"
            size="xs"
            onclick={markAllAsRead}
            class="flex items-center gap-1"
          >
            <Check class="h-3 w-3" />
            <span class="hidden sm:inline">Marcar todas</span>
          </Button>
        {/if}
        {#if $notifications.length > 0}
          <Button
            color="red"
            size="xs"
            onclick={clearAll}
            class="flex items-center gap-1"
          >
            <Trash2 class="h-3 w-3" />
            <span class="hidden sm:inline">Limpar</span>
          </Button>
        {/if}
      </div>
    </div>
  </div>

  <!-- Filtros Mobile -->
  <div class="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <div class="flex gap-2">
      <Button
        color={showOnlyUnread ? "blue" : "light"}
        size="sm"
        onclick={() => showOnlyUnread = !showOnlyUnread}
        class="flex items-center gap-2 flex-1 justify-center"
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
      <div class="text-center py-12">
        <div class="flex flex-col items-center gap-4">
          <Bell class="h-16 w-16 text-gray-400" />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {showOnlyUnread ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm max-w-sm">
            {showOnlyUnread 
              ? 'Você leu todas as suas notificações. Novas notificações aparecerão aqui quando chegarem.'
              : 'Você ainda não recebeu nenhuma notificação. Elas aparecerão aqui quando chegarem.'
            }
          </p>
        </div>
      </div>
    {:else}
      <div class="space-y-3">
        {#each sortedNotifications as notification (notification.id)}
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all duration-200 {notification.read ? 'opacity-75' : ''}">
            <div class="flex items-start gap-3">
              <!-- Ícone -->
              <div class="flex-shrink-0 mt-1">
                <Icon class="h-5 w-5 text-blue-500" />
              </div>

              <!-- Conteúdo -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">
                      {notification.title}
                    </h3>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {notification.message}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-500">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>

                  <!-- Status e ações -->
                  <div class="flex flex-col items-end gap-2">
                    {#if !notification.read}
                      <Badge color="red" size="small">Não lida</Badge>
                    {/if}
                    
                    <div class="flex gap-1">
                      {#if !notification.read}
                        <Button
                          size="xs"
                          color="green"
                          onclick={() => markAsRead(notification.id)}
                          class="flex items-center gap-1"
                        >
                          <Check class="h-3 w-3" />
                          <span class="hidden sm:inline">Lida</span>
                        </Button>
                      {/if}
                      
                      <Button
                        size="xs"
                        color="red"
                        onclick={() => removeNotification(notification.id)}
                        class="flex items-center gap-1"
                      >
                        <Trash2 class="h-3 w-3" />
                      </Button>
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
  <div class="container mx-auto px-4 py-6 max-w-2xl">
    <!-- Desktop Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Notificações
      </h1>
      <p class="text-gray-600 dark:text-gray-400 text-sm">
        Gerencie suas notificações e mantenha-se atualizado
      </p>
    </div>

    <!-- Desktop Stats -->
    <div class="mb-4 flex items-center gap-3">
      <Badge color="blue" size="small">
        {sortedNotifications.length} notificação{sortedNotifications.length !== 1 ? 'ões' : ''}
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
        color={showOnlyUnread ? "blue" : "light"}
        size="sm"
        onclick={() => showOnlyUnread = !showOnlyUnread}
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
        <Button
          color="green"
          size="sm"
          onclick={markAllAsRead}
          class="flex items-center gap-2"
        >
          <Check class="h-4 w-4" />
          Marcar todas como lidas
        </Button>
      {/if}

      {#if $notifications.length > 0}
        <Button
          color="red"
          size="sm"
          onclick={clearAll}
          class="flex items-center gap-2"
        >
          <Trash2 class="h-4 w-4" />
          Limpar todas
        </Button>
      {/if}
    </div>

    <!-- Desktop List -->
    {#if sortedNotifications.length === 0}
      <div class="text-center py-12">
        <div class="flex flex-col items-center gap-4">
          <Bell class="h-16 w-16 text-gray-400" />
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {showOnlyUnread ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm max-w-sm">
            {showOnlyUnread 
              ? 'Você leu todas as suas notificações. Novas notificações aparecerão aqui quando chegarem.'
              : 'Você ainda não recebeu nenhuma notificação. Elas aparecerão aqui quando chegarem.'
            }
          </p>
        </div>
      </div>
    {:else}
      <div class="space-y-3">
        {#each sortedNotifications as notification (notification.id)}
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all duration-200 hover:shadow-md {notification.read ? 'opacity-75' : ''}">
            <div class="flex items-start gap-3">
              <!-- Ícone -->
              <div class="flex-shrink-0 mt-1">
                <Icon class="h-5 w-5 text-blue-500" />
              </div>

              <!-- Conteúdo -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">
                      {notification.title}
                    </h3>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {notification.message}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-500">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>

                  <!-- Status e ações -->
                  <div class="flex flex-col items-end gap-2">
                    {#if !notification.read}
                      <Badge color="red" size="small">Não lida</Badge>
                    {/if}
                    
                    <div class="flex gap-1">
                      {#if !notification.read}
                        <Button
                          size="xs"
                          color="green"
                          onclick={() => markAsRead(notification.id)}
                          class="flex items-center gap-1"
                        >
                          <Check class="h-3 w-3" />
                          Lida
                        </Button>
                      {/if}
                      
                      <Button
                        size="xs"
                        color="red"
                        onclick={() => removeNotification(notification.id)}
                        class="flex items-center gap-1"
                      >
                        <Trash2 class="h-3 w-3" />
                      </Button>
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
