<script lang="ts">
  import { Modal } from 'flowbite-svelte';
  import { onMount } from 'svelte';

  onMount(() => {
    const scroll = document.getElementById('scroll');
    scroll?.style.setProperty('overflow', 'hidden');
    return () => {
      scroll?.style.removeProperty('overflow');
    };
  });
</script>

<div
  class="fixed right-0 bottom-0 left-0 z-30 flex h-[calc(100%-4rem)] w-full items-center justify-center p-4 backdrop-blur-sm md:h-[calc(100%-8rem)]"
>
  <Modal
    modal={false}
    class="
      relative! top-auto left-auto max-h-full w-11/12 max-w-sm -translate-x-0 -translate-y-0 text-gray-900 shadow-2xl shadow-black
      sm:max-w-md md:max-w-3xl xl:max-w-4xl dark:text-white [&>*]:grid [&>*]:grid-cols-5 [&>*]:gap-4 [&>*]:p-4
    "
    size="lg"
    permanent={true}
    dismissable={false}
    open={true}
  >
    <slot />
  </Modal>
</div>
