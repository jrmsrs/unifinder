<script lang="ts">
  import { unreadCount } from '$lib/stores/notifications';
  import { onMount } from 'svelte';

  interface Props {
    id?: string;
    class?: string;
    session?: any;
  }

  let { id, class: className = '', session }: Props = $props();
  let buttonElement: HTMLButtonElement;

  onMount(() => {
    // Simula o comportamento do NavHamburger original
    if (buttonElement) {
      // Adiciona os event listeners necessários para funcionar com o NavList
      buttonElement.addEventListener('click', () => {
        const navList = document.getElementById('the-nav-list');
        if (navList) {
          navList.classList.toggle('hidden');
        }
      });
    }
  });
</script>

<button
  bind:this={buttonElement}
  {id}
  type="button"
  class="relative inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 focus:outline-none md:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 {className}"
  aria-controls="mobile-menu"
  aria-expanded="false"
>
  <span class="sr-only">Abrir menu principal</span>

  <!-- Ícone do menu hambúrguer (3 linhas) -->
  <svg class="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" />
  </svg>

  <!-- Contador de notificações apenas para usuários logados -->
  {#if session && $unreadCount > 0}
    <span class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
      {$unreadCount > 99 ? '99+' : $unreadCount}
    </span>
  {/if}
</button>
