import { PUBLIC_API_BASE_URL } from '$env/static/public';

const baseObjetoApiURL = new URL('/objetos', PUBLIC_API_BASE_URL);
const baseGetOptions: RequestInit = { method: 'GET', headers: { 'Content-Type': 'application/json' } };

type JSONPostObjetoReq = {
  tipo: ObjetoTipo;
  titulo: string;
  descricao: string;
  localidade: ObjetoLocalidade;
  local_especifico: string;
  local_encaminhado?: string | null;
  categoria: ObjetoCategoria;
  image_url?: string | null;
};

type JSONPostObjetoRes = Objeto | null;

export const postObjeto = async (data: JSONPostObjetoReq, token: string): Promise<JSONPostObjetoRes> => {
  const userId = JSON.parse(atob(token.split('.')[1])).sub;
  const url = new URL(`/users/${userId}/objetos`, PUBLIC_API_BASE_URL);
  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        nome: data.titulo,
        descricao: data.descricao,
        local_ocorrencia: data.localidade,
        tipo: data.tipo.toUpperCase()
      })
    }).then((res) => res.json());
    return response;
  } catch (error) {
    console.error('API error:', error);
    return null;
  }
};

type JSONGetObjetosReq = {
  search?: string;
  tipo?: ObjetoTipo;
  usuario?: string;
  localidade?: ObjetoLocalidade[];
  categoria?: ObjetoCategoria[];
  page?: number;
  size?: number;
  inativo?: true;
};

type JSONGetObjetosRes = {
  items: Objeto[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

export const getObjetos = async (data?: JSONGetObjetosReq): Promise<JSONGetObjetosRes> => {
  const dataTransformed = new URLSearchParams();
  if (data?.search) dataTransformed.append('search', data.search);
  if (data?.tipo) dataTransformed.append('tipo', data.tipo);
  if (data?.usuario) dataTransformed.append('usuario', data.usuario);
  if (data?.localidade) data.localidade.forEach((loc) => dataTransformed.append('localidade', loc));
  if (data?.categoria) data.categoria.forEach((cat) => dataTransformed.append('categoria', cat));
  if (data?.page) dataTransformed.append('page', data.page.toString());
  if (data?.size) dataTransformed.append('size', data.size.toString());
  dataTransformed.append('status', data?.inativo ? 'finalizado' : 'aberto');
  const url = `${baseObjetoApiURL}?${dataTransformed.toString()}`;
  try {
    const response = await fetch(url, baseGetOptions).then((res) => res.json());
    return response;
  } catch (error: any) {
    console.error('API error:', error?.message);
    return {
      items: [],
      total: 0,
      page: 1,
      size: 100,
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

export const getComentariosByObjetoId = async (path: PathGetById): Promise<JSONGetComentariosByObjetoIdRes> => {
  const url = new URL(`/objetos/${path.id}/comentarios`, PUBLIC_API_BASE_URL);
  try {
    const response = await fetch(url.toString(), baseGetOptions).then((res) => res.json());
    return {
      comentarios: response.items
    };
  } catch (error) {
    console.error('API error:', error);
    return {
      comentarios: []
    };
  }
};

type JSONPostComentarioReq = {
  conteudo: string;
  user_id: string;
  objeto_id: string;
};

type JSONPostComentarioRes = Comentario | null;

export const postComentario = async (data: JSONPostComentarioReq, token: string): Promise<JSONPostComentarioRes> => {
  const userId = JSON.parse(atob(token.split('.')[1])).sub;
  const url = new URL('/comentarios', PUBLIC_API_BASE_URL);

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        conteudo: data.conteudo,
        user_id: userId,
        objeto_id: data.objeto_id
      })
    }).then((res) => res.json());
    return response;
  } catch (error) {
    console.error('API error:', error);
    return null;
  }
};

type PathDeleteComentario = {
  id: string;
};

export const deleteComentario = async (path: PathDeleteComentario, token: string): Promise<boolean> => {
  const url = new URL(`/comentarios/${path.id}`, PUBLIC_API_BASE_URL);
  try {
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
    return response.status === 200;
  } catch (error) {
    console.error('API error:', error);
    return false;
  }
};
