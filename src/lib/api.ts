import { PUBLIC_API_BASE_URL } from '$env/static/public';

const baseObjetosApiURL = new URL('/objetos', PUBLIC_API_BASE_URL);
const baseComentariosApiURL = new URL('/comentarios', PUBLIC_API_BASE_URL);
const baseUsersApiURL = new URL('/users', PUBLIC_API_BASE_URL);
const baseClaimsApiURL = new URL('/claims', PUBLIC_API_BASE_URL);
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
  try {
    const response = await fetch(`${baseUsersApiURL}/${userId}/objetos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        nome: data.titulo,
        descricao: data.descricao,
        local_ocorrencia: data.localidade,
        tipo: data.tipo.toUpperCase(),
        categoria: data.categoria,
        url_imagem: data.image_url ?? undefined
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
  try {
    const response = await fetch(`${baseObjetosApiURL}?${dataTransformed.toString()}`, baseGetOptions).then((res) => res.json());
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
    fetch(`${baseObjetosApiURL}?${new URLSearchParams({ tipo: 'achado', status: 'aberto', page: '1', size: '5' })}`, baseGetOptions),
    fetch(`${baseObjetosApiURL}?${new URLSearchParams({ tipo: 'perdido', status: 'aberto', page: '1', size: '5' })}`, baseGetOptions)
  ];
  if (user)
    requests.push(
      fetch(`${baseUsersApiURL}/${user.id}/objetos?${new URLSearchParams({ status: 'aberto', page: '1', size: '5' })}`, baseGetOptions)
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
  try {
    const response = await fetch(`${baseObjetosApiURL}/${path.id}`, baseGetOptions).then((res) => {
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

export const getObjetosByIds = async (ids: string[]): Promise<Objeto[]> => {
  if (!ids || ids.length === 0) return [];
  try {
    const requests = ids.map((id) => fetch(`${baseObjetosApiURL}/${id}`, baseGetOptions));
    const responses = await Promise.all(requests);
    const objetos = await Promise.all(
      responses.map(async (res) => {
        if (res.status === 404) return null;
        return res.json();
      })
    );
    return objetos.filter((obj): obj is Objeto => obj !== null);
  } catch (error) {
    console.error('API error:', error);
    return [];
  }
};

type PathPutObjeto = {
  id: string;
};

type JSONPutObjetoReq = {
  tipo?: ObjetoTipo;
  titulo?: string;
  descricao?: string;
  localidade?: ObjetoLocalidade;
  local_especifico?: string;
  local_encaminhado?: string | null;
  categoria?: ObjetoCategoria;
  image_url?: string | null;
  status?: ObjetoStatus;
};

type JSONPutObjetoRes = Objeto | null;

export const putObjeto = async (path: PathPutObjeto, data: JSONPutObjetoReq, token: string): Promise<JSONPutObjetoRes> => {
  try {
    const response = await fetch(`${baseObjetosApiURL}/${path.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        nome: data.titulo,
        descricao: data.descricao,
        local_ocorrencia: data.localidade,
        tipo: data.tipo?.toUpperCase(),
        url_imagem: data.image_url ?? undefined,
        status: data.status?.toUpperCase()
      })
    }).then((res) => res.json());
    return response;
  } catch (error) {
    console.error('API error:', error);
    return null;
  }
};

type PathDeleteObjeto = {
  id: string;
};

export const deleteObjeto = async (path: PathDeleteObjeto, token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${baseObjetosApiURL}/${path.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
    return response.status === 200;
  } catch (error) {
    console.error('API error:', error);
    return false;
  }
};

type JSONGetComentariosByObjetoIdRes = {
  comentarios: Comentario[];
};

export const getComentariosByObjetoId = async (path: PathGetById): Promise<JSONGetComentariosByObjetoIdRes> => {
  try {
    const response = await fetch(`${baseObjetosApiURL}/${path.id}/comentarios`, baseGetOptions).then((res) => res.json());
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
  const username = JSON.parse(atob(token.split('.')[1])).user_metadata?.username;

  try {
    const response = await fetch(baseComentariosApiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        conteudo: data.conteudo,
        user_id: userId,
        objeto_id: data.objeto_id,
        username
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
  try {
    const response = await fetch(`${baseComentariosApiURL}/${path.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
    return response.status === 200;
  } catch (error) {
    console.error('API error:', error);
    return false;
  }
};

// claim api

type JSONPostClaimReq = {
  objeto_id: string;
  descricao: string;
  evidencias?: string[];
};

type JSONPostClaimRes = {
  id: string;
  objeto_id: string;
  descricao: string;
  evidencias: string[];
  data_registro: string;
  status: ClaimStatus;
  user_id: string;
  tutor_id: string;
} | null;

export const postClaim = async (data: JSONPostClaimReq, token: string): Promise<JSONPostClaimRes> => {
  try {
    const response = await fetch(baseClaimsApiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        objeto_id: data.objeto_id,
        descricao: data.descricao,
        evidencias: data.evidencias ?? []
      })
    }).then((res) => res.json());
    return response;
  } catch (error) {
    console.error('API error:', error);
    return null;
  }
};

// Extend JSONPostClaimRes type
type Claim = JSONPostClaimRes & { objeto?: Objeto };

type JSONGetClaimsRes = {
  items: Claim[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

export const getPendingClaims = async (params?: { page?: number; size?: number; token?: string }): Promise<JSONGetClaimsRes> => {
  const dataTransformed = new URLSearchParams();
  if (params?.page) dataTransformed.append('page', params.page.toString());
  if (params?.size) dataTransformed.append('size', params.size.toString());

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (params?.token) {
      headers['Authorization'] = `Bearer ${params.token}`;
    }

    const res = await fetch(`${baseClaimsApiURL}/pending?${dataTransformed.toString()}`, {
      method: 'GET',
      headers
    });

    if (!res.ok) {
      console.error('API error:', res.status, res.statusText);
      return {
        items: [],
        total: 0,
        page: 1,
        size: 100,
        pages: 0
      };
    }

    const response = await res.json();
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

export const getMyClaims = async (params?: { page?: number; size?: number; token?: string }): Promise<JSONGetClaimsRes> => {
  const dataTransformed = new URLSearchParams();
  if (params?.page) dataTransformed.append('page', params.page.toString());
  if (params?.size) dataTransformed.append('size', params.size.toString());

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (params?.token) {
      headers['Authorization'] = `Bearer ${params.token}`;
    }

    const res = await fetch(`${baseClaimsApiURL}/me?${dataTransformed.toString()}`, {
      method: 'GET',
      headers
    });

    if (!res.ok) {
      console.error('API error:', res.status, res.statusText);
      return {
        items: [],
        total: 0,
        page: 1,
        size: 100,
        pages: 0
      };
    }

    const response = await res.json();
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

export const approveClaim = async (claimId: string, token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${baseClaimsApiURL}/${claimId}/aprovar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
    return response.ok;
  } catch (error) {
    console.error('API error:', error);
    return false;
  }
};

export const rejectClaim = async (claimId: string, token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${baseClaimsApiURL}/${claimId}/rejeitar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
    return response.ok;
  } catch (error) {
    console.error('API error:', error);
    return false;
  }
};
