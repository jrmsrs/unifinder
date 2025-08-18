<script lang="ts">
  import FilteredSearch from '$lib/components/FilteredSearch.svelte';
  import ObjectsCarousel from '$lib/components/ObjectsCarousel.svelte';
  import DevInfo from '$lib/components/dev/DevInfo.svelte';
  import { Alert, Button, Heading, Hr, P } from 'flowbite-svelte';

  let { data } = $props();
</script>

<div
  class="m-auto flex flex-col items-center justify-center p-4 [&>*]:my-4 [&>*>hr]:max-w-64 [&>hr]:w-full [&>hr]:max-w-64"
>
  <P>Perdeu algum pertence na UNIRIO? Procure aqui</P>
  <FilteredSearch></FilteredSearch>
  <Hr class="my-0!">ou</Hr>
  <Button color="primary" class="dark:bg-primary-700 dark:hover:bg-primary-800">
    Cadastrar objeto perdido
  </Button>
  <Hr />
  <P>Encontrou algum objeto na UNIRIO?</P>
  <Button color="primary" class="dark:bg-primary-700 dark:hover:bg-primary-800">
    Cadastrar objeto achado
  </Button>
  <Hr />
  {#if data.user}
    <Heading tag="h4">Objetos em acompanhamento</Heading>
    {#await data.streamed.tutelados}
      <ObjectsCarousel id="found-objects-carousel" objects={null} />
    {:then tutelados}
      {#if tutelados.length > 0}
        <ObjectsCarousel id="tutelados-carousel" objects={tutelados} tutela />
      {:else}
        <p class="text-center text-gray-500 dark:text-gray-400">Nenhum objeto em acompanhamento.</p>
      {/if}
    {:catch error}
      <Alert color="red" dismissable>Erro: {error.message}</Alert>
    {/await}
    <Hr />
  {/if}
  <Heading tag="h4">Últimos objetos achados</Heading>
  {#await data.streamed.latestObjetos}
    <ObjectsCarousel id="found-objects-carousel" objects={null} />
  {:then latestObjetos}
    {#if latestObjetos.achados.length > 0}
      <ObjectsCarousel id="found-objects-carousel" objects={latestObjetos.achados} />
    {:else}
      <p class="text-center text-gray-500 dark:text-gray-400">
        Nenhum objeto achado está disponível.
      </p>
    {/if}
  {:catch error}
    <Alert color="red" dismissable>Erro: {error.message}</Alert>
  {/await}
  <Hr />
  <Heading tag="h4">Últimos objetos perdidos</Heading>
  {#await data.streamed.latestObjetos}
    <ObjectsCarousel id="found-objects-carousel" objects={null} />
  {:then latestObjetos}
    {#if latestObjetos.perdidos.length > 0}
      <ObjectsCarousel id="lost-objects-carousel" objects={latestObjetos.perdidos} />
    {:else}
      <p class="text-center text-gray-500 dark:text-gray-400">
        Nenhum objeto perdido está disponível.
      </p>
    {/if}
  {:catch error}
    <Alert color="red" dismissable>Erro: {error.message}</Alert>
  {/await}
</div>

<DevInfo
  content={`\
# debug
  - signed_up=${Boolean(data.user)}
# todo (tela inicial):
  - (x) layout objetos
  - (x) layout barra pesquisa filtrada
  - (x) layout modal pesquisa filtrada
  - (-) mocks modal pesquisa filtrada
  - (x) layout cards objetos em acompanhamento
  - (x) layout cards ultimos achados/perdidos
  - (x) mocks cards
  - ( ) integração`}
/>
