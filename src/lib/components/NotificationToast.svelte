<script lang="ts">
  import { Alert, Button } from 'flowbite-svelte';
  import { X, Info } from 'lucide-svelte';
  import { fade, fly } from 'svelte/transition';
  import type { Notification } from '$lib/api/sse';
  import { notificationActions } from '$lib/stores/notifications';

  interface Props {
    notification: Notification;
    onClose?: () => void;
  }

  let { notification, onClose }: Props = $props();

  // Usar apenas ícone e cor informativos
  const Icon = Info;
  const color = 'blue';

  function handleClose() {
    if (onClose) {
      onClose();
    }
  }

  function handleMarkAsRead() {
    notificationActions.markAsRead(notification.id);
  }

  // Auto-close após 5 segundos para notificações informativas
  setTimeout(() => {
    handleClose();
  }, 5000);
</script>

<div class="mb-2 w-full" transition:fly={{ x: 300, duration: 300 }} role="alert" aria-live="polite">
  <Alert {color} dismissable onclick={handleClose}>
    <div class="flex items-start gap-3">
      <Icon class="mt-0.5 h-5 w-5 flex-shrink-0" />
      <div class="min-w-0 flex-1">
        <h4 class="truncate text-sm font-semibold">{notification.title}</h4>
        <p class="mt-1 line-clamp-2 text-sm opacity-90">{notification.message}</p>
        <p class="mt-2 text-xs opacity-75">
          {new Date(notification.timestamp).toLocaleString('pt-BR')}
        </p>
      </div>
      <div class="flex flex-shrink-0 flex-col gap-1">
        {#if !notification.read}
          <Button size="xs" color="light" onclick={handleMarkAsRead} class="text-xs">
            <span class="hidden sm:inline">Marcar como lida</span>
            <span class="sm:hidden">Lida</span>
          </Button>
        {/if}
        <Button size="xs" color="light" onclick={handleClose} class="text-xs">
          <X class="h-3 w-3" />
        </Button>
      </div>
    </div>
  </Alert>
</div>
