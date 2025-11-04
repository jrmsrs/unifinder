import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { session, supabase } }) => {
	if (!session) {
		redirect(303, '/auth');
	}

	// Buscar dados completos do usuário
	const { data: profile, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', session.user.id)
		.single();

	if (error && error.code !== 'PGRST116') {
		console.error('Error loading profile:', error);
	}

	return {
		session,
		user: session.user,
		profile: profile || {
			id: session.user.id,
			username: session.user.user_metadata?.username || '',
			full_name: session.user.user_metadata?.full_name || '',
			email: session.user.email || '',
			whatsapp: '',
			instagram: '',
			x_twitter: '',
			facebook: '',
			avatar_url: session.user.user_metadata?.avatar_url || ''
		}
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals: { session, supabase } }) => {
		if (!session) {
			return {
				error: 'Usuário não autenticado'
			};
		}

		const formData = await request.formData();
		const username = formData.get('username') as string;
		const fullName = formData.get('fullName') as string;
		const whatsapp = formData.get('whatsapp') as string;
		const instagram = formData.get('instagram') as string;
		const xTwitter = formData.get('xTwitter') as string;
		const facebook = formData.get('facebook') as string;

		// Validações básicas
		if (!username || username.trim().length < 3) {
			return {
				error: 'Nome de usuário deve ter pelo menos 3 caracteres'
			};
		}

		if (!fullName || fullName.trim().length < 2) {
			return {
				error: 'Nome completo deve ter pelo menos 2 caracteres'
			};
		}

		// Validar formato de redes sociais (opcional)
		const validateSocialHandle = (handle: string, platform: string) => {
			if (handle && !handle.match(/^[a-zA-Z0-9._]+$/)) {
				return `${platform} deve conter apenas letras, números, pontos e sublinhados`;
			}
			return null;
		};

		const socialErrors = [
			validateSocialHandle(instagram, 'Instagram'),
			validateSocialHandle(xTwitter, 'X (Twitter)'),
			validateSocialHandle(facebook, 'Facebook')
		].filter(Boolean);

		if (socialErrors.length > 0) {
			return {
				error: socialErrors[0]
			};
		}

		// Validar WhatsApp (apenas números)
		if (whatsapp && !whatsapp.match(/^[0-9+\-\s()]+$/)) {
			return {
				error: 'WhatsApp deve conter apenas números e símbolos válidos (+, -, espaços, parênteses)'
			};
		}

		try {
			// Atualizar ou inserir perfil
			const { error: upsertError } = await supabase
				.from('profiles')
				.upsert({
					id: session.user.id,
					username: username.trim(),
					full_name: fullName.trim(),
					whatsapp: whatsapp.trim(),
					instagram: instagram.trim(),
					x_twitter: xTwitter.trim(),
					facebook: facebook.trim(),
					updated_at: new Date().toISOString()
				});

			if (upsertError) {
				console.error('Profile update error:', upsertError);
				return {
					error: 'Erro ao atualizar perfil. Tente novamente.'
				};
			}

			return {
				success: 'Perfil atualizado com sucesso!'
			};
		} catch (error) {
			console.error('Unexpected error:', error);
			return {
				error: 'Erro inesperado. Tente novamente.'
			};
		}
	},

	changePassword: async ({ request, locals: { session, supabase } }) => {
		if (!session) {
			return {
				passwordError: 'Usuário não autenticado'
			};
		}

		const formData = await request.formData();
		const newPassword = formData.get('newPassword') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		// Validações
		if (!newPassword || newPassword.length < 6) {
			return {
				passwordError: 'A senha deve ter pelo menos 6 caracteres'
			};
		}

		if (newPassword !== confirmPassword) {
			return {
				passwordError: 'As senhas não coincidem'
			};
		}

		try {
			const { error } = await supabase.auth.updateUser({
				password: newPassword
			});

			if (error) {
				console.error('Password update error:', error);
				return {
					passwordError: 'Erro ao alterar senha. Tente novamente.'
				};
			}

			return {
				passwordSuccess: 'Senha alterada com sucesso!'
			};
		} catch (error) {
			console.error('Unexpected password error:', error);
			return {
				passwordError: 'Erro inesperado. Tente novamente.'
			};
		}
	}
};