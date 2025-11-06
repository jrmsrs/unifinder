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
  type ObjetoStatus = 'aberto' | 'finalizado' | 'em_reivindicacao';
  type ClaimStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'PENDENTE' | 'APROVADO' | 'REJEITADO';

  type Contact = {
    id: string;
    tipo: string;
    valor: string;
  };

  type User = {
    id: string;
    username: string;
    nome: string;
    contato: Contact[];
  };

  type Objeto = {
    id: string;
    data_registro: string;
    user_id: string;
    user: User;
    url_imagem: string;
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
    user_id: string;
    username: string;
    conteudo: string;
    user: User;
  };
}

export {};
