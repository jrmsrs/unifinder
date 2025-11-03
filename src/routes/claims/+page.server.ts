import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPendingClaims, getMyClaims, approveClaim, rejectClaim } from '$lib/api';

export const load: PageServerLoad = async ({ locals: { safeGetSession }, url }) => {
  const { session, user } = await safeGetSession();
  
  // Redireciona para login se não estiver autenticado
  if (!session) {
    throw redirect(303, '/auth');
  }
  
  const page = parseInt(url.searchParams.get('page') || '1');
  const size = parseInt(url.searchParams.get('size') || '20');
  
  return {
    streamed: {
      claimsForApproval: getPendingClaims({ page, size, token: session.access_token }),
      myClaims: getMyClaims({ page, size, token: session.access_token })
    },
    session,
    user
  };
};

export const actions: Actions = {
  approveClaim: async ({ request, locals: { safeGetSession } }) => {
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
    
    return { success: true };
  },
  
  rejectClaim: async ({ request, locals: { safeGetSession } }) => {
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
    
    return { success: true };
  }
};
