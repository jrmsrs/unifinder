<script lang="ts">
	import NavSeparator from './TheNavSep.svelte';
	import {
		ArrowRightToBracketOutline,
		ArrowLeftToBracketOutline,
		UserSolid,
		HomeSolid,
		InfoCircleSolid,
		SunSolid,
		MoonSolid
	} from 'flowbite-svelte-icons';

	import { page } from '$app/state';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
	import { scale } from 'svelte/transition';

	let { session } = $props();
	let activeUrl = $derived(page.url.pathname);

	function toggleDarkMode() {
		document.documentElement.classList.toggle('dark');
	}
</script>

<header class="sticky top-0 z-10">
	<Navbar class="bg-white dark:bg-gray-900">
		<NavBrand href="/">
			<img src="favicon.svg" class="me-3 h-6 sm:h-9" alt="UniFinder Logo" />
			<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
				UniFinder
			</span>
		</NavBrand>
		<NavHamburger />
		<NavUl
			{activeUrl}
			transition={scale}
			transitionParams={{ start: 0.8, duration: 200 }}
			class="
				w-11/12 not-md:mx-auto [&>*]:text-center [&>ul]:items-center not-md:[&>ul]:border-[1px]
				not-md:[&>ul]:border-gray-300 not-md:[&>ul]:bg-gray-100 
				not-md:dark:[&>ul]:border-gray-700 not-md:dark:[&>ul]:bg-gray-800 
				[&>ul>li]:mx-0.5 [&>ul>li]:w-full md:[&>ul>li]:w-auto
			"
			nonActiveClass="
				dark:text-gray-400 dark:hover:text-gray-400! dark:bg-transparent dark:hover:bg-gray-700!
				text-gray-700 hover:text-gray-700! bg-transparent hover:bg-gray-300!
			"
			activeClass="
				dark:text-gray-800! dark:bg-gray-300! dark:hover:text-gray-400! dark:hover:bg-gray-700!
				text-gray-300! bg-gray-700! hover:text-gray-800! hover:bg-gray-300!
			"
		>
			<NavLi href="/" class="flex content-between justify-between">
				<HomeSolid class="me-1 inline h-5 w-5" />
				Home
				<hr class="h-5 w-5 opacity-0 md:hidden" />
			</NavLi>
			<NavLi href="/about" class="flex content-between justify-between">
				<InfoCircleSolid class="me-1 inline h-5 w-5" />
				About
				<hr class="h-5 w-5 opacity-0 md:hidden" />
			</NavLi>
			<NavSeparator />
			{#if !session}
				<NavLi
					href="/auth"
					class="
						flex content-between justify-between 
						hover:bg-blue-500! hover:text-white! 
						dark:hover:bg-blue-500! dark:hover:text-white!
					"
				>
					<ArrowRightToBracketOutline class="me-1 inline h-5 w-5" />
					Login
					<hr class="h-5 w-5 opacity-0 md:hidden" />
				</NavLi>
			{:else}
				<NavLi class="flex content-between justify-between" href="/private">
					<UserSolid class="me-1 inline h-5 w-5" />
					Perfil
					<hr class="h-5 w-5 opacity-0 md:hidden" />
				</NavLi>
				<NavLi
					class="
						flex content-between justify-between 
						hover:bg-secondary-500! hover:text-white! 
						dark:hover:bg-secondary-500! dark:hover:text-white!
					"
					href="/auth/logout"
				>
					<ArrowLeftToBracketOutline class="me-1 inline h-5 w-5" />
					Logout
					<hr class="h-5 w-5 opacity-0 md:hidden" />
				</NavLi>
			{/if}
			<NavSeparator />
			<div
				role="button"
				tabindex="0"
				onclick={toggleDarkMode}
				onkeydown={(e) => e.key === 'Enter' && toggleDarkMode()}
				class="
					flex cursor-pointer content-between items-center
					justify-between rounded-md px-3 py-2 text-gray-700 not-md:w-full
					hover:bg-gray-300! md:rounded-full
					dark:text-gray-400 dark:hover:bg-gray-700!
				"
			>
				<div>
					<span class="dark:hidden"><SunSolid class="inline h-5 w-5 not-md:me-1" /></span>
					<span class="hidden dark:inline"><MoonSolid class="inline h-5 w-5 not-md:me-1" /></span>
				</div>
				<div class="flex items-center">
					<span class="md:hidden">
						<span class="dark:hidden">Modo Escuro</span>
						<span class="hidden dark:inline">Modo Claro</span>
					</span>
				</div>
				<hr class="h-5 w-5 opacity-0 md:hidden" />
			</div>
		</NavUl>
	</Navbar>
</header>
