<script lang="ts">
  let { key, value, icon }: { key: string; value: string; icon?: any } = $props();
</script>

<tr>
  <td class="font-semibold"> {key} </td>
  <td class="flex items-center gap-2">
    {#if icon}
      {@const IconComponent = icon}
      <IconComponent class="h-4 w-4" />
    {/if}
    <span>{value}</span>
  </td>
</tr>
