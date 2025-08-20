import type { PageServerLoad } from './$types';
import { getObjetos } from '$lib/api';

type query = {
  search?: string;
  tipo?: ObjetoTipo[];
  localidade?: ObjetoLocalidade[];
  categoria?: ObjetoCategoria[];
  usuario?: string;
  inativo?: true;
};

const allTipos: ObjetoTipo[] = ['achado', 'perdido'];

const allLocals: ObjetoLocalidade[] = [
  'biblio',
  'ru',
  'ccetibio',
  'cla',
  'cch',
  'ib',
  'ccjp',
  'intercampi',
  'outro'
];

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

export const load: PageServerLoad = async ({ url, locals }) => {
  const search = url.searchParams.get('search') ?? undefined;
  const tipoParam =
    url.searchParams.getAll('tipo').length > 0 ? url.searchParams.getAll('tipo') : undefined;
  const tipo = tipoParam?.every((e): e is ObjetoTipo => allTipos.includes(e as ObjetoTipo))
    ? tipoParam
    : undefined;
  const localidadeParam =
    url.searchParams.getAll('localidade').length > 0
      ? url.searchParams.getAll('localidade')
      : undefined;
  const localidade = localidadeParam?.every((e): e is ObjetoLocalidade =>
    allLocals.includes(e as ObjetoLocalidade)
  )
    ? localidadeParam
    : undefined;
  const categoriaParam =
    url.searchParams.getAll('categoria').length > 0
      ? url.searchParams.getAll('categoria')
      : undefined;
  const categoria = categoriaParam?.every((e): e is ObjetoCategoria =>
    allCategorias.includes(e as ObjetoCategoria)
  )
    ? categoriaParam
    : undefined;
  const inativo = url.searchParams.get('inativo') === 'true' ? true : undefined;
  const usuario = url.searchParams.get('tutela') && locals.user?.email; // .email temporariamente
  const query: query = {
    search,
    tipo,
    localidade,
    categoria,
    usuario: usuario || undefined,
    inativo
  };

  return {
    query,
    streamed: {
      objetos: fetchFilteredObjetos(10, query)
    }
  };
};
