<script lang="ts">
	import { Label, Input, Button, Heading, Hr, P, A } from 'flowbite-svelte';
	import { GoogleSolid } from 'flowbite-svelte-icons';

	let { data, email = $bindable('') }: { data: { tab: string; error?: string }; email: string } =
		$props();
</script>

<div
	class="
		flex h-[calc(100vh-11em)] w-full flex-col content-center justify-center
		[&>*]:mx-auto [&>*]:flex [&>*]:max-w-sm [&>*]:min-w-full [&>*]:flex-col [&>*]:gap-4
		[&>*]:min-[420px]:min-w-[380px]
  "
>
	{#if data.tab === 'reset'}
		<Heading tag="h3" class="mb-6 text-center">Redefinir senha</Heading>
		<form method="POST" action="?/reset">
			{#if data.error}
				<p class="text-red-500">{data.error}</p>
			{/if}
			<div>
				<Label for="email" placeholder="Email">Email</Label>
				<Input id="email" name="email" type="email" bind:value={email} />
			</div>
			<div class="flex flex-col items-center justify-center gap-2">
				<Button type="submit">Enviar link de redefinição</Button>
			</div>
		</form>
		<Hr class="my-10 text-primary-500" />
		<div class="flex flex-col items-center justify-center gap-2">
			<P
				><A href="/auth?tab=login" class="text-sm text-primary-500 hover:underline"
					>Voltar ao login</A
				></P
			>
		</div>
	{:else if data.tab === 'signup'}
		<Heading tag="h3" class="mb-6 text-center">Cadastrar</Heading>
		<form method="POST" action="?/gauth">
			<P class="text-center text-lg">Cadastre-se com sua conta Google</P>
			<div class="flex flex-col items-center justify-center gap-2">
				<Button type="submit"><GoogleSolid class="me-2" /> Cadastrar com Google</Button>
			</div>
		</form>
		<Hr class="my-10 text-primary-500">ou</Hr>
		<form method="POST" action="?/signup">
			{#if data.error}
				<p class="text-red-500">{data.error}</p>
			{/if}
			<div>
				<Label for="email" placeholder="Email">Email</Label>
				<Input id="email" name="email" type="email" />
			</div>
			<div>
				<Label for="password">Senha</Label>
				<Input id="password" name="password" type="password" />
			</div>
			<div class="flex flex-col items-center justify-center gap-2">
				<Button type="submit">Cadastrar</Button>
			</div>
		</form>
		<Hr class="my-10 text-primary-500" />
		<div class="flex flex-col items-center justify-center gap-2">
			<P>Já tem uma conta?</P>
			<P><A href="/auth?tab=login" class="text-sm text-primary-500 hover:underline">Entrar</A></P>
		</div>
	{:else}
		<Heading tag="h3" class="mb-6 text-center">Realizar login</Heading>
		<form method="POST" action="?/gauth">
			<P class="text-center text-lg">Entre com sua conta Google</P>
			<div class="flex flex-col items-center justify-center gap-2">
				<Button type="submit"><GoogleSolid class="me-2" /> Entrar com Google</Button>
			</div>
		</form>
		<Hr class="my-10 text-primary-500">ou</Hr>
		<form method="POST" action="?/login">
			{#if data.error}
				<p class="text-red-500">{data.error}</p>
			{/if}
			<div>
				<Label for="email" placeholder="Email">Email</Label>
				<Input id="email" name="email" type="email" bind:value={email} />
			</div>
			<div>
				<Label for="password">Senha</Label>
				<Input id="password" name="password" type="password" />
				<A href="/auth?tab=reset" class="text-sm text-primary-500 hover:underline"
					>Esqueci minha senha</A
				>
			</div>
			<div class="flex flex-col items-center justify-center gap-2">
				<Button type="submit">Entrar</Button>

				<!-- <button formaction="?/signup">Cadastrar</button>
			<button formaction="?/gauth">Entrar com Google</button> -->
			</div>
		</form>
		<Hr class="my-10 text-primary-500" />
		<div class="flex flex-col items-center justify-center gap-2">
			<P>Não tem uma conta?</P>
			<P
				><A href="/auth?tab=signup" class="text-sm text-primary-500 hover:underline">Cadastre-se</A
				></P
			>
		</div>
	{/if}

	tab={data.tab}<br />
	* todo:<br />
	&nbsp;&nbsp;- (x) implementar autenticação<br />
	&nbsp;&nbsp;- (x) separar login e sign up em abas<br />
	&nbsp;&nbsp;- ( ) campos de perfil em signup<br />
	&nbsp;&nbsp;- ( ) adicionar validação de formulário<br /><br />
</div>
