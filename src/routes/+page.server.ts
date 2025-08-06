import { fakerPT_BR as fk } from '@faker-js/faker';
import type { PageServerLoad } from './$types';

const makeObjetos = (tipo: 'achado' | 'perdido', qty: number) => {
  const objetos: Objeto[] = [];
  for (let i = 0; i < qty; i++) {
    objetos.push({
      id: fk.string.uuid(),
      created_at: fk.date.past().toISOString(),
      usuario: { id: fk.string.uuid(), username: fk.internet.username() },
      avatar_url: fk.image.avatar(),
      imagem: fk.image.urlPicsumPhotos({ width: 50, height: 50, blur: 10 }),
      titulo: fk.word.words(3).replace(/^(\w)(.*)/, (_, f, r) => f.toUpperCase() + r.toLowerCase()),
      descricao: fk.word
        .words(10)
        .replace(/^(\w)(.*)/, (_, f, r) => f.toUpperCase() + r.toLowerCase()),
      local: fk.location.city(),
      encaminhado: tipo === 'achado' ? fk.location.city() : undefined,
      tipo,
      categorias: [fk.lorem.word(), fk.lorem.word(), fk.lorem.word()],
      descritores: [fk.lorem.word(), fk.lorem.word(), fk.lorem.word()]
    });
  }
  return objetos;
};

const latestObjetos = {
  achados: makeObjetos('achado', 5),
  perdidos: makeObjetos('perdido', 5)
};

const fetchLatestObjetos = async () => {
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));
  return latestObjetos;
};

const fetchTutelados = async () => {
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));
  return [
    latestObjetos.achados[Math.floor(Math.random() * latestObjetos.achados.length)],
    latestObjetos.perdidos[Math.floor(Math.random() * latestObjetos.perdidos.length)]
  ];
};

export const load: PageServerLoad = () => {
  return {
    streamed: {
      latestObjetos: fetchLatestObjetos(),
      tutelados: fetchTutelados()
    }
  };
};
