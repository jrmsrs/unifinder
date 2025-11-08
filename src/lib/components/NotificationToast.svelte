<script lang="ts">
  import type { Notification } from '$lib/api/notifications';
  import { notificationActions } from '$lib/stores/notifications';
  import { Alert, Button } from 'flowbite-svelte';
  import { Info, X } from 'lucide-svelte';
  import { fly } from 'svelte/transition';

  interface Props {
    notification: Notification;
    onClose?: () => void;
  }

  let { notification, onClose }: Props = $props();

  /** Fecha a notificação */
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  /** Marca notificação como lida */
  const handleMarkAsRead = () => {
    notificationActions.markAsRead(notification.id);
  };

  // Auto-fecha após 5 segundos
  setTimeout(() => {
    handleClose();
  }, 5000);
</script>

<div class="mb-2 w-full" transition:fly={{ x: 300, duration: 300 }} role="alert" aria-live="polite">
  <Alert color="blue" dismissable onclick={handleClose}>
    <div class="flex items-start gap-3">
      <!-- Ícone da notificação -->
      <Info class="mt-0.5 h-5 w-5 flex-shrink-0" />

      <!-- Conteúdo da notificação -->
      <div class="min-w-0 flex-1">
        <p class="mt-1 line-clamp-2 text-sm opacity-90">{notification.message}</p>
        <p class="mt-2 text-xs opacity-75">
          {new Date(notification.created_at).toLocaleString('pt-BR')}
        </p>
      </div>

      <!-- Ações -->
      <div class="flex flex-shrink-0 flex-col gap-1">
        {#if !notification.delivered}
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
