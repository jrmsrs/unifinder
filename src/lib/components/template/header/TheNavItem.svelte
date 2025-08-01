<script lang="ts">
	import type { Component } from 'svelte';
	import { DarkMode, NavLi } from 'flowbite-svelte';
	import { SunSolid, MoonSolid } from 'flowbite-svelte-icons';

	let {
		href,
		text,
		icon,
		blue = false,
		red = false,
		themeToggle = false,
		class: extraClass = ''
	}: {
		href?: string;
		text?: string;
		icon?: Component;
		blue?: boolean;
		red?: boolean;
		themeToggle?: boolean;
		class?: string;
	} = $props();
</script>

{#if themeToggle}
	<div class="not-md:w-full">
		<DarkMode
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
	</div>
{:else}
	<NavLi
		{href}
		class="
    flex content-between justify-between 
    {blue
			? 'hover:bg-blue-500! hover:text-white! dark:hover:bg-blue-500! dark:hover:text-white!'
			: ''}
    {red
			? 'hover:bg-secondary-500! hover:text-white! dark:hover:bg-secondary-500! dark:hover:text-white!'
			: ''}
    {extraClass}
  "
	>
		{@const Icon = icon}
		<Icon class="me-1 inline h-5 w-5" />
		{text}
		<hr class="h-5 w-5 opacity-0 md:hidden" />
	</NavLi>
{/if}
