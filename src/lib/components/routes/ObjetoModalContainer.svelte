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

<div class="fixed h-full w-full inset-0 z-30 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
  <slot />
</div>
