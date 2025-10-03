<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import FilteredSearch from '$lib/components/FilteredSearch.svelte';
  import ImageLoader from '$lib/components/ImageLoader.svelte';
  import ObjectsCarousel from '$lib/components/ObjectsCarousel.svelte';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import DevInfo from '$lib/components/dev/DevInfo.svelte';
  import ModalContainer from '$lib/components/routes/ObjetoModalContainer.svelte';
  import ObjetoTable from '$lib/components/routes/ObjetoTable.svelte';
  import Row from '$lib/components/routes/ObjetoTableRow.svelte';
  import { dictLocalidades } from '$lib/utils/dicionaries.js';
  import { faker as fk } from '@faker-js/faker';
  import { A, Alert, Badge, Button, Heading, Hr, Modal, P } from 'flowbite-svelte';
  import { CheckOutline, EditSolid, FilePenSolid, TrashBinSolid } from 'flowbite-svelte-icons';
  import { ArrowLeft, AtSign, Calendar, CheckCircle, MapPin, Play } from 'lucide-svelte';
  let ref = page.url.searchParams.get('ref') || '/objetos';
  let { data } = $props();
  let comentario = $state(data.form ?? '');
  let comentarioSubmiting = $state(false);
  let comentarioRemoving = $state(false);
</script>

{#if ref === '/objetos'}
  <div class="m-auto flex flex-col items-center p-4 [&>*]:my-4 [&>*>hr]:max-w-64 [&>hr]:w-full [&>hr]:max-w-64">
    <div class="mb-4 grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div class="g col-span-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Heading class="col-span-1 lg:col-span-2 xl:col-span-3" tag="h4">Lista de Objetos</Heading>
        <FilteredSearch />
      </div>
      {#each Array.from({ length: 4 }) as _, i}
        <Skeleton card={64} paragraphSize={2} class={i === 2 ? 'hidden lg:flex' : i === 3 ? 'hidden xl:flex' : ''} />
      {/each}
    </div>
  </div>
{:else if ref === '/'}
  <div class="m-auto flex flex-col items-center justify-center p-4 [&>*]:my-4 [&>*>hr]:max-w-64 [&>hr]:w-full [&>hr]:max-w-64">
    <P>Perdeu algum pertence na UNIRIO? Procure aqui</P>
    <FilteredSearch></FilteredSearch>
    <Hr class="my-0!">ou</Hr>
    <Button color="primary" class="dark:bg-primary-700 dark:hover:bg-primary-800">Cadastrar objeto perdido</Button>
    <Hr />
    <P>Encontrou algum objeto na UNIRIO?</P>
    <Button color="primary" class="dark:bg-primary-700 dark:hover:bg-primary-800">Cadastrar objeto achado</Button>
    <Hr />
    <Heading tag="h4">Objetos em acompanhamento</Heading>
    <ObjectsCarousel id="found-objects-carousel" objects={null} />
  </div>
{/if}

<ModalContainer>
  <Modal
    modal={false}
    class="
      relative! top-auto left-auto max-h-full w-11/12
      max-w-sm -translate-x-0 -translate-y-0 text-gray-900 shadow-2xl shadow-black sm:max-w-md
      md:max-w-3xl xl:max-w-4xl dark:text-white [&>*]:grid [&>*]:grid-cols-5 [&>*]:gap-4 [&>*]:p-4
    "
    size="lg"
    permanent={true}
    dismissable={false}
    open={true}
  >
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
          <div class="flex flex-col">
            <ImageLoader src={objeto.url_imagem} alt={objeto.nome} class="h-72 rounded-t-lg sm:h-96 lg:h-[32rem]" />
            <div class="grid grid-cols-2 overflow-hidden rounded-b-lg [&>*]:mt-0 [&>*]:h-8 [&>*]:rounded-none">
              <Badge color={objeto.tipo === 'achado' ? 'green' : 'red'}>{objeto.tipo}</Badge>
              <Badge color="gray" class="mt-2">objeto.categoria</Badge>
            </div>
            <Heading tag="h2" class="mt-2 text-2xl font-bold">{objeto.nome}</Heading>
            <P class="text-gray-700 dark:text-gray-400">{objeto.descricao}</P>
            <ObjetoTable>
              <Row key="Postado:" value={new Date(objeto.data_registro).toLocaleDateString()} icon={Calendar} />
              <Row key="{objeto.tipo === 'achado' ? 'Coletado por' : 'Dono'}:" value="objeto.usuario.username" icon={AtSign} />
              <Row
                key="{objeto.tipo === 'achado' ? 'Encontrado' : 'Perdido'} em:"
                value={dictLocalidades[objeto.local_ocorrencia]}
                icon={MapPin}
              />
              {#if objeto.tipo === 'achado'}
                <Row key="Encaminhado:" value={objeto.local_armazenamento ?? 'Em mãos'} icon={MapPin} />
              {/if}
              <Row
                key="Status:"
                value={objeto.status.toLowerCase() === 'finalizado' ? 'Finalizado' : 'Ativo'}
                icon={objeto.status.toLowerCase() === 'finalizado' ? CheckCircle : Play}
              />
            </ObjetoTable>
          </div>
        {/if}
      {:catch error}
        <p class="text-red-500">Erro ao carregar o objeto: {error.message}</p>
      {/await}
    </div>
    <div
      class="g-f col-span-5 flex flex-col gap-4 md:col-span-2 [&>div]:rounded-lg [&>div]:bg-gray-50 [&>div]:p-4 [&>div]:dark:bg-gray-900"
    >
      <div id="acoes">
        <Heading tag="h3" class="text-xl font-bold">Ações (WIP)</Heading>
        <div class="my-1 grid grid-cols-5 gap-1">
          {#await data.streamed.objeto}
            <div class="col-span-3 h-9 animate-pulse rounded-sm bg-gray-300"></div>
            <div class="col-span-2 h-9 animate-pulse rounded-sm bg-gray-300"></div>
          {:then objeto}
            {#if objeto?.user_id === data.user?.id}
              <Button color="green" class="col-span-3 flex justify-between">
                <CheckOutline />
                Finalizar
                <div class="h-5 w-5"></div>
              </Button>
              <Button color="yellow"><EditSolid /></Button>
              <Button color="red"><TrashBinSolid /></Button>
            {:else}
              <Button color="primary" class="col-span-5 flex justify-between">
                <FilePenSolid class="h-5 w-5 shrink-0" />
                Reivindicar
                <div class="h-5 w-5"></div>
              </Button>
            {/if}
          {/await}
        </div>
      </div>
      <div id="comentarios" class="h-full">
        <Heading tag="h3" class="text-xl font-bold">
          Comentários
          {#await data.streamed.comentarios then { comentarios: c }}({c.length}){/await}
        </Heading>
        <div id="novo-comentario" class="mb-2 flex flex-col">
          {#await data.streamed.comentarios then}
            {#if data.user}
              <form
                method="post"
                action="?/createComentario"
                use:enhance={() => {
                  comentarioSubmiting = true;
                  return async ({ update }) => {
                    await update();
                    comentarioSubmiting = false;
                  };
                }}
              >
                <textarea
                  name="conteudo"
                  class="mt-1 h-24 w-full resize-none rounded-lg border border-gray-300 bg-white p-2 text-sm shadow-sm outline-none placeholder:text-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                  placeholder="Escreva seu comentário..."
                  bind:value={comentario}
                  required
                ></textarea>
                <Button type="submit" outline color="primary" class="mt-2" disabled={comentarioSubmiting}>Comentar</Button>
              </form>
            {:else}
              <P class="text-gray-700 dark:text-gray-400">
                Faça <A href="/auth">login</A> para comentar.
              </P>
            {/if}
          {/await}
        </div>
        {#if data.commentError}
          <Alert color="red" class="mb-2" dismissable>{data.commentError}</Alert>
        {/if}
        <div id="lista-comentarios" class="mt-6">
          {#await data.streamed.comentarios}
            {#each { length: 4 }}
              <Skeleton />
            {/each}
          {:then { comentarios }}
            {#if comentarios.length > 0}
              {#each comentarios as comentario}
                <div class="mb-4 text-sm">
                  <div class="mb-1 flex items-center gap-2">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full" style="background-color: {fk.color.human()}">
                      {'ucomentario.usuario.username'.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span class="font-semibold">{comentario.username}</span>
                      <span class="text-xs font-normal">•</span>
                      <span class="text-xs font-normal">{new Date(comentario.publicado_em).toLocaleDateString()}</span>
                    </div>
                    {#await data.streamed.objeto then objeto}
                      {#if data.user?.id === comentario.user_id || data.user?.id === objeto?.user_id}
                        <form
                          class="ml-auto"
                          method="post"
                          action="?/deleteComentario"
                          use:enhance={() => {
                            comentarioRemoving = true;
                            return async ({ update }) => {
                              await update();
                              comentarioRemoving = false;
                            };
                          }}
                        >
                          <input type="hidden" name="id" value={comentario.id} />
                          <Button type="submit" outline color="red" size="xs" disabled={comentarioRemoving}>
                            <TrashBinSolid class="h-4 w-4" />
                          </Button>
                        </form>
                      {/if}
                    {/await}
                  </div>
                  <div class="flex gap-2">
                    <p>{comentario.conteudo}</p>
                  </div>
                </div>
              {/each}
            {:else}
              <P class="text-gray-700 dark:text-gray-400">Nenhum comentário ainda.</P>
            {/if}
          {:catch error}
            <p class="text-red-500">Erro ao carregar os comentários: {error.message}</p>
          {/await}
        </div>
      </div>
    </div>
  </Modal>
</ModalContainer>

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
      - ( ) modal finalizar
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
    - ( ) autorização nivel dono do comentario
    - ( ) ações (put/delete) de objeto
    - ( ) ações (delete) de comentário`}
  />
{/await}
