import { PUBLIC_API_BASE_URL } from '$env/static/public';

const baseComentariosApiURL = new URL('/comentarios', PUBLIC_API_BASE_URL);
const baseObjetosApiURL = new URL('/objetos', PUBLIC_API_BASE_URL);
const baseGetOptions: RequestInit = { method: 'GET', headers: { 'Content-Type': 'application/json' } };

type JSONGetComentariosByObjetoIdRes = {
  comentarios: Comentario[];
};

export const getComentariosByObjetoId = async (path: PathById): Promise<JSONGetComentariosByObjetoIdRes> => {
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

export const deleteComentario = async (path: PathById, token: string): Promise<boolean> => {
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
