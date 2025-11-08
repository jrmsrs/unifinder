<script lang="ts">
  import { goto } from '$app/navigation';
  import FilteredSearch from '$lib/components/FilteredSearch.svelte';
  import ObjectsCarousel from '$lib/components/ObjectsCarousel.svelte';
  import DevInfo from '$lib/components/dev/DevInfo.svelte';
  import { Alert, Button, Heading, Hr, P } from 'flowbite-svelte';
  import { onMount } from 'svelte';

  let { data } = $props();

  // Redireciona para finalização de cadastro se usuário não tem username
  onMount(() => {
    if (data.user && data.user.email && !data.user.user_metadata.username) {
      goto('/auth?finish=true');
    }
  });
</script>

<div class="m-auto flex flex-col items-center justify-center p-4 [&>*]:my-4 [&>*>hr]:max-w-64 [&>hr]:w-full [&>hr]:max-w-64">
  <!-- Barra de pesquisa principal -->
  <P>Perdeu ou achou algum pertence na UNIRIO? Procure pelo objeto entre os Achados ou o registro do dono entre os Perdidos:</P>
  <FilteredSearch></FilteredSearch>
  <Hr class="my-0!">não encontrou?</Hr>
  <Button color="primary" class="dark:bg-primary-700 dark:hover:bg-primary-800" onclick={() => goto('/objetos?new=true')}>
    Registrar Objeto Perdido/Achado
  </Button>
  <Hr />

  <!-- Seção de objetos em acompanhamento (apenas usuários logados) -->
  {#if data.user}
    <Heading tag="h4">Objetos em acompanhamento</Heading>
    {#await data.streamed.objetos}
      <ObjectsCarousel id="found-objects-carousel" objects={null} />
    {:then { tutelados }}
      {#if tutelados && tutelados.length > 0}
        <ObjectsCarousel id="tutelados-carousel" objects={tutelados} tutela />
      {:else}
        <p class="text-center text-gray-500 dark:text-gray-400">Nenhum objeto em acompanhamento.</p>
      {/if}
    {:catch error}
      <Alert color="red" dismissable>Erro: {error.message}</Alert>
    {/await}
    <Hr />
  {/if}

  <!-- Seção de últimos objetos achados -->
  <Heading tag="h4">Últimos objetos achados</Heading>
  {#await data.streamed.objetos}
    <ObjectsCarousel id="found-objects-carousel" objects={null} />
  {:then { latestObjetos }}
    {#if latestObjetos.achados.length > 0}
      <ObjectsCarousel id="found-objects-carousel" objects={latestObjetos.achados} />
    {:else}
      <p class="text-center text-gray-500 dark:text-gray-400">Nenhum objeto achado está disponível.</p>
    {/if}
  {:catch error}
    <Alert color="red" dismissable>Erro: {error.message}</Alert>
  {/await}
  <Hr />

  <!-- Seção de últimos objetos perdidos -->
  <Heading tag="h4">Últimos objetos perdidos</Heading>
  {#await data.streamed.objetos}
    <ObjectsCarousel id="found-objects-carousel" objects={null} />
  {:then { latestObjetos }}
    {#if latestObjetos.perdidos.length > 0}
      <ObjectsCarousel id="lost-objects-carousel" objects={latestObjetos.perdidos} />
    {:else}
      <p class="text-center text-gray-500 dark:text-gray-400">Nenhum objeto perdido está disponível.</p>
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
  - (x) mocks modal pesquisa filtrada
  - (x) layout cards objetos em acompanhamento
  - (x) layout cards ultimos achados/perdidos
  - (x) mocks cards
  - (x) integração
# todo (autenticação):
  - (x) login padrão
  - (x) sign up padrão
  - (x) recuperação de senha padrão
  - (x) usuario tem username (etapa adicional)
  - (x) integração`}
/>
