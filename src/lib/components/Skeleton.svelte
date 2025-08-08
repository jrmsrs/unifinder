<script lang="ts">
  import { Card } from 'flowbite-svelte';
  import { UserSolid } from 'flowbite-svelte-icons';

  let {
    headingSize = 1,
    paragraphSize = 0,
    card,
    class: customClass = ''
  }: {
    headingSize?: number;
    paragraphSize?: number;
    card?: 64 | 48;
    class?: string;
  } = $props();
</script>

{#if card}
  <Card class="relative col-span-1 flex min-w-full flex-col gap-2 p-6 {card === 48 ? 'w-48' : ''} {customClass}">
    <div class="{card === 64 ? 'h-64' : 'h-48'} bg-primary-300 dark:bg-primary-700"></div>
    <div
      class="mt-1 mb-0.5 flex animate-pulse flex-wrap [&>*]:me-2.5 [&>*]:h-7 [&>*]:rounded-xl [&>*]:bg-primary-300 dark:[&>*]:bg-primary-700"
    >
      {#each new Array(headingSize) as _}
        <div class="w-1/5"></div>
        <div class="w-1/3"></div>
        <div class="w-1/8"></div>
      {/each}
    </div>
    <div
      class="my-1.5 flex animate-pulse flex-wrap [&>div]:me-1 [&>div]:mb-2
			[&>div]:h-4 [&>div]:rounded-lg [&>div]:bg-primary-300 dark:[&>div]:bg-primary-700"
    >
      {#each new Array(paragraphSize) as _}
        <div class="w-1/4"></div>
        <div class="w-1/5"></div>
        <div class="w-1/2"></div>
        <div class="w-1/3"></div>
        <div class="w-1/5"></div>
        <div class="w-1/3"></div>
        <div class="w-1/2"></div>
      {/each}
      {#if !paragraphSize}
        <div class="w-1/4"></div>
        <div class="w-1/5"></div>
        <div class="w-1/2"></div>
        <div class="w-1/3"></div>
      {/if}
    </div>
  </Card>
{:else}
  <div class="flex w-full animate-pulse items-center space-x-4 {customClass}">
    <div
      class="my-2 flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-primary-300 dark:bg-primary-700"
    >
      <UserSolid class="h-12 w-12 [&>*]:fill-primary-50 dark:[&>*]:fill-primary-800" />
    </div>
    <div class="w-full">
      <div
        class="my-1.5 flex animate-pulse flex-wrap [&>div]:me-2.5 [&>div]:mb-2 [&>div]:h-7 [&>div]:rounded-xl [&>div]:bg-primary-300 dark:[&>div]:bg-primary-700"
      >
        {#each new Array(headingSize) as _}
          <div class="w-1/5"></div>
          <div class="w-1/3"></div>
          <div class="w-1/8"></div>
        {/each}
      </div>
      <div
        class="my-1.5 flex animate-pulse flex-wrap justify-between [&>div]:me-1 [&>div]:mb-1
			[&>div]:h-4 [&>div]:rounded-lg [&>div]:bg-primary-300 dark:[&>div]:bg-primary-700"
      >
        {#each new Array(paragraphSize) as _}
          <div class="w-1/4"></div>
          <div class="w-1/5"></div>
          <div class="w-1/2"></div>
          <div class="w-1/3"></div>
          <div class="w-1/5"></div>
          <div class="w-1/3"></div>
          <div class="w-1/2"></div>
        {/each}
      </div>
    </div>
  </div>
{/if}
