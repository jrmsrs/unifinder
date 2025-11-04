import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession();

  // Redireciona para login se não estiver autenticado
  if (!session) {
    throw redirect(303, '/auth');
  }

  return {
    session
  };
};
