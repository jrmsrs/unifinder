<script lang="ts">
	import {
		ArrowRightToBracketOutline,
		ArrowLeftToBracketOutline,
		UserSolid,
		HomeSolid,
		InfoCircleSolid
	} from 'flowbite-svelte-icons';
	import { Navbar, NavBrand, NavHamburger } from 'flowbite-svelte';
	import NavSeparator from './TheNavSep.svelte';
	import NavItem from './TheNavItem.svelte';
	import NavList from './TheNavList.svelte';

	let { session } = $props();
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
		<NavList>
			<NavItem href="/" text="Home" icon={HomeSolid} />
			<NavItem href="/about" text="About" icon={InfoCircleSolid} />
			<NavSeparator />
			{#if !session}
				<NavItem href="/auth" text="Login" icon={ArrowRightToBracketOutline} blue />
			{:else}
				<NavItem href="/private" text="Perfil" icon={UserSolid} />
				<NavItem href="/auth/logout" text="Logout" icon={ArrowLeftToBracketOutline} red />
			{/if}
			<NavSeparator />
			<NavItem themeToggle />
		</NavList>
	</Navbar>
</header>
