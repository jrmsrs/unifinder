import { getObjetosLatest } from '$lib/api';
import type { PageServerLoad } from './$types';

/** Busca os objetos mais recentes */
const fetchLatestObjetos = async (user?: { id: string; email: string }) => {
  const latestObjetos = await getObjetosLatest(user);
  return latestObjetos;
};

export const load: PageServerLoad = ({ locals }) => {
  return {
    streamed: {
      objetos: fetchLatestObjetos(locals.user ? { id: locals.user.id, email: locals.user.email ?? '' } : undefined)
    }
  };
};
