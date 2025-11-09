import { finalizeClaim, getMyClaims, postClaim } from '$lib/api/claims';
import { deleteComentario, getComentariosByObjetoId, postComentario } from '$lib/api/comentarios';
import { deleteObjeto, finishObjeto, getObjetoById } from '$lib/api/objetos';
import { stringFromBase64URL, stringToBase64URL } from '@supabase/ssr';
import { redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

/** Busca um objeto pelo ID */
const fetchObjeto = async (id: string) => {
  const objeto = await getObjetoById({ id });
  return objeto;
};

/** Busca comentários associados ao objeto */
const fetchComentarios = async (id: string) => {
  const comentarios = await getComentariosByObjetoId({ id });
  return comentarios;
};

/** Busca reivindicações do usuário logado */
const fetchMyClaims = async (token: string) => {
  const claims = await getMyClaims({ page: 1, size: 100, token });
  return claims;
};

export const load: PageServerLoad = async ({ params, url, locals: { safeGetSession } }) => {
  const { session } = await safeGetSession();

  return {
    form: url.searchParams.get('form') ? JSON.parse(stringFromBase64URL(url.searchParams.get('form')!)) : null,
    commentError: url.searchParams.get('comment_error') || null,
    finishError: url.searchParams.get('finish_error') || null,
    streamed: {
      objeto: fetchObjeto(params.id),
      comentarios: fetchComentarios(params.id),
      myClaims: session ? fetchMyClaims(session.access_token) : Promise.resolve({ items: [], total: 0 })
    }
  };
};

/** Schema de validação para reivindicação */
const claimSchema = z.object({
  descricao: z.string(),
  evidencias: z
    .array(z.instanceof(File))
    .max(5, 'Você pode enviar no máximo 5 arquivos como evidência.')
    .refine((files) => files.every((file) => file.size <= 5 * 1024 * 1024), 'Cada arquivo deve ter no máximo 5MB.')
    .optional()
});

/** Schema de validação para finalização de objeto */
const finishSchema = z.object({
  motivo_finalizacao: z
    .string()
    .min(10, 'O motivo deve ter pelo menos 10 caracteres.')
    .max(500, 'O motivo deve ter no máximo 500 caracteres.')
});

export const actions: Actions = {
  updateObjeto: async () => {},

  /** Finaliza objeto (tutor encerra o ciclo do objeto) */
  finishObjeto: async ({ request, params, locals: { safeGetSession } }) => {
    const session = await safeGetSession();
    if (!session.session) {
      throw redirect(303, '/auth?redirect=/objetos/' + params.id);
    }

    const formData = await request.formData();
    const formPayload = {
      motivo_finalizacao: formData.get('motivo_finalizacao')
    };

    const validation = finishSchema.safeParse(formPayload);

    if (!validation.success) {
      console.error('Erro de validação:', validation.error);
      throw redirect(
        303,
        `/objetos/${params.id}?finish_error=${encodeURIComponent(validation.error.message)}&form=${stringToBase64URL(JSON.stringify(formPayload))}`
      );
    }

    const result = await finishObjeto(params.id as string, validation.data.motivo_finalizacao, session.session.access_token);

    if (!result) {
      throw redirect(
        303,
        `/objetos/${params.id}?finish_error=${encodeURIComponent('Erro ao finalizar objeto. Tente novamente.')}&form=${stringToBase64URL(JSON.stringify({ motivo_finalizacao: formPayload.motivo_finalizacao }))}`
      );
    }

    throw redirect(303, '/objetos?message=Objeto finalizado com sucesso!');
  },

  /** Cria reivindicação de objeto */
  claimObjeto: async ({ request, params, locals: { safeGetSession } }) => {
    const session = await safeGetSession();
    if (!session.session) {
      throw redirect(303, '/auth?redirect=/objetos/' + params.id);
    }

    const formData = await request.formData();
    const formPayload = {
      descricao: formData.get('descricao'),
      evidencias: Array.from(formData.getAll('evidencias')).filter((item) => item instanceof File)
    };

    const validation = claimSchema.safeParse(formPayload);

    if (!validation.success) {
      console.error('Erro de validação:', validation.error);
      const { evidencias, ...rest } = formPayload;
      throw redirect(
        303,
        `/objetos/${params.id}?error=${encodeURIComponent(validation.error.message)}&form=${stringToBase64URL(JSON.stringify(rest))}`
      );
    }

    const result = await postClaim(
      {
        objeto_id: params.id as string,
        descricao: validation.data.descricao,
        evidencias: ['upload-nao-implementado']
      },
      session.session.access_token
    );

    if (!result) {
      throw redirect(
        303,
        `/objetos/${params.id}?error=${encodeURIComponent('Erro ao enviar reivindicação. Tente novamente.')}&form=${stringToBase64URL(
          JSON.stringify({ descricao: formPayload.descricao })
        )}`
      );
    }
  },

  /** Exclui objeto (apenas tutor) */
  deleteObjeto: async ({ request, params, locals: { safeGetSession } }) => {
    const session = await safeGetSession();
    if (!session.session) {
      throw redirect(303, '/auth?redirect=/objetos/' + params.id);
    }

    const success = await deleteObjeto({ id: params.id as string }, session.session.access_token);

    if (!success) {
      throw redirect(303, `/objetos/${params.id}?error=${encodeURIComponent('Erro ao excluir objeto. Tente novamente.')}`);
    }

    throw redirect(303, `/objetos`);
  },

  /** Cria comentário no objeto */
  createComentario: async ({ request, params, locals: { safeGetSession } }) => {
    const session = await safeGetSession();
    if (!session.session) {
      throw redirect(303, '/auth?redirect=/objetos/' + params.id);
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

  /** Exclui comentário (apenas autor) */
  deleteComentario: async ({ request, params, locals: { safeGetSession } }) => {
    const session = await safeGetSession();
    if (!session.session) {
      throw redirect(303, '/auth?redirect=/objetos/' + params.id);
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
  },

  /** Finaliza reivindicação a partir da tela do objeto */
  finalizeClaimFromObject: async ({ request, params, locals: { safeGetSession } }) => {
    console.log('pingou');
    const session = await safeGetSession();
    if (!session.session) {
      throw redirect(303, '/auth?redirect=/objetos/' + params.id);
    }

    const formData = await request.formData();
    const claimId = formData.get('claimId') as string;

    if (!claimId) {
      throw redirect(303, `/objetos/${params.id}?error=${encodeURIComponent('ID da reivindicação não encontrado.')}`);
    }

    const success = await finalizeClaim(claimId, session.session.access_token);

    if (!success) {
      throw redirect(
        303,
        `/objetos/${params.id}?error=${encodeURIComponent('Erro ao finalizar reivindicação. Verifique se está aprovada.')}`
      );
    }

    throw redirect(303, `/objetos/${params.id}?message=Reivindicação finalizada com sucesso!`);
  }
};
