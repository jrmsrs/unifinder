<script lang="ts">
  import { navigating } from '$app/state';
  import { Navbar, NavBrand, NavHamburger } from 'flowbite-svelte';
  import {
    ArrowLeftToBracketOutline,
    ArrowRightToBracketOutline,
    CubeSolid,
    CubesStackedSolid,
    HomeSolid,
    InfoCircleSolid,
    QuestionCircleOutline,
    UserSolid
  } from 'flowbite-svelte-icons';
  import HandHelpingIcon from 'lucide-svelte/icons/hand-helping';
  import NavItem from './TheNavItem.svelte';
  import NavList from './TheNavList.svelte';
  import NavSeparator from './TheNavSep.svelte';

  $effect(() => {
    const theme = document.querySelector('meta[name="theme-color"]');
    const htmlElement = document.querySelector('html');
    const themeButton = document.getElementById('theme-toggle');
    const hamburger = document.getElementById('the-nav-hamburger');
    const navlist = document.getElementById('the-nav-list');

    if (!navigating.complete && hamburger && navlist && !navlist.classList.contains('hidden'))
      hamburger.click();

    if (theme && htmlElement && themeButton) {
      const setTheme = (colorA: string, colorB: string) => {
        if (htmlElement.classList.contains('dark')) theme.setAttribute('content', colorA);
        else theme.setAttribute('content', colorB);
      };
      setTheme('#0f172a', '#ffffff');
      themeButton.addEventListener('click', () => setTheme('#ffffff', '#0f172a'));
    }
  });

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
    <NavHamburger id="the-nav-hamburger" />
    <NavList id="the-nav-list">
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
      <NavItem id="theme-toggle" themeToggle />
    </NavList>
  </Navbar>
</header>
