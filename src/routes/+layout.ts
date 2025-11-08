import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  // Declara dependência para invalidação do layout (ex: refresh de sessão)
  depends('supabase:auth');

  // Cria cliente Supabase apropriado (browser ou server)
  const supabase = isBrowser()
    ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: { fetch }
      })
    : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: { fetch },
        cookies: {
          getAll() {
            return data.cookies;
          }
        }
      });

  // Recupera sessão e usuário autenticados
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return {
    supabase,
    session,
    user,
    // Metadados para SEO
    title: 'UniFinder: Plataforma de Achados e Perdidos da UNIRIO',
    description: 'Registre um pertence que tenha perdido ou encontre o dono de um objeto que achou pela UNIRIO.',
    keywords: 'achados, perdidos, unirio, pertences, objetos, spotted, spottedunirio',
    imageURL: 'https://gist.github.com/user-attachments/assets/24310ae2-3466-4791-afff-1636a218b7eb',
    logo: '/favicon.svg',
    author: 'jojoDev02 & jrmsrs',
    type: 'WebApplication'
  };
};
