import { approveClaim, finalizeClaim, getMyClaims, getObjetosByIds, getPendingClaims, rejectClaim } from '$lib/api';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/* Enriquece claims com dados completos dos objetos associados */
async function enrichClaimsWithObjetos(claims: any) {
  if (!claims.items || claims.items.length === 0) return claims;

  const objetoIds = claims.items.map((claim: any) => claim.objeto_id).filter(Boolean);
  const objetos = await getObjetosByIds(objetoIds);

  const objetosMap = new Map(objetos.map((obj) => [obj.id, obj]));

  claims.items = claims.items.map((claim: any) => ({
    ...claim,
    objeto: objetosMap.get(claim.objeto_id)
  }));

  return claims;
}

export const load: PageServerLoad = async ({ locals: { safeGetSession }, url }) => {
  const { session, user } = await safeGetSession();

  if (!session) {
    throw redirect(303, '/auth');
  }

  const page = parseInt(url.searchParams.get('page') || '1');
  const size = parseInt(url.searchParams.get('size') || '20');

  // Busca paralela: claims pendentes (tutor) e claims próprias (usuário)
  const claimsForApprovalPromise = getPendingClaims({ page, size, token: session.access_token }).then(enrichClaimsWithObjetos);
  const myClaimsPromise = getMyClaims({ page, size, token: session.access_token }).then(enrichClaimsWithObjetos);

  return {
    streamed: {
      claimsForApproval: claimsForApprovalPromise,
      myClaims: myClaimsPromise
    },
    session,
    user
  };
};

export const actions: Actions = {
  /** Aprova reivindicação (tutor do objeto) */
  approveClaim: async ({ request, locals: { safeGetSession }, url }) => {
    const { session } = await safeGetSession();
    if (!session) {
      throw redirect(303, '/auth');
    }

    const formData = await request.formData();
    const claimId = formData.get('claimId') as string;

    if (!claimId) {
      return { success: false, error: 'ID da reivindicação não fornecido' };
    }

    const success = await approveClaim(claimId, session.access_token);

    if (!success) {
      return { success: false, error: 'Erro ao aprovar reivindicação' };
    }

    throw redirect(303, url.pathname + url.search);
  },

  /** Rejeita reivindicação (tutor do objeto) */
  rejectClaim: async ({ request, locals: { safeGetSession }, url }) => {
    const { session } = await safeGetSession();
    if (!session) {
      throw redirect(303, '/auth');
    }

    const formData = await request.formData();
    const claimId = formData.get('claimId') as string;

    if (!claimId) {
      return { success: false, error: 'ID da reivindicação não fornecido' };
    }

    const success = await rejectClaim(claimId, session.access_token);

    if (!success) {
      return { success: false, error: 'Erro ao rejeitar reivindicação' };
    }

    throw redirect(303, url.pathname + url.search);
  },

  /** Finaliza reivindicação (usuário que abriu a reivindicação) */
  finalizeClaim: async ({ request, locals: { safeGetSession }, url }) => {
    const { session } = await safeGetSession();
    if (!session) {
      throw redirect(303, '/auth');
    }

    const formData = await request.formData();
    const claimId = formData.get('claimId') as string;

    if (!claimId) {
      return { success: false, error: 'ID da reivindicação não fornecido' };
    }

    const success = await finalizeClaim(claimId, session.access_token);

    if (!success) {
      return { success: false, error: 'Erro ao finalizar reivindicação' };
    }

    throw redirect(303, url.pathname + url.search);
  }
};
