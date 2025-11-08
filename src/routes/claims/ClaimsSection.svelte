<script lang="ts">
  import Skeleton from '$lib/components/Skeleton.svelte';
  import { Heading } from 'flowbite-svelte';
  import type { Snippet } from 'svelte';
  import ClaimCard from './ClaimCard.svelte';
  import type { Claim } from './types';

  let {
    title,
    icon,
    iconColor,
    claims,
    total,
    emptyMessage,
    emptyIcon,
    onClaimClick,
    variant = 'mobile',
    loading = false
  }: {
    title: string;
    icon: Snippet;
    iconColor: string;
    claims: Claim[];
    total: number;
    emptyMessage: string;
    emptyIcon: Snippet;
    onClaimClick: (claim: Claim) => void;
    variant?: 'mobile' | 'desktop';
    loading?: boolean;
  } = $props();
</script>

<div>
  <div class="mb-{variant === 'mobile' ? '3' : '4'} flex items-center gap-2">
    <div class={iconColor}>
      {@render icon()}
    </div>
    <Heading
      tag="h{variant === 'mobile' ? '3' : '2'}"
      class="text-{variant === 'mobile' ? 'lg' : 'xl'} font-semibold text-gray-900 dark:text-white"
    >
      {title} ({total})
    </Heading>
  </div>

  {#if loading}
    <div class={variant === 'mobile' ? 'space-y-3' : 'grid grid-cols-1 gap-4 md:grid-cols-2'}>
      {#each Array.from({ length: variant === 'mobile' ? 3 : 4 }) as _}
        <Skeleton card={48} paragraphSize={2} />
      {/each}
    </div>
  {:else if claims.length === 0}
    <div
      class="rounded-lg border border-gray-200 bg-white py-{variant === 'mobile'
        ? '8'
        : '12'} text-center dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="mx-auto mb-4 h-16 w-16 text-gray-400">
        {@render emptyIcon()}
      </div>
      <p class="text-{variant === 'mobile' ? 'sm' : 'base'} text-gray-600 dark:text-gray-400">{emptyMessage}</p>
    </div>
  {:else}
    <div class={variant === 'mobile' ? 'space-y-3' : 'grid grid-cols-1 gap-4 md:grid-cols-2'}>
      {#each claims as claim (claim.id)}
        <ClaimCard {claim} onclick={onClaimClick} {variant} />
      {/each}
    </div>
  {/if}
</div>
