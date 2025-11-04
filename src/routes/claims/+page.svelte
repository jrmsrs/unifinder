<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { Button, Card, Badge, Alert, Heading, P, Modal, Hr } from 'flowbite-svelte';
  import { Check, X, FileImage, Clock, CheckCircle2, AlertCircle } from 'lucide-svelte';
  import ImageLoader from '$lib/components/ImageLoader.svelte';
  import Skeleton from '$lib/components/Skeleton.svelte';

  let { data, form } = $props();

  let selectedClaim = $state<Claim | null>(null);
  let showModal = $state(false);
  let isClaimForApproval = $state(false);

  type Claim = {
    id: string;
    objeto_id: string;
    descricao: string;
    evidencias: string[];
    data_registro: string;
    status: ClaimStatus;
    user_id: string;
    tutor_id: string;
    objeto?: Objeto;
  };

  // Carrega claims de ambas as fontes
  const claimsData = $derived(async () => {
    const [claimsForApproval, myClaims] = await Promise.all([data.streamed.claimsForApproval, data.streamed.myClaims]);

    return {
      my: myClaims,
      toApprove: claimsForApproval
    };
  });

  function openModal(claim: Claim, forApproval: boolean = false) {
    selectedClaim = claim;
    isClaimForApproval = forApproval;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    selectedClaim = null;
    isClaimForApproval = false;
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusBadgeColor(status: ClaimStatus): 'green' | 'red' | 'yellow' | 'gray' {
    const normalized = status.toLowerCase() as ClaimStatus;
    switch (normalized) {
      case 'aprovado':
        return 'green';
      case 'rejeitado':
        return 'red';
      case 'pendente':
        return 'yellow';
      default:
        return 'gray';
    }
  }

  function getStatusText(status: ClaimStatus): string {
    const normalized = status.toLowerCase() as ClaimStatus;
    switch (normalized) {
      case 'aprovado':
        return 'Aprovado';
      case 'rejeitado':
        return 'Rejeitado';
      case 'pendente':
        return 'Pendente';
      default:
        return status;
    }
  }

  // Componente para renderizar claim card (mobile)
  function ClaimCardMobile(claim: Claim, canApprove: boolean = false) {
    return { claim, canApprove };
  }
</script>

<svelte:head>
  <title>Reivindicações - UniFinder</title>
</svelte:head>

<!-- Mobile First Layout -->
<div class="min-h-screen bg-gray-50 lg:hidden dark:bg-gray-900">
  <!-- Header Mobile -->
  <div class="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Reivindicações</h1>
      </div>
    </div>
  </div>

  <!-- Conteúdo -->
  <div class="space-y-6 px-4 py-4">
    {#await claimsData()}
      <div class="space-y-3">
        {#each Array.from({ length: 6 }) as _}
          <Skeleton card={48} paragraphSize={2} />
        {/each}
      </div>
    {:then { my, toApprove }}
      <!-- Seção: Para Aprovar -->
      <div>
        <div class="mb-3 flex items-center gap-2">
          <AlertCircle class="h-5 w-5 text-orange-500" />
          <Heading tag="h3" class="text-lg font-semibold text-gray-900 dark:text-white">
            Para Aprovar ({toApprove.total})
          </Heading>
        </div>

        {#if toApprove.items.length === 0}
          <div class="rounded-lg border border-gray-200 bg-white py-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <p class="text-sm text-gray-600 dark:text-gray-400">Nenhuma reivindicação pendente para aprovação</p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each toApprove.items as claim (claim.id)}
              <Card
                class="cursor-pointer p-4 transition-shadow hover:shadow-md active:scale-[0.98]"
                role="button"
                tabindex={0}
                onclick={() => openModal(claim, true)}
                onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && openModal(claim, true)}
              >
                <div class="flex items-start gap-3">
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
                      <ImageLoader src={claim.objeto.url_imagem} alt={claim.objeto.nome} class="h-20 w-20 rounded-lg object-cover" />
                    </div>
                  {/if}
                  <div class="min-w-0 flex-1">
                    <div class="mb-2 flex items-start justify-between gap-2">
                      <div class="flex-1">
                        <h3 class="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                          {claim.objeto?.nome || `Objeto #${claim.objeto_id}`}
                        </h3>
                        <p class="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
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
            {/each}
          </div>
        {/if}
      </div>

      <Hr />

      <!-- Seção: Minhas Reivindicações -->
      <div>
        <div class="mb-3 flex items-center gap-2">
          <CheckCircle2 class="h-5 w-5 text-blue-500" />
          <Heading tag="h3" class="text-lg font-semibold text-gray-900 dark:text-white">
            Minhas Reivindicações ({my.total})
          </Heading>
        </div>

        {#if my.items.length === 0}
          <div class="rounded-lg border border-gray-200 bg-white py-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <p class="text-sm text-gray-600 dark:text-gray-400">Você ainda não fez nenhuma reivindicação</p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each my.items as claim (claim.id)}
              <Card
                class="cursor-pointer p-4 transition-shadow hover:shadow-md active:scale-[0.98]"
                role="button"
                tabindex={0}
                onclick={() => openModal(claim, false)}
                onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && openModal(claim, false)}
              >
                <div class="flex items-start gap-3">
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
                      <ImageLoader src={claim.objeto.url_imagem} alt={claim.objeto.nome} class="h-20 w-20 rounded-lg object-cover" />
                    </div>
                  {/if}
                  <div class="min-w-0 flex-1">
                    <div class="mb-2 flex items-start justify-between gap-2">
                      <div class="flex-1">
                        <h3 class="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                          {claim.objeto?.nome || `Objeto #${claim.objeto_id}`}
                        </h3>
                        <p class="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
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
            {/each}
          </div>
        {/if}
      </div>
    {:catch error}
      <Alert color="red" dismissable>Erro: {error.message}</Alert>
    {/await}
  </div>
</div>

<!-- Desktop Layout (hidden on mobile) -->
<div class="hidden lg:block">
  <div class="container mx-auto max-w-6xl px-4 py-6">
    <!-- Desktop Header -->
    <div class="mb-6">
      <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Reivindicações</h1>
      <p class="text-sm text-gray-600 dark:text-gray-400">Gerencie suas reivindicações e as reivindicações que você precisa aprovar</p>
    </div>

    {#await claimsData()}
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        {#each Array.from({ length: 4 }) as _}
          <Skeleton card={48} paragraphSize={2} />
        {/each}
      </div>
    {:then { my, toApprove }}
      <!-- Seção: Para Aprovar -->
      <div class="mb-8">
        <div class="mb-4 flex items-center gap-2">
          <AlertCircle class="h-6 w-6 text-orange-500" />
          <Heading tag="h2" class="text-xl font-semibold text-gray-900 dark:text-white">
            Para Aprovar ({toApprove.total})
          </Heading>
        </div>

        {#if toApprove.items.length === 0}
          <div class="rounded-lg border border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <AlertCircle class="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <p class="text-gray-600 dark:text-gray-400">Nenhuma reivindicação pendente para aprovação</p>
          </div>
        {:else}
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            {#each toApprove.items as claim (claim.id)}
              <Card
                class="cursor-pointer p-6 transition-shadow hover:shadow-lg active:scale-[0.98]"
                role="button"
                tabindex={0}
                onclick={() => openModal(claim, true)}
                onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && openModal(claim, true)}
              >
                <div class="mb-4 flex items-start gap-4">
                  {#if claim.objeto}
                    <div
                      class="flex-shrink-0 cursor-pointer"
                      role="button"
                      tabindex={0}
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
                      <ImageLoader src={claim.objeto.url_imagem} alt={claim.objeto.nome} class="h-32 w-32 rounded-lg object-cover" />
                    </div>
                  {/if}
                  <div class="min-w-0 flex-1">
                    <div class="mb-2 flex items-start justify-between gap-2">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        {claim.objeto?.nome || `Objeto #${claim.objeto_id}`}
                      </h3>
                      <Badge color={getStatusBadgeColor(claim.status)} size="small">
                        {getStatusText(claim.status)}
                      </Badge>
                    </div>
                    <p class="mb-3 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                      {claim.descricao}
                    </p>
                    <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                      <Clock class="h-3 w-3" />
                      {formatDate(claim.data_registro)}
                    </div>
                  </div>
                </div>
              </Card>
            {/each}
          </div>
        {/if}
      </div>

      <Hr />

      <!-- Seção: Minhas Reivindicações -->
      <div>
        <div class="mb-4 flex items-center gap-2">
          <CheckCircle2 class="h-6 w-6 text-blue-500" />
          <Heading tag="h2" class="text-xl font-semibold text-gray-900 dark:text-white">
            Minhas Reivindicações ({my.total})
          </Heading>
        </div>

        {#if my.items.length === 0}
          <div class="rounded-lg border border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <FileImage class="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <p class="text-gray-600 dark:text-gray-400">Você ainda não fez nenhuma reivindicação</p>
          </div>
        {:else}
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            {#each my.items as claim (claim.id)}
              <Card
                class="cursor-pointer p-6 transition-shadow hover:shadow-lg active:scale-[0.98]"
                role="button"
                tabindex={0}
                onclick={() => openModal(claim, false)}
                onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && openModal(claim, false)}
              >
                <div class="mb-4 flex items-start gap-4">
                  {#if claim.objeto}
                    <div
                      class="flex-shrink-0 cursor-pointer"
                      role="button"
                      tabindex={0}
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
                      <ImageLoader src={claim.objeto.url_imagem} alt={claim.objeto.nome} class="h-32 w-32 rounded-lg object-cover" />
                    </div>
                  {/if}
                  <div class="min-w-0 flex-1">
                    <div class="mb-2 flex items-start justify-between gap-2">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        {claim.objeto?.nome || `Objeto #${claim.objeto_id}`}
                      </h3>
                      <Badge color={getStatusBadgeColor(claim.status)} size="small">
                        {getStatusText(claim.status)}
                      </Badge>
                    </div>
                    <p class="mb-3 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                      {claim.descricao}
                    </p>
                    <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                      <Clock class="h-3 w-3" />
                      {formatDate(claim.data_registro)}
                    </div>
                  </div>
                </div>
              </Card>
            {/each}
          </div>
        {/if}
      </div>
    {:catch error}
      <Alert color="red" dismissable>Erro: {error.message}</Alert>
    {/await}
  </div>
</div>

<!-- Modal de detalhes -->
{#if selectedClaim && showModal}
  <Modal bind:open={showModal}>
    {#snippet header()}
      <Heading tag="h5" class="text-center">Detalhes da Reivindicação</Heading>
    {/snippet}

    <div class="space-y-4">
      <!-- Objeto -->
      {#if selectedClaim.objeto}
        <div>
          <h3 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Objeto Reivindicado</h3>
          <div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <ImageLoader src={selectedClaim.objeto.url_imagem} alt={selectedClaim.objeto.nome} class="h-16 w-16 rounded-lg object-cover" />
            <div class="flex-1">
              <p class="font-medium text-gray-900 dark:text-white">{selectedClaim.objeto.nome}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">{selectedClaim.objeto.descricao}</p>
            </div>
            <Button
              size="xs"
              color="primary"
              onclick={() => {
                const claim = selectedClaim;
                const objeto = claim?.objeto;
                if (objeto) {
                  const objetoId = objeto.id;
                  closeModal();
                  goto(`/objetos/${objetoId}`);
                }
              }}
            >
              Ver objeto
            </Button>
          </div>
        </div>
      {/if}

      <!-- Descrição -->
      <div>
        <h3 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Descrição</h3>
        <p class="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">{selectedClaim.descricao}</p>
      </div>

      <!-- Evidências -->
      {#if selectedClaim.evidencias && selectedClaim.evidencias.length > 0}
        <div>
          <h3 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Evidências</h3>
          <div class="grid grid-cols-2 gap-2">
            {#each selectedClaim.evidencias as evidencia}
              <ImageLoader src={evidencia} alt="Evidência" class="h-32 w-full rounded-lg object-cover" />
            {/each}
          </div>
        </div>
      {/if}

      <!-- Data -->
      <div>
        <h3 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Data da Ocorrência</h3>
        <p class="text-sm text-gray-700 dark:text-gray-300">{formatDate(selectedClaim.data_registro)}</p>
      </div>

      <!-- Status -->
      <div>
        <h3 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Status</h3>
        <Badge color={getStatusBadgeColor(selectedClaim.status)}>
          {getStatusText(selectedClaim.status)}
        </Badge>
      </div>
    </div>

    {#if isClaimForApproval && (selectedClaim.status === 'pendente' || selectedClaim.status === 'PENDENTE')}
      <div class="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
        <form
          method="POST"
          action="?/rejectClaim"
          use:enhance={() => {
            closeModal();
          }}
        >
          <input type="hidden" name="claimId" value={selectedClaim.id} />
          <Button type="submit" color="light" class="border border-gray-300 dark:border-gray-600">
            <X class="mr-2 h-4 w-4" />
            Rejeitar
          </Button>
        </form>
        <form
          method="POST"
          action="?/approveClaim"
          use:enhance={() => {
            closeModal();
          }}
        >
          <input type="hidden" name="claimId" value={selectedClaim.id} />
          <Button type="submit" color="primary" class="font-semibold shadow-sm">
            <Check class="mr-2 h-4 w-4" />
            Aprovar
          </Button>
        </form>
      </div>
    {/if}
  </Modal>
{/if}

{#if form?.error}
  <Alert color="red" dismissable class="fixed top-20 right-4 z-50">
    {form.error}
  </Alert>
{/if}

{#if form?.success}
  <Alert color="green" dismissable class="fixed top-20 right-4 z-50">Reivindicação processada com sucesso!</Alert>
{/if}
