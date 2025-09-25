import { getObjetos, postObjeto } from '$lib/api';
import { stringFromBase64URL, stringToBase64URL } from '@supabase/ssr';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

type query = {
  search?: string;
  tipo?: ObjetoTipo;
  localidade?: ObjetoLocalidade[];
  categoria?: ObjetoCategoria[];
  usuario?: string;
  inativo?: true;
};

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

const fetchFilteredObjetos = async (query?: query) => {
  const objetos = await getObjetos({ ...query });
  return objetos;
};

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

export const actions: Actions = {
  createObjeto: async ({ request, locals: { safeGetSession } }) => {
    const session = await safeGetSession();
    if (!session) throw redirect(303, '/auth');

    const formData = await request.formData();
    const tipo = formData.get('tipo') as ObjetoTipo;
    const titulo = formData.get('titulo') as string;
    const descricao = formData.get('descricao') as string;
    const localidade = formData.get('localidade') as ObjetoLocalidade;
    const local_especifico = formData.get('local_especifico') as string;
    const local_encaminhado =
      tipo === 'achado'
        ? formData.get('local_encaminhado') !== 'wip-outro'
          ? (formData.get('local_encaminhado') as string)
          : (formData.get('local_encaminhado_add') as string)
        : null;
    const categoria = formData.get('categoria') as ObjetoCategoria;
    const image_url = formData.get('image_url') as string | null;

    if (!tipo || (tipo === 'achado' && !local_encaminhado) || !titulo || !descricao || !localidade || !categoria) {
      console.log('Faltando campo obrigatório');
      throw redirect(
        303,
        `/objetos?\
new=true${tipo ? `&tipo=${tipo}` : ''}&\
form=${stringToBase64URL(JSON.stringify({ tipo, titulo, descricao, localidade, local_especifico, local_encaminhado, categoria, image_url }))}&\
error=${encodeURIComponent('Todos os campos com (*) são obrigatórios')}`
      );
    }

    const createdObjeto = await postObjeto(
      {
        tipo,
        titulo,
        descricao,
        localidade,
        local_especifico,
        local_encaminhado,
        categoria,
        image_url: image_url && image_url.length > 0 ? image_url : null
      },
      session.session?.access_token ?? ''
    );
    console.log('createdObjeto', createdObjeto);
    if (!createdObjeto) {
      throw redirect(
        303,
        `/objetos?\
new=true${tipo ? `&tipo=${tipo}` : ''}&\
form=${stringToBase64URL(JSON.stringify({ tipo, titulo, descricao, localidade, local_especifico, local_encaminhado, categoria, image_url }))}&\
error=${encodeURIComponent('Não foi possível criar o objeto. Tente novamente mais tarde.')}`
      );
    }
    throw redirect(303, `/objetos/${createdObjeto.id}`);
  }
};
