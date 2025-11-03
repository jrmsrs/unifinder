<script lang="ts">
  import { ImageSolid } from 'flowbite-svelte-icons';

  let { src, alt, class: divClass = '', imgClass = '' } = $props();
  let isLoading = $state(true);
  let hasError = $state(false);

  $effect(() => {
    if (!src || src === '' || src === 'null') {
      hasError = true;
      isLoading = false;
    }
  });
</script>

<div class="relative overflow-hidden bg-gray-200 dark:bg-gray-700 {divClass}">
  {#if isLoading && !hasError}
    <div class="flex h-full w-full animate-pulse items-center justify-center bg-gray-300 dark:bg-gray-700">
      <ImageSolid class="h-1/3 w-1/3 text-gray-400 dark:text-gray-600" aria-label="Carregando imagem..." />
    </div>
  {:else if hasError}
    <div class="flex h-full w-full items-center justify-center bg-gray-300 dark:bg-gray-700">
      <ImageSolid class="h-1/3 w-1/3 text-gray-400 dark:text-gray-600" aria-label="Sem imagem" />
    </div>
  {/if}
  {#if !hasError}
    <img
      {src}
      {alt}
      draggable="false"
      oncontextmenu={(e) => {
        e.preventDefault();
        return false;
      }}
      onload={() => (isLoading = false)}
      onerror={() => {
        hasError = true;
        isLoading = false;
      }}
      class="absolute top-0 left-0 h-full w-full object-cover transition-opacity duration-500 {imgClass}"
      class:opacity-0={isLoading}
      class:opacity-100={!isLoading}
    />
  {/if}
</div>
