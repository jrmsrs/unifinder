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
            <ImageLoader src={obj.imagem} alt={obj.titulo} divClass="h-64" />
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
