import { getComentariosByObjetoId, getObjetoById } from '$lib/api';
import type { PageServerLoad } from './$types';

const fetchObjeto = async (id: string) => {
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));
  const objeto = await getObjetoById({ id });
  return objeto;
};

const fetchComentarios = async (id: string) => {
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));
  const comentarios = await getComentariosByObjetoId({ id });
  return comentarios;
};

export const load: PageServerLoad = ({ params }) => {
  return {
    streamed: {
      objeto: fetchObjeto(params.id),
      comentarios: fetchComentarios(params.id)
    }
  };
};
