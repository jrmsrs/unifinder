<script lang="ts">
  import { enhance } from '$app/forms';
  import { dictCategorias, dictLocalidades } from '$lib/utils/dicionaries.js';
  import { Alert, Button, Heading, Helper, Input, Label, Modal, P, Select, Textarea } from 'flowbite-svelte';
  import { CloseOutline } from 'flowbite-svelte-icons';
  import { ImageUp } from 'lucide-svelte';
  import { scale } from 'svelte/transition';

  let {
    edit: editObjeto = $bindable(),
    objeto,
    form,
    error
  } = $props<{
    edit: boolean;
    objeto: Objeto;
    form: any;
    error: string;
  }>();

  // Inicializa o estado com dados do formulário (se houver erro) ou do objeto
  let objetoTipo: ObjetoTipo | undefined = $state(form?.tipo ?? objeto.tipo.toLowerCase());
  let objetoTitulo: string = $state(form?.titulo ?? objeto.nome);
  let objetoDescricao: string = $state(form?.descricao ?? objeto.descricao);
  let objetoLocalidade: ObjetoLocalidade | '' = $state(form?.localidade ?? objeto.local_ocorrencia);
  let objetoLocalEspecifico: string = $state(form?.local_especifico ?? objeto.local_especifico ?? '');
  let objetoLocalEncaminhado: string = $state(form?.local_encaminhado ?? objeto.local_armazenamento ?? '');
  let objetoCategoria: ObjetoCategoria | '' = $state(form?.categoria ?? objeto.categoria);

  let objetoImageFile: File | undefined = $state(undefined);
  let objetoImagePreviewURL: string | undefined | null = $state(form?.image_url ?? objeto.url_imagem ?? undefined);
  let objetoSubmiting = $state(false);

  // Listas de Localidades e Categorias para o Select
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

  /** Manipula seleção de arquivo de imagem */
  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('Arquivo muito grande (máx 15MB)');
        target.value = '';
        objetoImageFile = undefined;
        objetoImagePreviewURL = objeto.url_imagem ?? undefined;
        return;
      }
      objetoImageFile = file;
      objetoImagePreviewURL = URL.createObjectURL(file);
    }
  };

  /** Remove a imagem selecionada */
  const handleRemoveImage = () => {
    objetoImageFile = undefined;
    if (objetoImagePreviewURL) {
      if (objetoImagePreviewURL.startsWith('blob:')) {
        URL.revokeObjectURL(objetoImagePreviewURL);
      }
      objetoImagePreviewURL = null;
    }
  };

  // Reseta estado de submissão quando há erro
  $effect(() => {
    if (error) {
      objetoSubmiting = false;
    }
  });
</script>

<Modal
  class="w-11/12 shadow-2xl shadow-black backdrop:bg-transparent backdrop:backdrop-blur-sm"
  dismissable={false}
  transition={scale}
  bind:open={editObjeto}
>
  {#snippet header()}
    <Heading tag="h5" class="text-center">Editar objeto {objetoTipo ? (objetoTipo === 'achado' ? 'encontrado' : 'perdido') : ''}</Heading>
  {/snippet}
  <form
    class="flex flex-col gap-4"
    method="POST"
    action="?/updateObjeto"
    enctype="multipart/form-data"
    use:enhance={() => {
      objetoSubmiting = true;
      return async ({ update, result }) => {
        await update();
        if (result.type === 'redirect') {
          editObjeto = false;
        }
        objetoSubmiting = false;
      };
    }}
  >
    <input type="hidden" name="id" value={objeto.id} />
    <input type="hidden" name="tipo" value={objetoTipo} />

    <div>
      <Label>
        Título <span class="text-red-400">*</span>
        <Input name="titulo" bind:value={objetoTitulo} placeholder="Digite o título do objeto" />
      </Label>
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
        onclick={() => document.getElementById('imageInputEdit')?.click()}
        role="button"
        tabindex="0"
      >
        <input
          type="file"
          id="imageInputEdit"
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
      <input type="text" class="sr-only" placeholder="URL da imagem" name="image_url" bind:value={objetoImagePreviewURL} />
    </div>

    <div>
      <Label>
        Área em que foi {objetoTipo === 'achado' ? 'encontrado' : 'perdido'} (prédio, praça, etc)
        <span class="text-red-400">*</span>
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
          Especifique o local armazenado (ex. "Guarita do CCH", "Secretaria da Biblioteca", etc.)
          <Input bind:value={objetoLocalEncaminhado} placeholder="Padrão: Objeto em mãos" name="local_encaminhado" />
        </Label>
      </div>
      <Helper>
        <span class="font-extrabold">Importante:</span> Certifique-se de que o local especificado é seguro e apropriado para armazenar o objeto
        até que o dono possa recuperá-lo.
      </Helper>
    {/if}

    <div>
      <Label>
        Categoria <span class="text-red-400">*</span>
        <Select items={listaCategorias} bind:value={objetoCategoria} placeholder="Selecione uma categoria" name="categoria" />
      </Label>
    </div>

    {#if error}
      <Alert color="red">
        Erro ao atualizar o objeto:
        <ul class="list-inside list-disc">
          {#each error.split('; ') as err}
            <li>{err}</li>
          {/each}
        </ul>
      </Alert>
    {/if}

    <div class="flex shrink-0 items-center space-x-3 rounded-b-lg p-4 md:p-5 rtl:space-x-reverse">
      <div class="flex w-full justify-end">
        <Button
          type="submit"
          value="submit"
          disabled={objetoSubmiting || !objetoTitulo.trim() || !objetoDescricao.trim() || !objetoLocalidade || !objetoCategoria}
        >
          Salvar Alterações
        </Button>
        <button
          type="button"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          onclick={() => (editObjeto = false)}
        >
          <span class="sr-only">Fechar modal</span>
          <CloseOutline class="h-7 w-7" />
        </button>
      </div>
    </div>
  </form>
</Modal>
