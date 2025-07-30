<script>
	import { goto } from '$app/navigation';
	import { Button } from 'flowbite-svelte';

	let { data } = $props();
	let { supabase } = $derived(data);

	const logout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
			goto('/error');
		} else {
			goto('/auth');
		}
	};
</script>

That's a página privada do: {data.user?.email}

<Button onclick={logout}>Logout</Button>
