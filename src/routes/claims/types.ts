export type ClaimStatus = 'pendente' | 'aprovado' | 'aprovada' | 'rejeitado' | 'concluida' | 'PENDENTE' | 'APROVADO' | 'APROVADA' | 'REJEITADO' | 'CONCLUIDA';

export type Claim = {
  id: string;
  objeto_id: string;
  descricao: string;
  evidencias: string[];
  data_registro: string;
  status: ClaimStatus;
  user_id: string;
  tutor_id: string;
  objeto?: Objeto;
};

/** Formata a data para exibição */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/** Retorna a cor do badge com base no status da reivindicação */
export function getStatusBadgeColor(status: ClaimStatus): 'green' | 'red' | 'yellow' | 'gray' | 'blue' {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case 'aprovado':
    case 'aprovada':
      return 'green';
    case 'rejeitado':
      return 'red';
    case 'pendente':
      return 'yellow';
    case 'concluida':
      return 'blue';
    default:
      return 'gray';
  }
}

/** Retorna o texto do status da reivindicação */
export function getStatusText(status: ClaimStatus): string {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case 'aprovado':
    case 'aprovada':
      return 'Aprovada';
    case 'rejeitado':
      return 'Rejeitado';
    case 'pendente':
      return 'Pendente';
    case 'concluida':
      return 'Concluída';
    default:
      return status;
  }
}

/** Verifica se o status é aprovado/aprovada */
export function isStatusAprovada(status: ClaimStatus): boolean {
  const normalized = status.toLowerCase();
  return normalized === 'aprovado' || normalized === 'aprovada';
}

/** Verifica se o status é concluída */
export function isStatusConcluida(status: ClaimStatus): boolean {
  const normalized = status.toLowerCase();
  return normalized === 'concluida';
}
