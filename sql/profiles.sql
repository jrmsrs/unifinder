-- Tabela de perfis de usuário para o UniFinder
-- Este arquivo define a estrutura da tabela profiles no Supabase

-- Criar a tabela profiles se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  whatsapp VARCHAR(20),
  instagram VARCHAR(50),
  x_twitter VARCHAR(50),
  facebook VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam todos os perfis (para busca)
CREATE POLICY IF NOT EXISTS "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- Política para permitir que usuários insiram apenas seu próprio perfil
CREATE POLICY IF NOT EXISTS "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para permitir que usuários atualizem apenas seu próprio perfil
CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Política para permitir que usuários deletem apenas seu próprio perfil
CREATE POLICY IF NOT EXISTS "Users can delete their own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função para criar perfil automaticamente quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Comentários para documentação
COMMENT ON TABLE public.profiles IS 'Perfis de usuário do UniFinder';
COMMENT ON COLUMN public.profiles.id IS 'ID do usuário (referência para auth.users)';
COMMENT ON COLUMN public.profiles.username IS 'Nome de usuário único';
COMMENT ON COLUMN public.profiles.full_name IS 'Nome completo do usuário';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL do avatar do usuário';
COMMENT ON COLUMN public.profiles.whatsapp IS 'Número do WhatsApp';
COMMENT ON COLUMN public.profiles.instagram IS 'Username do Instagram';
COMMENT ON COLUMN public.profiles.x_twitter IS 'Username do X (Twitter)';
COMMENT ON COLUMN public.profiles.facebook IS 'Username do Facebook';
COMMENT ON COLUMN public.profiles.created_at IS 'Data de criação do perfil';
COMMENT ON COLUMN public.profiles.updated_at IS 'Data da última atualização do perfil';