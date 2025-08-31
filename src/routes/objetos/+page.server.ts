import { getObjetos } from '$lib/api';
import { ur } from '@faker-js/faker';
import type { PageServerLoad } from './$types';

type query = {
  search?: string;
  tipo?: ObjetoTipo[];
  localidade?: ObjetoLocalidade[];
  categoria?: ObjetoCategoria[];
  usuario?: string;
  inativo?: true;
};

const allTipos: ObjetoTipo[] = ['achado', 'perdido'];

const allLocals: ObjetoLocalidade[] = ['biblio', 'ru', 'ccetibio', 'cla', 'cch', 'ib', 'ccjp', 'intercampi', 'outro'];

const allCategorias: ObjetoCategoria[] = [
  'documento',
  'carteira',
  'mochila',
  'eletronico',
  'academico',
  'utensilio',
  'vestuario',
  'chaveiro',
  'outro'
];

const fetchFilteredObjetos = async (qty: number, query?: query) => {
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));
  const objetos = await getObjetos({ query, limit: qty });
  return objetos;
};

const buildObjetoQuery = (url: URL, email?: string): query => {
  const tipoUnf = url.searchParams.getAll('tipo').length > 0 ? url.searchParams.getAll('tipo') : undefined;
  const localidadeUnf = url.searchParams.getAll('localidade').length > 0 ? url.searchParams.getAll('localidade') : undefined;
  const categoriaUnf = url.searchParams.getAll('categoria').length > 0 ? url.searchParams.getAll('categoria') : undefined;
  return {
    search: url.searchParams.get('search') ?? undefined,
    tipo: tipoUnf?.every((e): e is ObjetoTipo => allTipos.includes(e as ObjetoTipo)) ? tipoUnf : undefined,
    localidade: localidadeUnf?.every((e): e is ObjetoLocalidade => allLocals.includes(e as ObjetoLocalidade)) ? localidadeUnf : undefined,
    categoria: categoriaUnf?.every((e): e is ObjetoCategoria => allCategorias.includes(e as ObjetoCategoria)) ? categoriaUnf : undefined,
    inativo: url.searchParams.get('inativo') === 'true' ? true : undefined,
    usuario: url.searchParams.get('tutela') ? email : undefined
  };
};

export const load: PageServerLoad = async ({ url, locals }) => {
  const objetoQuery = buildObjetoQuery(url, locals.user?.email);
  return {
    newObjeto: url.searchParams.get('new') === 'true',
    query: objetoQuery,
    streamed: {
      objetos: fetchFilteredObjetos(10, objetoQuery)
    }
  };
};
