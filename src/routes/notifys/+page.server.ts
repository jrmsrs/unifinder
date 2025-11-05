import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getNotifications } from '$lib/api/notifications';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession();

  // Redireciona para login se não estiver autenticado
  if (!session) {
    throw redirect(303, '/auth');
  }

  // Busca notificações do servidor
  const notificationsResponse = await getNotifications({
    token: session.access_token,
    size: 50
  });

  return {
    session,
    initialNotifications: notificationsResponse.items || []
  };
};
