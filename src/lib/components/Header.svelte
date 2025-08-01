<script lang="ts">
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, DarkMode } from 'flowbite-svelte';
	import { scale } from 'svelte/transition';

	let { session } = $props();
</script>

<header class="sticky top-0 z-10">
	<Navbar class="bg-white dark:bg-gray-900">
		<NavBrand href="/">
			<img src="favicon.svg" class="me-3 h-6 sm:h-9" alt="UniFinder Logo" />
			<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white"
				>UniFinder</span
			>
		</NavBrand>
		<NavHamburger />
		<NavUl
			transition={scale}
			transitionParams={{ start: 0.8, duration: 200 }}
			class="w-11/12 not-md:mx-auto [&>*]:text-center [&>ul]:items-center [&>ul>li]:w-full md:[&>ul>li]:w-auto"
		>
			<NavLi href="/">Home</NavLi>
			<NavLi href="/about">About</NavLi>
			{#if !session}
				<NavLi href="/auth">Login</NavLi>
			{:else}
				<NavLi href="/private">Perfil</NavLi>
				<NavLi href="/auth/logout">Logout</NavLi>
			{/if}
			<div class="not-md:w-full">
				<DarkMode
					class="flex w-full content-center rounded-sm md:rounded-full [&>*]:mx-auto [&>*]:w-min"
				/>
			</div>
		</NavUl>
	</Navbar>
</header>
