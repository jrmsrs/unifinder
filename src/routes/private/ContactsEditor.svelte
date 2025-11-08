<script lang="ts">
  import { Button, Helper, Input, Select } from 'flowbite-svelte';
  import { Check, Edit3, Plus, X, XCircle } from 'lucide-svelte';

  interface Contact {
    id: string;
    tipo: string;
    valor: string;
    editing?: boolean;
  }

  interface Props {
    contacts?: Contact[];
    onchange?: (contacts: Contact[]) => void;
  }

  let { contacts = [], onchange }: Props = $props();

  // Estado local dos contatos com controle de edição
  let localContacts = $state<Contact[]>([]);

  // Controle de sincronização para evitar loops reativos
  let lastContactsSnapshot = $state('');
  let isUpdatingFromInternal = $state(false);

  // Estados do formulário de novo contato
  let newType = $state('email');
  let newValue = $state('');

  const contactTypes = [
    { value: 'email', name: 'Email' },
    { value: 'whatsapp', name: 'WhatsApp' },
    { value: 'instagram', name: 'Instagram' },
    { value: 'x', name: 'X (Twitter)' },
    { value: 'facebook', name: 'Facebook' },
    { value: 'outro', name: 'Outro' }
  ];

  // Sincronização bidirecional: props → estado local
  $effect(() => {
    const currentContactsSnapshot = JSON.stringify(contacts);
    if (currentContactsSnapshot !== lastContactsSnapshot && !isUpdatingFromInternal) {
      localContacts = contacts.map((c) => ({ ...c, editing: false }));
      lastContactsSnapshot = currentContactsSnapshot;
    }
    if (isUpdatingFromInternal) {
      isUpdatingFromInternal = false;
    }
  });

  /** Emite mudanças para o callback onchange */
  const emitChange = () => {
    const cleanContacts = localContacts.map(({ editing, ...contact }) => contact);

    isUpdatingFromInternal = true;
    lastContactsSnapshot = JSON.stringify(cleanContacts);

    onchange?.(cleanContacts);
  };

  /** Adiciona novo contato à lista */
  const addContact = () => {
    if (!newValue.trim()) return;

    const newContact: Contact = {
      id: crypto.randomUUID(),
      tipo: newType,
      valor: newValue.trim(),
      editing: false
    };

    localContacts = [...localContacts, newContact];
    newValue = '';
    emitChange();
  };

  /** Inicia edição de um contato */
  const startEdit = (id: string) => {
    localContacts = localContacts.map((c) => (c.id === id ? { ...c, editing: true } : c));
  };

  /** Salva edição de um contato */
  const saveEdit = (id: string) => {
    localContacts = localContacts.map((c) => (c.id === id ? { ...c, editing: false } : c));
    emitChange();
  };

  /** Cancela edição de um contato */
  const cancelEdit = (id: string) => {
    const originalContact = contacts.find((c) => c.id === id);
    if (originalContact) {
      localContacts = localContacts.map((c) => (c.id === id ? { ...originalContact, editing: false } : c));
    } else {
      localContacts = localContacts.map((c) => (c.id === id ? { ...c, editing: false } : c));
    }
  };

  /** Remove um contato da lista */
  const removeContact = (id: string) => {
    localContacts = localContacts.filter((c) => c.id !== id);
    emitChange();
  };

  /** Manipula eventos de teclado na edição */
  const handleEditKeydown = (event: KeyboardEvent, id: string) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveEdit(id);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelEdit(id);
    }
  };
  /** Manipula eventos de teclado no novo contato */
  const handleNewKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addContact();
    }
  };

  /** Obtém o rótulo legível para um tipo de contato */
  const getTypeLabel = (type: string) => {
    return contactTypes.find((t) => t.value === type)?.name || type;
  };
</script>

<div class="space-y-4">
  <!-- Formulário para adicionar novo contato -->
  <div class="flex items-end gap-2">
    <div class="w-32 flex-shrink-0">
      <Select bind:value={newType} items={contactTypes} class="w-full" />
    </div>
    <div class="flex-grow">
      <Input bind:value={newValue} placeholder="Digite o contato..." onkeydown={handleNewKeydown} class="w-full" />
    </div>
    <div class="flex-shrink-0">
      <Button
        color="blue"
        onclick={addContact}
        disabled={!newValue.trim()}
        class="flex h-10 w-10 items-center justify-center"
        aria-label="Adicionar contato"
      >
        <Plus class="h-4 w-4" />
      </Button>
    </div>
  </div>

  <!-- Lista de contatos com edição inline -->
  {#if localContacts.length > 0}
    <div class="space-y-2">
      {#each localContacts as contact (contact.id)}
        <div class="flex items-center gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
          {#if contact.editing}
            <!-- Modo edição: input + controles -->
            <div class="w-20 flex-shrink-0">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getTypeLabel(contact.tipo)}
              </span>
            </div>
            <div class="flex-grow">
              <Input bind:value={contact.valor} onkeydown={(e) => handleEditKeydown(e, contact.id)} class="w-full" autofocus />
            </div>
            <div class="flex flex-shrink-0 gap-1">
              <Button color="green" size="xs" onclick={() => saveEdit(contact.id)} aria-label="Salvar">
                <Check class="h-3 w-3" />
              </Button>
              <Button color="gray" size="xs" onclick={() => cancelEdit(contact.id)} aria-label="Cancelar">
                <XCircle class="h-3 w-3" />
              </Button>
            </div>
          {:else}
            <!-- Modo visualização: texto + ações -->
            <div class="w-20 flex-shrink-0">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getTypeLabel(contact.tipo)}
              </span>
            </div>
            <div class="flex-grow">
              <span class="text-gray-900 dark:text-gray-100">
                {contact.valor}
              </span>
            </div>
            <div class="flex flex-shrink-0 gap-1">
              <Button color="blue" size="xs" onclick={() => startEdit(contact.id)} aria-label="Editar">
                <Edit3 class="h-3 w-3" />
              </Button>
              <Button color="red" size="xs" onclick={() => removeContact(contact.id)} aria-label="Remover">
                <X class="h-3 w-3" />
              </Button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <!-- Estado vazio -->
    <div class="py-4 text-center text-gray-500 dark:text-gray-400">
      <p class="text-sm">Nenhum contato adicionado ainda.</p>
      <Helper class="mt-1 text-xs">Use o formulário acima para adicionar contatos.</Helper>
    </div>
  {/if}
</div>
