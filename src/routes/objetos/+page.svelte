<script lang="ts">
  import DevInfo from '$lib/components/dev/DevInfo.svelte';
  import ImageLoader from '$lib/components/ImageLoader.svelte';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import { Alert, Badge, Card, Heading, P } from 'flowbite-svelte';

  let { data } = $props();
</script>

<div
  class="m-auto flex flex-col items-center justify-center p-4 [&>*]:my-4 [&>*>hr]:max-w-64 [&>hr]:w-full [&>hr]:max-w-64"
>
  <Heading tag="h4">Lista de Objetos</Heading>
  <div
    class="mb-4 grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  >
    {#await data.streamed.objetos}
      {#each Array.from({ length: 4 }) as _, i}
        <Skeleton
          card={64}
          paragraphSize={2}
          class={i === 2 ? 'hidden lg:flex' : i === 3 ? 'hidden xl:flex' : ''}
        />
      {/each}
    {:then objetos}
      {#if objetos.length > 0}
        {#each objetos as objeto (objeto.id)}
          <Card class="relative col-span-1 flex min-w-full flex-col gap-2 p-6">
            <ImageLoader src={objeto.imagem} alt={objeto.titulo} divClass="h-64" />
            <Heading tag="h5">{objeto.titulo}</Heading>
            <P>{objeto.descricao}</P>
            <Badge
              color={objeto.tipo === 'achado' ? 'green' : 'red'}
              class="absolute top-8 left-1/2 -translate-x-1/2"
            >
              {objeto.tipo}
            </Badge>
            <P>{objeto.local}</P>
            <P>Publicado em: {new Date(objeto.created_at).toLocaleDateString()}</P>
            <P>Categorias: {objeto.categorias.join(', ')}</P>
            <P>Descritores: {objeto.descritores.join(', ')}</P>
          </Card>
        {/each}
      {:else}
        <p class="text-center text-primary-500 dark:text-primary-400">Nenhum objeto encontrado.</p>
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
