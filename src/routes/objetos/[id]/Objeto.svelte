<script lang="ts">
  import ImageLoader from '$lib/components/ImageLoader.svelte';
  import ObjetoTable from '$lib/components/routes/ObjetoTable.svelte';
  import Row from '$lib/components/routes/ObjetoTableRow.svelte';
  import { dictCategorias, dictLocalidades } from '$lib/utils/dicionaries.js';
  import { Badge, Heading, P } from 'flowbite-svelte';
  import { AlertTriangle, AtSign, Calendar, CheckCircle, FileText, Hourglass, Info, MapPin, Play } from 'lucide-svelte';

  let { objeto, onOpenProfile }: { objeto: Objeto; onOpenProfile?: (user: User) => void } = $props();
</script>

<div class="flex flex-col">
  <!-- Imagem do objeto -->
  <ImageLoader src={objeto.url_imagem} alt={objeto.nome} class="h-72 rounded-t-lg sm:h-96 lg:h-[32rem]" />

  <!-- Badges de tipo e categoria -->
  <div class="grid grid-cols-2 overflow-hidden rounded-b-lg [&>*]:mt-0 [&>*]:h-8 [&>*]:rounded-none">
    <Badge color={objeto.tipo.toLowerCase() === 'achado' ? 'green' : 'red'} class="mt-2">
      {objeto.tipo.toLowerCase() === 'achado' ? 'Achado' : 'Perdido'}
    </Badge>
    <Badge color="gray" class="mt-2">{dictCategorias[objeto.categoria]}</Badge>
  </div>

  <!-- Título e descrição -->
  <Heading tag="h2" class="mt-2 text-2xl font-bold">{objeto.nome}</Heading>
  <P class="text-gray-700 dark:text-gray-400">{objeto.descricao}</P>

  <!-- Tabela de informações detalhadas -->
  <ObjetoTable>
    <!-- Data de registro -->
    <Row
      key="Postado:"
      value={`${new Date(objeto.data_registro + 'Z').toLocaleDateString('pt-BR')} às ${new Date(
        objeto.data_registro + 'Z'
      ).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
      icon={Calendar}
    />

    <!-- Tutor/dono do objeto (clicável para ver perfil) -->
    <Row key="{objeto.tipo === 'achado' ? 'Coletado por' : 'Dono'}:">
      {#if onOpenProfile}
        <button
          type="button"
          class="group m-0 flex w-full items-center gap-2 rounded-md p-0 text-left transition-colors hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)]"
          onclick={() => onOpenProfile(objeto.user)}
        >
          <AtSign class="h-4 w-4" />
          {objeto.user.username}
          <span class="truncate text-blue-800 group-hover:underline dark:text-blue-200">[contato]</span>
        </button>
      {:else}
        <span>{objeto.user.username}</span>
      {/if}
    </Row>

    <!-- Localidade onde foi encontrado/perdido -->
    <Row key="{objeto.tipo === 'achado' ? 'Encontrado' : 'Perdido'} em:" value={dictLocalidades[objeto.local_ocorrencia]} icon={MapPin} />

    <!-- Local de armazenamento (apenas para achados) -->
    {#if objeto.tipo === 'achado'}
      <Row key="Encaminhado:" value={objeto.local_armazenamento ?? 'Em mãos'} icon={MapPin} />
    {/if}

    <!-- Status do objeto -->
    <Row
      key="Status:"
      value={objeto.status.toLowerCase() === 'aberto'
        ? 'Ativo'
        : objeto.status.toLowerCase() === 'em_reivindicacao'
          ? 'Reivindicação em andamento'
          : objeto.status.toLowerCase() === 'aguardando_retirada'
            ? 'Aguardando Retirada'
            : objeto.status.toLowerCase() === 'finalizado'
              ? 'Finalizado'
              : 'Desconhecido'}
      icon={objeto.status.toLowerCase() === 'aberto'
        ? Play
        : objeto.status.toLowerCase() === 'em_reivindicacao'
          ? AlertTriangle
          : objeto.status.toLowerCase() === 'aguardando_retirada'
            ? Hourglass
            : objeto.status.toLowerCase() === 'finalizado'
              ? CheckCircle
              : Info}
    />

    <!-- Motivo da finalização (se finalizado) -->
    {#if objeto.status?.toLowerCase() === 'finalizado' && objeto.motivo_finalizacao}
      <Row key="Motivo da finalização:" value={objeto.motivo_finalizacao} icon={FileText} />
    {/if}
  </ObjetoTable>
</div>
