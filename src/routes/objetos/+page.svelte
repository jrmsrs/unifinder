<script lang="ts">
  import ObjetoModalNew from './ObjetoModalNew.svelte';

  import DevInfo from '$lib/components/dev/DevInfo.svelte';
  import FilteredSearch from '$lib/components/FilteredSearch.svelte';
  import ImageLoader from '$lib/components/ImageLoader.svelte';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import { dictLocalidades } from '$lib/utils/dicionaries.js';
  import { Alert, Badge, Button, Card, Heading, Hr, P } from 'flowbite-svelte';
  import { AtSign, MapPin } from 'lucide-svelte';

  let { data } = $props();
  let newObjeto = $state(data.newObjeto);
  let objetoTipo: ObjetoTipo | undefined = $state(data.form?.tipo ?? data.query?.tipo?.[0] ?? undefined);
</script>

<div class="m-auto flex flex-col items-center p-4 [&>*]:my-4 [&>*>hr]:max-w-64 [&>hr]:w-full [&>hr]:max-w-64">
  <div class="mb-4 grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <div class="g col-span-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Heading class="col-span-1 lg:col-span-2 xl:col-span-3" tag="h4">
        Lista de Objetos
        {data.query?.tipo && data.query?.tipo?.length === 1 ? (data.query?.tipo?.[0] === 'achado' ? 'Achados' : 'Perdidos') : undefined}
      </Heading>
      <FilteredSearch query={data.query}></FilteredSearch>
    </div>
    {#await data.streamed.objetos}
      {#each Array.from({ length: 4 }) as _, i}
        <Skeleton card={64} paragraphSize={2} class={i === 2 ? 'hidden lg:flex' : i === 3 ? 'hidden xl:flex' : ''} />
      {/each}
    {:then { items: objetos }}
      {#if objetos.length && objetos.length > 0}
        {#each objetos as obj (obj.id)}
          <a href={`/objetos/${obj.id}?ref=%2fobjetos`}>
            <Card class="relative col-span-1 flex min-w-full flex-col gap-2 p-6">
              <ImageLoader src={obj.url_imagem} alt={obj.nome} class="h-64" />
              <Heading tag="h5" class="line-clamp-1">{obj.nome}</Heading>
              <P class="line-clamp-1">{obj.descricao}</P>
              <Badge color={obj.tipo === 'achado' ? 'green' : 'red'} class="absolute top-8 left-1/2 -translate-x-1/2">
                {obj.tipo}
              </Badge>
              <div class="grid grid-cols-3 gap-1 break-all [&>*]:line-clamp-1 [&>*]:text-sm">
                <P class="col-span-2">
                  <MapPin class="mb-1 inline-block h-4 w-4" />
                  {dictLocalidades[obj.local_ocorrencia]}
                </P>
                <P class="text-end text-xs! text-gray-500 dark:text-gray-400">
                  {#if obj.local_armazenamento}Encaminhado{/if}
                </P>
                <P class="col-span-2">
                  <AtSign class="mb-1 inline-block h-4 w-4" />
                  obj.usuario.username
                </P>
                <P class="text-end">
                  {new Date(obj.data_registro).toLocaleDateString('pt-BR', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </P>
              </div>
            </Card>
          </a>
        {/each}
      {:else}
        <p class="text-center text-gray-500 dark:text-gray-400">Nenhum objeto encontrado.</p>
      {/if}
    {:catch error}
      <Alert color="red" dismissable>Erro: {error.message}</Alert>
    {/await}
  </div>
</div>

<Hr />

<div class="m-auto mb-8 flex max-w-3xl flex-col items-center gap-4 p-4">
  <P class="text-center text-lg">
    {data.query?.tipo?.[0]
      ? data.query?.tipo?.[0] === 'achado'
        ? 'Não encontrou o que procurava? Anuncie um objeto perdido!'
        : 'Achou algo? Anuncie o objeto encontrado!'
      : 'Anuncie um objeto perdido ou encontrado'}
  </P>
  <Button
    class="ml-2"
    onclick={() => {
      newObjeto = true;
      console.log(newObjeto)
      objetoTipo = data.query?.tipo?.[0] ? (data.query?.tipo?.[0] === 'achado' ? 'perdido' : 'achado') : undefined;
    }}
  >
    {data.query?.tipo?.[0] ? (data.query?.tipo?.[0] === 'achado' ? 'Novo objeto perdido' : 'Novo objeto achado') : 'Novo objeto'}
  </Button>
</div>

<ObjetoModalNew bind:new={newObjeto} form={data.form} query={data.query} error={data.error} />

<DevInfo
  content={`\
# debug
  - signed_up=${Boolean(data.user)}
# todo (tela objetos)
  - (x) layout objetos`}
/>
