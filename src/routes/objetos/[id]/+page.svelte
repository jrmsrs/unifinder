<script lang="ts">
  import FilteredSearch from '$lib/components/FilteredSearch.svelte';
  import ImageLoader from '$lib/components/ImageLoader.svelte';
  import ObjectsCarousel from '$lib/components/ObjectsCarousel.svelte';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import DevInfo from '$lib/components/dev/DevInfo.svelte';
  import ModalContainer from '$lib/components/routes/ObjetoModalContainer.svelte';
  import ObjetoTable from '$lib/components/routes/ObjetoTable.svelte';
  import Row from '$lib/components/routes/ObjetoTableRow.svelte';
  import { dictLocalidades } from '$lib/utils/dicionaries.js';
  import { Badge, Button, Heading, Hr, Modal, P } from 'flowbite-svelte';
  import { ArrowLeft, AtSign, Calendar, CheckCircle, MapPin, Play } from 'lucide-svelte';
  // get page searchParams "ref"
  import { page } from '$app/state';
  let ref = page.url.searchParams.get('ref') || '/objetos';
  let { data } = $props();
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

<div class="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm"></div>

<ModalContainer>
  <Modal
    modal={false}
    class="
      relative! top-auto left-auto max-h-full w-11/12
      max-w-sm -translate-x-0 -translate-y-0 text-gray-900 shadow-2xl shadow-black backdrop:bg-none sm:max-w-md
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
        onclick={() => history.back()}
      >
        <ArrowLeft class="drop-shadow-xs drop-shadow-gray-900" />
      </button>
      {#await data.streamed.objeto}
        <Skeleton card={64} paragraphSize={2} />
      {:then { objeto }}
        <div class="flex flex-col">
          <ImageLoader src={objeto.imagem} alt={objeto.titulo} class="h-72 rounded-t-lg sm:h-96 lg:h-[32rem]" />
          <div class="grid grid-cols-2 overflow-hidden rounded-b-lg [&>*]:mt-0 [&>*]:h-8 [&>*]:rounded-none">
            <Badge color={objeto.tipo === 'achado' ? 'green' : 'red'}>{objeto.tipo}</Badge>
            <Badge color="gray" class="mt-2">{objeto.categoria}</Badge>
          </div>
          <Heading tag="h2" class="mt-2 text-2xl font-bold">{objeto.titulo}</Heading>
          <P class="text-gray-700 dark:text-gray-400">{objeto.descricao}</P>
          <ObjetoTable>
            <Row key="Postado:" value={new Date(objeto.created_at).toLocaleDateString()} icon={Calendar} />
            <Row key="{objeto.tipo === 'achado' ? 'Coletado por:' : 'Dono'}:" value={objeto.usuario.username} icon={AtSign} />
            <Row key="{objeto.tipo === 'achado' ? 'Encontrado' : 'Perdido'} em:" value={dictLocalidades[objeto.local]} icon={MapPin} />
            {#if objeto.tipo === 'achado'}
              <Row key="Encaminhado:" value={objeto.encaminhado ?? 'Em mãos'} icon={MapPin} />
            {/if}
            <Row
              key="Status:"
              value={objeto.status === 'FINALIZADO' ? 'Finalizado' : 'Ativo'}
              icon={objeto.status === 'FINALIZADO' ? CheckCircle : Play}
            />
          </ObjetoTable>
        </div>
      {:catch error}
        <p class="text-red-500">Erro ao carregar o objeto: {error.message}</p>
      {/await}
    </div>
    <div
      class="g-f col-span-5 flex flex-col gap-4 md:col-span-2 [&>div]:rounded-lg [&>div]:bg-gray-100 [&>div]:p-4 [&>div]:dark:bg-gray-900"
    >
      <div id="acoes">
        <Heading tag="h3" class="text-xl font-bold">Ações</Heading>
        <pre>Botões pra:
  - Visitante: 
    - reivindicar;
  - Usuário: 
    - modificar;
    - finalizar;
    - excluir;</pre>
      </div>
      <div id="comentarios" class="h-full">
        <Heading tag="h3" class="text-xl font-bold">Comentários</Heading>
        <P class="text-gray-700 dark:text-gray-400">
          Esta seção está em desenvolvimento. Em breve você poderá comentar e interagir com outros usuários sobre este objeto.
        </P>
      </div>
    </div>
  </Modal>
</ModalContainer>

{#await data.streamed.objeto then { objeto }}
  <DevInfo
    content={`\
# debug
  - signed_up=${Boolean(data.user)}
  - objeto=${JSON.stringify(objeto, null, 2)}
# todo (tela objeto)
  - ( ) layout objeto`}
  />
{/await}
