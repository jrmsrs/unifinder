import { deleteComentario, deleteObjeto, getComentariosByObjetoId, getObjetoById, postComentario } from '$lib/api';
import { stringFromBase64URL, stringToBase64URL } from '@supabase/ssr';
import { redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

const fetchObjeto = async (id: string) => {
  const objeto = await getObjetoById({ id });
  return objeto;
};

const fetchComentarios = async (id: string) => {
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));
  const comentarios = await getComentariosByObjetoId({ id });
  return comentarios;
};

export const load: PageServerLoad = ({ params, url }) => {
  return {
    form: url.searchParams.get('form') ? JSON.parse(stringFromBase64URL(url.searchParams.get('form')!)) : null,
    commentError: url.searchParams.get('comment_error') || null,
    streamed: {
      objeto: fetchObjeto(params.id),
      comentarios: fetchComentarios(params.id)
    }
  };
};

export const actions: Actions = {
  updateObjeto: async () => {},
  finishObjeto: async () => {},
  claimObjeto: async () => {},
  deleteObjeto: async ({ request, params, locals: { safeGetSession } }) => {
    const session = await safeGetSession();
    if (!session.session) {
      throw redirect(303, '/login?redirect=/objetos/' + params.id);
    }
    const success = await deleteObjeto({ id: params.id as string }, session.session.access_token);
    if (!success) {
      throw redirect(303, `/objetos/${params.id}?error=${encodeURIComponent('Erro ao excluir objeto. Tente novamente.')}`);
    }
    throw redirect(303, `/objetos`);
  },
  createComentario: async ({ request, params, locals: { safeGetSession } }) => {
    const session = await safeGetSession();
    if (!session.session) {
      throw redirect(303, '/login?redirect=/objetos/' + params.id);
    }
    const formData = await request.formData();
    const conteudo = formData.get('conteudo');
    const schema = z.object({
      conteudo: z.string().min(1, 'O comentário não pode ser vazio.').max(1000, 'O comentário deve ter no máximo 1000 caracteres.')
    });
    const parsed = schema.safeParse({ conteudo });
    if (!parsed.success) {
      throw redirect(
        303,
        `/objetos/${params.id}?comment_error=${encodeURIComponent(parsed.error.message)}&form=${stringToBase64URL(JSON.stringify({ conteudo }))}`
      );
    }
    const comentario = await postComentario(
      {
        conteudo: parsed.data.conteudo,
        user_id: session.session.user.id,
        objeto_id: params.id as string
      },
      session.session.access_token
    );
    if (!comentario) {
      throw redirect(
        303,
        `/objetos/${params.id}?comment_error=${encodeURIComponent('Erro ao publicar comentário. Tente novamente.')}&form=${stringToBase64URL(JSON.stringify({ conteudo }))}`
      );
    }
    throw redirect(303, `/objetos/${params.id}`);
  },
  deleteComentario: async ({ request, params, locals: { safeGetSession } }) => {
    const session = await safeGetSession();
    if (!session.session) {
      throw redirect(303, '/login?redirect=/objetos/' + params.id);
    }
    const formData = await request.formData();
    const id = formData.get('id');
    if (!id) {
      throw redirect(303, `/objetos/${params.id}?comment_error=${encodeURIComponent('ID do comentário não encontrado.')}`);
    }
    const success = await deleteComentario({ id: id as string }, session.session.access_token);
    if (!success) {
      throw redirect(303, `/objetos/${params.id}?comment_error=${encodeURIComponent('Erro ao excluir comentário. Tente novamente.')}`);
    }
    throw redirect(303, `/objetos/${params.id}`);
  }
};
