import type { PageServerLoad } from './$types';
import { getObjetosLatest } from '$lib/api';

const fetchLatestObjetos = async () => {
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));
  const latestObjetos = await getObjetosLatest();
  return latestObjetos;
};

export const load: PageServerLoad = () => {
  return {
    streamed: {
      objetos: fetchLatestObjetos()
    }
  };
};
