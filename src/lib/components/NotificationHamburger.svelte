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
  class="relative inline-flex items-center justify-center p-2 w-10 h-10 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 md:hidden {className}"
  aria-controls="mobile-menu"
  aria-expanded="false"
>
  <span class="sr-only">Abrir menu principal</span>
  
  <!-- Ícone do menu hambúrguer (3 linhas) -->
  <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
  </svg>
  
  <!-- Contador de notificações apenas para usuários logados -->
  {#if session && $unreadCount > 0}
    <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
      {$unreadCount > 99 ? '99+' : $unreadCount}
    </span>
  {/if}
</button>
