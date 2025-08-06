<script lang="ts">
  import { Button, Search } from 'flowbite-svelte';
  import { FilterOutline, SearchOutline } from 'flowbite-svelte-icons';
</script>

<div class="flex">
  <div class="relative">
    <Button
      color="secondary"
      class="rounded-e-none border border-e-0 border-primary-700 px-4 whitespace-nowrap"
    >
      <FilterOutline class="my-0.5 h-6 w-6" />
    </Button>
  </div>
  <Search
    placeholder="Buscar objetos..."
    size="lg"
    class="[&>div]:hidden [&>input]:rounded-none [&>input]:ps-4"
  />
  <Button class="rounded-s-none px-4!"><SearchOutline class="h-6 w-6" /></Button>
</div>
