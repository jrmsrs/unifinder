<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import Profile from '$lib/components/Profile.svelte';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import DevInfo from '$lib/components/dev/DevInfo.svelte';
  import CosmeticObjetosBg from '$lib/components/routes/ObjetoCosmeticBg.svelte';
  import ModalContainer from '$lib/components/routes/ObjetoModalContainer.svelte';
  import { Button, Heading } from 'flowbite-svelte';
  import { CheckOutline, EditSolid, FilePenSolid } from 'flowbite-svelte-icons';
  import { ArrowLeft, CheckCircle2 } from 'lucide-svelte';
  import ObjetoClaimNew from '../ObjetoModalClaim.svelte';
  import ObjetoModalFinish from '../ObjetoModalFinish.svelte';
  import Objeto from './Objeto.svelte';
  import ObjetoComentarios from './ObjetoComentarios.svelte';

  let ref = page.url.searchParams.get('ref') || '/objetos';
  let { data } = $props();
  let objetoClaim = $state(false);
  let objetoFinish = $state(false);
  let finishError = $state('');
  let claimFinishing = $state(false);

  // Estado do modal de perfil do usuário
  let showProfile = $state(false);
  let selectedUser: User | null = $state(null);

  /** Abre o modal de perfil do usuário */
  const onOpenProfile = (user: User) => {
    selectedUser = user;
    showProfile = true;
  };

  /** Fecha o modal de perfil do usuário */
  const closeProfile = () => {
    showProfile = false;
    selectedUser = null;
  };

  // Abre modal de finalização se houver erro na URL
  $effect(() => {
    if (page.url.searchParams.get('finish_error')) {
      finishError = page.url.searchParams.get('finish_error') || '';
      objetoFinish = true;
    }
  });
</script>

<CosmeticObjetosBg />

<ModalContainer>
  <!-- Coluna principal: detalhes do objeto -->
  <div id="objeto" class="col-span-5 md:col-span-3">
    <!-- Botão voltar -->
    <button
      class="
        absolute top-4 left-4 z-10 flex h-16 w-16 items-center justify-center rounded-full bg-transparent p-4
        text-sm font-semibold text-white transition hover:bg-gray-900/50
      "
      onclick={() => goto(decodeURIComponent(ref))}
    >
      <ArrowLeft class="drop-shadow-xs drop-shadow-gray-900" />
    </button>

    {#await data.streamed.objeto}
      <Skeleton card={64} paragraphSize={2} />
    {:then objeto}
      {#if objeto === null}
        <p class="text-red-500">Objeto não encontrado.</p>
      {:else}
        <Objeto {objeto} {onOpenProfile} />
      {/if}
    {:catch error}
      <p class="text-red-500">Erro ao carregar o objeto: {error.message}</p>
    {/await}
  </div>

  <!-- Coluna lateral: ações e comentários -->
  <div class="g-f col-span-5 flex flex-col gap-4 md:col-span-2 [&>div]:rounded-lg [&>div]:bg-gray-50 [&>div]:p-4 [&>div]:dark:bg-gray-900">
    <!-- Seção de ações -->
    <!-- Seção de ações -->
    <div id="acoes">
      <Heading tag="h3" class="text-xl font-bold">Ações</Heading>
      <div class="my-1 grid grid-cols-5 gap-1 [&>form>button]:w-full!">
        {#await Promise.all([data.streamed.objeto, data.streamed.myClaims])}
          <div class="col-span-3 h-9 animate-pulse rounded-sm bg-gray-300"></div>
          <div class="col-span-2 h-9 animate-pulse rounded-sm bg-gray-300"></div>
        {:then [objeto, myClaims]}
          {@const approvedClaim = myClaims?.items?.find(
            (claim: Claim) => claim.objeto_id === objeto?.id && (claim.status === 'aprovada' || claim.status === 'APROVADA')
          )}

          <!-- Ações para o tutor do objeto -->
          {#if objeto?.user_id === data.user?.id}
            <form action="?/editObjeto" class="col-span-2">
              <Button
                type="submit"
                color="yellow"
                class="flex w-full justify-between"
                disabled={objeto?.status?.toLowerCase() === 'finalizado'}
              >
                <EditSolid />
                Editar
                <div class="h-5 w-5"></div>
              </Button>
            </form>
            <Button
              color="green"
              class="col-span-3 flex justify-between"
              onclick={() => (objetoFinish = true)}
              disabled={objeto?.status?.toLowerCase() === 'finalizado'}
            >
              <CheckOutline />
              {objeto?.status?.toLowerCase() === 'finalizado' ? 'Finalizado' : 'Finalizar'}
              <div class="h-5 w-5"></div>
            </Button>

            <!-- Ações para usuário com reivindicação aprovada -->
          {:else if approvedClaim}
            <form
              method="POST"
              action="?/finalizeClaimFromObject"
              class="col-span-5"
              use:enhance={() => {
                claimFinishing = true;
                return async ({ update }) => {
                  await update();
                  claimFinishing = false;
                };
              }}
            >
              <input type="hidden" name="claimId" value={approvedClaim.id} />
              <Button type="submit" color="green" class="flex w-full justify-between" disabled={claimFinishing}>
                <CheckCircle2 class="h-5 w-5 shrink-0" />
                Finalizar
                <div class="h-5 w-5"></div>
              </Button>
            </form>

            <!-- Ações para outros usuários -->
          {:else if objeto?.status.toLowerCase() === 'aberto'}
            <Button color="primary" class="col-span-5 flex justify-between" onclick={() => (objetoClaim = true)}>
              <FilePenSolid class="h-5 w-5 shrink-0" />
              Reivindicar
              <div class="h-5 w-5"></div>
            </Button>
          {:else if objeto?.status.toLowerCase() === 'em_reivindicacao' || objeto?.status.toLowerCase() === 'aguardando_retirada'}
            <Button color="gray" class="col-span-5 flex justify-between" disabled>
              <FilePenSolid class="h-5 w-5 shrink-0" />
              Reivindicado
              <div class="h-5 w-5"></div>
            </Button>
          {:else if objeto?.status.toLowerCase() === 'finalizado'}
            <Button color="green" class="col-span-5 flex justify-between" disabled>
              <CheckCircle2 class="h-5 w-5 shrink-0" />
              Finalizado
              <div class="h-5 w-5"></div>
            </Button>
          {/if}
        {/await}
      </div>
    </div>

    <!-- Seção de comentários -->
    <ObjetoComentarios {data} />
  </div>
</ModalContainer>

<!-- Modais -->
<ObjetoClaimNew bind:objetoClaim error={null} />
<ObjetoModalFinish bind:objetoFinish error={finishError} />

<!-- Modal de perfil do usuário -->
{#if selectedUser}
  <Profile user={selectedUser} bind:open={showProfile} onclose={closeProfile} />
{/if}
