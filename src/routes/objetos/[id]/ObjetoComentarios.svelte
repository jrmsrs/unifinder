<script lang="ts">
  import { enhance } from '$app/forms';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import { A, Alert, Button, Heading, P } from 'flowbite-svelte';
  import { TrashBinSolid } from 'flowbite-svelte-icons';

  type Streamed = { comentarios: Promise<{ comentarios: Comentario[] }>; objeto: Promise<Objeto | null> };
  let { data }: { data: { user: { id: string } | null; form?: string; commentError: string | null; streamed: Streamed } } = $props();
  let comentario = $state(data.form ?? '');
  let comentarioSubmiting = $state(false);
  let comentarioRemoving = $state(false);
</script>

<div id="comentarios" class="h-full">
  <Heading tag="h3" class="text-xl font-bold">
    Comentários
    {#await data.streamed.comentarios then { comentarios: c }}({c.length}){/await}
  </Heading>
  <div id="novo-comentario" class="mb-2 flex flex-col">
    {#await data.streamed.comentarios then}
      {#if data.user}
        <form
          method="post"
          action="?/createComentario"
          use:enhance={() => {
            comentarioSubmiting = true;
            return async ({ update }) => {
              await update();
              comentario = '';
              comentarioSubmiting = false;
            };
          }}
        >
          <textarea
            name="conteudo"
            class="
              mt-1 h-24 w-full resize-none rounded-lg border border-gray-300 bg-white p-2 text-sm shadow-sm outline-none
              placeholder:text-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500
              dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500
            "
            placeholder="Escreva seu comentário..."
            bind:value={comentario}
            required
          ></textarea>
          <Button type="submit" outline color="primary" class="mt-2" disabled={comentarioSubmiting}>Comentar</Button>
        </form>
      {:else}
        <P class="text-gray-700 dark:text-gray-400">
          Faça <A href="/auth">login</A> para comentar.
        </P>
      {/if}
    {/await}
  </div>
  {#if data.commentError}
    <Alert color="red" class="mb-2" dismissable>{data.commentError}</Alert>
  {/if}
  <div id="lista-comentarios" class="mt-6">
    {#await data.streamed.comentarios}
      {#each { length: 4 }}
        <Skeleton />
      {/each}
    {:then { comentarios }}
      {#if comentarios.length > 0}
        {#each comentarios as comentario}
          <div class="mb-4 text-sm">
            <div class="mb-1 flex items-center gap-2">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full"
                style="background-color: hsl({parseInt(comentario.user_id.slice(0, 6), 16)}, 50%, 50%)"
              >
                {String(comentario.username).charAt(0).toUpperCase()}
              </div>
              <div>
                <span class="font-semibold">{comentario.username}</span>
                <span class="text-xs font-normal">•</span>
                <span class="text-xs font-normal">{new Date(comentario.publicado_em).toLocaleDateString()}</span>
              </div>
              {#await data.streamed.objeto then objeto}
                {#if data.user?.id === comentario.user_id || data.user?.id === objeto?.user_id}
                  <form
                    class="ml-auto"
                    method="post"
                    action="?/deleteComentario"
                    use:enhance={() => {
                      comentarioRemoving = true;
                      return async ({ update }) => {
                        await update();
                        comentarioRemoving = false;
                      };
                    }}
                  >
                    <input type="hidden" name="id" value={comentario.id} />
                    <Button type="submit" outline color="red" size="xs" disabled={comentarioRemoving}>
                      <TrashBinSolid class="h-4 w-4" />
                    </Button>
                  </form>
                {/if}
              {/await}
            </div>
            <div class="flex gap-2">
              <p>{comentario.conteudo}</p>
            </div>
          </div>
        {/each}
      {:else}
        <P class="text-gray-700 dark:text-gray-400">Nenhum comentário ainda.</P>
      {/if}
    {:catch error}
      <p class="text-red-500">Erro ao carregar os comentários: {error.message}</p>
    {/await}
  </div>
</div>
