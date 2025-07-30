import type { SupabaseClient } from '@supabase/supabase-js';
import type { PageServerLoad } from './$types';

const fetchObjetos = async (supabase: SupabaseClient) => {
	await new Promise<void>((resolve) => setTimeout(resolve, 2000));
	const { data: objetos } = await supabase.from('objeto').select('*');
	return objetos;
};

export const load: PageServerLoad = ({ locals: { supabase } }) => {
	return {
		streamed: {
			objetos: fetchObjetos(supabase)
		}
	};
};
