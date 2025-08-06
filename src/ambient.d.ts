declare global {
  type Objeto = {
    id: string;
    created_at: string;
    usuario: { id: string; username: string };
    avatar_url: string;
    imagem: string;
    titulo: string;
    descricao: string;
    local: string;
    encaminhado?: string;
    tipo: 'achado' | 'perdido';
    categorias: string[];
    descritores: string[];
  };
}

export {};
