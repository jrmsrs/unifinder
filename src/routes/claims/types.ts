export type ClaimStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'PENDENTE' | 'APROVADO' | 'REJEITADO';

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
export function getStatusBadgeColor(status: ClaimStatus): 'green' | 'red' | 'yellow' | 'gray' {
  const normalized = status.toLowerCase() as ClaimStatus;
  switch (normalized) {
    case 'aprovado':
      return 'green';
    case 'rejeitado':
      return 'red';
    case 'pendente':
      return 'yellow';
    default:
      return 'gray';
  }
}

/** Retorna o texto do status da reivindicação */
export function getStatusText(status: ClaimStatus): string {
  const normalized = status.toLowerCase() as ClaimStatus;
  switch (normalized) {
    case 'aprovado':
      return 'Aprovado';
    case 'rejeitado':
      return 'Rejeitado';
    case 'pendente':
      return 'Pendente';
    default:
      return status;
  }
}
