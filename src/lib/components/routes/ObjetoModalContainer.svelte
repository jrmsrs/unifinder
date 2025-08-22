<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    const scroll = document.getElementById('scroll');
    scroll?.style.setProperty('overflow', 'hidden');
    return () => {
      scroll?.style.removeProperty('overflow');
    };
  });
</script>

<div class="fixed h-[calc(100%-4rem)] md:h-[calc(100%-8rem)] w-full bottom-0 left-0 right-0 z-30 flex items-center justify-center p-4 backdrop-blur-sm">
  <slot />
</div>
