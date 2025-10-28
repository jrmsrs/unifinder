<script lang="ts">
  import { dictLocalidades } from '$lib/utils/dicionaries';
  import { Badge, Card, Heading, P } from 'flowbite-svelte';
  import { AtSign, MapPin } from 'lucide-svelte';
  import ImageLoader from './ImageLoader.svelte';
  import ObjectsCarouselScroll from './ObjectsCarouselScroll.svelte';
  import Skeleton from './Skeleton.svelte';

  let { objects, tutela, id }: { objects: Objeto[] | null; tutela?: boolean; id: string } = $props();
</script>

<div class="relative w-full">
  <div
    {id}
    class="
				no-scrollbar flex gap-4 overflow-x-auto! scroll-smooth
				first:px-[calc(50vw-10rem)]
				sm:first:px-[calc(640px-50vw-10rem)]
				md:first:px-[calc(768px-50vw-10rem)]
				lg:first:px-[calc(1024px-50vw-10rem)]
				xl:first:px-[calc(1280px-50vw-10rem)]
				2xl:first:px-[calc(1536px-50vw-10rem)]
				[&>*]:min-h-64 [&>*]:max-w-64 [&>*]:min-w-64
			"
  >
    {#if objects === null}
      {#each Array.from({ length: 3 }) as _, i}
        <Skeleton card={48} />
      {/each}
    {:else}
      {#each objects as obj}
        <a href={`/objetos/${obj.id}?ref=%2f`}>
          <Card class="relative col-span-1 flex h-full gap-2 p-6">
            <ImageLoader src={obj.url_imagem} alt={obj.nome} class="h-48 max-w-full min-w-48" />
            <Heading tag="h5" class="text-xl font-bold tracking-tight">{obj.nome}</Heading>
            <div class="flex">
              <Badge color={obj.tipo.toLowerCase() === 'achado' ? 'green' : 'red'} class="absolute top-8 left-1/2 -translate-x-1/2">
                {obj.tipo.toLowerCase() === 'achado' ? 'Achado' : 'Perdido'}
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
                  {obj.user_id.slice(0, 8)}
                </P>
                <P class="text-end">
                  {new Date(obj.data_registro).toLocaleDateString('pt-BR', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </P>
              </div>
            </div>
          </Card>
        </a>
      {/each}
      <a
        href={tutela ? `/objetos?tutela=true` : `/objetos?tipo=${objects[0].tipo.toLowerCase()}`}
        class=" flex flex-row items-center justify-center rounded-lg bg-gray-300 dark:bg-gray-700"
      >
        Ver todos
      </a>
    {/if}
  </div>
  <div class="absolute top-1/2 left-0 -ml-7 -translate-y-1/2 bg-transparent">
    <ObjectsCarouselScroll carouselId={id} />
  </div>
  <div class="absolute top-1/2 right-0 -mr-7 -translate-y-1/2 bg-transparent">
    <ObjectsCarouselScroll carouselId={id} right />
  </div>
</div>
