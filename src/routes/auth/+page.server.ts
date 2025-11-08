import { PUBLIC_VERCEL_URL } from '$env/static/public';
import { stringFromBase64URL, stringToBase64URL } from '@supabase/ssr';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

// Carrega dados para a página de autenticação
export function load({ locals: { safeGetSession }, url }) {
  return {
    finish: url.searchParams.get('finish') === 'true',
    tab: url.searchParams.get('tab') || 'login',
    error: url.searchParams.get('error') || null,
    form: url.searchParams.get('form') ? JSON.parse(stringFromBase64URL(url.searchParams.get('form')!)) : null,
    session: safeGetSession()
  };
}

export const actions: Actions = {
  /** Cadastro de novo usuário */
  signup: async ({ request, locals: { supabase } }) => {
    let validationErrors = [];
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;

    // Validações de campos obrigatórios
    if (!email || !username || !password || !passwordConfirm) {
      validationErrors.push('Todos os campos são obrigatórios');
    }
    if (!/^(?=.*[a-zA-Z])[a-zA-Z0-9_]+$/.test(username)) {
      validationErrors.push('Nome de usuário inválido (permitido apenas letras, números e underscores - pelo menos uma letra)');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.push('E-mail inválido');
    }
    if (password !== passwordConfirm) {
      validationErrors.push('As duas senhas não combinam');
    }
    if (password.length < 6) {
      validationErrors.push('A senha deve ter pelo menos 6 caracteres');
    }

    // Redireciona com erros de validação
    if (validationErrors.length > 0) {
      redirect(
        303,
        `/auth?tab=signup&error=${encodeURIComponent(validationErrors.join('; '))}&form=${stringToBase64URL(JSON.stringify({ email, username }))}`
      );
    }

    // Cria usuário via Supabase Auth
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { username, role: 'user' } } });
    if (error) {
      redirect(
        303,
        `/auth?tab=signup&error=${encodeURIComponent(error.message)}&form=${stringToBase64URL(JSON.stringify({ email, username }))}`
      );
    } else {
      redirect(303, '/');
    }
  },

  /** Login de usuário existente */
  login: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      redirect(303, `/auth?tab=login&error=${encodeURIComponent(error.message)}&form=${stringToBase64URL(JSON.stringify({ email }))}`);
    } else {
      redirect(303, '/');
    }
  },

  /** Autenticação via Google OAuth */
  gauth: async ({ locals: { supabase }, url }) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: PUBLIC_VERCEL_URL ? `${PUBLIC_VERCEL_URL}/` : 'http://localhost:5173/'
      }
    });
    if (error) {
      redirect(303, `/auth?tab=${url.searchParams.get('tab')}&error=${encodeURIComponent(error.message)}`);
    } else {
      redirect(303, data.url);
    }
  },

  /** Finaliza cadastro via Google OAuth (adiciona username) */
  gauthFinish: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const username = formData.get('username') as string;

    if (!username) return;

    const userId = await supabase.auth.getUser().then((res) => res.data.user?.id);

    // Atualiza username na tabela user e nos metadados do auth
    const [res1, res2] = await Promise.all([
      supabase.from('user').update({ username: username.trim() }).eq('id', userId),
      supabase.auth.updateUser({ data: { username, role: 'user' } })
    ]);

    if (res1.error || res2.error) {
      redirect(
        303,
        `/auth?&error=${encodeURIComponent(res1.error ? res1.error.message : res2.error ? res2.error.message : '')}&form=${stringToBase64URL(
          JSON.stringify({ username })
        )}&finish=true`
      );
    } else {
      redirect(303, '/');
    }
  }
};
