import { dictLocalidades } from '$lib/utils/dicionaries';

declare global {
  type ObjetoLocalidade = keyof typeof dictLocalidades;
  type ObjetoCategoria =
    | 'documento'
    | 'carteira'
    | 'mochila'
    | 'eletronico'
    | 'academico'
    | 'utensilio'
    | 'vestuario'
    | 'chaveiro'
    | 'outro';
  type ObjetoTipo = 'achado' | 'perdido';
  type ObjetoStatus = 'ABERTO' | 'FINALIZADO';

  type Objeto = {
    id: string;
    created_at: string;
    usuario: { id: string; username: string; avatar_url: string };
    imagem: string;
    titulo: string;
    descricao: string;
    local: ObjetoLocalidade;
    encaminhado?: string;
    tipo: ObjetoTipo;
    categoria: ObjetoCategoria;
    status: ObjetoStatus;
  };
}

export {};
