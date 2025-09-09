import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { fakerPT_BR as fk } from '@faker-js/faker';

const baseObjetoApiURL = new URL('/objetos', PUBLIC_API_BASE_URL);
const baseGetOptions = { method: 'GET', headers: { 'Content-Type': 'application/json' } };

type query = {
  search?: string;
  tipo?: ObjetoTipo;
  localidade?: ObjetoLocalidade[];
  categoria?: ObjetoCategoria[];
  usuario?: string;
  inativo?: true;
};

const makeComentarios = (userEmail?: string): Comentario[] => {
  const comentarios: Comentario[] = [];
  for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
    const isOwn = Boolean(Math.random() > 0.5 && userEmail);
    const genre = Math.random() > 0.5 ? 'female' : 'male';
    const firstName = fk.person.firstName(genre);
    const lastName = fk.person.lastName(genre);
    comentarios.push({
      id: fk.string.uuid(),
      created_at: fk.date.past().toISOString(),
      usuario: {
        id: fk.string.uuid(),
        username: isOwn ? (userEmail as string).split('@')[0] : fk.internet.username({ firstName, lastName }),
        email: isOwn ? (userEmail as string) : fk.internet.email({ firstName, lastName }),
        avatar_url: fk.image.avatar()
      },
      texto: fk.lorem.sentence()
    });
  }
  return comentarios;
};

type JSONGetObjetosReq = {
  query?: query;
  limit?: number;
};

type JSONGetObjetosRes = {
  items: Objeto[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

export const getObjetos = async (data?: JSONGetObjetosReq): Promise<JSONGetObjetosRes> => {
  const url = `${baseObjetoApiURL}?${new URLSearchParams({ page: '1', size: (data?.limit || 10).toString() })}`;
  try {
    const response = await fetch(url, baseGetOptions).then((res) => res.json());
    return response;
  } catch (error: any) {
    console.error('API error:', error?.message);
    return {
      items: [],
      total: 0,
      page: 1,
      size: data?.limit || 10,
      pages: 0
    };
  }
};

type JSONGetObjetosLatestRes = {
  latestObjetos: { achados: Objeto[]; perdidos: Objeto[] };
  tutelados?: Objeto[];
};

export const getObjetosLatest = async (user?: { id: string; email: string }): Promise<JSONGetObjetosLatestRes> => {
  const requests = [
    fetch(`${baseObjetoApiURL}?${new URLSearchParams({ tipo: 'achado', status: 'ABERTO', page: '1', size: '5' })}`, baseGetOptions),
    fetch(`${baseObjetoApiURL}?${new URLSearchParams({ tipo: 'perdido', status: 'ABERTO', page: '1', size: '5' })}`, baseGetOptions)
  ];
  if (user)
    requests.push(
      fetch(`${baseObjetoApiURL}?${new URLSearchParams({ usuario: user.email, status: 'ABERTO', page: '1', size: '5' })}`, baseGetOptions)
    );
  try {
    const responses = await Promise.all(requests);
    const responseAchados = await responses[0].json();
    const responsePerdidos = await responses[1].json();
    const responseTutelados = user ? await responses[2].json() : undefined;
    return {
      latestObjetos: {
        achados: responseAchados.items,
        perdidos: responsePerdidos.items
      },
      tutelados: user ? responseTutelados?.items : undefined
    };
  } catch (error) {
    console.error('API error:', error);
    return {
      latestObjetos: {
        achados: [],
        perdidos: []
      },
      tutelados: []
    };
  }
};

type PathGetById = {
  id: string;
};

type JSONGetObjetoByIdRes = Objeto | null;

export const getObjetoById = async (path: PathGetById): Promise<JSONGetObjetoByIdRes> => {
  const url = `${baseObjetoApiURL}/${path.id}`;
  try {
    const response = await fetch(url.toString(), baseGetOptions).then((res) => {
      if (res.status === 404) return null;
      return res.json();
    });
    if (response === null) return null;
    return response;
  } catch (error) {
    console.error('API error:', error);
    return null;
  }
};

type JSONGetComentariosByObjetoIdRes = {
  comentarios: Comentario[];
};

export const getComentariosByObjetoId = async (path: PathGetById, userEmail?: string): Promise<JSONGetComentariosByObjetoIdRes> => {
  const comentarios = makeComentarios(userEmail);
  return {
    comentarios
  };
};
