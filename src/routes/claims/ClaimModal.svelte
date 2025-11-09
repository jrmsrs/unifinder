<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import ImageLoader from '$lib/components/ImageLoader.svelte';
  import { Badge, Button, Heading, Modal } from 'flowbite-svelte';
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
  <Modal bind:open>
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
        <h3 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Data da Ocorrência</h3>
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
      <div class="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
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
          <Button type="submit" color="light" disabled={actionSubmiting}>
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
          <Button type="submit" color="primary" disabled={actionSubmiting}>
            <Check class="mr-2 h-4 w-4" />
            Aprovar
          </Button>
        </form>
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
