<script lang="ts">
  import { enhance } from '$app/forms';
  import { Alert, Button, Heading, Helper, Label, Modal, Textarea } from 'flowbite-svelte';
  import { CloseOutline } from 'flowbite-svelte-icons';
  import { FileUp } from 'lucide-svelte';
  import { scale } from 'svelte/transition';

  let { objetoClaim = $bindable(), error } = $props();
  let claimDescricao: string = $state('');
  let claimAttachFile: File | undefined = $state(undefined);
  let claimSubmiting = $state(false);

  function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande (máx 5MB)');
        target.value = '';
        claimAttachFile = undefined;
        return;
      }
      claimAttachFile = file;
    }
  }

  function handleRemoveImage() {
    claimAttachFile = undefined;
  }

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
    class="flex flex-col gap-4"
    method="POST"
    action="?/claimObjeto"
    enctype="multipart/form-data"
    use:enhance={() => {
      claimSubmiting = true;
      return async ({ update }) => {
        await update();
      };
    }}
  >
    <div>
      <Label>
        Descreva por que você acredita que o objeto é seu <span class="text-red-400">*</span>
        <Textarea
          bind:value={claimDescricao}
          name="descricao"
          placeholder="Descreva informações sobre o objeto, como você o perdeu, onde e quando, etc."
          class="w-full dark:border-gray-600! dark:bg-gray-700!"
          rows={4}
        />
      </Label>
    </div>
    <div>
      <Label>Anexe documentos/imagens comprobatórios (opcional)</Label>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        class="relative flex h-64 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        onclick={() => document.getElementById('imageInput')?.click()}
        role="button"
        tabindex="0"
      >
        {#if claimAttachFile}
          <div class="flex h-full w-full flex-col items-center justify-center p-4">
            <p class="mb-2 text-center text-sm">{claimAttachFile.name}</p>
            <Button
              outline
              color="red"
              onclick={(e: Event) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
            >
              Remover arquivo
            </Button>
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center">
            <FileUp class="mb-2 h-12 w-12" />
            <p class="text-center text-sm">Clique para selecionar um arquivo (máx 5MB)</p>
          </div>
        {/if}
        <input
          type="file"
          id="imageInput"
          name="comprovativo"
          accept="image/*,application/pdf"
          class="absolute inset-0 h-full w-full opacity-0"
          onchange={handleFileSelect}
        />
      </div>
    </div>

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

    <div class="flex shrink-0 items-center space-x-3 rounded-b-lg p-4 md:p-5 rtl:space-x-reverse">
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
