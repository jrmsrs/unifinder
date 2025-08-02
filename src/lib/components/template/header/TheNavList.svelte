<script lang="ts">
	import { scale } from 'svelte/transition';
	import { page } from '$app/state';
	import { NavUl } from 'flowbite-svelte';

	let activeUrl = $derived(page.url.pathname);
	let { children } = $props();
</script>

<NavUl
	{activeUrl}
	transition={scale}
	transitionParams={{ start: 0.8, duration: 200 }}
	class="
        w-11/12 not-md:mx-auto [&>*]:text-center [&>ul]:items-center not-md:[&>ul]:border-[1px]
        not-md:[&>ul]:border-primary-300 not-md:[&>ul]:bg-primary-100 
        not-md:dark:[&>ul]:border-primary-700 not-md:dark:[&>ul]:bg-primary-800 
        [&>ul>li]:mx-0.5 [&>ul>li]:w-full md:[&>ul>li]:w-auto
      "
	nonActiveClass="
        dark:text-primary-400 dark:hover:text-primary-400! dark:bg-transparent dark:hover:bg-primary-700!
        text-primary-700 hover:text-primary-700! bg-transparent hover:bg-primary-300!
      "
	activeClass="
        dark:text-primary-800! dark:bg-primary-300! dark:hover:text-primary-400! dark:hover:bg-primary-700!
        text-primary-300! bg-primary-700! hover:text-primary-800! hover:bg-primary-300!
      "
>
	{@render children()}
</NavUl>
