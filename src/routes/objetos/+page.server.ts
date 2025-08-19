import { fakerPT_BR as fk } from '@faker-js/faker';
import type { PageServerLoad } from './$types';

// typescript: expect any string while suggest specific values
type Suggestive<T extends string> = T | (string & {}) | undefined;

type query = {
  search?: string;
  tipo?: ObjetoTipo[];
  localidade?: ObjetoLocalidade[];
  categoria?: Suggestive<ObjetoCategoria>[];
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

// mock purpose only
const makeFilteredObjetos = (qty: number, query?: query) => {
  const objetos: Objeto[] = [];
  for (let i = 0; i < qty; i++) {
    const search = query?.search || '';
    const tipo = query?.tipo
      ? fk.helpers.arrayElement(query.tipo)
      : fk.helpers.arrayElement(allTipos);
    const local = query?.localidade
      ? fk.helpers.arrayElement(query.localidade)
      : fk.helpers.arrayElement(allLocals);
    const usuario = query?.usuario;
    let categoria: Suggestive<ObjetoCategoria> = '';
    if (query?.categoria) categoria = fk.helpers.arrayElement(query.categoria);
    objetos.push({
      id: fk.string.uuid(),
      created_at: fk.date.past().toISOString(),
      usuario: {
        id: usuario ? 'current-user-id' : fk.string.uuid(),
        username: usuario || fk.internet.username(),
        avatar_url: usuario ? 'current-user-avatar-url' : fk.image.avatar()
      },
      imagem: fk.image.urlPicsumPhotos({ width: 50, height: 50, blur: 10 }),
      titulo:
        search +
        fk.word.words(3).replace(/^(\w)(.*)/, (_, f, r) => f.toUpperCase() + r.toLowerCase()),
      descricao: fk.word
        .words(10)
        .replace(/^(\w)(.*)/, (_, f, r) => f.toUpperCase() + r.toLowerCase()),
      local,
      encaminhado: tipo === 'achado' ? fk.helpers.arrayElement(allLocals) : undefined,
      tipo,
      categoria: (categoria ? categoria : fk.helpers.arrayElement(allCategorias)) as ObjetoCategoria
    });
  }
  return objetos;
};

const fetchFilteredObjetos = async (qty: number, query?: query) => {
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));
  // mock (then fetch from API)
  return makeFilteredObjetos(qty, query);
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
  const categoria = url.searchParams.get('categoria') as unknown as Suggestive<ObjetoCategoria>[];
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
