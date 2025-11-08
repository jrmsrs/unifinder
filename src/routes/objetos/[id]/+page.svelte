<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import Profile from '$lib/components/Profile.svelte';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import DevInfo from '$lib/components/dev/DevInfo.svelte';
  import CosmeticObjetosBg from '$lib/components/routes/ObjetoCosmeticBg.svelte';
  import ModalContainer from '$lib/components/routes/ObjetoModalContainer.svelte';
  import { Button, Heading } from 'flowbite-svelte';
  import { CheckOutline, EditSolid, FilePenSolid } from 'flowbite-svelte-icons';
  import { ArrowLeft } from 'lucide-svelte';
  import ObjetoClaimNew from '../ObjetoModalClaim.svelte';
  import ObjetoModalFinish from '../ObjetoModalFinish.svelte';
  import Objeto from './Objeto.svelte';
  import ObjetoComentarios from './ObjetoComentarios.svelte';

  let ref = page.url.searchParams.get('ref') || '/objetos';
  let { data } = $props();
  let objetoClaim = $state(false);
  let objetoFinish = $state(false);
  let finishError = $state('');

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
    <div id="acoes">
      <Heading tag="h3" class="text-xl font-bold">Ações</Heading>
      <div class="my-1 grid grid-cols-5 gap-1 [&>form>button]:w-full!">
        {#await data.streamed.objeto}
          <div class="col-span-3 h-9 animate-pulse rounded-sm bg-gray-300"></div>
          <div class="col-span-2 h-9 animate-pulse rounded-sm bg-gray-300"></div>
        {:then objeto}
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

            <!-- Ações para outros usuários -->
          {:else if objeto?.status.toLowerCase() === 'aberto'}
            <Button color="primary" class="col-span-5 flex justify-between" onclick={() => (objetoClaim = true)}>
              <FilePenSolid class="h-5 w-5 shrink-0" />
              Reivindicar
              <div class="h-5 w-5"></div>
            </Button>
          {:else}
            <Button color="gray" class="col-span-5 flex justify-between" disabled>
              <FilePenSolid class="h-5 w-5 shrink-0" />
              Reivindicado
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

{#await data.streamed.objeto then objeto}
  <DevInfo
    content={`\
# debug
  - signed_up=${Boolean(data.user)}
  - objeto=${JSON.stringify(objeto, null, 2)}
# todo (tela objeto)
  - (-) layout objeto
    - (x) exibir informações do objeto
      - (x) mock objeto
    - (x) exibir ações
      - (x) botões de ações do responsável
      - (x) botões de ações do usuário
      - (x) modal finalizar
      - (x) modal editar
    - (x) exibir comentários
      - (x) ações do dono
      - (x) mock comentários
  - (-) integração
    - (x) get objeto
    - (x) get comentarios
    - (x) autorização nivel dono do objeto
    - (x) autorização nivel dono do comentário
    - ( ) put de objeto
    - (x) delete de comentário`}
  />
{/await}
