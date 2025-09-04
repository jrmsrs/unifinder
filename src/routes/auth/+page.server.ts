import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export function load({ locals: { supabase }, url }) {
  return {
    tab: url.searchParams.get('tab') || 'login',
    error: url.searchParams.get('error') || null,
    user: supabase.auth.getUser()
  };
}

export const actions: Actions = {
  signup: async ({ request, locals: { supabase } }) => {
    let validationErrors = [];
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;
    if (!email || !username || !password || !passwordConfirm) {
      validationErrors.push('Todos os campos são obrigatórios');
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
    if (validationErrors.length > 0) {
      redirect(303, '/auth?tab=signup&error=' + encodeURIComponent(validationErrors.join('; ')));
    }
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
    if (error) {
      redirect(303, '/auth?tab=signup&error=' + encodeURIComponent(error.message));
    } else {
      redirect(303, '/');
    }
  },
  login: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      redirect(303, '/auth?tab=login&error=' + encodeURIComponent(error.message));
    } else {
      redirect(303, '/private');
    }
  },
  gauth: async ({ locals: { supabase }, url }) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    });
    if (error) {
      redirect(303, '/auth?tab=' + url.searchParams.get('tab') + '&error=' + encodeURIComponent(error.message));
    } else {
      redirect(303, data.url);
    }
  }
};
