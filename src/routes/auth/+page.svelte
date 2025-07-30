<script lang="ts">
	import { Label, Input, Button } from 'flowbite-svelte';
</script>

<form
	method="POST"
	action="?/login"
	class="flex h-[calc(100vh-9rem)] w-full flex-col content-center justify-center"
>
	<div class="mx-auto flex max-w-sm flex-col gap-4">
		<div>
			<Label for="email">Email</Label>
			<Input id="email" name="email" type="email" />
		</div>
		<div>
			<Label for="password">Password</Label>
			<Input id="password" name="password" type="password" />
		</div>
		<div class="flex w-full justify-center gap-2">
			<Button type="submit">Login</Button>
			<button formaction="?/signup">Sign up</button>
			<button formaction="?/gauth">Auth in with Google</button>
		</div>
		* todo: transformar isso em modal, separar login e sign up em abas, campos de perfil em signup
	</div>
</form>
