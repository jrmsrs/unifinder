import { dictLocalidades } from '$lib/utils/dicionaries';

declare global {
  /** Tipo de localidade do objeto */
  type ObjetoLocalidade = keyof typeof dictLocalidades;

  /** Tipo de categoria do objeto */
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

  /** Tipo de objeto perdido/achado */
  type ObjetoTipo = 'achado' | 'perdido';

  /** Tipo de status do objeto */
  type ObjetoStatus = 'aberto' | 'finalizado' | 'em_reivindicacao';

  /** Tipo de status da reivindicação */
  type ClaimStatus = 'pendente' | 'aprovado' | 'aprovada' | 'rejeitado' | 'concluida' | 'PENDENTE' | 'APROVADO' | 'APROVADA' | 'REJEITADO' | 'CONCLUIDA';

  /** Tipo de papel do usuário */
  type UserRole = 'user' | 'admin' | 'funcionario';

  /** Tipo de contato do usuário */
  type Contact = {
    id: string;
    tipo: string;
    valor: string;
  };

  /** Tipo de usuário */
  type User = {
    id: string;
    username: string;
    nome: string;
    contato: Contact[];
    role: UserRole;
  };

  /** Tipo de objeto perdido/achado */
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
    motivo_finalizacao?: string;
  };

  /** Tipo de comentário em objeto */
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
