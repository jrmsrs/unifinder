<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { Alert, Avatar, Button, Card, Helper, Input, Label, Spinner, TabItem, Tabs } from 'flowbite-svelte';
  import { CheckCircle, Eye, EyeOff, LogOut, Save, Shield, TriangleAlertIcon, User } from 'lucide-svelte';
  import { onMount } from 'svelte';

  let { data, form } = $props();
  let { supabase, profile } = $derived(data);

  let isSubmitting = $state(false);
  let showPassword = $state(false);
  let showConfirmPassword = $state(false);

  let formData = $derived({
    username: profile?.username || '',
    nome: profile?.nome || '',
    email: data.user?.email || data.session?.user?.email || '',
    whatsapp: profile?.whatsapp || '',
    instagram: profile?.instagram || '',
    xTwitter: profile?.x_twitter || '',
    facebook: profile?.facebook || ''
  });

  $effect(() => {
    if (profile) {
      formData.username = profile.username || '';
      formData.nome = profile.nome || '';
      formData.email = data.user?.email || data.session?.user?.email || '';
      formData.whatsapp = profile.whatsapp || '';
      formData.instagram = profile.instagram || '';
      formData.xTwitter = profile.x_twitter || '';
      formData.facebook = profile.facebook || '';
    }
  });

  // Dados do formulário de senha
  let passwordData = $state({
    newPassword: '',
    confirmPassword: ''
  });

  // Função de logout
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
      goto('/error');
    } else {
      goto('/auth');
    }
  };

  // Atualizar dados quando o form retorna
  onMount(() => {
    if (form?.success || form?.passwordSuccess) {
      // Limpar campos de senha após sucesso
      passwordData.newPassword = '';
      passwordData.confirmPassword = '';
    }
  });
</script>

<svelte:head>
  <title>UniFinder: Perfil Privado</title>
  <meta name="description" content="Gerencie suas informações pessoais e configurações de conta" />
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6 p-4">
  <!-- Header da página -->
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-4">
      <Avatar src={profile?.avatar_url} alt={profile?.username || 'Avatar'} class="h-16 w-16" />
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Olá, {profile?.nome?.split(' ')[0] || data.user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário'}!
        </h1>
        <p class="text-gray-600 dark:text-gray-400">Gerencie suas informações pessoais</p>
      </div>
    </div>
    <Button color="red" outline onclick={logout} class="flex items-center space-x-2">
      <LogOut class="h-4 w-4" />
      <span>Sair</span>
    </Button>
  </div>

  <!-- Alertas de feedback -->
  {#if form?.success}
    <Alert color="green" dismissable class="flex items-center space-x-2">
      <CheckCircle class="h-5 w-5" />
      <span>{form.success}</span>
    </Alert>
  {/if}

  {#if form?.passwordSuccess}
    <Alert color="green" dismissable class="flex items-center space-x-2">
      <CheckCircle class="h-5 w-5" />
      <span>{form.passwordSuccess}</span>
    </Alert>
  {/if}

  {#if form?.error}
    <Alert color="red" dismissable class="flex items-center space-x-2">
      <TriangleAlertIcon class="h-5 w-5" />
      <span>{form.error}</span>
    </Alert>
  {/if}

  {#if form?.passwordError}
    <Alert color="red" dismissable class="flex items-center space-x-2">
      <TriangleAlertIcon class="h-5 w-5" />
      <span>{form.passwordError}</span>
    </Alert>
  {/if}

  <!-- Tabs de navegação -->
  <Tabs
    style="underline"
    contentClass="flex rounded-lg divide-x rtl:divide-x-reverse divide-gray-200 shadow dark:divide-gray-700 w-full [&>div]:w-full"
  >
    <TabItem open class="flex items-center space-x-2" title="Informações Pessoais">
      <User class="h-4 w-4" />
      <span>Informações Pessoais</span>
      <form
        method="POST"
        action="?/updateProfile"
        use:enhance={() => {
          isSubmitting = true;
          return async ({ update }) => {
            await update();
            isSubmitting = false;
          };
        }}
        class="space-y-6"
      >
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <!-- Username -->
          <div>
            <Label for="username" class="mb-2">Nome de Usuário *</Label>
            <Input
              id="username"
              name="username"
              bind:value={formData.username}
              placeholder="Seu nome de usuário"
              required
              minlength={3}
              class="w-full"
            />
            <Helper class="text-xs">Mínimo 3 caracteres</Helper>
          </div>

          <!-- Full Name -->
          <div>
            <Label for="fullName" class="mb-2">Nome Completo *</Label>
            <Input
              id="fullName"
              name="fullName"
              bind:value={formData.nome}
              placeholder="Seu nome completo"
              required
              minlength={2}
              class="w-full"
            />
            <Helper class="text-xs">Mínimo 2 caracteres</Helper>
          </div>

          <!-- Email (readonly) -->
          <div class="md:col-span-2">
            <Label for="email" class="mb-2">Email</Label>
            <Input id="email" value={formData.email} readonly class="w-full bg-gray-50 dark:bg-gray-800" />
            <Helper class="text-xs">O email não pode ser alterado aqui</Helper>
          </div>
        </div>

        <!-- Seção de Contatos/Redes Sociais -->
        <div class="border-t pt-6">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Contatos e Redes Sociais</h3>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- WhatsApp -->
            <div>
              <Label for="whatsapp" class="mb-2">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                bind:value={formData.whatsapp}
                placeholder="+55 11 99999-9999"
                type="tel"
                class="w-full"
              />
              <Helper class="text-xs">Número com código do país</Helper>
            </div>

            <!-- Instagram -->
            <div>
              <Label for="instagram" class="mb-2">Instagram</Label>
              <Input id="instagram" name="instagram" bind:value={formData.instagram} placeholder="@seu_usuario" class="w-full" />
              <Helper class="text-xs">Apenas o nome de usuário, sem @</Helper>
            </div>

            <!-- X (Twitter) -->
            <div>
              <Label for="xTwitter" class="mb-2">X (Twitter)</Label>
              <Input id="xTwitter" name="xTwitter" bind:value={formData.xTwitter} placeholder="@seu_usuario" class="w-full" />
              <Helper class="text-xs">Apenas o nome de usuário, sem @</Helper>
            </div>

            <!-- Facebook -->
            <div>
              <Label for="facebook" class="mb-2">Facebook</Label>
              <Input id="facebook" name="facebook" bind:value={formData.facebook} placeholder="seu.usuario" class="w-full" />
              <Helper class="text-xs">Nome de usuário ou ID do Facebook</Helper>
            </div>
          </div>
        </div>

        <!-- Botão de Salvar -->
        <div class="flex justify-end border-t pt-6">
          <Button type="submit" color="blue" disabled={isSubmitting} class="flex items-center space-x-2">
            {#if isSubmitting}
              <Spinner class="h-4 w-4" />
            {:else}
              <Save class="h-4 w-4" />
            {/if}
            <span>Salvar Alterações</span>
          </Button>
        </div>
      </form>
    </TabItem>

    <TabItem class="flex items-center space-x-2" title="Segurança">
      <Shield class="h-4 w-4" />
      <span>Segurança</span>

      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Alterar Senha</h3>
      <form
        method="POST"
        action="?/changePassword"
        use:enhance={() => {
          isSubmitting = true;
          return async ({ update }) => {
            await update();
            isSubmitting = false;
          };
        }}
        class="space-y-6"
      >
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <!-- Nova Senha -->
          <div>
            <Label for="newPassword" class="mb-2">Nova Senha *</Label>
            <div class="relative">
              <Input
                id="newPassword"
                name="newPassword"
                bind:value={passwordData.newPassword}
                type={showPassword ? 'text' : 'password'}
                placeholder="Nova senha"
                required
                minlength={6}
                class="w-full pr-10"
              />
              <button
                type="button"
                onclick={() => (showPassword = !showPassword)}
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {#if showPassword}
                  <EyeOff class="h-5 w-5" />
                {:else}
                  <Eye class="h-5 w-5" />
                {/if}
              </button>
            </div>
            <Helper class="text-xs">Mínimo 6 caracteres</Helper>
          </div>

          <!-- Confirmar Senha -->
          <div>
            <Label for="confirmPassword" class="mb-2">Confirmar Nova Senha *</Label>
            <div class="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                bind:value={passwordData.confirmPassword}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirme a nova senha"
                required
                minlength={6}
                class="w-full pr-10"
              />
              <button
                type="button"
                onclick={() => (showConfirmPassword = !showConfirmPassword)}
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {#if showConfirmPassword}
                  <EyeOff class="h-5 w-5" />
                {:else}
                  <Eye class="h-5 w-5" />
                {/if}
              </button>
            </div>
            <Helper class="text-xs">Digite a mesma senha novamente</Helper>
          </div>
        </div>

        <!-- Botão de Alterar Senha -->
        <div class="flex justify-end border-t pt-6">
          <Button type="submit" color="red" disabled={isSubmitting} class="flex items-center space-x-2">
            {#if isSubmitting}
              <Spinner class="h-4 w-4" />
            {:else}
              <Shield class="h-4 w-4" />
            {/if}
            <span>Alterar Senha</span>
          </Button>
        </div>
      </form>
    </TabItem>
  </Tabs>
</div>

<style>
  /* Adiciona transições suaves */
  :global(.transition-all) {
    transition: all 0.3s ease;
  }

  /* Melhora o foco nos inputs */
  :global(.focus\:ring-2:focus) {
    transition: all 0.2s ease;
  }
</style>
