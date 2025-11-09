import { PUBLIC_API_BASE_URL } from '$env/static/public';

const baseURL = new URL('/claims', PUBLIC_API_BASE_URL);

type PostClaimReq = {
  objeto_id: string;
  descricao: string;
  evidencias?: string[];
};

export const postClaim = async (data: PostClaimReq, token: string) => {
  try {
    return await fetch(baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        objeto_id: data.objeto_id,
        descricao: data.descricao,
        evidencias: data.evidencias ?? []
      })
    }).then((res) => res.json());
  } catch (error) {
    console.error('API error:', error);
    return null;
  }
};

export const getPendingClaims = async (params?: { page?: number; size?: number; token?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.size) queryParams.append('size', params.size.toString());

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (params?.token) headers['Authorization'] = `Bearer ${params.token}`;

    const res = await fetch(`${baseURL}/pending?${queryParams}`, { method: 'GET', headers });
    if (!res.ok) return { items: [], total: 0, page: 1, size: 100, pages: 0 };

    return await res.json();
  } catch (error: any) {
    console.error('API error:', error?.message);
    return { items: [], total: 0, page: 1, size: 100, pages: 0 };
  }
};

export const getMyClaims = async (params?: { page?: number; size?: number; token?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.size) queryParams.append('size', params.size.toString());

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (params?.token) headers['Authorization'] = `Bearer ${params.token}`;

    const res = await fetch(`${baseURL}/me?${queryParams}`, { method: 'GET', headers });
    if (!res.ok) return { items: [], total: 0, page: 1, size: 100, pages: 0 };

    return await res.json();
  } catch (error: any) {
    console.error('API error:', error?.message);
    return { items: [], total: 0, page: 1, size: 100, pages: 0 };
  }
};

export const approveClaim = async (claimId: string, token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${baseURL}/${claimId}/aprovar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
    return response.ok;
  } catch (error) {
    console.error('API error:', error);
    return false;
  }
};

export const rejectClaim = async (claimId: string, token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${baseURL}/${claimId}/rejeitar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
    return response.ok;
  } catch (error) {
    console.error('API error:', error);
    return false;
  }
};

export const finalizeClaim = async (claimId: string, token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${baseURL}/${claimId}/finalizar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error finalizing claim:', response.status, response.statusText, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('API error finalizing claim:', error);
    return false;
  }
};
