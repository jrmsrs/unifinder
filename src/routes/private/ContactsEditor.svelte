<!-- src/lib/components/profile/ContactsEditor.svelte -->
<script lang="ts">
  import { Button, Helper, Input, Select } from 'flowbite-svelte';
  import { Check, Edit3, Plus, X, XCircle } from 'lucide-svelte';

  interface Contact {
    id: string;
    type: string;
    value: string;
    editing?: boolean;
  }

  interface Props {
    contacts?: Contact[];
    onchange?: (contacts: Contact[]) => void;
  }

  let { contacts = [], onchange }: Props = $props();

  // Estado local dos contatos
  let localContacts = $state<Contact[]>([]);

  // Controles do formulário de criação
  let newType = $state('email');
  let newValue = $state('');

  // Tipos de contato disponíveis
  const contactTypes = [
    { value: 'email', name: 'Email' },
    { value: 'whatsapp', name: 'WhatsApp' },
    { value: 'instagram', name: 'Instagram' },
    { value: 'x', name: 'X (Twitter)' },
    { value: 'facebook', name: 'Facebook' },
    { value: 'outro', name: 'Outro' }
  ];

  // Sincronizar com props iniciais
  $effect(() => {
    localContacts = contacts.map((c) => ({ ...c, editing: false }));
  });

  // Emitir mudanças para o parent
  const emitChange = () => {
    const cleanContacts = localContacts.map(({ editing, ...contact }) => contact);
    onchange?.(cleanContacts);
  };

  // Adicionar novo contato
  const addContact = () => {
    if (!newValue.trim()) return;

    const newContact: Contact = {
      id: crypto.randomUUID(),
      type: newType,
      value: newValue.trim(),
      editing: false
    };

    localContacts = [...localContacts, newContact];
    newValue = '';
    emitChange();
  };

  // Iniciar edição
  const startEdit = (id: string) => {
    localContacts = localContacts.map((c) => (c.id === id ? { ...c, editing: true } : c));
  };

  // Salvar edição
  const saveEdit = (id: string) => {
    localContacts = localContacts.map((c) => (c.id === id ? { ...c, editing: false } : c));
    emitChange();
  };

  // Cancelar edição
  const cancelEdit = (id: string) => {
    localContacts = localContacts.map((c) => (c.id === id ? { ...c, editing: false } : c));
  };

  // Remover contato
  const removeContact = (id: string) => {
    localContacts = localContacts.filter((c) => c.id !== id);
    emitChange();
  };

  // Handle Enter/Escape nas edições
  const handleEditKeydown = (event: KeyboardEvent, id: string) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveEdit(id);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelEdit(id);
    }
  };

  // Handle Enter no formulário de criação
  const handleNewKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addContact();
    }
  };

  // Obter label do tipo
  const getTypeLabel = (type: string) => {
    return contactTypes.find((t) => t.value === type)?.name || type;
  };
</script>

<div class="space-y-4">
  <!-- Formulário de criação -->
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

  <!-- Lista de contatos -->
  {#if localContacts.length > 0}
    <div class="space-y-2">
      {#each localContacts as contact (contact.id)}
        <div class="flex items-center gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
          {#if contact.editing}
            <!-- Modo edição -->
            <div class="w-20 flex-shrink-0">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getTypeLabel(contact.type)}
              </span>
            </div>
            <div class="flex-grow">
              <Input bind:value={contact.value} onkeydown={(e) => handleEditKeydown(e, contact.id)} class="w-full" autofocus />
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
            <!-- Modo exibição -->
            <div class="w-20 flex-shrink-0">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getTypeLabel(contact.type)}
              </span>
            </div>
            <div class="flex-grow">
              <span class="text-gray-900 dark:text-gray-100">
                {contact.value}
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
    <div class="py-4 text-center text-gray-500 dark:text-gray-400">
      <p class="text-sm">Nenhum contato adicionado ainda.</p>
      <Helper class="mt-1 text-xs">Use o formulário acima para adicionar contatos.</Helper>
    </div>
  {/if}
</div>
