<script lang="ts">
  import { enhance } from '$app/forms';
  import { Alert, Button, Heading, Helper, Label, Modal, Textarea } from 'flowbite-svelte';
  import { CloseOutline } from 'flowbite-svelte-icons';
  import { scale } from 'svelte/transition';

  let { objetoFinish = $bindable(), error } = $props();
  let motivoFinalizacao: string = $state('');
  let finishSubmiting = $state(false);

  $effect(() => {
    if (error) {
      finishSubmiting = false;
    }
  });
</script>

<Modal
  class="w-11/12 shadow-2xl shadow-black backdrop:bg-transparent backdrop:backdrop-blur-sm"
  dismissable={false}
  transition={scale}
  bind:open={objetoFinish}
>
  {#snippet header()}
    <Heading tag="h5" class="text-center">Finalizar Objeto</Heading>
  {/snippet}
  <form
    id="finishObjetoForm"
    class="flex flex-col gap-4"
    method="POST"
    action="?/finishObjeto"
    use:enhance={() => {
      finishSubmiting = true;
      return async ({ update }) => {
        await update();
        finishSubmiting = false;
        (document.getElementById('finishObjetoForm') as HTMLFormElement).reset();
        objetoFinish = false;
      };
    }}
  >
    <div>
      <Label>
        Motivo da finalização <span class="text-red-400">*</span>
        <Textarea
          bind:value={motivoFinalizacao}
          name="motivo_finalizacao"
          placeholder="Descreva o motivo da finalização do objeto (ex: foi encontrado pelo dono, foi devolvido, etc.)"
          class="w-full dark:border-gray-600! dark:bg-gray-700!"
          rows={4}
        />
      </Label>
      <Helper class="text-xs text-gray-500 dark:text-gray-400">
        Esta ação marcará o objeto como finalizado e não poderá ser desfeita.
      </Helper>
    </div>

    {#if error}
      <Alert color="red">
        Erro ao finalizar objeto:
        <ul class="list-inside list-disc">
          {#each error.split('; ') as err}
            <li>{err}</li>
          {/each}
        </ul>
      </Alert>
    {/if}

    <div class="flex shrink-0 items-center space-x-3 rounded-b-lg p-4 md:p-5 rtl:space-x-reverse">
      <div class="flex w-full justify-end gap-2">
        <Button color="alternative" onclick={() => (objetoFinish = false)}>Cancelar</Button>
        <Button type="submit" color="red" disabled={finishSubmiting || motivoFinalizacao?.trim().length === 0}>Finalizar Objeto</Button>
        <button
          type="button"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          onclick={() => (objetoFinish = false)}
        >
          <span class="sr-only">Fechar modal</span>
          <CloseOutline class="h-7 w-7" />
        </button>
      </div>
    </div>
  </form>
</Modal>
