<script lang="ts">
  import { page } from '$app/state';
  import FilteredSearch from '$lib/components/FilteredSearch.svelte';
  import ObjectsCarousel from '$lib/components/ObjectsCarousel.svelte';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import { Button, Heading, Hr, P } from 'flowbite-svelte';
  let ref = page.url.searchParams.get('ref') || '/objetos';
</script>

{#if ref === '/objetos' || page.url.pathname === '/objetos'}
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
{:else}
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
