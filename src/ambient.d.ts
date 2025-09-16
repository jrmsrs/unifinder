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
    data_registro: string;
    usuario: { id: string; username: string; email: string; avatar_url: string };
    imagem: string;
    nome: string;
    descricao: string;
    local_ocorrencia: ObjetoLocalidade;
    local_armazenamento?: string;
    tipo: ObjetoTipo;
    categoria: ObjetoCategoria;
    status: ObjetoStatus;
  };

  type Comentario = {
    id: string;
    publicado_em: string;
    objeto_id: string;
    usuario: { id: string; username: string; email: string; avatar_url: string };
    conteudo: string;
  };
}

export {};
