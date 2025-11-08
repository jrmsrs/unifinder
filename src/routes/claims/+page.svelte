<script lang="ts">
  import { Alert, Hr } from 'flowbite-svelte';
  import { AlertCircle, CheckCircle2, FileImage } from 'lucide-svelte';
  import ClaimModal from './ClaimModal.svelte';
  import ClaimsSection from './ClaimsSection.svelte';
  import type { Claim } from './types';

  let { data, form } = $props();

  let selectedClaim = $state<Claim | null>(null);
  let showModal = $state(false);
  let isClaimForApproval = $state(false);

  /** Busca paralela de claims */
  const claimsData = $derived(async () => {
    const [claimsForApproval, myClaims] = await Promise.all([data.streamed.claimsForApproval, data.streamed.myClaims]);

    return {
      my: myClaims,
      toApprove: claimsForApproval
    };
  });

  /** Abre o modal para visualizar ou aprovar uma reivindicação */
  function openModal(claim: Claim, forApproval: boolean = false) {
    selectedClaim = claim;
    isClaimForApproval = forApproval;
    showModal = true;
  }

  /** Fecha o modal de detalhes da reivindicação */
  function closeModal() {
    showModal = false;
    selectedClaim = null;
    isClaimForApproval = false;
  }
</script>

<svelte:head>
  <title>Reivindicações - UniFinder</title>
</svelte:head>

<!-- Layout Mobile -->
<div class="min-h-screen bg-gray-50 lg:hidden dark:bg-gray-900">
  <!-- Header fixo -->
  <div class="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
    <h1 class="text-xl font-bold text-gray-900 dark:text-white">Reivindicações</h1>
  </div>

  <div class="space-y-6 px-4 py-4">
    {#await claimsData()}
      <ClaimsSection
        title="Para Aprovar"
        iconColor="text-orange-500"
        claims={[]}
        total={0}
        emptyMessage=""
        onClaimClick={() => {}}
        variant="mobile"
      >
        {#snippet icon()}
          <AlertCircle class="h-5 w-5" />
        {/snippet}
        {#snippet emptyIcon()}
          <AlertCircle class="h-16 w-16" />
        {/snippet}
      </ClaimsSection>
    {:then { my, toApprove }}
      <ClaimsSection
        title="Para Aprovar"
        iconColor="text-orange-500"
        claims={toApprove.items}
        total={toApprove.total}
        emptyMessage="Nenhuma reivindicação pendente para aprovação"
        onClaimClick={(claim) => openModal(claim, true)}
        variant="mobile"
      >
        {#snippet icon()}
          <AlertCircle class="h-5 w-5" />
        {/snippet}
        {#snippet emptyIcon()}
          <AlertCircle class="h-16 w-16" />
        {/snippet}
      </ClaimsSection>

      <Hr />

      <ClaimsSection
        title="Minhas Reivindicações"
        iconColor="text-blue-500"
        claims={my.items}
        total={my.total}
        emptyMessage="Você ainda não fez nenhuma reivindicação"
        onClaimClick={(claim) => openModal(claim, false)}
        variant="mobile"
      >
        {#snippet icon()}
          <CheckCircle2 class="h-5 w-5" />
        {/snippet}
        {#snippet emptyIcon()}
          <FileImage class="h-16 w-16" />
        {/snippet}
      </ClaimsSection>
    {:catch error}
      <Alert color="red" dismissable>Erro: {error.message}</Alert>
    {/await}
  </div>
</div>

<!-- Layout Desktop -->
<div class="hidden lg:block">
  <div class="container mx-auto max-w-6xl px-4 py-6">
    <div class="mb-6">
      <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Reivindicações</h1>
      <p class="text-sm text-gray-600 dark:text-gray-400">Gerencie suas reivindicações e as reivindicações que você precisa aprovar</p>
    </div>

    {#await claimsData()}
      <ClaimsSection
        title="Para Aprovar"
        iconColor="text-orange-500"
        claims={[]}
        total={0}
        emptyMessage=""
        onClaimClick={() => {}}
        variant="desktop"
      >
        {#snippet icon()}
          <AlertCircle class="h-5 w-5" />
        {/snippet}
        {#snippet emptyIcon()}
          <AlertCircle class="h-16 w-16" />
        {/snippet}
      </ClaimsSection>
    {:then { my, toApprove }}
      <div class="mb-8">
        <ClaimsSection
          title="Para Aprovar"
          iconColor="text-orange-500"
          claims={toApprove.items}
          total={toApprove.total}
          emptyMessage="Nenhuma reivindicação pendente para aprovação"
          onClaimClick={(claim) => openModal(claim, true)}
          variant="desktop"
        >
          {#snippet icon()}
            <AlertCircle class="h-5 w-5" />
          {/snippet}
          {#snippet emptyIcon()}
            <AlertCircle class="h-16 w-16" />
          {/snippet}
        </ClaimsSection>
      </div>

      <Hr />

      <ClaimsSection
        title="Minhas Reivindicações"
        iconColor="text-blue-500"
        claims={my.items}
        total={my.total}
        emptyMessage="Você ainda não fez nenhuma reivindicação"
        onClaimClick={(claim) => openModal(claim, false)}
        variant="desktop"
      >
        {#snippet icon()}
          <CheckCircle2 class="h-5 w-5" />
        {/snippet}
        {#snippet emptyIcon()}
          <FileImage class="h-16 w-16" />
        {/snippet}
      </ClaimsSection>
    {:catch error}
      <Alert color="red" dismissable>Erro: {error.message}</Alert>
    {/await}
  </div>
</div>

<!-- Modal de detalhes -->
<ClaimModal claim={selectedClaim} bind:open={showModal} {isClaimForApproval} onClose={closeModal} />

<!-- Alertas de feedback -->
{#if form?.error}
  <Alert color="red" dismissable class="fixed top-20 right-4 z-50">
    {form.error}
  </Alert>
{/if}

{#if form?.success}
  <Alert color="green" dismissable class="fixed top-20 right-4 z-50">Reivindicação processada com sucesso!</Alert>
{/if}
