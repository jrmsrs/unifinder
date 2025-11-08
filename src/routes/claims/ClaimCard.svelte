<script lang="ts">
  import { goto } from '$app/navigation';
  import ImageLoader from '$lib/components/ImageLoader.svelte';
  import { Badge, Card } from 'flowbite-svelte';
  import { Clock } from 'lucide-svelte';
  import { formatDate, getStatusBadgeColor, getStatusText, type Claim } from './types';

  let {
    claim,
    onclick,
    variant = 'mobile'
  }: {
    claim: Claim;
    onclick: (claim: Claim) => void;
    variant?: 'mobile' | 'desktop';
  } = $props();

  /** Manipulador de clique na carta */
  const handleClick = () => {
    onclick(claim);
  };

  /** Manipulador de tecla pressionada na carta */
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      onclick(claim);
    }
  };
</script>

<Card
  class="cursor-pointer p-{variant === 'mobile' ? '4' : '6'} transition-shadow hover:shadow-{variant === 'mobile'
    ? 'md'
    : 'lg'} active:scale-[0.98]"
  role="button"
  tabindex={0}
  onclick={handleClick}
  onkeydown={handleKeydown}
>
  <div class="mb-{variant === 'mobile' ? '0' : '4'} flex items-start gap-{variant === 'mobile' ? '3' : '4'}">
    {#if claim.objeto}
      <div
        class="flex-shrink-0 cursor-pointer"
        role="button"
        tabindex="0"
        onclick={(e: MouseEvent) => {
          e.stopPropagation();
          goto(`/objetos/${claim.objeto!.id}`);
        }}
        onkeydown={(e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            e.stopPropagation();
            goto(`/objetos/${claim.objeto!.id}`);
          }
        }}
      >
        <ImageLoader
          src={claim.objeto.url_imagem}
          alt={claim.objeto.nome}
          class="h-{variant === 'mobile' ? '20' : '32'} w-{variant === 'mobile' ? '20' : '32'} rounded-lg object-cover"
        />
      </div>
    {/if}
    <div class="min-w-0 flex-1">
      <div class="mb-2 flex items-start justify-between gap-2">
        <div class={variant === 'mobile' ? 'flex-1' : ''}>
          <h3 class="mb-1 text-{variant === 'mobile' ? 'sm' : 'lg'} font-semibold text-gray-900 dark:text-white">
            {claim.objeto?.nome || `Objeto #${claim.objeto_id}`}
          </h3>
          <p
            class="line-clamp-{variant === 'mobile' ? '2' : '3'} text-{variant === 'mobile' ? 'xs' : 'sm'} text-gray-600 dark:text-gray-400"
          >
            {claim.descricao}
          </p>
        </div>
        <Badge color={getStatusBadgeColor(claim.status)} size="small">
          {getStatusText(claim.status)}
        </Badge>
      </div>

      <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
        <Clock class="h-3 w-3" />
        {formatDate(claim.data_registro)}
      </div>
    </div>
  </div>
</Card>
