<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import DevInfo from '$lib/components/dev/DevInfo.svelte';
  import CosmeticObjetosBg from '$lib/components/routes/ObjetoCosmeticBg.svelte';
  import ModalContainer from '$lib/components/routes/ObjetoModalContainer.svelte';
  import { Button, Heading } from 'flowbite-svelte';
  import { CheckOutline, EditSolid, FilePenSolid, TrashBinSolid } from 'flowbite-svelte-icons';
  import { ArrowLeft } from 'lucide-svelte';
  import ObjetoClaimNew from '../ObjetoModalClaim.svelte';
  import ObjetoModalFinish from '../ObjetoModalFinish.svelte';
  import Objeto from './Objeto.svelte';
  import ObjetoComentarios from './ObjetoComentarios.svelte';

  let ref = page.url.searchParams.get('ref') || '/objetos';
  let { data } = $props();
  let objetoClaim = $state(false);
  let objetoRemoving = $state(false);
  let objetoFinish = $state(false);
  let finishError = $state('');

  $effect(() => {
    if (page.url.searchParams.get('finish_error')) {
      finishError = page.url.searchParams.get('finish_error') || '';
      objetoFinish = true;
    }
  });
</script>

<CosmeticObjetosBg />

<ModalContainer>
  <div id="objeto" class="col-span-5 md:col-span-3">
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
        <Objeto {objeto} />
      {/if}
    {:catch error}
      <p class="text-red-500">Erro ao carregar o objeto: {error.message}</p>
    {/await}
  </div>
  <div class="g-f col-span-5 flex flex-col gap-4 md:col-span-2 [&>div]:rounded-lg [&>div]:bg-gray-50 [&>div]:p-4 [&>div]:dark:bg-gray-900">
    <div id="acoes">
      <Heading tag="h3" class="text-xl font-bold">Ações</Heading>
      <div class="my-1 grid grid-cols-5 gap-1 [&>form>button]:w-full!">
        {#await data.streamed.objeto}
          <div class="col-span-3 h-9 animate-pulse rounded-sm bg-gray-300"></div>
          <div class="col-span-2 h-9 animate-pulse rounded-sm bg-gray-300"></div>
        {:then objeto}
          {#if objeto?.user_id === data.user?.id}
            <Button
              color="green"
              class="col-span-3 flex justify-between"
              onclick={() => (objetoFinish = true)}
              disabled={objeto?.status.toLowerCase() === 'finalizado'}
            >
              <CheckOutline />
              {objeto?.status.toLowerCase() === 'finalizado' ? 'Finalizado' : 'Finalizar'}
              <div class="h-5 w-5"></div>
            </Button>

            <form action="?/editObjeto">
              <Button type="submit" color="yellow"><EditSolid /></Button>
            </form>
            <form
              method="post"
              action="?/deleteObjeto"
              use:enhance={() => {
                objetoRemoving = true;
                return async ({ update }) => {
                  await update();
                  objetoRemoving = false;
                };
              }}
            >
              <Button color="red" type="submit" disabled={objetoRemoving}>
                {#if objetoRemoving}
                  <div class="h-5 w-5 animate-spin rounded-full border-2 border-t-2 border-gray-200"></div>
                {:else}
                  <TrashBinSolid />
                {/if}
              </Button>
            </form>
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
    <ObjetoComentarios {data} />
  </div>
</ModalContainer>

<ObjetoClaimNew bind:objetoClaim error={null} />
<ObjetoModalFinish bind:objetoFinish error={finishError} />

{#await data.streamed.objeto then objeto}
  <DevInfo
    content={`\
# debug
  - signed_up=${Boolean(data.user)}
  - objeto=${JSON.stringify(objeto, null, 2)}
# todo (tela objeto)
  - (-) layout objeto
    - (-) exibir informações do objeto
      - (x) mock objeto
    - (-) exibir ações
      - (x) botões de ações do responsável
      - (x) botões de ações do usuário
      - (x) modal finalizar  <!-- Atualizado -->
      - ( ) modal editar
      - ( ) modal excluir
    - (-) exibir comentários
      - (x) ações do dono
      - (x) mock comentários
      - ( ) modal excluir comentário
  - (-) integração
    - (x) get objeto
    - ( ) get comentarios
    - ( ) autorização nivel dono do objeto
    - ( ) autorização nivel dono do comentário
    - ( ) ações (put/delete) de objeto
    - ( ) ações (delete) de comentário`}
  />
{/await}
