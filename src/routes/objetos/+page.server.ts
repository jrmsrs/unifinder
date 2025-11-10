import { getObjetos, postObjeto } from '$lib/api';
import { stringFromBase64URL, stringToBase64URL } from '@supabase/ssr';
import { redirect, type Actions } from '@sveltejs/kit';
import sharp from 'sharp';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

/** Tipos permitidos para filtros de objetos */
type query = {
  search?: string;
  tipo?: ObjetoTipo;
  localidade?: ObjetoLocalidade[];
  categoria?: ObjetoCategoria[];
  usuario?: string;
  inativo?: true;
};

// Valores permitidos para filtros
const allTipos: ObjetoTipo[] = ['achado', 'perdido'];

const allLocals: ObjetoLocalidade[] = ['biblio', 'ru', 'ccetibio', 'cla', 'cch', 'ib', 'ccjp', 'intercampi', 'outro'];

const allCategorias: ObjetoCategoria[] = [
  'documento',
  'carteira',
  'mochila',
  'eletronico',
  'academico',
  'utensilio',
  'vestuario',
  'chaveiro',
  'outro'
];

/** Busca objetos com filtros opcionais */
const fetchFilteredObjetos = async (query?: query) => {
  const objetos = await getObjetos({ ...query });
  return objetos;
};

/** Constrói query de objetos a partir dos parâmetros da URL */
const buildObjetoQuery = (url: URL, email?: string): query => {
  const tipoUnf = url.searchParams.getAll('tipo').length > 0 ? url.searchParams.getAll('tipo') : undefined;
  const localidadeUnf = url.searchParams.getAll('localidade').length > 0 ? url.searchParams.getAll('localidade') : undefined;
  const categoriaUnf = url.searchParams.getAll('categoria').length > 0 ? url.searchParams.getAll('categoria') : undefined;
  return {
    search: url.searchParams.get('search') ?? undefined,
    tipo: tipoUnf?.length === 1 && allTipos.includes(tipoUnf[0] as ObjetoTipo) ? (tipoUnf[0] as ObjetoTipo) : undefined,
    localidade: localidadeUnf?.every((e): e is ObjetoLocalidade => allLocals.includes(e as ObjetoLocalidade)) ? localidadeUnf : undefined,
    categoria: categoriaUnf?.every((e): e is ObjetoCategoria => allCategorias.includes(e as ObjetoCategoria)) ? categoriaUnf : undefined,
    inativo: url.searchParams.get('inativo') === 'true' ? true : undefined,
    usuario: url.searchParams.get('tutela') ? email : undefined
  };
};

export const load: PageServerLoad = async ({ url, locals }) => {
  const objetoQuery = buildObjetoQuery(url, locals.user?.email);
  return {
    newObjeto: url.searchParams.get('new') === 'true',
    error: url.searchParams.get('error') || null,
    query: objetoQuery,
    form: url.searchParams.get('form') ? JSON.parse(stringFromBase64URL(url.searchParams.get('form')!)) : null,
    streamed: {
      objetos: fetchFilteredObjetos(objetoQuery)
    }
  };
};

/** Esquema de validação para criação de objeto */
const objetoSchema = z.object({
  tipo: z.enum(['achado', 'perdido'], { error: 'Selecione um tipo' }),
  titulo: z.string().trim().min(1, 'O título é obrigatório'),
  descricao: z.string().trim().min(1, 'A descrição é obrigatória'),
  localidade: z.string({ error: 'Selecione uma localidade' }).min(1),
  local_especifico: z.string().optional(),
  local_encaminhado: z.string().optional(),
  categoria: z.string({ error: 'Selecione uma categoria' }).min(1),
  imagem_arquivo: z
    .instanceof(File)
    .refine((file) => file.size < 15 * 1024 * 1024, 'A imagem deve ter no máximo 15MB.')
    .optional(),
  image_url: z.string().optional()
});

export const actions: Actions = {
  /** Cria novo objeto */
  createObjeto: async ({ request, locals: { supabase, safeGetSession } }) => {
    const session = await safeGetSession();
    if (!session) throw redirect(303, '/auth');

    const formData = await request.formData();
    const formPayload = Object.fromEntries(formData);
    const validation = objetoSchema.safeParse(formPayload);

    // Valida dados do formulário
    if (!validation.success) {
      console.error('Erro de validação:', validation.error);
      const { imagem_arquivo, ...rest } = formPayload;
      throw redirect(
        303,
        `/objetos?new=true&form=${stringToBase64URL(JSON.stringify(rest))}&error=${encodeURIComponent(
          Object.values(z.flattenError(validation.error).fieldErrors).flat().join('; ')
        )}`
      );
    }

    const { imagem_arquivo, ...otherData } = validation.data;
    let imageUrl: string | null = null;

    // Processa e faz upload da imagem (se fornecida)
    if (imagem_arquivo && imagem_arquivo.size > 0) {
      try {
        const imageBuffer = Buffer.from(await imagem_arquivo.arrayBuffer());
        // Redimensiona e comprime imagem
        const processedImageBuffer = await sharp(imageBuffer).resize(800).jpeg({ quality: 70 }).toBuffer();
        const fileName = `${crypto.randomUUID()}.jpg`;
        const filePath = `${session.user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('objetos')
          .upload(filePath, processedImageBuffer, { contentType: 'image/jpeg' });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('objetos').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      } catch (error: any) {
        console.error('Erro ao processar/enviar a imagem:', error);
        const { imagem_arquivo, ...rest } = formPayload;
        throw redirect(
          303,
          `/objetos?new=true&form=${stringToBase64URL(JSON.stringify(rest))}&error=${encodeURIComponent(
            'Não foi possível processar a imagem. Erro: ' + error.message
          )}`
        );
      }
    }

    // Cria objeto via API
    const createdObjeto = await postObjeto(
      {
        tipo: otherData.tipo,
        titulo: otherData.titulo,
        descricao: otherData.descricao,
        localidade: otherData.localidade as ObjetoLocalidade,
        local_especifico: otherData.local_especifico as string,
        local_encaminhado: otherData.tipo === 'achado' ? otherData.local_encaminhado : null,
        categoria: otherData.categoria as ObjetoCategoria,
        image_url: imageUrl ?? otherData.image_url
      },
      session.session?.access_token as string
    );

    if (!createdObjeto) {
      console.error('Erro ao criar o objeto via API');
      const { imagem_arquivo, ...rest } = formPayload;
      throw redirect(
        303,
        `/objetos?new=true&form=${stringToBase64URL(JSON.stringify({ ...rest, image_url: imageUrl }))}&error=${encodeURIComponent(
          'Ocorreu um erro ao registrar o objeto. Por favor, tente novamente.'
        )}`
      );
    }

    throw redirect(303, `/objetos/${createdObjeto.id}`);
  }
};
