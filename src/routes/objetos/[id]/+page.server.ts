import { finalizeClaim, getMyClaims, postClaim } from '$lib/api/claims';
import { deleteComentario, getComentariosByObjetoId, postComentario } from '$lib/api/comentarios';
import { deleteObjeto, finishObjeto, getObjetoById, putObjeto } from '$lib/api/objetos';
import { stringFromBase64URL, stringToBase64URL } from '@supabase/ssr';
import { fail, redirect, error as svelteError, type Actions } from '@sveltejs/kit';
import sharp from 'sharp';
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
  motivo_finalizacao: z.string().min(1, 'O motivo deve ter pelo menos 1 caractere.').max(500, 'O motivo deve ter no máximo 500 caracteres.')
});

// Schema de validação para a edição
const editSchema = z.object({
  id: z.string().uuid('ID inválido'),
  titulo: z.string().trim().min(1, 'O título é obrigatório'),
  descricao: z.string().trim().min(1, 'A descrição é obrigatória'),
  localidade: z.enum(['biblio', 'ccetibio', 'cch', 'ccjp', 'cla', 'ib', 'intercampi', 'ru', 'outro']),
  local_especifico: z.string().optional(),
  local_encaminhado: z.string().optional(),
  categoria: z.enum(['academico', 'carteira', 'chaveiro', 'documento', 'eletronico', 'mochila', 'utensilio', 'vestuario', 'outro']),
  tipo: z.enum(['achado', 'perdido']),
  image_url: z.string().url().optional().nullable(),
  imagem_arquivo: z.instanceof(File).optional()
});

export const actions: Actions = {
  updateObjeto: async ({ request, locals }) => {
    const { session, supabase } = locals;

    if (!session) {
      throw svelteError(401, 'Usuário não autenticado.');
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Trata os dados do formulário
    const imageFile = data.imagem_arquivo instanceof File ? data.imagem_arquivo : undefined;
    let imageUrl: string | undefined | null = data.image_url as string | undefined;
    if (imageUrl === 'undefined' || imageUrl === '') imageUrl = null;
    if (imageUrl?.startsWith('blob:') && !(imageFile && imageFile.size > 0)) imageUrl = undefined;

    const validated = editSchema.safeParse({
      ...data,
      image_url: imageUrl,
      imagem_arquivo: imageFile && imageFile.size > 0 ? imageFile : undefined,
      local_especifico: data.local_especifico || undefined,
      local_encaminhado: data.local_encaminhado || undefined
    });

    // Retorna erros de validação
    if (!validated.success) {
      console.error('Erro de validação:', validated.error);
      return fail(400, { ...data, error: Object.values(z.flattenError(validated.error).fieldErrors).flat().join('; ') });
    }

    const { id, ...otherData } = validated.data;
    let finalImageUrl: string | null | undefined = otherData.image_url;

    // Lógica de Upload de Imagem
    if (imageFile && imageFile.size > 0) {
      try {
        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        const processedImageBuffer = await sharp(imageBuffer).resize(800).jpeg({ quality: 70 }).toBuffer();

        const fileName = `${crypto.randomUUID()}.jpg`;
        const filePath = `${session.user.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage.from('objetos').upload(filePath, processedImageBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl }
        } = supabase.storage.from('objetos').getPublicUrl(uploadData.path);
        finalImageUrl = publicUrl;
      } catch (error: any) {
        console.error('Erro ao processar/enviar a imagem:', error);
        return fail(500, {
          ...data,
          error: 'Não foi possível processar a imagem. Erro: ' + error.message
        });
      }
    } else if (otherData.image_url === null && !imageFile) {
      console.log('hm');
      finalImageUrl = null;
    } else if (!otherData.image_url && !imageFile) {
      console.log('ehm');
      finalImageUrl = null;
    }

    // Chama a API para atualizar o objeto
    const apiResult = await putObjeto(
      id,
      {
        titulo: otherData.titulo,
        descricao: otherData.descricao,
        localidade: otherData.localidade,
        local_especifico: otherData.local_especifico || undefined,
        local_encaminhado: otherData.local_encaminhado || undefined,
        categoria: otherData.categoria,
        tipo: otherData.tipo,
        image_url: finalImageUrl // AGORA DEVE SER `null`
      },
      session.access_token
    );

    if (!apiResult) {
      return fail(500, {
        ...data,
        error: 'Erro na API ao atualizar o objeto. Por favor, tente novamente.'
      });
    }

    throw redirect(303, `/objetos/${id}`);
  },

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
