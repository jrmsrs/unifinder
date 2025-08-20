import { fakerPT_BR as fk } from '@faker-js/faker';

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

const makeObjetosFiltered = (query?: query, qty: number = 10): Objeto[] => {
  const objetos: Objeto[] = [];
  for (let i = 0; i < qty; i++) {
    const search = query?.search || '';
    const tipo = query?.tipo ? fk.helpers.arrayElement(query.tipo) : fk.helpers.arrayElement(allTipos);
    const local = query?.localidade ? fk.helpers.arrayElement(query.localidade) : fk.helpers.arrayElement(allLocals);
    const categoria = query?.categoria ? fk.helpers.arrayElement(query.categoria) : fk.helpers.arrayElement(allCategorias);
    const usuario = query?.usuario;
    objetos.push({
      id: fk.string.uuid(),
      created_at: fk.date.past().toISOString(),
      usuario: {
        id: usuario ? 'current-user-id' : fk.string.uuid(),
        username: usuario || fk.internet.username(),
        avatar_url: usuario ? 'current-user-avatar-url' : fk.image.avatar()
      },
      imagem: fk.image.urlPicsumPhotos({ width: 50, height: 50, blur: 10 }),
      titulo: search + fk.word.words(3).replace(/^(\w)(.*)/, (_, f, r) => f.toUpperCase() + r.toLowerCase()),
      descricao: fk.word.words(10).replace(/^(\w)(.*)/, (_, f, r) => f.toUpperCase() + r.toLowerCase()),
      local,
      encaminhado: tipo === 'achado' ? fk.helpers.arrayElement(allLocals) : undefined,
      tipo,
      categoria: (categoria ? categoria : fk.helpers.arrayElement(allCategorias)) as ObjetoCategoria
    });
  }
  return objetos;
};

type JSONGetObjetosReq = {
  query?: query;
  limit?: number;
};

type JSONGetObjetosRes = {
  objetos: Objeto[];
  total: number;
};

export const getObjetos = async (data?: JSONGetObjetosReq): Promise<JSONGetObjetosRes> => {
  const objetos = makeObjetosFiltered(data?.query);
  return {
    objetos,
    total: objetos.length
  };
};

type JSONGetObjetosLatestReq = {
  query?: query;
  limit?: number;
};

type JSONGetObjetosLatestRes = {
  latestObjetos: { achados: Objeto[]; perdidos: Objeto[] };
  tutelados?: Objeto[];
};

export const getObjetosLatest = async (data?: JSONGetObjetosLatestReq): Promise<JSONGetObjetosLatestRes> => {
  const objetos = makeObjetosFiltered(data?.query, data?.limit);
  const achados = objetos.filter((obj) => obj.tipo === 'achado');
  const perdidos = objetos.filter((obj) => obj.tipo === 'perdido');
  return {
    latestObjetos: { achados, perdidos },
    tutelados: [
      achados[Math.floor(Math.random() * achados.length)] ?? perdidos[Math.floor(Math.random() * perdidos.length)],
      perdidos[Math.floor(Math.random() * perdidos.length)] ?? achados[Math.floor(Math.random() * achados.length)]
    ]
  };
};
