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
    class: extraClass = ''
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
  } = $props();
</script>

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
{:else if !sep}
  <NavLi
    {href}
    class="
    flex content-between justify-between 
    {green ? 'hover:bg-green-500! hover:text-white! dark:hover:bg-green-500! dark:hover:text-white!' : ''}
    {red ? 'hover:bg-secondary-500! hover:text-white! dark:hover:bg-secondary-500! dark:hover:text-white!' : ''}
    {extraClass}
  "
  >
    {#if icon}
      {#if Array.isArray(icon)}
        <span class="relative me-1 inline-block h-5 w-5">
          {#each icon as ic, i}
            {@const IconComponent = ic}
            <IconComponent class="absolute {i === 0 ? 'top-1 h-5 w-6' : '-top-1 m-auto h-4 w-4'} right-0" />
          {/each}
          {#if badgeCount > 0}
            <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {badgeCount > 99 ? '99+' : badgeCount}
            </span>
          {/if}
        </span>
      {:else}
        {@const Icon = icon}
        <span class="relative me-1 inline-block">
          <Icon class="inline h-5 w-5" />
          {#if badgeCount > 0}
            <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {badgeCount > 99 ? '99+' : badgeCount}
            </span>
          {/if}
        </span>
      {/if}
    {/if}
    <span>{@render children()}</span>
    <hr class="h-5 w-5 opacity-0 md:hidden" />
  </NavLi>
{:else}
  <li>
    <TheNavSep />
  </li>
{/if}
