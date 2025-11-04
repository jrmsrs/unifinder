# Página de Perfil Privado - UniFinder

Este documento descreve a implementação da página `/private` do UniFinder, que permite aos usuários gerenciar suas informações pessoais e configurações de conta.

## 🚀 Funcionalidades

### 📄 Informações Pessoais
- **Nome de Usuário**: Campo obrigatório com validação (mínimo 3 caracteres)
- **Nome Completo**: Campo obrigatório com validação (mínimo 2 caracteres)
- **Email**: Exibido como somente leitura (gerenciado pelo Supabase Auth)

### 📱 Contatos e Redes Sociais
- **WhatsApp**: Número com código do país
- **Instagram**: Username (sem @)
- **X (Twitter)**: Username (sem @)
- **Facebook**: Username ou ID

### 🔒 Segurança
- **Alterar Senha**: Formulário seguro com confirmação
- **Visualização de Senha**: Botões para mostrar/ocultar senhas
- **Logout**: Botão para sair da conta

## 🎨 Design e UX

### Interface
- **Layout Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Tabs Organizadas**: Separação clara entre perfil e segurança
- **Componentes Flowbite**: Usa a biblioteca de componentes do projeto
- **Ícones Lucide**: Ícones modernos e consistentes
- **Tema Dark/Light**: Suporte completo aos temas do sistema

### Estados Visuais
- **Loading States**: Spinners durante submissão de formulários
- **Feedback Imediato**: Alertas de sucesso e erro
- **Validação Visual**: Helpers e mensagens de erro
- **Transições Suaves**: Animações CSS para melhor experiência

## 💾 Estrutura Técnica

### Arquivos Principais

```
src/routes/private/
├── +layout.server.ts     # Verificação de autenticação
├── +page.server.ts       # Ações do servidor (update profile, change password)
└── +page.svelte          # Interface do usuário

src/lib/components/profile/
└── SocialLinks.svelte    # Componente para exibir links sociais

sql/
└── profiles.sql          # Schema da tabela de perfis
```

### Banco de Dados

#### Tabela `profiles`
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  whatsapp VARCHAR(20),
  instagram VARCHAR(50),
  x_twitter VARCHAR(50),
  facebook VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Row Level Security (RLS)
- Usuários podem ver todos os perfis (para busca)
- Usuários podem inserir/atualizar/deletar apenas seu próprio perfil
- Triggers automáticos para criação de perfil e atualização de timestamps

### Ações do Servidor

#### `updateProfile`
- Valida dados de entrada
- Verifica unicidade do username
- Valida formato de redes sociais
- Atualiza perfil no banco via upsert

#### `changePassword`
- Valida senha (mínimo 6 caracteres)
- Confirmação de senha
- Atualiza senha via Supabase Auth

## 🔧 Configuração

### 1. Banco de Dados
Execute o arquivo `sql/profiles.sql` no seu projeto Supabase:

```bash
# Via Supabase CLI
supabase db reset

# Ou execute manualmente no dashboard do Supabase
```

### 2. Variáveis de Ambiente
Certifique-se de que as variáveis do Supabase estão configuradas:

```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Dependências
O projeto já inclui todas as dependências necessárias:
- `flowbite-svelte` - Componentes UI
- `lucide-svelte` - Ícones
- `@supabase/ssr` - Autenticação

## 🚀 Como Usar

### Acessar a Página
1. Faça login na aplicação
2. Navegue para `/private`
3. A página redirecionará para `/auth` se não estiver logado

### Editar Perfil
1. **Aba "Informações Pessoais"**:
   - Preencha os campos obrigatórios
   - Adicione contatos opcionais
   - Clique em "Salvar Alterações"

2. **Aba "Segurança"**:
   - Digite a nova senha
   - Confirme a senha
   - Clique em "Alterar Senha"

### Feedback Visual
- ✅ **Sucesso**: Alertas verdes com ícone de check
- ❌ **Erro**: Alertas vermelhos com ícone de aviso
- ⏳ **Loading**: Spinners durante processamento

## 📝 Validações

### Client-side
- Campos obrigatórios marcados com `*`
- Validação HTML5 nativa
- Comprimento mínimo para campos de texto

### Server-side
- Validação de comprimento de strings
- Formato de redes sociais (apenas letras, números, pontos e underscore)
- Formato de WhatsApp (apenas números e símbolos válidos)
- Confirmação de senha

## 🔒 Segurança

### Autenticação
- Todas as rotas verificam autenticação via `locals.session`
- Redirecionamento automático para login se não autenticado

### Autorização
- RLS garante que usuários só acessem seus próprios dados
- Políticas do Supabase impedem acesso não autorizado

### Validação de Dados
- Sanitização de entrada no servidor
- Escape de caracteres especiais
- Validação de formato e comprimento

## 🐛 Solução de Problemas

### Erro: "Profile not found"
- Verifique se a tabela `profiles` existe
- Execute os triggers de criação automática de perfil

### Erro: "Username already taken"
- O username deve ser único no sistema
- Tente um username diferente

### Problemas de Layout
- Certifique-se de que o Tailwind CSS está configurado
- Verifique se o Flowbite está importado corretamente

## 📚 Personalização

### Adicionar Novos Campos
1. Atualize a tabela `profiles` no banco
2. Adicione o campo no formulário (`+page.svelte`)
3. Inclua validação no servidor (`+page.server.ts`)

### Modificar Validações
Edite as funções de validação em `+page.server.ts`:

```typescript
// Exemplo: mudar comprimento mínimo do username
if (!username || username.trim().length < 5) {
  return { error: 'Username deve ter pelo menos 5 caracteres' };
}
```

### Customizar Estilos
Modifique as classes Tailwind nos componentes ou adicione CSS customizado no final do arquivo `.svelte`.

## 🔗 Links Úteis

- [Documentação do SvelteKit](https://kit.svelte.dev/docs)
- [Flowbite Svelte Components](https://flowbite-svelte.com/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)