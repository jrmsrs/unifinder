<script lang="ts">
	import {
		ArrowRightToBracketOutline,
		ArrowLeftToBracketOutline,
		UserSolid,
		HomeSolid,
		InfoCircleSolid,
		CubeSolid,
		QuestionCircleOutline,
		CubesStackedSolid
	} from 'flowbite-svelte-icons';
	import { Navbar, NavBrand, NavHamburger } from 'flowbite-svelte';
	import NavSeparator from './TheNavSep.svelte';
	import NavItem from './TheNavItem.svelte';
	import NavList from './TheNavList.svelte';
	import HandHelpingIcon from 'lucide-svelte/icons/hand-helping';

	let { session } = $props();
</script>

<header class="sticky top-0 z-10">
	<Navbar class="bg-white dark:bg-primary-900">
		<NavBrand href="/">
			<img src="favicon.svg" class="me-3 h-6 sm:h-9" alt="UniFinder Logo" />
			<span
				class="inline self-center text-xl font-semibold whitespace-nowrap md:hidden lg:inline dark:text-white"
			>
				UniFinder
			</span>
		</NavBrand>
		<NavHamburger />
		<NavList>
			<NavItem href="/" icon={HomeSolid}>Início</NavItem>
			<NavItem href="/objects?tipo=perdidos" icon={[CubesStackedSolid, QuestionCircleOutline]}>
				Perdidos
			</NavItem>
			<NavItem href="/objects?tipo=achados" icon={[HandHelpingIcon, CubeSolid]}>Achados</NavItem>
			<NavItem href="/about" icon={InfoCircleSolid}>Sobre</NavItem>
			<NavSeparator />
			{#if !session}
				<NavItem href="/auth" icon={ArrowRightToBracketOutline} blue>Login</NavItem>
			{:else}
				<NavItem href="/private" icon={UserSolid}>Perfil</NavItem>
				<NavItem href="/auth/logout" icon={ArrowLeftToBracketOutline} red>Logout</NavItem>
			{/if}
			<NavSeparator />
			<NavItem themeToggle />
		</NavList>
	</Navbar>
</header>
