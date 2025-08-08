import { fakerPT_BR as fk } from '@faker-js/faker';
import type { PageServerLoad } from './$types';

type filter = {
  tipo?: 'achado' | 'perdido';
  categorias?: string[];
  descritores?: string[];
  usuario?: string;
};

const makeFilteredObjetos = (qty: number, filter?: filter) => {
  const objetos: Objeto[] = [];
  for (let i = 0; i < qty; i++) {
    const tipo = filter?.tipo || fk.helpers.arrayElement(['achado', 'perdido']);
    let categorias: string[] = [];
    if (filter?.categorias) categorias = filter.categorias;
    let descritores: string[] = [];
    if (filter?.descritores) descritores = filter.descritores;
    objetos.push({
      id: fk.string.uuid(),
      created_at: fk.date.past().toISOString(),
      usuario: {
        id: fk.string.uuid(),
        username: fk.internet.username(),
        avatar_url: fk.image.avatar()
      },
      imagem: fk.image.urlPicsumPhotos({ width: 50, height: 50, blur: 10 }),
      titulo: fk.word.words(3).replace(/^(\w)(.*)/, (_, f, r) => f.toUpperCase() + r.toLowerCase()),
      descricao: fk.word
        .words(10)
        .replace(/^(\w)(.*)/, (_, f, r) => f.toUpperCase() + r.toLowerCase()),
      local: fk.location.city(),
      encaminhado: tipo === 'achado' ? fk.location.city() : undefined,
      tipo,
      categorias: categorias.length
        ? categorias
        : [fk.lorem.word(), fk.lorem.word(), fk.lorem.word()],
      descritores: descritores.length
        ? descritores
        : [fk.lorem.word(), fk.lorem.word(), fk.lorem.word()]
    });
  }
  return objetos;
};

const fetchFilteredObjetos = async (qty: number, filter?: filter) => {
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));
  return makeFilteredObjetos(qty, filter);
};

export const load: PageServerLoad = async ({ url }) => {
  const tipoParam = url.searchParams.get('tipo');
  const tipo = tipoParam === 'achado' || tipoParam === 'perdido' ? tipoParam : undefined;
  const categorias = url.searchParams.getAll('categorias');
  const descritores = url.searchParams.getAll('descritores');
  const usuario = url.searchParams.get('usuario');
  const filter: filter = {
    tipo,
    categorias: categorias.length ? categorias : undefined,
    descritores: descritores.length ? descritores : undefined,
    usuario: usuario || undefined
  };

  return {
    streamed: {
      objetos: fetchFilteredObjetos(10, filter)
    }
  };
};

//       encaminhado: tipo === 'achado' ? fk.location.city() : undefined,
//       tipo,
//       categorias: [fk.lorem.word(), fk.lorem.word(), fk.lorem.word()],
//       descritores: [fk.lorem.word(), fk.lorem.word(), fk.lorem.word()]
//     });
//   }
//   return objetos;
// };

// const latestObjetos = {
//   achados: makeObjetos('achado', 5),
//   perdidos: makeObjetos('perdido', 5)
// };

// const fetchLatestObjetos = async () => {
//   await new Promise<void>((resolve) => setTimeout(resolve, 2000));
//   return latestObjetos;
// };

// const fetchTutelados = async () => {
//   await new Promise<void>((resolve) => setTimeout(resolve, 2000));
//   return [
//     latestObjetos.achados[Math.floor(Math.random() * latestObjetos.achados.length)],
//     latestObjetos.perdidos[Math.floor(Math.random() * latestObjetos.perdidos.length)]
//   ];
// };

// export const load: PageServerLoad = () => {
//   return {
//     streamed: {
//       latestObjetos: fetchLatestObjetos(),
//       tutelados: fetchTutelados()
//     }
//   };
// };
