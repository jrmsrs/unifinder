<script lang="ts">
  import { DarkMode, NavLi } from 'flowbite-svelte';
  import { MoonSolid, SunSolid } from 'flowbite-svelte-icons';
  import type { Component } from 'svelte';
  import TheNavSep from './TheNavSep.svelte';

  let {
    id,
    href,
    children,
    icon,
    sep = false,
    green = false,
    red = false,
    themeToggle = false,
    badgeCount = 0,
    class: extraClass = '',
    onclick = undefined
  }: {
    id?: string;
    href?: string;
    children?: any;
    icon?: Component | any[];
    sep?: boolean;
    green?: boolean;
    red?: boolean;
    themeToggle?: boolean;
    badgeCount?: number;
    class?: string;
    onclick?: (() => void) | undefined;
  } = $props();

  // Executa onclick e fecha menu mobile
  function handleClick(event: Event) {
    if (onclick) {
      event.preventDefault();

      const navList = document.getElementById('the-nav-list');
      if (navList && !navList.classList.contains('hidden')) {
        navList.classList.add('hidden');
      }

      onclick();
    }
  }
</script>

<!-- Toggle de tema claro/escuro -->
{#if themeToggle}
  <li class="not-md:w-full">
    <DarkMode
      {id}
      class="
        flex w-full content-center rounded-sm hover:bg-gray-300 
        md:rounded-full dark:hover:bg-gray-700 [&>*]:mx-auto
        [&>*]:w-full md:[&>*]:w-min
      "
    >
      {#snippet lightIcon()}
        <div class="flex content-between justify-between px-1">
          <SunSolid class="me-1 inline h-5 w-5" />
          <span class="inline md:hidden">Modo Claro</span>
          <hr class="h-5 w-5 opacity-0 md:hidden" />
        </div>
      {/snippet}
      {#snippet darkIcon()}
        <div class="flex content-between justify-between px-1 text-gray-700">
          <MoonSolid class="me-1 inline h-5 w-5" />
          <span class="inline md:hidden">Modo Escuro</span>
          <hr class="h-5 w-5 opacity-0 md:hidden" />
        </div>
      {/snippet}
    </DarkMode>
  </li>

  <!-- Separador visual -->
{:else if sep}
  <li>
    <TheNavSep />
  </li>

  <!-- Item de navegação com onclick customizado -->
{:else if onclick}
  <li class="not-md:w-full">
    <button
      type="button"
      onclick={handleClick}
      class="
        flex w-full cursor-pointer items-center justify-between rounded-lg p-2 py-2 ps-3 pe-4
        text-gray-900 hover:bg-gray-100 md:p-2 dark:text-white dark:hover:bg-gray-700
        {green ? 'hover:bg-green-500! hover:text-white! dark:hover:bg-green-500! dark:hover:text-white!' : ''}
        {red ? 'hover:bg-secondary-500! hover:text-white! dark:hover:bg-secondary-500! dark:hover:text-white!' : ''}
        {extraClass}
      "
    >
      <!-- Ícone(s) com badge de contagem opcional -->
      {#if icon}
        {#if Array.isArray(icon)}
          <span class="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
            {#each icon as ic, i}
              {@const IconComponent = ic}
              <IconComponent class="absolute {i === 0 ? 'top-1 h-5 w-6' : '-top-1 m-auto h-4 w-4'} right-0" />
            {/each}
            {#if badgeCount > 0}
              <span
                class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
              >
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            {/if}
          </span>
        {:else}
          {@const Icon = icon}
          <span class="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
            <Icon class="h-5 w-5" />
            {#if badgeCount > 0}
              <span
                class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
              >
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            {/if}
          </span>
        {/if}
      {/if}

      <!-- Texto centralizado (mobile) / alinhado à esquerda (desktop) -->
      <span class="flex-1 text-center md:text-left">{@render children()}</span>

      <!-- Espaçador invisível para simetria no mobile -->
      <span class="h-5 w-5 opacity-0 md:hidden"></span>
    </button>
  </li>

  <!-- Item de navegação padrão com href -->
{:else}
  <NavLi
    {href}
    class="
      flex w-full items-center justify-between
      not-md:w-full
      {green ? 'hover:bg-green-500! hover:text-white! dark:hover:bg-green-500! dark:hover:text-white!' : ''}
      {red ? 'hover:bg-secondary-500! hover:text-white! dark:hover:bg-secondary-500! dark:hover:text-white!' : ''}
      {extraClass}
    "
  >
    <!-- Ícone(s) com badge de contagem opcional -->
    {#if icon}
      {#if Array.isArray(icon)}
        <span class="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
          {#each icon as ic, i}
            {@const IconComponent = ic}
            <IconComponent class="absolute {i === 0 ? 'top-1 h-5 w-6' : '-top-1 m-auto h-4 w-4'} right-0" />
          {/each}
          {#if badgeCount > 0}
            <span
              class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
            >
              {badgeCount > 99 ? '99+' : badgeCount}
            </span>
          {/if}
        </span>
      {:else}
        {@const Icon = icon}
        <span class="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
          <Icon class="h-5 w-5" />
          {#if badgeCount > 0}
            <span
              class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
            >
              {badgeCount > 99 ? '99+' : badgeCount}
            </span>
          {/if}
        </span>
      {/if}
    {/if}

    <!-- Texto centralizado (mobile) / alinhado à esquerda (desktop) -->
    <span class="flex-1 text-center md:text-left">{@render children()}</span>

    <!-- Espaçador invisível para simetria no mobile -->
    <span class="h-5 w-5 opacity-0 md:hidden"></span>
  </NavLi>
{/if}
