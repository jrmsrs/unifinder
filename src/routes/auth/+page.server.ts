import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export function load({ url }) {
  return {
    tab: url.searchParams.get('tab') || 'login',
    error: url.searchParams.get('error') || null
  };
}

export const actions: Actions = {
  signup: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signUp({ email, password });
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
      redirect(
        303,
        '/auth?tab=' + url.searchParams.get('tab') + '&error=' + encodeURIComponent(error.message)
      );
    } else {
      redirect(303, data.url);
    }
  }
};
