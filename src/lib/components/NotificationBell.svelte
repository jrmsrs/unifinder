<script lang="ts">
  import { Bell, BellRing } from 'lucide-svelte';
  import { unreadCount } from '$lib/stores/notifications';
  import { goto } from '$app/navigation';

  function goToNotifications() {
    goto('/notifys');
  }
</script>

<button
  type="button"
  class="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
  on:click={goToNotifications}
  aria-label="Notificações"
>
  {#if $unreadCount > 0}
    <BellRing class="h-6 w-6" />
    <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {$unreadCount > 99 ? '99+' : $unreadCount}
    </span>
  {:else}
    <Bell class="h-6 w-6" />
  {/if}
</button>
