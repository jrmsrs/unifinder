<!-- src/lib/components/profile/Profile.svelte -->
<script lang="ts">
  import { Badge, Button, Heading, Modal, P } from 'flowbite-svelte';
  import { FacebookSolid, InstagramSolid, WhatsappSolid, XSolid } from 'flowbite-svelte-icons';
  import { Check, Copy, ExternalLink, Mail } from 'lucide-svelte';

  interface Contact {
    id: string;
    tipo: string;
    valor: string;
  }

  interface User {
    nome: string;
    username: string;
    contacts: Contact[];
  }

  interface Props {
    user: User;
    open?: boolean;
    onclose?: () => void;
  }

  let { user, open = $bindable(false), onclose }: Props = $props();

  // Estado dos botões de cópia
  let copiedStates = $state<Record<string, boolean>>({});

  // Definir tipos para as chaves do contactConfig
  type ContactType = 'email' | 'whatsapp' | 'instagram' | 'x' | 'facebook' | 'outro';

  // Configuração dos tipos de contato com tipagem explícita
  const contactConfig: Record<
    ContactType,
    {
      icon: any;
      label: string;
      getUrl: (value: string) => string;
      getDisplayValue: (value: string) => string;
    }
  > = {
    email: {
      icon: Mail,
      label: 'Email',
      getUrl: (value: string) => `mailto:${value}`,
      getDisplayValue: (value: string) => value
    },
    whatsapp: {
      icon: WhatsappSolid,
      label: 'WhatsApp',
      getUrl: (value: string) => `https://wa.me/${value.replace(/[^\d+]/g, '')}`,
      getDisplayValue: (value: string) => value
    },
    instagram: {
      icon: InstagramSolid,
      label: 'Instagram',
      getUrl: (value: string) => `https://instagram.com/${value.replace('@', '')}`,
      getDisplayValue: (value: string) => `@${value.replace('@', '')}`
    },
    x: {
      icon: XSolid,
      label: 'X (Twitter)',
      getUrl: (value: string) => `https://x.com/${value.replace('@', '')}`,
      getDisplayValue: (value: string) => `@${value.replace('@', '')}`
    },
    facebook: {
      icon: FacebookSolid,
      label: 'Facebook',
      getUrl: (value: string) => `https://facebook.com/${value}`,
      getDisplayValue: (value: string) => value
    },
    outro: {
      icon: Mail,
      label: 'Contato',
      getUrl: (value: string) => (value.startsWith('http') ? value : `#`),
      getDisplayValue: (value: string) => value
    }
  };

  // Filtrar e processar contatos
  let processedContacts = $derived(
    user.contacts
      .filter((contact) => contact.valor && contact.valor.trim() !== '')
      .map((contact) => {
        const config = contactConfig[contact.tipo as ContactType] || contactConfig.outro;
        return {
          ...contact,
          config,
          url: config.getUrl(contact.valor),
          displayValue: config.getDisplayValue(contact.valor)
        };
      })
  );

  // Função para copiar texto
  const copyToClipboard = async (text: string, contactId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      copiedStates[contactId] = true;

      // Reset após 2 segundos
      setTimeout(() => {
        copiedStates[contactId] = false;
      }, 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      copiedStates[contactId] = true;
      setTimeout(() => {
        copiedStates[contactId] = false;
      }, 2000);
    }
  };

  // Função para abrir link
  const openLink = (url: string) => {
    if (url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Fechar modal
  const closeModal = () => {
    onclose?.();
  };
</script>

<Modal bind:open onclose={closeModal} size="md" class="w-full">
  {#snippet header()}
    <div class="flex items-center space-x-3">
      <div class="flex-shrink-0">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <span class="text-lg font-semibold text-blue-600 dark:text-blue-300">
            {user.nome.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
      <div class="flex-grow">
        <Heading tag="h3" class="text-xl font-semibold text-gray-900 dark:text-white">
          {user.nome}
        </Heading>
        <P class="text-sm text-gray-600 dark:text-gray-400">@{user.username}</P>
      </div>
    </div>
  {/snippet}

  <div class="space-y-6">
    {#if processedContacts.length > 0}
      <div>
        <Heading tag="h4" class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Contatos</Heading>
        <div class="space-y-3 text-gray-900 dark:text-gray-100">
          {#each processedContacts as contact (contact.id)}
            <div
              class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
            >
              <div class="flex min-w-0 flex-grow items-center space-x-3 px-1">
                <contact.config.icon class="h-4 w-4" />
                <span class="max-w-[200px] truncate" title={contact.displayValue}>
                  {contact.displayValue}
                </span>
              </div>

              <div class="flex flex-shrink-0 items-center space-x-2">
                <!-- Botão de link externo -->
                {#if contact.url !== '#'}
                  <Button
                    size="xs"
                    color="blue"
                    outline
                    onclick={() => openLink(contact.url)}
                    class="flex items-center space-x-1"
                    aria-label={`Abrir ${contact.config.label}`}
                  >
                    <ExternalLink class="h-3 w-3" />
                  </Button>
                {/if}

                <!-- Botão de copiar -->
                <Button
                  size="xs"
                  color={copiedStates[contact.id] ? 'green' : 'gray'}
                  outline
                  onclick={() => copyToClipboard(contact.valor, contact.id)}
                  class="flex items-center space-x-1"
                  aria-label="Copiar contato"
                >
                  {#if copiedStates[contact.id]}
                    <Check class="h-3 w-3" />
                  {:else}
                    <Copy class="h-3 w-3" />
                  {/if}
                </Button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="py-8 text-center">
        <P class="text-gray-500 dark:text-gray-400">Este usuário ainda não adicionou contatos públicos.</P>
      </div>
    {/if}
  </div>

  {#snippet footer()}
    <div class="flex justify-end">
      <Button color="gray" onclick={closeModal}>Fechar</Button>
    </div>
  {/snippet}
</Modal>

<style>
  /* Melhorias visuais para truncate e responsividade */
  :global(.truncate) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
