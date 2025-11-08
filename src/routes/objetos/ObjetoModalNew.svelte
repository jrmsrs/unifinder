<script lang="ts">
  import { enhance } from '$app/forms';
  import { dictCategorias, dictLocalidades } from '$lib/utils/dicionaries.js';
  import { Alert, Button, Heading, Helper, Input, Label, Modal, P, RadioButton, Select, Textarea } from 'flowbite-svelte';
  import { CloseOutline } from 'flowbite-svelte-icons';
  import { ImageUp } from 'lucide-svelte';
  import { scale } from 'svelte/transition';

  let { new: newObjeto = $bindable(), form, query, error } = $props();
  let objetoTipo: ObjetoTipo | undefined = $state(form?.tipo ?? query?.tipo ?? undefined);
  let objetoTitulo: string = $state(form?.titulo ?? '');
  let objetoDescricao: string = $state(form?.descricao ?? '');

  /** Lista de localidades disponíveis */
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
  let objetoLocalidade: ObjetoLocalidade | '' = $state(form?.localidade ?? '');
  let objetoLocalEspecifico: string = $state(form?.local_especifico ?? '');
  let objetoLocalEncaminhado: string = $state(
    form?.local_encaminhado && form?.local_encaminhado !== '' ? form?.local_encaminhado : 'em mãos'
  );
  let objetoLocalEncaminhadoAdd: string = $state(form?.local_encaminhado_add ?? '');

  /** Lista de categorias disponíveis */
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
  let objetoCategoria: ObjetoCategoria | '' = $state(form?.categoria ?? '');

  let objetoImageFile: File | undefined = $state(undefined);
  let objetoImagePreviewURL: string | undefined = $state(form?.image_url ?? undefined);
  let objetoSubmiting = $state(false);

  /** Valida e carrega imagem selecionada (máximo 15MB) */
  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('Arquivo muito grande (máx 15MB)');
        target.value = '';
        objetoImageFile = undefined;
        objetoImagePreviewURL = undefined;
        return;
      }
      objetoImageFile = file;
      objetoImagePreviewURL = URL.createObjectURL(file);
    }
  };

  /** Remove imagem selecionada */
  const handleRemoveImage = () => {
    objetoImageFile = undefined;
    if (objetoImagePreviewURL) {
      URL.revokeObjectURL(objetoImagePreviewURL);
      objetoImagePreviewURL = undefined;
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
      <!-- Campo título -->
      <div>
        <Label>
          Título <span class="text-red-400">*</span>
          <Input name="titulo" bind:value={objetoTitulo} placeholder="Digite o título do objeto" />
        </Label>
      </div>

      <!-- Seletor de tipo (achado/perdido) -->
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

    <!-- Campo descrição -->
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

    <!-- Upload de imagem -->
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
      <input type="text" class="sr-only" placeholder="URL da imagem" name="image_url" bind:value={objetoImagePreviewURL} />
    </div>

    <!-- Localidade onde foi encontrado/perdido -->
    <div>
      <Label>
        Área em que foi {objetoTipo === 'achado' ? 'encontrado' : 'perdido'} (prédio, praça, etc) <span class="text-red-400">*</span>
        <Select items={listaLocalidades} bind:value={objetoLocalidade} placeholder="Selecione a área" name="localidade" />
      </Label>
    </div>

    <!-- Local específico (opcional) -->
    <div>
      <Label>
        Local específico (ex. sala 101 no 1º andar)
        <Input bind:value={objetoLocalEspecifico} placeholder="(Opcional) Digite a localização específica" name="local_especifico" />
      </Label>
    </div>

    <!-- Local de encaminhamento (apenas para achados) -->
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

    <!-- Especificar outro local (se selecionado) -->
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

    <!-- Categoria do objeto -->
    <div>
      <Label>
        Categoria <span class="text-red-400">*</span>
        <Select items={listaCategorias} bind:value={objetoCategoria} placeholder="Selecione uma categoria" name="categoria" />
      </Label>
    </div>

    <!-- Mensagem de erro -->
    {#if error}
      <Alert color="red">
        Erro ao registrar o objeto:
        <ul class="list-inside list-disc">
          {#each error.split('; ') as err}
            <li>{err}</li>
            {#if err.includes('Por favor, tente novamente.')}
              <pre class="overflow-x-scroll">{'\n'}POST /objeto {JSON.stringify(form, null, 2)}</pre>
            {/if}
          {/each}
        </ul>
      </Alert>
    {/if}

    <!-- Botões de ação -->
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
