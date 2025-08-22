<script lang="ts">
  let { children } = $props();
</script>

<table class="mt-1 w-full table-auto">
  <tbody class="[&>tr>td:first-child]:pe-1 [&>tr>td:last-child]:ps-1">
    {@render children()}
  </tbody>
</table>
