import { page } from '$app/state';
import { getObjetoById } from '$lib/api';
import type { PageServerLoad } from './$types';

const fetchObjeto = async (id: string) => {
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));
  const objeto = await getObjetoById({ id });
  return objeto;
};

export const load: PageServerLoad = ({ params }) => {
  return {
    streamed: {
      objeto: fetchObjeto(params.id)
    }
  };
};
