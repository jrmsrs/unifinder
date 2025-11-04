<script lang="ts">
	import { Badge, Button } from 'flowbite-svelte';
	import { ExternalLink, MessageCircle, Hash, Facebook as FacebookIcon } from 'lucide-svelte';

	interface Props {
		profile: {
			whatsapp?: string;
			instagram?: string;
			x_twitter?: string;
			facebook?: string;
		};
		showLabels?: boolean;
		size?: 'sm' | 'md' | 'lg';
	}

	let { profile, showLabels = true, size = 'md' }: Props = $props();

	// Funções para gerar URLs das redes sociais
	const getWhatsAppUrl = (number: string) => {
		// Remove espaços, hífens e parênteses, mantém apenas números e +
		const cleanNumber = number.replace(/[\s\-()]/g, '');
		return `https://wa.me/${cleanNumber}`;
	};

	const getInstagramUrl = (username: string) => {
		// Remove @ se existir
		const cleanUsername = username.replace('@', '');
		return `https://instagram.com/${cleanUsername}`;
	};

	const getTwitterUrl = (username: string) => {
		// Remove @ se existir
		const cleanUsername = username.replace('@', '');
		return `https://x.com/${cleanUsername}`;
	};

	const getFacebookUrl = (username: string) => {
		return `https://facebook.com/${username}`;
	};

	// Determinar tamanhos baseados na prop size
	const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
	const buttonSize = size === 'sm' ? 'xs' : size === 'lg' ? 'lg' : 'sm';

	// Lista de redes sociais com seus dados
	$: socialLinks = [
		{
			name: 'WhatsApp',
			value: profile.whatsapp,
			url: profile.whatsapp ? getWhatsAppUrl(profile.whatsapp) : null,
			icon: MessageCircle,
			color: 'green' as const,
			bgColor: 'bg-green-100 hover:bg-green-200',
			textColor: 'text-green-800'
		},
		{
			name: 'Instagram',
			value: profile.instagram,
			url: profile.instagram ? getInstagramUrl(profile.instagram) : null,
			icon: Hash, // Usando Hash como substituto para Instagram
			color: 'pink' as const,
			bgColor: 'bg-pink-100 hover:bg-pink-200',
			textColor: 'text-pink-800'
		},
		{
			name: 'X (Twitter)',
			value: profile.x_twitter,
			url: profile.x_twitter ? getTwitterUrl(profile.x_twitter) : null,
			icon: Hash, // Usando Hash como substituto para X/Twitter
			color: 'gray' as const,
			bgColor: 'bg-gray-100 hover:bg-gray-200',
			textColor: 'text-gray-800'
		},
		{
			name: 'Facebook',
			value: profile.facebook,
			url: profile.facebook ? getFacebookUrl(profile.facebook) : null,
			icon: FacebookIcon,
			color: 'blue' as const,
			bgColor: 'bg-blue-100 hover:bg-blue-200',
			textColor: 'text-blue-800'
		}
	].filter(link => link.value && link.value.trim() !== '');
</script>

{#if socialLinks.length > 0}
	<div class="flex flex-wrap gap-2">
		{#each socialLinks as link (link.name)}
			{#if showLabels}
				<Badge
					color={link.color}
					class="flex items-center space-x-1 transition-colors"
				>
					<svelte:component this={link.icon} class={iconSize} />
					<span>{link.name}</span>
					{#if link.url}
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							class="ml-1 text-current hover:underline"
							aria-label={`Abrir ${link.name}`}
						>
							<ExternalLink class="h-3 w-3" />
						</a>
					{/if}
				</Badge>
			{:else}
				{#if link.url}
					<Button
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						size={buttonSize}
						color="light"
						class="{link.bgColor} {link.textColor} flex items-center space-x-1 transition-colors"
						aria-label={`Abrir ${link.name}`}
					>
						<svelte:component this={link.icon} class={iconSize} />
					</Button>
				{:else}
					<Button
						size={buttonSize}
						color="light"
						disabled
						class="{link.bgColor} {link.textColor} flex items-center space-x-1 opacity-50"
					>
						<svelte:component this={link.icon} class={iconSize} />
					</Button>
				{/if}
			{/if}
		{/each}
	</div>
{:else}
	<p class="text-sm text-gray-500 dark:text-gray-400">
		Nenhum contato ou rede social adicionado ainda.
	</p>
{/if}