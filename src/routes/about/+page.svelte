<script lang="ts">
	import { goto } from '$app/navigation';
	import { Heading, P, Button } from 'flowbite-svelte';

	function goHome() {
		goto('/');
	}
</script>

<main>
	<Heading class="mb-3" tag="h3">About Us</Heading>
	<P class="mb-3" firstUpper justify>
		Lorem ipsum dolor sit amet, consectetur adipiscing elit. Crux sacra quis nostrud exercitation
		ullamco laboris nisi ut aliquip ex ea commodo consequat. Sed do eiusmod tempor incididunt ut
		labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
		laboris nisi ut aliquip ex ea commodo consequat.
	</P>
	<P class="mb-3" justify>
		Magna carta, vitae elit libero, a pharetra augue. Ut enim ad minim veniam, consectetur
		adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Crux sacra
		quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
	</P>
	<Button onclick={goHome}>Go to Home</Button>
</main>
