<script lang="ts">
  import { enhance } from '$app/forms';
  import DevInfo from '$lib/components/dev/DevInfo.svelte';
  import FilteredSearch from '$lib/components/FilteredSearch.svelte';
  import ImageLoader from '$lib/components/ImageLoader.svelte';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import { dictCategorias, dictLocalidades } from '$lib/utils/dicionaries.js';
  import {
    Alert,
    Badge,
    Button,
    Card,
    Heading,
    Helper,
    Hr,
    Input,
    Label,
    Modal,
    P,
    RadioButton,
    Select,
    Spinner,
    Textarea
  } from 'flowbite-svelte';
  import { CloseOutline } from 'flowbite-svelte-icons';
  import { AtSign, ImageUp, MapPin } from 'lucide-svelte';
  import { scale } from 'svelte/transition';

  let { data } = $props();
  let newObjeto = $state(data.newObjeto);
  let objetoTipo: ObjetoTipo | undefined = $state(data.form?.tipo ?? data.query?.tipo?.[0] ?? undefined);
  let objetoTitulo: string = $state(data.form?.titulo ?? '');
  let objetoDescricao: string = $state(data.form?.descricao ?? '');
  const listaLocalidades: Array<{ value: ObjetoLocalidade; name: string }> = [
    { value: 'biblio', name: dictLocalidades.biblio },
    { value: 'ccetibio', name: dictLocalidades.ccetibio },
    { value: 'cch', name: dictLocalidades.cch },
    { value: 'ccjp', name: dictLocalidades.ccjp },
    { value: 'cla', name: dictLocalidades.cla },
    { value: 'ib', name: dictLocalidades.ib },
    { value: 'intercampi', name: dictLocalidades.intercampi },
    { value: 'ru', name: dictLocalidades.ru },
    { value: 'outro', name: dictLocalidades.outro }
  ];
  let objetoLocalidade: ObjetoLocalidade | '' = $state(data.form?.localidade ?? '');
  let objetoLocalEspecifico: string = $state(data.form?.local_especifico ?? '');
  let objetoLocalEncaminhado: string = $state(
    data.form?.local_encaminhado && data.form?.local_encaminhado !== '' ? data.form?.local_encaminhado : 'em mãos'
  );
  let objetoLocalEncaminhadoAdd: string = $state(data.form?.local_encaminhado_add ?? '');
  const listaCategorias: Array<{ value: ObjetoCategoria; name: string }> = [
    { value: 'academico', name: dictCategorias.academico },
    { value: 'carteira', name: dictCategorias.carteira },
    { value: 'chaveiro', name: dictCategorias.chaveiro },
    { value: 'documento', name: dictCategorias.documento },
    { value: 'eletronico', name: dictCategorias.eletronico },
    { value: 'mochila', name: dictCategorias.mochila },
    { value: 'utensilio', name: dictCategorias.utensilio },
    { value: 'vestuario', name: dictCategorias.vestuario },
    { value: 'outro', name: dictCategorias.outro }
  ];
  let objetoCategoria: ObjetoCategoria | '' = $state(data.form?.categoria ?? '');

  let objetoImageFile: File | undefined = $state(undefined);
  let objetoImagePreviewURL: string | undefined = $state(data.form?.image_url ?? undefined);
  let objetoSubmiting = $state(false);

  function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande (máx 5MB)');
        target.value = '';
        objetoImageFile = undefined;
        objetoImagePreviewURL = undefined;
        return;
      }
      objetoImageFile = file;
      objetoImagePreviewURL = URL.createObjectURL(file);
    }
  }

  function handleRemoveImage() {
    objetoImageFile = undefined;
    if (objetoImagePreviewURL) {
      URL.revokeObjectURL(objetoImagePreviewURL);
      objetoImagePreviewURL = undefined;
    }
  }

  $effect(() => {
    if (data.error) {
      objetoSubmiting = false;
    }
  });
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
              <ImageLoader src={obj.imagem} alt={obj.nome} class="h-64" />
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
      objetoTipo = data.query?.tipo?.[0] ? (data.query?.tipo?.[0] === 'achado' ? 'perdido' : 'achado') : undefined;
    }}
  >
    {data.query?.tipo?.[0] ? (data.query?.tipo?.[0] === 'achado' ? 'Novo objeto perdido' : 'Novo objeto achado') : 'Novo objeto'}
  </Button>
</div>

<Modal
  class="w-11/12 shadow-2xl shadow-black backdrop:bg-transparent backdrop:backdrop-blur-sm"
  dismissable={false}
  transition={scale}
  bind:open={newObjeto}
>
  {#snippet header()}
    <Heading tag="h5" class="text-center">Novo objeto {objetoTipo ? (objetoTipo === 'achado' ? 'encontrado' : 'perdido') : ''}</Heading>
  {/snippet}
  <form
    class="flex flex-col gap-4"
    method="POST"
    action="?/createObjeto"
    enctype="multipart/form-data"
    use:enhance={() => {
      objetoSubmiting = true;
      return async ({ update }) => {
        await update();
      };
    }}
  >
    <div class="flex flex-col-reverse gap-4">
      <div>
        <Label>
          Título <span class="text-red-400">*</span>
          <Input name="titulo" bind:value={objetoTitulo} placeholder="Digite o título do objeto" />
        </Label>
      </div>
      <div>
        <Label>Tipo de objeto <span class="text-red-400">*</span></Label>
        <div class="grid grid-cols-2 flex-row text-center [&>label]:rounded-none [&>label]:first:rounded-l-lg [&>label]:last:rounded-r-lg">
          <RadioButton
            outline
            value="achado"
            name="tipo"
            class="
              rounded-e-none border border-gray-500! 
              focus-within:ring-2 focus-within:ring-white! hover:bg-primary-600! hover:text-white! dark:text-white!
            "
            checkedClass="outline-0 bg-primary-600! text-white!"
            bind:group={objetoTipo}
          >
            Achado
          </RadioButton>
          <RadioButton
            outline
            value="perdido"
            name="tipo"
            class="
              rounded-s-none border border-gray-500! 
              focus-within:ring-2 focus-within:ring-white! hover:bg-primary-600! hover:text-white! dark:text-white!
            "
            checkedClass="outline-0 bg-primary-600! text-white!"
            bind:group={objetoTipo}
          >
            Perdido
          </RadioButton>
        </div>
      </div>
    </div>
    <div>
      <Label>
        Descrição <span class="text-red-400">*</span>
        <Textarea
          bind:value={objetoDescricao}
          name="descricao"
          placeholder="Descreva informações adicionais sobre o objeto"
          class="w-full dark:border-gray-600! dark:bg-gray-700!"
          rows={4}
        />
      </Label>
    </div>
    <div>
      <Label>Imagem</Label>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        class="relative flex h-64 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        onclick={() => document.getElementById('imageInput')?.click()}
        role="button"
        tabindex="0"
      >
        <input
          type="file"
          id="imageInput"
          name="imagem_arquivo"
          accept="image/png, image/jpeg"
          class="sr-only"
          onchange={handleFileSelect}
        />

        {#if objetoImagePreviewURL}
          <div class="relative h-full w-full">
            <img class="relative h-full w-full object-contain" src={objetoImagePreviewURL} alt="Prévia da imagem" />
            <button
              type="button"
              class="absolute top-2 right-2 rounded-full bg-red-500/80 p-1 text-white hover:bg-red-600/80"
              onclick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              aria-label="Remover imagem selecionada"
            >
              <CloseOutline class="h-4 w-4" />
            </button>
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center">
            <ImageUp class="mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">Clique para enviar uma imagem</p>
            <P class="text-xs text-gray-500 dark:text-gray-400">PNG ou JPG (MAX. 5MB)</P>
          </div>
        {/if}
      </div>
    </div>
    <div>
      <Label>
        Área em que foi {objetoTipo === 'achado' ? 'encontrado' : 'perdido'} (prédio, praça, etc) <span class="text-red-400">*</span>
        <Select items={listaLocalidades} bind:value={objetoLocalidade} placeholder="Selecione a área" name="localidade" />
      </Label>
    </div>
    <div>
      <Label>
        Local específico (ex. sala 101 no 1º andar)
        <Input bind:value={objetoLocalEspecifico} placeholder="(Opcional) Digite a localização específica" name="local_especifico" />
      </Label>
    </div>
    {#if objetoTipo === 'achado'}
      <div>
        <Label>
          Local para o qual o objeto foi encaminhado (se aplicável)
          <Select
            placeholder={objetoLocalidade !== '' && objetoLocalidade !== 'intercampi' && objetoLocalidade !== 'outro'
              ? `Locais em ${dictLocalidades[objetoLocalidade]}`
              : 'Selecione um local'}
            name="local_encaminhado"
            bind:value={objetoLocalEncaminhado}
          >
            <option value="em mãos"> Objeto em mãos </option>
            <option value="wip-blabla">
              Guarita do {objetoLocalidade !== '' && objetoLocalidade !== 'intercampi' && objetoLocalidade !== 'outro'
                ? dictLocalidades[objetoLocalidade]
                : 'Campus'}
            </option>
            <option value="outro"> Outro local - especificar </option>
          </Select>
        </Label>
      </div>
      <Helper>
        É altamente recomendado que você encaminhe o objeto encontrado a algum dos locais listados abaixo,
        <span class="font-extrabold"> onde deve haver responsáveis para gerir a entrega do objeto ao dono, </span>
        e então preenchê-lo. É possível marcar como "Objeto em mãos" e modificar mais tarde quando realizar o encaminhamento.
      </Helper>
    {/if}
    {#if objetoTipo === 'achado' && objetoLocalEncaminhado === 'outro'}
      <div>
        <Label>
          Especifique o outro local <span class="text-red-400">*</span>
          <Input bind:value={objetoLocalEncaminhadoAdd} placeholder="Digite um local ainda não listado" name="local_encaminhado_add" />
        </Label>
      </div>
      <Helper>
        <span class="font-extrabold">ATENÇÃO:</span> Certifique-se de que o local especificado realmente não está listado (você selecionou a
        Área correta?) e é seguro e apropriado para armazenar o objeto até que o dono possa recuperá-lo.
      </Helper>
    {/if}
    <div>
      <Label>
        Categoria <span class="text-red-400">*</span>
        <Select items={listaCategorias} bind:value={objetoCategoria} placeholder="Selecione uma categoria" name="categoria" />
      </Label>
    </div>

    {#if data.error}
      <Alert color="red">
        Erro ao registrar o objeto:
        <ul class="list-inside list-disc">
          {#each data.error.split('; ') as err}
            <li>{err}</li>
            {#if err.includes('Por favor, tente novamente.')}
              <pre class="overflow-x-scroll">{'\n'}POST /objeto {JSON.stringify(data.form, null, 2)}</pre>
            {/if}
          {/each}
        </ul>
      </Alert>
    {/if}

    <div class="flex shrink-0 items-center space-x-3 rounded-b-lg p-4 md:p-5 rtl:space-x-reverse">
      <div class="flex w-full justify-end">
        <Button
          type="submit"
          value="submit"
          disabled={objetoSubmiting ||
            !objetoTipo ||
            !objetoTitulo.trim() ||
            !objetoDescricao.trim() ||
            !objetoLocalidade ||
            !objetoCategoria}
        >
          Cadastrar
        </Button>
        <button
          type="button"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          onclick={() => (newObjeto = false)}
        >
          <span class="sr-only">Fechar modal</span>
          <CloseOutline class="h-7 w-7" />
        </button>
      </div>
    </div>
  </form>
</Modal>

<DevInfo
  content={`\
# debug
  - signed_up=${Boolean(data.user)}
# todo (tela objetos)
  - (x) layout objetos`}
/>
