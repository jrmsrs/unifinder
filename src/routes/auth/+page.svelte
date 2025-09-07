<script lang="ts">
  import DevInfo from '$lib/components/dev/DevInfo.svelte';
  import { A, Alert, Button, Heading, Hr, Input, Label, Modal, P } from 'flowbite-svelte';
  import { GoogleSolid } from 'flowbite-svelte-icons';
  import { AtSign } from 'lucide-svelte';
  import type { PageData } from './$types';

  let {
    data,
    username = $bindable(data.form ? (data.form.username ?? '') : ''),
    email = $bindable(data.form ? (data.form.email ?? '') : ''),
    senha = $bindable(''),
    confirmaSenha = $bindable('')
  }: {
    data: PageData;
    username: string;
    email: string;
    senha: string;
    confirmaSenha: string;
  } = $props();
</script>

<div
  class="
		flex h-[calc(100vh-11em)] w-full flex-col content-center justify-center
		[&>*]:mx-auto [&>*]:flex [&>*]:max-w-sm [&>*]:min-w-full [&>*]:flex-col [&>*]:gap-4
		[&>*]:min-[420px]:min-w-[380px]
  "
>
  {#if data.user || (data.finish && data.error !== 'server_error')}
    <Heading tag="h3" class="mb-6 text-center">Finalize seu cadastro</Heading>
    <form method="POST" action="?/gauthFinish">
      {#if data.error}
        <Alert color="red" dismissable>{data.error}</Alert>
      {/if}

      <div>
        <Label>Email</Label>
        <Input disabled value={data.user?.email} />
      </div>

      <div>
        <Label for="username">Nome de usuário</Label>
        <div class="flex items-center justify-between gap-2">
          <div><AtSign class="inline-block h-8 w-8" /></div>
          <Input
            placeholder="Digite seu nome de usuário"
            autocomplete="on"
            required
            id="username"
            name="username"
            type="text"
            bind:value={username}
          />
          <div class="flex h-12 w-16 items-center justify-center rounded-full bg-green-500 text-4xl">
            {username.charAt(0).toUpperCase() || '*'}
          </div>
        </div>
      </div>
      <div class="flex flex-col items-center justify-center gap-2">
        <Button type="submit" class="dark:bg-primary-700 dark:hover:bg-primary-800">Finalizar cadastro</Button>
      </div>
    </form>
  {:else if data.tab === 'reset'}
    <Heading tag="h3" class="mb-6 text-center">Redefinir senha</Heading>
    <form method="POST" action="?/reset">
      {#if data.error}
        <Alert color="red" dismissable>{data.error}</Alert>
      {/if}
      <div>
        <Label for="email">Email</Label>
        <Input
          placeholder="Digite seu email para receber o link de redefinição"
          autocomplete="on"
          id="email"
          name="email"
          type="email"
          bind:value={email}
        />
      </div>
      <div class="flex flex-col items-center justify-center gap-2">
        <Button type="submit" class="dark:bg-primary-700 dark:hover:bg-primary-800">Enviar link de redefinição</Button>
      </div>
    </form>
    <Hr class="my-10 text-gray-500" />
    <div class="flex flex-col items-center justify-center gap-2">
      <P><A href="/auth?tab=login" class="text-sm text-gray-500 hover:underline">Voltar ao login</A></P>
    </div>
  {:else if data.tab === 'signup'}
    <Heading tag="h3" class="mb-6 text-center">Cadastrar</Heading>
    <form method="POST" action="?/gauth">
      <P class="text-center text-lg">Cadastre-se com sua conta Google</P>
      <div class="flex flex-col items-center justify-center gap-2">
        <div
          class="
              rounded-[10px] bg-linear-to-r/longer
              from-[#EA4335] to-[#4285F4] p-0.5
              hover:dark:from-[#A50E0E] hover:dark:to-[#174EA6]
            "
        >
          <Button
            type="submit"
            class="
                bg-white! text-gray-900! 
                hover:bg-linear-to-r/longer! hover:from-[#FAD2CF]! hover:to-[#D2E3FC]! 
                hover:text-gray-900! dark:bg-gray-900! dark:text-white!
              "
          >
            <GoogleSolid class="me-2" /> Cadastrar com Google
          </Button>
        </div>
      </div>
    </form>
    <Hr class="my-10 text-gray-500">ou</Hr>
    <form method="POST" action="?/signup">
      {#if data.error}
        <Alert color="red" dismissable>{data.error}</Alert>
      {/if}
      <div>
        <Label for="email">Email</Label>
        <Input placeholder="Digite seu email" autocomplete="on" required id="email" name="email" type="email" bind:value={email} />
      </div>
      <div>
        <Label for="username">Nome de usuário</Label>
        <div class="flex items-center justify-between gap-2">
          <div><AtSign class="inline-block h-8 w-8" /></div>
          <Input
            placeholder="Digite seu nome de usuário"
            autocomplete="on"
            required
            id="username"
            name="username"
            type="text"
            bind:value={username}
          />
          <div class="flex h-12 w-16 items-center justify-center rounded-full bg-green-500 text-4xl">
            {username.charAt(0).toUpperCase() || '*'}
          </div>
        </div>
      </div>
      <div>
        <Label class={senha.length > 0 && senha.length < 6 ? 'text-red-600!' : ''} for="password">Senha</Label>
        <Input placeholder="Digite sua senha" autocomplete="on" required id="password" name="password" type="password" bind:value={senha} />
        {#if senha.length > 0 && senha.length < 6}
          <P class="text-sm text-red-600!">A senha deve ter pelo menos 6 caracteres.</P>
        {/if}
      </div>
      <div>
        <Label class={senha !== confirmaSenha ? 'text-red-600!' : ''} for="confirmaSenha">Confirme a Senha</Label>
        <Input
          placeholder="Digite sua senha novamente"
          autocomplete="on"
          required
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          bind:value={confirmaSenha}
        />
        {#if senha !== confirmaSenha && senha.length > 0}
          <P class="text-sm text-red-600!">As senhas não coincidem.</P>
        {/if}
      </div>
      <div class="flex flex-col items-center justify-center gap-2">
        <Button
          type="submit"
          class="dark:bg-primary-700 dark:hover:bg-primary-800"
          disabled={!senha || !confirmaSenha || !username || !email}>Cadastrar</Button
        >
      </div>
    </form>
    <Hr class="my-10 text-gray-500" />
    <div class="flex flex-col items-center justify-center gap-2">
      <P>Já tem uma conta?</P>
      <P><A href="/auth?tab=login" class="text-sm text-gray-500 hover:underline">Entrar</A></P>
    </div>
  {:else}
    <Heading tag="h3" class="mb-6 text-center">Realizar login</Heading>
    <form method="POST" action="?/gauth">
      <P class="text-center text-lg">Entre com sua conta Google</P>
      <div class="flex flex-col items-center justify-center gap-2">
        <div
          class="
            rounded-[10px] bg-linear-to-r/longer
            from-[#EA4335] to-[#4285F4] p-0.5
            hover:dark:from-[#A50E0E] hover:dark:to-[#174EA6]
          "
        >
          <Button
            type="submit"
            class="
              bg-white! text-gray-900! 
              hover:bg-linear-to-r/longer! hover:from-[#FAD2CF]! hover:to-[#D2E3FC]! 
              hover:text-gray-900! dark:bg-gray-900! dark:text-white!
            "
          >
            <GoogleSolid class="me-2" /> Entrar com Google
          </Button>
        </div>
      </div>
    </form>
    <Hr class="my-10 text-gray-500">ou</Hr>
    <form method="POST" action="?/login">
      {#if data.error}
        <Alert color="red" dismissable>{data.error}</Alert>
      {/if}
      <div>
        <Label for="email">Email</Label>
        <Input placeholder="Digite seu email" autocomplete="on" id="email" name="email" type="email" bind:value={email} />
      </div>
      <div>
        <Label for="password">Senha</Label>
        <Input placeholder="Digite sua senha" autocomplete="on" id="password" name="password" type="password" />
        <A href="/auth?tab=reset" class="text-sm text-gray-500 hover:underline">Esqueci minha senha</A>
      </div>
      <div class="flex flex-col items-center justify-center gap-2">
        <Button type="submit" class="dark:bg-primary-700 dark:hover:bg-primary-800">Entrar</Button>
      </div>
    </form>
    <Hr class="my-10 text-gray-500" />
    <div class="flex flex-col items-center justify-center gap-2">
      <P>Não tem uma conta?</P>
      <P><A href="/auth?tab=signup" class="text-sm text-gray-500 hover:underline">Cadastre-se</A></P>
    </div>
  {/if}
</div>

<DevInfo
  content={`\
# debug
  - signed_up=${Boolean(data.user)}
  - auth_tab=${data.tab}
# todo (tela autenticação)
  - (x) layout autenticação
  - (x) separar login e sign up em abas
  - ( ) campos de perfil em signup
  - ( ) validação de formulário
  - (x) integração com autenticador
  - ( ) integração com backend`}
/>
