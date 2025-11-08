import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const supabase: Handle = async ({ event, resolve }) => {
  /**
   * Cria um cliente Supabase específico para esta requisição de servidor.
   * O cliente Supabase obtém o token de autenticação dos cookies da requisição.
   */
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      /**
       * A API de cookies do SvelteKit requer que `path` seja definido explicitamente nas
       * opções do cookie. Definir `path` como `/` replica o comportamento anterior/padrão.
       */
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' });
        });
      }
    }
  });

  /**
   * Função auxiliar para obter a sessão autenticada com validação de JWT.
   *
   * Diferente de `supabase.auth.getSession()`, que retorna a sessão _sem_
   * validar o JWT, esta função também chama `getUser()` para validar o
   * JWT antes de retornar a sessão.
   */
  event.locals.safeGetSession = async () => {
    const {
      data: { session }
    } = await event.locals.supabase.auth.getSession();
    if (!session) {
      return { session: null, user: null };
    }

    const {
      data: { user },
      error
    } = await event.locals.supabase.auth.getUser();
    if (error) {
      // Validação de JWT falhou
      return { session: null, user: null };
    }
    // @ts-expect-error: user property may not be optional in type definition
    delete session?.user;

    return { session: Object.assign({}, session, { user }), user };
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      /**
       * Bibliotecas Supabase usam os cabeçalhos `content-range` e `x-supabase-api-version`,
       * então precisamos informar ao SvelteKit para passá-los.
       */
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });
};

const protectedRoutes: Array<(route: { pathname: string; searchParams: URLSearchParams }) => boolean> = [
  ({ pathname }) => pathname.startsWith('/private'),
  ({ pathname, searchParams }) => pathname === '/objetos' && searchParams.has('new')
];

/** Guarda de autenticação para rotas protegidas */
export const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  const hasSession = !!session;
  const { pathname, searchParams } = event.url;
  const username = user?.user_metadata?.username as string | undefined;
  const isUsernameSet = !!username && username !== user?.email;
  const isAuthPage = pathname === '/auth' || pathname === '/auth/logout';

  const isProtectedRoute = protectedRoutes.some((rule) => rule({ pathname, searchParams }));

  if (hasSession && !isUsernameSet && !isAuthPage) return redirect(303, '/auth');
  if (!hasSession && isProtectedRoute) return redirect(303, '/auth');
  if (hasSession && isUsernameSet && pathname === '/auth') return redirect(303, '/');

  return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
