<script lang="ts">
  import { navigating } from '$app/state';
  import { Navbar, NavBrand, NavHamburger } from 'flowbite-svelte';
  import {
    ArrowLeftToBracketOutline,
    ArrowRightToBracketOutline,
    BellSolid,
    CheckOutline,
    CubeSolid,
    CubesStackedSolid,
    HomeSolid,
    InfoCircleSolid,
    QuestionCircleOutline,
    UserSolid
  } from 'flowbite-svelte-icons';
  import { bounceInOut } from 'svelte/easing';
  import { slide } from 'svelte/transition';
  import NavItem from './TheNavItem.svelte';
  import NavList from './TheNavList.svelte';
  import NotificationHamburger from '$lib/components/NotificationHamburger.svelte';
  import { unreadCount } from '$lib/stores/notifications';

  $effect(() => {
    const theme = document.querySelector('meta[name="theme-color"]');
    const htmlElement = document.querySelector('html');
    const themeButton = document.getElementById('theme-toggle');
    const hamburger = document.getElementById('the-nav-hamburger');
    const navlist = document.getElementById('the-nav-list');
    const scroll = document.getElementById('scroll');

    if (!navigating.complete && hamburger && navlist && !navlist.classList.contains('hidden')) hamburger.click();

    if (theme && htmlElement && themeButton) {
      const setTheme = (colorA: string, colorB: string) => {
        if (htmlElement.classList.contains('dark')) theme.setAttribute('content', colorA);
        else theme.setAttribute('content', colorB);
      };
      setTheme('#171616', '#ffffff');
      themeButton.addEventListener('click', () => setTheme('#ffffff', '#171616'));
    }

    if (scroll)
      scroll.addEventListener('scroll', function () {
        var scrollPosition = scroll.scrollTop || window.pageYOffset;
        var scrollThreshold = 32;
        blueLine = scrollPosition > scrollThreshold;
      });
  });

  let blueLine = $state(false);

  let { session } = $props();
</script>

<header class="sticky top-0 z-35">
  <Navbar class="bg-white pb-0 dark:bg-gray-900">
    <NavBrand href="/">
      <img src="/favicon.svg" class="mx-3 h-6 sm:h-9" alt="UniFinder Logo" />
      <span class="inline self-center text-xl font-semibold whitespace-nowrap md:hidden lg:inline dark:text-white"> UniFinder </span>
    </NavBrand>
    <NotificationHamburger id="the-nav-hamburger" class="m-0 p-0" {session} />
    <NavList id="the-nav-list">
      <NavItem href="/" icon={HomeSolid}>Início</NavItem>
      <NavItem href="/objetos?tipo=perdido" icon={[CubesStackedSolid, QuestionCircleOutline]}>Perdidos</NavItem>
      <NavItem href="/objetos?tipo=achado" icon={CubeSolid}>Achados</NavItem>
      <NavItem href="/about" icon={InfoCircleSolid}>Sobre</NavItem>
      <NavItem sep />
      {#if !session}
        <NavItem href="/auth" icon={ArrowRightToBracketOutline} green>Login</NavItem>
      {:else}
        <NavItem href="/claims" icon={CheckOutline}>Reivindicações</NavItem>
        <NavItem href="/notifys" icon={BellSolid} badgeCount={$unreadCount}>Notificações</NavItem>
        <NavItem href="/private" icon={UserSolid}>Perfil</NavItem>
        <NavItem href="/auth/logout" icon={ArrowLeftToBracketOutline} red>Logout</NavItem>
      {/if}
      <NavItem sep />
      <NavItem id="theme-toggle" themeToggle />
    </NavList>
    <div class="mt-2 flex h-0.5 w-full flex-col content-center items-center md:mt-0">
      {#if blueLine}
        <div
          id="blue-line"
          transition:slide={{ duration: 1000, axis: 'x', easing: bounceInOut }}
          class="h-0.5 w-full bg-primary-500 md:mt-0"
        ></div>
      {/if}
    </div>
  </Navbar>
</header>
