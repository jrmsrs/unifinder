<script lang="ts">
	import FilteredSearch from '$lib/components/FilteredSearch.svelte';
	import ObjectsCarousel from '$lib/components/ObjectsCarousel.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import ImageLoader from '$lib/components/ImageLoader.svelte';
	import {
		Label,
		Input,
		Helper,
		MultiSelect,
		Button,
		Modal,
		Card,
		Alert,
		Badge,
		Heading,
		P,
		Hr,
	} from 'flowbite-svelte';
	import { scale } from 'svelte/transition';
	import DevInfo from '$lib/components/dev/DevInfo.svelte';
	let { data } = $props();
	let defaultModal = $state(false);
	let multiSelected = $state<string[]>([]);
</script>

<div
	class="m-auto flex flex-col items-center justify-center p-4 [&>*]:my-4 [&>*>hr]:max-w-64 [&>hr]:w-full [&>hr]:max-w-64"
>
	<Heading tag="h4">Objetos em acompanhamento</Heading>
	{#await data.streamed.tutelados}
		<Skeleton />
	{:then tutelados}
		{#if tutelados.length > 0}
			<ObjectsCarousel id="tutelados-carousel" objects={tutelados} />
		{:else}
			<p class="text-center text-primary-500 dark:text-primary-400">
				Nenhum objeto em acompanhamento.
			</p>
		{/if}
	{:catch error}
		<Alert color="red" dismissable>Erro: {error.message}</Alert>
	{/await}
	<P>Perdeu algum pertence na UNIRIO? Procure aqui</P>
	<FilteredSearch></FilteredSearch>
	<Hr class="my-0!">ou</Hr>
	<Button>Cadastrar objeto perdido</Button>
	<Hr />
	<P>Encontrou algum objeto na UNIRIO?</P>
	<Button>Cadastrar objeto achado</Button>
	<Hr />
	<Heading tag="h4">Últimos objetos achados</Heading>
	{#await data.streamed.latestObjetos}
		<Skeleton />
	{:then latestObjetos}
		{#if latestObjetos.achados.length > 0}
			<ObjectsCarousel id="found-objects-carousel" objects={latestObjetos.achados} />
		{:else}
			<p class="text-center text-primary-500 dark:text-primary-400">
				Nenhum objeto achado está disponível.
			</p>
		{/if}
	{:catch error}
		<Alert color="red" dismissable>Erro: {error.message}</Alert>
	{/await}
	<Hr />
	<Heading tag="h4">Últimos objetos perdidos</Heading>
	{#await data.streamed.latestObjetos}
		<Skeleton />
	{:then latestObjetos}
		{#if latestObjetos.perdidos.length > 0}
			<ObjectsCarousel id="lost-objects-carousel" objects={latestObjetos.perdidos} />
		{:else}
			<p class="text-center text-primary-500 dark:text-primary-400">
				Nenhum objeto perdido está disponível.
			</p>
		{/if}
	{:catch error}
		<Alert color="red" dismissable>Erro: {error.message}</Alert>
	{/await}
	<div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<Card class="col-span-1 p-6">
			<h5 class="mb-4 text-xl font-bold tracking-tight">Exemplo de Card</h5>
			<p class="mb-2 text-sm text-primary-500 dark:text-primary-400">
				Atraso simulado para demonstrar o estado de carregamento.
			</p>
			{#await data.streamed.userProfile}
				<Skeleton />
			{:then profile}
				<div class="flex items-center space-x-4">
					<ImageLoader
						src={profile.avatarUrl}
						alt="Avatar de {profile.name}"
						divClass="min-w-12 max-w-full h-12 rounded-full"
					/>
					<div>
						<p class="text-lg font-semibold">{profile.name}</p>
						<p class="text-sm text-primary-500 dark:text-primary-400">
							{profile.bio + ' ' + profile.bio}
						</p>
					</div>
				</div>
				<div class="mt-4">
					{#each profile.tags as tag}
						<Badge class="me-2 mb-2" color="secondary">{tag}</Badge>
					{/each}
				</div>
			{:catch error}
				<Alert color="red" dismissable>Erro: {error.message}</Alert>
			{/await}
		</Card>

		<Card class="col-span-1 p-6">
			<h5 class="mb-4 text-xl font-bold tracking-tight">Card com Imagem</h5>
			<div class="mx-auto w-full max-w-md">
				<p class="mb-2 text-sm text-primary-500 dark:text-primary-400">Fica salva em cache.</p>

				<ImageLoader
					src="https://placehold.co/800x450"
					alt="Exemplo de imagem com carregamento lento"
					divClass="aspect-video w-full rounded-lg"
				></ImageLoader>
			</div>
		</Card>

		{#if data.user}
			<Card class="col-span-1 p-6">
				(Um card visível só pra usuários autenticados. Usuário: {data.user.email})
			</Card>
		{/if}
	</div>
	<Button onclick={() => (defaultModal = true)}>Abrir modal</Button>

	<Modal
		class="w-11/12 backdrop:bg-primary-500/50 backdrop:backdrop-blur-md"
		title="Random Form"
		form
		transition={scale}
		bind:open={defaultModal}
		onaction={({ action }) => alert(`Handle "${action}"`)}
	>
		<div class="flex flex-col gap-4">
			<div>
				<Label for="select">Select</Label>
				<MultiSelect
					id="select"
					bind:value={multiSelected}
					items={[
						{ value: 'option1', name: 'Option 1' },
						{ value: 'option2', name: 'Option 2' },
						{ value: 'option3', name: 'Option 3' }
					]}
					placeholder="Select options"
				/>
				<Helper>Select one or more options</Helper>
			</div>
			<div>
				<Label for="name">Name</Label>
				<Input clearable required id="name" type="text" placeholder="John Doe" />
				<Helper>Enter your full name</Helper>
			</div>
			<div>
				<Label for="email">Email</Label>
				<Input clearable required id="email" type="email" placeholder="john.doe@example.com" />
				<Helper>Enter your email address</Helper>
			</div>
		</div>
		{#snippet footer()}
			<div class="flex w-full justify-end">
				<Button type="submit" value="submit">Submit</Button>
			</div>
		{/snippet}
	</Modal>
</div>

<DevInfo
	content={`\
# todo (tela inicial):
  - (x) layout objetos
  - (x) layout barra pesquisa filtrada
  - ( ) layout modal pesquisa filtrada
  - (x) layout cards ultimos achados/perdidos
  - (-) mocks
  - ( ) integração`}
/>
