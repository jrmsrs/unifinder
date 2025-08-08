<script lang="ts">
  import { Badge, Card, Heading, P } from 'flowbite-svelte';
  import ImageLoader from './ImageLoader.svelte';
  import ObjectsCarouselScroll from './ObjectsCarouselScroll.svelte';
  import Skeleton from './Skeleton.svelte';

  let { objects, id }: { objects: Objeto[] | null; id: string } = $props();
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
				[&>*]:min-h-64 [&>*]:min-w-64
			"
  >
    {#if objects === null}
      {#each Array.from({ length: 3 }) as _, i}
        <Skeleton card={48} />
      {/each}
    {:else}
      {#each objects as obj}
        <Card class="relative col-span-1 flex gap-2 p-6">
          <ImageLoader src={obj.imagem} alt={obj.titulo} divClass="min-w-48 max-w-full h-48" />
          <Heading tag="h5" class="text-xl font-bold tracking-tight">{obj.titulo}</Heading>
          <div class="flex">
            <Badge
              color={obj.tipo === 'achado' ? 'green' : 'red'}
              class="absolute top-8 left-1/2 -translate-x-1/2"
            >
              {obj.tipo === 'achado' ? 'Achado' : 'Perdido'}
            </Badge>
            <P class="mb-2 text-sm text-primary-500 dark:text-primary-400">
              <span class="italic">{obj.tipo === 'achado' ? 'Encontrado em' : 'Perdido em'}</span>
              {obj.local}
              <span class="italic">por</span>
              {obj.usuario.username}
            </P>
          </div>
        </Card>
      {/each}
    {/if}
    <div
      class="
				flex flex-row items-center justify-center rounded-lg bg-primary-300 dark:bg-primary-700
			"
    >
      Ver todos
    </div>
  </div>
  <div class="absolute top-1/2 left-0 -ml-7 -translate-y-1/2 bg-transparent">
    <ObjectsCarouselScroll carouselId={id} />
  </div>
  <div class="absolute top-1/2 right-0 -mr-7 -translate-y-1/2 bg-transparent">
    <ObjectsCarouselScroll carouselId={id} right />
  </div>
</div>
