<script lang="ts">
  import { enhance } from '$app/forms';
  import { Alert, Button, Heading, Helper, Label, Modal, Textarea } from 'flowbite-svelte';
  import { CloseOutline } from 'flowbite-svelte-icons';
  import { FileUp, X } from 'lucide-svelte';
  import { scale } from 'svelte/transition';

  let { objetoClaim = $bindable(), error, objeto }: { objetoClaim: boolean; error: string | null; objeto?: Objeto } = $props();
  let claimDescricao: string = $state('');
  let claimAttachFiles: FileList | null = $state(null);
  let claimSubmiting = $state(false);

  // Verifica se o objeto é do tipo 'Perdido'
  let isObjetoPerdido = $derived(objeto?.tipo?.toLowerCase() === 'perdido');

  /** Valida arquivos selecionados (máximo 5 arquivos, 5MB cada) */
  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;

    if (files) {
      if (files.length > 5) {
        alert('Você pode enviar no máximo 5 arquivos como evidência.');
        target.value = '';
        claimAttachFiles = null;
        return;
      }
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > 5 * 1024 * 1024) {
          alert(`O arquivo ${files[i].name} é muito grande (máx 5MB)`);
          target.value = '';
          claimAttachFiles = null;
          return;
        }
      }
      claimAttachFiles = files;
    }
  };

  /** Remove arquivo da lista de anexos */
  const handleRemoveFile = (i: number) => {
    if (!claimAttachFiles) return;

    const dataTransfer = new DataTransfer();
    for (let j = 0; j < claimAttachFiles.length; j++) {
      if (j !== i) {
        dataTransfer.items.add(claimAttachFiles[j]);
      }
    }
    claimAttachFiles = dataTransfer.files;
    (document.getElementById('fileInput') as HTMLInputElement).files = claimAttachFiles;
  };

  // Reseta estado de submissão quando há erro
  $effect(() => {
    if (error) {
      claimSubmiting = false;
    }
  });
</script>

<Modal
  class="w-11/12 shadow-2xl shadow-black backdrop:bg-transparent backdrop:backdrop-blur-sm"
  dismissable={false}
  transition={scale}
  bind:open={objetoClaim}
>
  {#snippet header()}
    <Heading tag="h5" class="text-center">Reivindicação de Objeto</Heading>
  {/snippet}
  <form
    id="claimObjetoForm"
    class="flex flex-col"
    method="POST"
    action="?/claimObjeto"
    enctype="multipart/form-data"
    use:enhance={() => {
      claimSubmiting = true;
      return async ({ update }) => {
        await update();
        claimSubmiting = false;
        claimAttachFiles = null;
        (document.getElementById('claimObjetoForm') as HTMLFormElement).reset();
        objetoClaim = false;
      };
    }}
  >
    <!-- Campo de descrição da reivindicação -->
    <div class="mb-4">
      <Label>
        {#if isObjetoPerdido}
          Por que acredita que encontrou esse objeto? <span class="text-red-400">*</span>
        {:else}
          Por que você acredita que o objeto é seu? <span class="text-red-400">*</span>
        {/if}
        <Textarea
          bind:value={claimDescricao}
          name="descricao"
          placeholder={isObjetoPerdido 
            ? '"Encontrei na biblioteca", "Estava na sala 101", "Alguém me mostrou", "Me chama no privado (21) 99999-9999", etc.'
            : '"Tem meu nome na capa", "É parecido com o que eu perdi", "Tenho fotos dele", "Me chama no privado (21) 99999-9999", etc.'}
          class="mt-1 w-full dark:border-gray-600! dark:bg-gray-700!"
          rows={4}
        />
      </Label>
    </div>

    <!-- Upload de evidências (opcional) -->
    <div>
      <Label for="fileInput">Anexe documentos comprobatórios (opcional)</Label>

      <div class="flex flex-col">
        <!-- Área de drag-and-drop -->
        <div
          class="relative mt-1 flex h-64 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
          <input
            type="file"
            id="fileInput"
            name="evidencias"
            class="absolute inset-0 h-full w-full opacity-0"
            onchange={handleFileSelect}
            multiple
          />
          <FileUp class="mr-2 h-6 w-6 text-gray-400" />
          <span class="text-center text-sm text-gray-600 dark:text-gray-400">
            carregue arquivos.<br />i.e. uma foto do objeto, um recibo, etc.
          </span>
        </div>

        <!-- Lista de arquivos anexados -->
        <div class="mt-2 flex flex-col">
          {#each claimAttachFiles as file, i}
            <div class="mb-1 flex items-center justify-between rounded bg-gray-100 p-2 dark:bg-gray-600">
              <span class="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
              <button
                type="button"
                class="p-1 text-red-500 hover:text-red-700"
                onclick={(e: Event) => {
                  e.stopPropagation();
                  handleRemoveFile(i);
                }}
              >
                <X class="h-6 w-6" />
              </button>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <p class="mt-2 mb-4 text-xs text-gray-600 dark:text-gray-400">
      A pessoa que cadastrou o objeto irá avaliar sua reivindicação com base nas informações fornecidas e fornecerá um retorno. Este espaço
      pode ser utilizado para dar feedback ou solicitar infos que não serão públicas na plataforma.
    </p>

    <!-- Mensagem de erro -->
    {#if error}
      <Alert color="red">
        Erro ao enviar reivindicação:
        <ul class="list-inside list-disc">
          {#each error.split('; ') as err}
            <li>{err}</li>
          {/each}
        </ul>
      </Alert>
    {/if}

    <!-- Botões de ação -->
    <div class="flex shrink-0 items-center space-x-3 rounded-b-lg rtl:space-x-reverse">
      <div class="flex w-full justify-end">
        <Button type="submit" value="submit" disabled={claimSubmiting || claimDescricao?.trim().length === 0}>Cadastrar</Button>
        <button
          type="button"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          onclick={() => (objetoClaim = false)}
        >
          <span class="sr-only">Fechar modal</span>
          <CloseOutline class="h-7 w-7" />
        </button>
      </div>
    </div>
  </form>
</Modal>
