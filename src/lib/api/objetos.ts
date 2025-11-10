import { PUBLIC_API_BASE_URL } from '$env/static/public';

const baseObjetosApiURL = new URL('/objetos', PUBLIC_API_BASE_URL);
const baseUsersApiURL = new URL('/users', PUBLIC_API_BASE_URL);
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

type JSONPutObjetoReq = Partial<JSONPostObjetoReq> & {
  status?: ObjetoStatus;
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

export const postObjeto = async (data: JSONPostObjetoReq, token: string): Promise<Objeto | null> => {
  const userId = JSON.parse(atob(token.split('.')[1])).sub;
  try {
    const response = await fetch(`${baseUsersApiURL}/${userId}/objetos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        nome: data.titulo,
        descricao: data.descricao,
        local_ocorrencia: data.localidade,
        local_armazenamento: (data.local_encaminhado ?? data.tipo.toLocaleLowerCase() === 'achado') ? 'Em mãos' : undefined,
        local_especifico: data.local_especifico,
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

export const getObjetos = async (data?: JSONGetObjetosReq): Promise<JSONGetObjetosRes> => {
  const dataTransformed = new URLSearchParams();
  if (data?.search) dataTransformed.append('search', data.search);
  if (data?.tipo) dataTransformed.append('tipo', data.tipo);
  if (data?.usuario) dataTransformed.append('usuario', data.usuario);
  if (data?.localidade) data.localidade.forEach((loc) => dataTransformed.append('local_ocorrencia', loc));
  if (data?.categoria) data.categoria.forEach((cat) => dataTransformed.append('categoria', cat));
  if (data?.page) dataTransformed.append('page', data.page.toString());
  if (data?.size) dataTransformed.append('size', data.size.toString());
  dataTransformed.append('status', data?.inativo ? 'finalizado' : 'aberto');

  try {
    const response = await fetch(`${baseObjetosApiURL}?${dataTransformed.toString()}`, baseGetOptions).then((res) => res.json());
    return response;
  } catch (error: any) {
    console.error('API error:', error?.message);
    return { items: [], total: 0, page: 1, size: 100, pages: 0 };
  }
};

export const getObjetoById = async (path: PathById): Promise<Objeto | null> => {
  try {
    const response = await fetch(`${baseObjetosApiURL}/${path.id}`, baseGetOptions).then((res) => {
      if (res.status === 404) return null;
      return res.json();
    });
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

export const getObjetosLatest = async (user?: { id: string; email: string }) => {
  const requests = [
    fetch(`${baseObjetosApiURL}?${new URLSearchParams({ tipo: 'achado', status: 'aberto', page: '1', size: '5' })}`, baseGetOptions),
    fetch(`${baseObjetosApiURL}?${new URLSearchParams({ tipo: 'perdido', status: 'aberto', page: '1', size: '5' })}`, baseGetOptions)
  ];
  if (user) {
    requests.push(
      fetch(`${baseUsersApiURL}/${user.id}/objetos?${new URLSearchParams({ status: 'aberto', page: '1', size: '5' })}`, baseGetOptions)
    );
  }

  try {
    const responses = await Promise.all(requests);
    const responseAchados = await responses[0].json();
    const responsePerdidos = await responses[1].json();
    let responseTutelados = user ? await responses[2].json() : undefined;

    if (user) {
      responseTutelados = {
        ...responseTutelados,
        items: responseTutelados.items.filter((objeto: Objeto) => objeto.status.toLowerCase() !== 'finalizado')
      };
    }

    return {
      latestObjetos: { achados: responseAchados.items, perdidos: responsePerdidos.items },
      tutelados: responseTutelados?.items ?? undefined
    };
  } catch (error) {
    console.error('API error:', error);
    return { latestObjetos: { achados: [], perdidos: [] }, tutelados: [] };
  }
};

export const putObjeto = async (id: string, data: JSONPutObjetoReq, token: string): Promise<Objeto | null> => {
  try {
    const response = await fetch(`${baseObjetosApiURL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        nome: data.titulo,
        descricao: data.descricao,
        local_ocorrencia: data.localidade,
        local_armazenamento: data.local_encaminhado,
        local_especifico: data.local_especifico,
        tipo: data.tipo?.toUpperCase(),
        categoria: data.categoria,
        status: data.status,
        url_imagem: data.image_url ?? undefined
      })
    }).then((res) => res.json());
    return response;
  } catch (error) {
    console.error('API error:', error);
    return null;
  }
};

export const deleteObjeto = async (path: PathById, token: string): Promise<boolean> => {
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

export const finishObjeto = async (id: string, motivo_finalizacao: string, accessToken: string): Promise<boolean> => {
  try {
    const response = await fetch(`${baseObjetosApiURL}/${id}/finalizar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ motivo_finalizacao })
    });

    if (!response.ok) {
      console.error('Erro ao finalizar objeto:', response.statusText);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Erro ao finalizar objeto:', error);
    return false;
  }
};
