<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { Button, Card, Badge, Alert, Heading, P, Modal, Hr } from 'flowbite-svelte';
  import { 
    Check, 
    X,
    FileImage,
    Clock,
    Eye,
    CheckCircle2,
    AlertCircle
  } from 'lucide-svelte';
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
    const [claimsForApproval, myClaims] = await Promise.all([
      data.streamed.claimsForApproval,
      data.streamed.myClaims
    ]);
    
    return {
      my: myClaims,
      toApprove: claimsForApproval
    };
  });

  function openModal(claim: Claim, forApproval: boolean = false) {
    console.log('🚀 openModal called BEFORE', { 
      forApproval, 
      status: claim.status
    });
    selectedClaim = claim;
    isClaimForApproval = forApproval;
    showModal = true;
    console.log('🚀 openModal called AFTER', { 
      isClaimForApproval,
      status: selectedClaim?.status
    });
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

  function getStatusBadgeColor(status: ClaimStatus): "green" | "red" | "yellow" | "gray" {
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
<div class="min-h-screen bg-gray-50 dark:bg-gray-900 lg:hidden">
  <!-- Header Mobile -->
  <div class="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          Reivindicações
        </h1>
      </div>
    </div>
  </div>

  <!-- Conteúdo -->
  <div class="px-4 py-4 space-y-6">
    {#await claimsData()}
      <div class="space-y-3">
        {#each Array.from({ length: 6 }) as _}
          <Skeleton card={48} paragraphSize={2} />
        {/each}
      </div>
    {:then { my, toApprove }}
      <!-- Seção: Para Aprovar -->
      <div>
        <div class="flex items-center gap-2 mb-3">
          <AlertCircle class="h-5 w-5 text-orange-500" />
          <Heading tag="h3" class="text-lg font-semibold text-gray-900 dark:text-white">
            Para Aprovar ({toApprove.total})
          </Heading>
        </div>
        
        {#if toApprove.items.length === 0}
          <div class="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Nenhuma reivindicação pendente para aprovação
            </p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each toApprove.items as claim (claim.id)}
              <Card class="p-4">
                <div class="flex items-start gap-3">
                  {#if claim.objeto}
                    <a href={`/objetos/${claim.objeto.id}`} class="flex-shrink-0">
                      <ImageLoader src={claim.objeto.url_imagem} alt={claim.objeto.nome} class="h-20 w-20 rounded-lg object-cover" />
                    </a>
                  {/if}
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <div class="flex-1">
                        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          {claim.objeto?.nome || `Objeto #${claim.objeto_id}`}
                        </h3>
                        <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {claim.descricao}
                        </p>
                      </div>
                      <Badge color={getStatusBadgeColor(claim.status)} size="small">
                        {getStatusText(claim.status)}
                      </Badge>
                    </div>
                    
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                        <Clock class="h-3 w-3" />
                        {formatDate(claim.data_registro)}
                      </div>
                      <Button
                        size="xs"
                        color="blue"
                        onclick={() => openModal(claim, true)}
                      >
                        <Eye class="h-3 w-3" />
                        Ver
                      </Button>
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
        <div class="flex items-center gap-2 mb-3">
          <CheckCircle2 class="h-5 w-5 text-blue-500" />
          <Heading tag="h3" class="text-lg font-semibold text-gray-900 dark:text-white">
            Minhas Reivindicações ({my.total})
          </Heading>
        </div>
        
        {#if my.items.length === 0}
          <div class="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Você ainda não fez nenhuma reivindicação
            </p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each my.items as claim (claim.id)}
              <Card class="p-4">
                <div class="flex items-start gap-3">
                  {#if claim.objeto}
                    <a href={`/objetos/${claim.objeto.id}`} class="flex-shrink-0">
                      <ImageLoader src={claim.objeto.url_imagem} alt={claim.objeto.nome} class="h-20 w-20 rounded-lg object-cover" />
                    </a>
                  {/if}
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <div class="flex-1">
                        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          {claim.objeto?.nome || `Objeto #${claim.objeto_id}`}
                        </h3>
                        <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {claim.descricao}
                        </p>
                      </div>
                      <Badge color={getStatusBadgeColor(claim.status)} size="small">
                        {getStatusText(claim.status)}
                      </Badge>
                    </div>
                    
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                        <Clock class="h-3 w-3" />
                        {formatDate(claim.data_registro)}
                      </div>
                      <Button
                        size="xs"
                        color="blue"
                        onclick={() => openModal(claim)}
                      >
                        <Eye class="h-3 w-3" />
                        Ver
                      </Button>
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
  <div class="container mx-auto px-4 py-6 max-w-6xl">
    <!-- Desktop Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Reivindicações
      </h1>
      <p class="text-gray-600 dark:text-gray-400 text-sm">
        Gerencie suas reivindicações e as reivindicações que você precisa aprovar
      </p>
    </div>

    {#await claimsData()}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each Array.from({ length: 4 }) as _}
          <Skeleton card={48} paragraphSize={2} />
        {/each}
      </div>
    {:then { my, toApprove }}
      <!-- Seção: Para Aprovar -->
      <div class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <AlertCircle class="h-6 w-6 text-orange-500" />
          <Heading tag="h2" class="text-xl font-semibold text-gray-900 dark:text-white">
            Para Aprovar ({toApprove.total})
          </Heading>
        </div>
        
        {#if toApprove.items.length === 0}
          <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <AlertCircle class="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600 dark:text-gray-400">
              Nenhuma reivindicação pendente para aprovação
            </p>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each toApprove.items as claim (claim.id)}
              <Card class="p-6 hover:shadow-lg transition-shadow">
                <div class="flex items-start gap-4 mb-4">
                  {#if claim.objeto}
                    <a href={`/objetos/${claim.objeto.id}`} class="flex-shrink-0">
                      <ImageLoader src={claim.objeto.url_imagem} alt={claim.objeto.nome} class="h-32 w-32 rounded-lg object-cover" />
                    </a>
                  {/if}
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        {claim.objeto?.nome || `Objeto #${claim.objeto_id}`}
                      </h3>
                      <Badge color={getStatusBadgeColor(claim.status)} size="small">
                        {getStatusText(claim.status)}
                      </Badge>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                      {claim.descricao}
                    </p>
                    <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 mb-3">
                      <Clock class="h-3 w-3" />
                      {formatDate(claim.data_registro)}
                    </div>
                    <Button
                      size="sm"
                      color="blue"
                      onclick={() => openModal(claim, true)}
                      class="w-full"
                    >
                      <Eye class="h-4 w-4 mr-1" />
                      Ver detalhes
                    </Button>
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
        <div class="flex items-center gap-2 mb-4">
          <CheckCircle2 class="h-6 w-6 text-blue-500" />
          <Heading tag="h2" class="text-xl font-semibold text-gray-900 dark:text-white">
            Minhas Reivindicações ({my.total})
          </Heading>
        </div>
        
        {#if my.items.length === 0}
          <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FileImage class="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600 dark:text-gray-400">
              Você ainda não fez nenhuma reivindicação
            </p>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each my.items as claim (claim.id)}
              <Card class="p-6 hover:shadow-lg transition-shadow">
                <div class="flex items-start gap-4 mb-4">
                  {#if claim.objeto}
                    <a href={`/objetos/${claim.objeto.id}`} class="flex-shrink-0">
                      <ImageLoader src={claim.objeto.url_imagem} alt={claim.objeto.nome} class="h-32 w-32 rounded-lg object-cover" />
                    </a>
                  {/if}
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        {claim.objeto?.nome || `Objeto #${claim.objeto_id}`}
                      </h3>
                      <Badge color={getStatusBadgeColor(claim.status)} size="small">
                        {getStatusText(claim.status)}
                      </Badge>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                      {claim.descricao}
                    </p>
                    <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 mb-3">
                      <Clock class="h-3 w-3" />
                      {formatDate(claim.data_registro)}
                    </div>
                    <Button
                      size="sm"
                      color="blue"
                      onclick={() => openModal(claim)}
                      class="w-full"
                    >
                      <Eye class="h-4 w-4 mr-1" />
                      Ver detalhes
                    </Button>
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
      <Heading tag="h5" class="text-center">
        Detalhes da Reivindicação
      </Heading>
    {/snippet}

    <div class="space-y-4">
      <!-- Objeto -->
      {#if selectedClaim.objeto}
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Objeto Reivindicado</h3>
            <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <ImageLoader src={selectedClaim.objeto.url_imagem} alt={selectedClaim.objeto.nome} class="h-16 w-16 rounded-lg object-cover" />
              <div class="flex-1">
                <p class="font-medium text-gray-900 dark:text-white">{selectedClaim.objeto.nome}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{selectedClaim.objeto.descricao}</p>
              </div>
              <Button
                size="xs"
                color="blue"
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
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Descrição da Reivindicação</h3>
          <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedClaim.descricao}</p>
        </div>

        <!-- Evidências -->
        {#if selectedClaim.evidencias && selectedClaim.evidencias.length > 0}
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Evidências</h3>
            <div class="grid grid-cols-2 gap-2">
              {#each selectedClaim.evidencias as evidencia}
                <ImageLoader src={evidencia} alt="Evidência" class="w-full h-32 object-cover rounded-lg" />
              {/each}
            </div>
          </div>
        {/if}

        <!-- Data -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Data da Ocorrência</h3>
          <p class="text-sm text-gray-700 dark:text-gray-300">{formatDate(selectedClaim.data_registro)}</p>
        </div>

        <!-- Status -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Status</h3>
          <Badge color={getStatusBadgeColor(selectedClaim.status)}>
            {getStatusText(selectedClaim.status)}
          </Badge>
        </div>
      </div>

      <div class="flex justify-between gap-2 mt-4">
        <!-- Debug: isClaimForApproval={isClaimForApproval}, status={selectedClaim?.status} -->
        {#if isClaimForApproval && (selectedClaim.status === 'pendente' || selectedClaim.status === 'PENDENTE')}
          <form method="POST" action="?/rejectClaim" use:enhance={() => {
            closeModal();
            return () => {};
          }}>
            <input type="hidden" name="claimId" value={selectedClaim.id} />
            <Button type="submit" color="red">
              <X class="h-4 w-4 mr-2" />
              Rejeitar
            </Button>
          </form>
          <form method="POST" action="?/approveClaim" use:enhance={() => {
            closeModal();
            return () => {};
          }}>
            <input type="hidden" name="claimId" value={selectedClaim.id} />
            <Button type="submit" color="green">
              <Check class="h-4 w-4 mr-2" />
              Aprovar
            </Button>
          </form>
        {:else}
          <Button onclick={closeModal} color="gray">
            Fechar
          </Button>
        {/if}
      </div>
  </Modal>
{/if}

{#if form?.error}
  <Alert color="red" dismissable class="fixed top-20 right-4 z-50">
    {form.error}
  </Alert>
{/if}

{#if form?.success}
  <Alert color="green" dismissable class="fixed top-20 right-4 z-50">
    Reivindicação processada com sucesso!
  </Alert>
{/if}
