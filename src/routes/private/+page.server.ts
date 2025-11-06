import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// Carrega dados do perfil do usuário autenticado
export const load: PageServerLoad = async ({ locals: { session, supabase } }) => {
  if (!session) {
    redirect(303, '/auth');
  }

  const { data: profile, error } = await supabase.from('user').select('*').eq('id', session.user.id).single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error loading profile:', error);
  }

  return {
    session,
    user: session.user,
    profile: profile || null
  };
};

export const actions: Actions = {
  // Atualiza informações do perfil (nome, username, contatos)
  updateProfile: async ({ request, locals: { session, supabase } }) => {
    if (!session) {
      return {
        error: 'Usuário não autenticado'
      };
    }

    const formData = await request.formData();
    const username = formData.get('username') as string;
    const fullName = formData.get('fullName') as string;
    const contactsJson = formData.get('contacts') as string;

    // Validação de campos obrigatórios
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

    // Processamento e validação dos contatos (JSONB: { id, tipo, valor })
    let contacts = [];
    try {
      contacts = contactsJson ? JSON.parse(contactsJson) : [];

      if (!Array.isArray(contacts)) {
        return { error: 'Formato de contatos inválido' };
      }

      // Validação estrutural de cada contato
      for (const contact of contacts) {
        if (!contact.id || !contact.tipo || !contact.valor) {
          return { error: 'Todos os contatos devem ter id, tipo e valor' };
        }

        if (typeof contact.id !== 'string' || typeof contact.tipo !== 'string' || typeof contact.valor !== 'string') {
          return { error: 'ID, tipo e valor dos contatos devem ser strings' };
        }

        // Validação de tipos permitidos
        const allowedTypes = ['email', 'whatsapp', 'instagram', 'x', 'facebook', 'outro'];
        if (!allowedTypes.includes(contact.tipo)) {
          return { error: `Tipo de contato '${contact.tipo}' não é válido` };
        }
      }

      // Sanitização: manter apenas campos necessários
      contacts = contacts.map((contact) => ({
        id: contact.id,
        tipo: contact.tipo,
        valor: contact.valor
      }));
    } catch (error) {
      console.error('Error parsing contacts:', error);
      return { error: 'Formato de contatos inválido' };
    }

    try {
      console.log('Updating profile with:', { username, fullName, contacts });

      // Atualização no banco: perfil + contatos em JSONB
      const { error: updateError } = await supabase
        .from('user')
        .update({
          username: username.trim(),
          nome: fullName.trim(),
          contato: contacts
        })
        .eq('id', session.user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        return { error: 'Erro ao atualizar perfil. Tente novamente.' };
      }

      return { success: 'Perfil atualizado com sucesso!' };
    } catch (error) {
      console.error('Unexpected error:', error);
      return { error: 'Erro inesperado. Tente novamente.' };
    }
  },

  // Alteração de senha via Supabase Auth
  changePassword: async ({ request, locals: { session, supabase } }) => {
    if (!session) {
      return {
        passwordError: 'Usuário não autenticado'
      };
    }

    const formData = await request.formData();
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validação da nova senha
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
