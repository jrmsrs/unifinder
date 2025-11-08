<script lang="ts">
  import { navigating } from '$app/state';
  import NotificationHamburger from '$lib/components/NotificationHamburger.svelte';
  import { unreadCount } from '$lib/stores/notifications';
  import type { Session } from '@supabase/supabase-js';
  import { Navbar, NavBrand } from 'flowbite-svelte';
  import {
    ArrowLeftToBracketOutline,
    ArrowRightToBracketOutline,
    BellSolid,
    CheckOutline,
    CubeSolid,
    CubesStackedSolid,
    HomeSolid,
    QuestionCircleOutline,
    UserSolid
  } from 'flowbite-svelte-icons';
  import { bounceInOut } from 'svelte/easing';
  import { slide } from 'svelte/transition';
  import NavItem from './TheNavItem.svelte';
  import NavList from './TheNavList.svelte';

  let { session, openNotifys = $bindable(false) }: { session: Session | null; openNotifys: boolean } = $props();
  let blueLine = $state(false);

  // Fecha menu mobile ao navegar
  $effect(() => {
    const hamburger = document.getElementById('the-nav-hamburger');
    const navlist = document.getElementById('the-nav-list');

    if (!navigating.complete && hamburger && navlist && !navlist.classList.contains('hidden')) {
      hamburger.click();
    }
  });

  // Gerencia tema e scroll
  $effect(() => {
    const theme = document.querySelector('meta[name="theme-color"]');
    const htmlElement = document.querySelector('html');
    const themeButton = document.getElementById('theme-toggle');
    const scroll = document.getElementById('scroll');

    let themeClickHandler: (() => void) | null = null;
    let scrollHandler: (() => void) | null = null;

    // Atualiza cor do tema ao alternar dark/light mode
    if (theme && htmlElement && themeButton) {
      const setTheme = (colorA: string, colorB: string) => {
        if (htmlElement.classList.contains('dark')) theme.setAttribute('content', colorA);
        else theme.setAttribute('content', colorB);
      };
      setTheme('#171616', '#ffffff');
      themeClickHandler = () => setTheme('#ffffff', '#171616');
      themeButton.addEventListener('click', themeClickHandler);
    }

    // Mostra linha azul ao rolar página
    if (scroll) {
      scrollHandler = function () {
        var scrollPosition = scroll.scrollTop || window.pageYOffset;
        var scrollThreshold = 32;
        blueLine = scrollPosition > scrollThreshold;
      };
      scroll.addEventListener('scroll', scrollHandler);
    }

    // Cleanup: remove event listeners
    return () => {
      if (themeButton && themeClickHandler) {
        themeButton.removeEventListener('click', themeClickHandler);
      }
      if (scroll && scrollHandler) {
        scroll.removeEventListener('scroll', scrollHandler);
      }
    };
  });
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

      <!-- Links de navegação responsivos (mobile/tablet/desktop) -->
      <NavItem class="hidden md:flex lg:hidden" href="/objetos" icon={CubesStackedSolid}>Objetos</NavItem>
      <NavItem class="flex md:hidden lg:flex" href="/objetos?tipo=perdido" icon={[CubesStackedSolid, QuestionCircleOutline]}>
        Perdidos
      </NavItem>
      <NavItem class="flex md:hidden lg:flex" href="/objetos?tipo=achado" icon={CubeSolid}>Achados</NavItem>
      <NavItem sep />

      <!-- Menu autenticado vs não autenticado -->
      {#if !session}
        <NavItem href="/auth" icon={ArrowRightToBracketOutline} green>Login</NavItem>
      {:else}
        <NavItem href="/claims" icon={CheckOutline}>
          <span class="md:hidden lg:flex">Reivindicações</span>
        </NavItem>
        <NavItem icon={BellSolid} badgeCount={$unreadCount} onclick={() => (openNotifys = true)}>
          <span class="md:hidden">Notificações</span>
        </NavItem>
        <NavItem href="/private" icon={UserSolid}>
          <span class="md:hidden lg:flex">Perfil </span>
        </NavItem>
        <NavItem href="/auth/logout" icon={ArrowLeftToBracketOutline} red>
          <span class="md:hidden lg:flex">Logout</span>
        </NavItem>
      {/if}

      <NavItem sep />
      <NavItem id="theme-toggle" themeToggle />
    </NavList>

    <!-- Linha azul animada ao rolar -->
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
