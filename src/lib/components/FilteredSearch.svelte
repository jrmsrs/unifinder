<script lang="ts">
  import { goto } from '$app/navigation';
  import { dictCategorias, dictLocalidades, dictTipos } from '$lib/utils/dicionaries';
  import { Button, Heading, Helper, Input, Label, Modal, MultiSelect, Toggle } from 'flowbite-svelte';
  import { CloseOutline, FilterOutline, SearchOutline } from 'flowbite-svelte-icons';
  import { scale } from 'svelte/transition';

  let { query = undefined } = $props();

  // Mapeia dicionários para opções de seleção
  let locations: { value: ObjetoLocalidade; name: string }[] = Object.entries(dictLocalidades).map(([value, name]) => ({
    value: value as ObjetoLocalidade,
    name
  }));

  let tipoChoices: { value: ObjetoTipo; label: string }[] = Object.entries(dictTipos).map(([value, label]) => ({
    value: value as ObjetoTipo,
    label
  }));

  let categoriaChoices: { value: ObjetoCategoria; label: string }[] = Object.entries(dictCategorias).map(([value, label]) => ({
    value: value as ObjetoCategoria,
    label
  }));

  // Estado dos filtros
  let modal = $state(false);
  let search = $state(query?.search ?? '');
  let localidade = $state<string[]>(query?.localidade ?? []);
  let tipoSelected = $state(query?.tipo ?? []);
  let categoriaSelected = $state<string[]>(query?.categoria ?? []);
  let inativo = $state(query?.inativo ?? false);
  let tutela = $state(query?.usuario ? true : false);

  /** Remove campos vazios do objeto de filtros */
  const removeEmptyFields = (obj: Record<string, any>): Record<string, any> => {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => {
          if (Array.isArray(v)) return v.length > 0;
          if (typeof v === 'string') return v.trim() !== '';
          return Boolean(v);
        })
        .map(([k, v]) => [k, typeof v === 'object' && !Array.isArray(v) ? removeEmptyFields(v) : v])
        .filter(([_, v]) => {
          if (typeof v === 'object' && !Array.isArray(v)) return Object.keys(v).length > 0;
          return true;
        })
    );
  };
</script>

<div role="search" aria-label="Busca avançada" class="w-full max-w-full">
  <!-- Botão de busca principal -->
  <button
    type="button"
    class="flex h-12 w-full items-center text-white [&>span]:h-full"
    onclick={() => {
      modal = true;
    }}
  >
    <!-- Ícone de filtro -->
    <span
      class="
        content-center rounded-s-lg border border-e-0
        border-gray-800 bg-gray-700 px-4 whitespace-nowrap hover:bg-gray-800
        dark:border-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700
      "
    >
      <FilterOutline class="my-0.5 h-6 w-6" />
    </span>

    <!-- Campo de busca (visual) -->
    <span
      class="
        flex w-full min-w-0 cursor-text items-center gap-2 border border-solid
        border-gray-300 bg-white px-4 py-3
        dark:border-gray-600 dark:bg-gray-700
      "
    >
      <span
        class="
          block min-w-0 flex-1 overflow-hidden text-start text-ellipsis whitespace-nowrap
          {query?.search ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-300'}
        "
      >
        {query?.search ?? 'Buscar objetos...'}
      </span>
    </span>

    <!-- Ícone de busca -->
    <span
      class="
        content-center rounded-e-lg
        border-primary-800 bg-primary-700 px-4 hover:bg-primary-800
        dark:border-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700
      "
    >
      <SearchOutline class="h-6 w-6" />
    </span>
  </button>

  <!-- Modal de busca avançada -->
  <Modal
    class="w-11/12 shadow-2xl shadow-black backdrop:bg-transparent backdrop:backdrop-blur-sm"
    form
    dismissable={false}
    transition={scale}
    bind:open={modal}
    onaction={() => {
      modal = false;
      const filters = removeEmptyFields({
        search,
        tipo: tipoSelected,
        localidade,
        categorias: categoriaSelected,
        inativo,
        tutela
      });
      const queryParams = new URLSearchParams();
      for (const key in filters) {
        const value = filters[key];
        if (Array.isArray(value)) {
          value.forEach((item) => {
            queryParams.append(key, item);
          });
        } else {
          queryParams.set(key, value);
        }
      }
      goto(`/objetos?${queryParams.toString()}`);
    }}
  >
    {#snippet header()}
      <Heading tag="h5" class="text-center">Pesquisa filtrada</Heading>
    {/snippet}

    <div class="flex flex-col gap-4">
      <!-- Campo de busca textual -->
      <div>
        <Label for="search">Pesquisa por termo, descrição, andar, sala, etc</Label>
        <Input
          bind:value={search}
          id="search"
          type="text"
          placeholder="(opcional) Garrafinha, carregador, ..."
          class="not-[:placeholder-shown]:border-primary-600! not-[:placeholder-shown]:outline-primary-600! 
            dark:not-[:placeholder-shown]:border-primary-600! dark:not-[:placeholder-shown]:bg-primary-800
            dark:not-[:placeholder-shown]:outline-primary-600!"
        />
      </div>

      <!-- Filtro de tipo (achado/perdido) -->
      <div>
        <Label>Tipo de objeto</Label>
        <div class="grid grid-cols-2 flex-row text-center [&>label]:rounded-none [&>label]:first:rounded-l-lg [&>label]:last:rounded-r-lg">
          {#each tipoChoices as tipo (tipo.value)}
            <label
              class="
                col-span-1 block border border-solid border-gray-300 p-2 text-gray-900 focus-within:outline-2
                has-[:checked]:bg-primary-600
                has-[:checked]:text-white
                has-[:not(:checked)]:bg-transparent dark:border-gray-600
                dark:text-gray-400
              "
            >
              <input type="checkbox" id={tipo.value} bind:group={tipoSelected} value={tipo.value} class="absolute z-10 opacity-0" />
              {tipo.label}
            </label>
          {/each}
        </div>
      </div>

      <!-- Filtro de localidade -->
      <div>
        <Label for="localidade">Prédio/Localidade</Label>
        <MultiSelect
          id="localidade"
          class="[&>div]:top-[100%] [&>div]:max-h-64 [&>span>div]:bg-primary-100 [&>span>div]:text-primary-900 
            dark:[&>span>div]:bg-primary-700 dark:[&>span>div]:text-primary-100"
          bind:value={localidade}
          items={locations}
          placeholder="Todas"
        />
        <Helper>Selecione uma ou mais localidades</Helper>
      </div>

      <!-- Filtro de categoria -->
      <div>
        <Label>Categoria(s)</Label>
        <div class="my-1 flex flex-wrap justify-center gap-x-2 gap-y-2 text-center">
          {#each categoriaChoices as categoria (categoria.value)}
            <label
              class="
                block rounded border border-solid
                border-gray-300 p-2 text-gray-900
                focus-within:outline-2
                has-[:checked]:bg-primary-600
                has-[:checked]:text-white has-[:not(:checked)]:bg-transparent
                dark:border-gray-600 dark:text-gray-400
              "
            >
              <input
                type="checkbox"
                id={categoria.value}
                bind:group={categoriaSelected}
                value={categoria.value}
                class="absolute z-10 opacity-0"
              />
              {categoria.label}
            </label>
          {/each}
        </div>
        <Helper>Selecione uma ou mais categorias</Helper>
      </div>

      <!-- Toggle para incluir objetos inativos -->
      <div class="flex items-center justify-between">
        <Label for="inativo">
          Incluir objetos inativos
          <Helper>Objetos/anúncios resolvidos ou expirados</Helper>
        </Label>
        <Toggle id="inativo" color="primary" class="px-1" bind:checked={inativo} />
      </div>

      <!-- Toggle para filtrar objetos em acompanhamento -->
      <div class="flex items-center justify-between">
        <Label for="tutela">
          Apenas objetos acompanhados
          <Helper>Objetos/anúncios registrados por você ou sob sua responsabilidade</Helper>
        </Label>
        <Toggle id="tutela" color="primary" class="px-1" bind:checked={tutela} />
      </div>
    </div>

    {#snippet footer()}
      <div class="flex w-full justify-end">
        <Button type="submit" value="submit">Pesquisar</Button>
        <button
          type="button"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          onclick={() => (modal = false)}
        >
          <span class="sr-only">Fechar modal</span>
          <CloseOutline class="h-7 w-7" />
        </button>
      </div>
    {/snippet}
  </Modal>
</div>
