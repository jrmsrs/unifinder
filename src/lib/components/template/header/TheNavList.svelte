<script lang="ts">
  import { page } from '$app/state';
  import { NavUl } from 'flowbite-svelte';
  import { scale } from 'svelte/transition';

  let activeUrl = $derived(page.url.pathname + page.url.search);
  let { children, id = undefined } = $props();
</script>

<NavUl
  {id}
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
        dark:text-gray-50! dark:bg-primary-500! dark:hover:text-gray-400! dark:hover:bg-gray-700!
        text-gray-50! bg-primary-600! hover:text-gray-800! hover:bg-gray-300!
      "
>
  {@render children()}
</NavUl>
