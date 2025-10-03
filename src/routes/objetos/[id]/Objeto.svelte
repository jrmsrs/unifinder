<script lang="ts">
  import ImageLoader from '$lib/components/ImageLoader.svelte';
  import ObjetoTable from '$lib/components/routes/ObjetoTable.svelte';
  import Row from '$lib/components/routes/ObjetoTableRow.svelte';
  import { dictLocalidades } from '$lib/utils/dicionaries.js';
  import { Badge, Heading, P } from 'flowbite-svelte';
  import { AtSign, Calendar, CheckCircle, MapPin, Play } from 'lucide-svelte';

  let { objeto }: { objeto: Objeto } = $props();
</script>

<div class="flex flex-col">
  <ImageLoader src={objeto.url_imagem} alt={objeto.nome} class="h-72 rounded-t-lg sm:h-96 lg:h-[32rem]" />
  <div class="grid grid-cols-2 overflow-hidden rounded-b-lg [&>*]:mt-0 [&>*]:h-8 [&>*]:rounded-none">
    <Badge color={objeto.tipo === 'achado' ? 'green' : 'red'}>{objeto.tipo}</Badge>
    <Badge color="gray" class="mt-2">objeto.categoria</Badge>
  </div>
  <Heading tag="h2" class="mt-2 text-2xl font-bold">{objeto.nome}</Heading>
  <P class="text-gray-700 dark:text-gray-400">{objeto.descricao}</P>
  <ObjetoTable>
    <Row key="Postado:" value={new Date(objeto.data_registro).toLocaleDateString()} icon={Calendar} />
    <Row key="{objeto.tipo === 'achado' ? 'Coletado por' : 'Dono'}:" value={objeto.user_id.slice(0, 8)} icon={AtSign} />
    <Row
      key="{objeto.tipo === 'achado' ? 'Encontrado' : 'Perdido'} em:"
      value={dictLocalidades[objeto.local_ocorrencia]}
      icon={MapPin}
    />
    {#if objeto.tipo === 'achado'}
      <Row key="Encaminhado:" value={objeto.local_armazenamento ?? 'Em mãos'} icon={MapPin} />
    {/if}
    <Row
      key="Status:"
      value={objeto.status.toLowerCase() === 'finalizado' ? 'Finalizado' : 'Ativo'}
      icon={objeto.status.toLowerCase() === 'finalizado' ? CheckCircle : Play}
    />
  </ObjetoTable>
</div>

