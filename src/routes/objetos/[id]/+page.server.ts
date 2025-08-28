import { getComentariosByObjetoId, getObjetoById } from '$lib/api';
import type { PageServerLoad } from './$types';

const fetchObjeto = async (id: string, email?: string) => {
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));
  const objeto = await getObjetoById({ id }, email);
  return objeto;
};

// parametro email só pra mock, excluir na integração
const fetchComentarios = async (id: string, email?: string) => {
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));
  const comentarios = await getComentariosByObjetoId({ id }, email);
  return comentarios;
};

export const load: PageServerLoad = ({ params, locals }) => {
  return {
    streamed: {
      objeto: fetchObjeto(params.id, locals.user?.email),
      comentarios: fetchComentarios(params.id, locals.user?.email)
    }
  };
};
