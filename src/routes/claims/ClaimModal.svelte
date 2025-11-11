<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import ImageLoader from '$lib/components/ImageLoader.svelte';
  import { Badge, Button, Heading, Label, Modal, Textarea } from 'flowbite-svelte';
  import { Check, CheckCircle2, X } from 'lucide-svelte';
  import { formatDate, getStatusBadgeColor, getStatusText, isStatusAprovada, isStatusConcluida, type Claim } from './types';

  let {
    claim,
    open = $bindable(),
    isClaimForApproval,
    onClose
  }: {
    claim: Claim | null;
    open: boolean;
    isClaimForApproval: boolean;
    onClose: () => void;
  } = $props();

  let actionSubmiting = $state(false);
  let motivo = $state('');

  /** Navega para a página do objeto associado à reivindicação */
  const navigateToObjeto = () => {
    if (claim?.objeto?.id) {
      const objetoId = claim.objeto.id;
      onClose();
      goto(`/objetos/${objetoId}`);
    }
  };
</script>

{#if claim}
  <Modal class="w-11/12 shadow-2xl shadow-black backdrop:bg-transparent backdrop:backdrop-blur-sm" bind:open>
    {#snippet header()}
      <Heading tag="h5" class="text-center">Detalhes da Reivindicação</Heading>
    {/snippet}

    <div class="space-y-4">
      <!-- Informações do objeto -->
      {#if claim.objeto}
        <div>
          <h3 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Objeto Reivindicado</h3>
          <div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <ImageLoader src={claim.objeto.url_imagem} alt={claim.objeto.nome} class="h-16 w-16 rounded-lg object-cover" />
            <div class="flex-1">
              <p class="font-medium text-gray-900 dark:text-white">{claim.objeto.nome}</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">{claim.objeto.descricao}</p>
            </div>
            <Button size="xs" color="primary" onclick={navigateToObjeto}>Ver objeto</Button>
          </div>
        </div>
      {/if}

      <div>
        <h3 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Descrição</h3>
        <p class="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">{claim.descricao}</p>
      </div>

      <!-- Evidências anexadas -->
      {#if claim.evidencias && claim.evidencias.length > 0}
        <div>
          <h3 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Evidências</h3>
          <div class="grid grid-cols-2 gap-2">
            {#each claim.evidencias as evidencia}
              <ImageLoader src={evidencia} alt="Evidência" class="h-32 w-full rounded-lg object-cover" />
            {/each}
          </div>
        </div>
      {/if}

      <div>
        <h3 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Data da Reivindicação</h3>
        <p class="text-sm text-gray-700 dark:text-gray-300">{formatDate(claim.data_registro)}</p>
      </div>

      <div>
        <h3 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Status</h3>
        <Badge color={getStatusBadgeColor(claim.status)}>
          {getStatusText(claim.status)}
        </Badge>
      </div>
    </div>

    <!-- Ações de aprovação/rejeição (apenas para tutores e claims pendentes) -->
    {#if isClaimForApproval && (claim.status === 'pendente' || claim.status === 'PENDENTE')}
      <div class="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div class="mb-4">
          <Label for="motivo" class="mb-2 block font-semibold">Réplica (Obrigatório)</Label>
          <Textarea
            id="motivo"
            rows={4}
            bind:value={motivo}
            placeholder={'"Parece legítimo", "Falta evidência", "Me chama no privado (21) 99999-9999", etc.'}
            class="focus:ring-opacity-50 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          />
          <p class="mb-2 text-xs text-gray-600 dark:text-gray-400">
            Digite o motivo da aprovação ou rejeição. O espaço pode ser utilizado para dar feedback ou solicitar infos que não serão
            públicas na plataforma.
          </p>
        </div>

        <div class="flex justify-end gap-3">
          <form
            method="POST"
            action="?/rejectClaim"
            use:enhance={() => {
              actionSubmiting = true;
              return async ({ update }) => {
                await update();
                actionSubmiting = false;
                onClose();
              };
            }}
          >
            <input type="hidden" name="claimId" value={claim.id} />
            <input type="hidden" name="motivo" value={motivo} />
            <Button type="submit" color="red" disabled={actionSubmiting || motivo.trim() === ''}>
              <X class="mr-2 h-4 w-4" />
              Rejeitar
            </Button>
          </form>
          <form
            method="POST"
            action="?/approveClaim"
            use:enhance={() => {
              actionSubmiting = true;
              return async ({ update }) => {
                await update();
                actionSubmiting = false;
                onClose();
              };
            }}
          >
            <input type="hidden" name="claimId" value={claim.id} />
            <input type="hidden" name="motivo" value={motivo} />
            <Button type="submit" color="green" disabled={actionSubmiting || motivo.trim() === ''}>
              <Check class="mr-2 h-4 w-4" />
              Aprovar
            </Button>
          </form>
        </div>
      </div>
    {/if}

    <!-- Ação de finalizar (apenas para usuário que abriu a reivindicação e claims aprovadas, não concluídas) -->
    {#if !isClaimForApproval && isStatusAprovada(claim.status) && !isStatusConcluida(claim.status)}
      <div class="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
        <form
          method="POST"
          action="?/finalizeClaim"
          use:enhance={() => {
            actionSubmiting = true;
            return async ({ update }) => {
              await update();
              actionSubmiting = false;
              onClose();
            };
          }}
        >
          <input type="hidden" name="claimId" value={claim.id} />
          <Button type="submit" color="green" disabled={actionSubmiting}>
            <CheckCircle2 class="mr-2 h-4 w-4" />
            Finalizar
          </Button>
        </form>
      </div>
    {/if}

    <!-- Indicador de reivindicação concluída -->
    {#if !isClaimForApproval && isStatusConcluida(claim.status)}
      <div class="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <CheckCircle2 class="h-5 w-5 text-blue-500" />
          <span>Reivindicação finalizada com sucesso</span>
        </div>
      </div>
    {/if}
  </Modal>
{/if}
