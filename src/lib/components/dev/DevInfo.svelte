<script lang="ts">
  let { content = 'nothing' } = $props();
</script>

<details
  class="no-scrollbar fixed bottom-0 left-0 z-15 max-h-40 max-w-full overflow-auto rounded-md bg-primary-500 text-white"
>
  <summary class="sticky top-0 w-full cursor-pointer bg-primary-600 p-2">dev</summary>
  <pre class="no-scrollbar overflow-auto p-2 text-nowrap">{content}</pre>
</details>
