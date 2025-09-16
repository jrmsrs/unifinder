import { getComentariosByObjetoId, getObjetoById } from '$lib/api';
import type { PageServerLoad } from './$types';

const fetchObjeto = async (id: string) => {
  const objeto = await getObjetoById({ id });
  return objeto;
};

// parametro email só pra mock, excluir na integração
const fetchComentarios = async (id: string) => {
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));
  const comentarios = await getComentariosByObjetoId({ id });
  return comentarios;
};

export const load: PageServerLoad = ({ params, locals }) => {
  return {
    streamed: {
      objeto: fetchObjeto(params.id),
      comentarios: fetchComentarios(params.id)
    }
  };
};
