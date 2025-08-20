<script lang="ts">
  import FilteredSearch from '$lib/components/FilteredSearch.svelte';
  import ImageLoader from '$lib/components/ImageLoader.svelte';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import DevInfo from '$lib/components/dev/DevInfo.svelte';
  import { dictCategorias, dictLocalidades } from '$lib/utils/dicionaries.js';
  import { Badge, Button, Heading, Hr, Modal, P } from 'flowbite-svelte';
  import { ArrowLeft, AtSign, MapPin } from 'lucide-svelte';
  // get page searchParams "ref"
  import { page } from '$app/state';
  import ObjectsCarousel from '$lib/components/ObjectsCarousel.svelte';
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

<Modal
  class="
    w-11/12 max-w-sm shadow-2xl shadow-black backdrop:bg-transparent backdrop:backdrop-blur-sm 
    sm:max-w-md md:max-w-3xl xl:max-w-4xl
    [&>*]:grid [&>*]:grid-cols-5 [&>*]:gap-4 [&>*]:p-4
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
        <ImageLoader src={objeto.imagem} alt={objeto.titulo} class="h-72 sm:h-96 lg:h-[32rem]" />
        <div class="grid grid-cols-2 [&>*]:mt-0 [&>*]:h-8">
          <Badge color={objeto.tipo === 'achado' ? 'green' : 'red'}>{objeto.tipo}</Badge>
          <Badge color="gray" class="mt-2">{objeto.categoria}</Badge>
        </div>
        <Heading tag="h2" class="text-2xl font-bold">{objeto.titulo}</Heading>
        <P class="text-gray-500 dark:text-gray-400">{objeto.descricao}</P>
        <table class="mt-4 w-full table-auto">
          <tbody>
            <tr>
              <td class="font-semibold">Cadastrado por:</td>
              <td class="flex items-center gap-2">
                <AtSign class="h-4 w-4" />
                <span>{objeto.usuario.username}</span>
              </td>
            </tr>
            <tr>
              <td class="font-semibold">Perdido em:</td>
              <td class="flex items-center gap-2">
                <MapPin class="h-4 w-4" />
                <span>{dictLocalidades[objeto.local]}</span>
              </td>
            </tr>
            <tr>
              <td class="font-semibold">etc etc</td>
              <td>etc etc</td>
            </tr>
          </tbody>
        </table>

        <!-- <div class="flex items-center">
          <span class="font-semibold">Cadastrado por:</span>
          <AtSign class="h-4 w-4" />
          <span>{objeto.usuario.username}</span>
          em
          <span>{new Date(objeto.created_at).toLocaleDateString()}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-semibold">Perdido em: </span>
          <MapPin class="h-4 w-4" />
          <span>{dictLocalidades[objeto.local]}</span>
        </div> -->
      </div>
    {:catch error}
      <p class="text-red-500">Erro ao carregar o objeto: {error.message}</p>
    {/await}
  </div>
  <div class="g-f col-span-5 flex flex-col gap-2 md:col-span-2 [&>*]:rounded-lg [&>*]:p-4 [&>*]:dark:bg-gray-900">
    <div id="acoes">
      <Heading tag="h3" class="text-xl font-bold">Ações</Heading>
      <pre>Botões pra:
  - Visitante: 
    - reivindicar;
  - Usuário: 
    - modificar;
    finalizar;
    excluir;</pre>
    </div>
    <div id="comentarios" class="h-full">
      <Heading tag="h3" class="text-xl font-bold">Comentários</Heading>
      <P class="text-gray-500 dark:text-gray-400">
        Esta seção está em desenvolvimento. Em breve você poderá comentar e interagir com outros usuários sobre este objeto.
      </P>
    </div>
  </div>
</Modal>

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

<!--

<script lang="ts">
  import DevInfo from '$lib/components/dev/DevInfo.svelte';
  import FilteredSearch from '$lib/components/FilteredSearch.svelte';
  import ImageLoader from '$lib/components/ImageLoader.svelte';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import { dictCategorias, dictLocalidades } from '$lib/utils/dicionaries.js';
  import { Alert, Badge, Card, Heading, P } from 'flowbite-svelte';
  import { AtSign, MapPin } from 'lucide-svelte';

  let { data } = $props();
</script>

<div class="m-auto flex flex-col items-center p-4 [&>*]:my-4 [&>*>hr]:max-w-64 [&>hr]:w-full [&>hr]:max-w-64">
  <div class="mb-4 grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <div class="g col-span-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Heading class="col-span-1 lg:col-span-2 xl:col-span-3" tag="h4">Lista de Objetos</Heading>
      <FilteredSearch query={data.query}></FilteredSearch>
    </div>
    {#await data.streamed.objetos}
      {#each Array.from({ length: 4 }) as _, i}
        <Skeleton card={64} paragraphSize={2} class={i === 2 ? 'hidden lg:flex' : i === 3 ? 'hidden xl:flex' : ''} />
      {/each}
    {:then { objetos }}
      {#if objetos.length > 0}
        {#each objetos as obj (obj.id)}
          <Card class="relative col-span-1 flex min-w-full flex-col gap-2 p-6">
            <ImageLoader src={obj.imagem} alt={obj.titulo} class="h-64" />
            <Heading tag="h5" class="line-clamp-1">{obj.titulo}</Heading>
            <P class="line-clamp-1">{obj.descricao}</P>
            <Badge color={obj.tipo === 'achado' ? 'green' : 'red'} class="absolute top-8 left-1/2 -translate-x-1/2">
              {obj.tipo}
            </Badge>
            <div class="grid grid-cols-3 gap-1 break-all [&>*]:line-clamp-1 [&>*]:text-sm">
              <P class="col-span-2">
                <MapPin class="mb-1 inline-block h-4 w-4" />
                {dictLocalidades[obj.local]}
              </P>
              <P class="text-end text-xs! text-gray-500 dark:text-gray-400">
                {#if obj.encaminhado}Encaminhado{/if}
              </P>
              <P class="col-span-2">
                <AtSign class="mb-1 inline-block h-4 w-4" />
                {obj.usuario.username}
              </P>
              <P class="text-end">
                {new Date(obj.created_at).toLocaleDateString('pt-BR', {
                  year: '2-digit',
                  month: '2-digit',
                  day: '2-digit'
                })}
              </P>
            </div>
          </Card>
        {/each}
      {:else}
        <p class="text-center text-gray-500 dark:text-gray-400">Nenhum objeto encontrado.</p>
      {/if}
    {:catch error}
      <Alert color="red" dismissable>Erro: {error.message}</Alert>
    {/await}
  </div>
</div>

<DevInfo
  content={`\
# debug
  - signed_up=${Boolean(data.user)}
# todo (tela objetos)
  - (x) layout objetos`}
/>

-->
