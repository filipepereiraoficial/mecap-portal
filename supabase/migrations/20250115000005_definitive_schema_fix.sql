/*
  Sistema de Gestão de Igreja - Schema V5 (Definitivo)

  Este script cria a estrutura completa do banco de dados, corrigindo
  problemas de ordem de dependência das versões anteriores.

  Ordem de execução:
  1. Criação de ENUMs (tipos customizados).
  2. Criação das Tabelas na ordem correta de dependência.
  3. Criação de Funções e Triggers (para automação).
  4. Habilitação do Row Level Security (RLS) em todas as tabelas.
  5. Criação das Políticas de Segurança (RLS Policies) para controle de acesso.
*/

-- PASSO 1: CRIAÇÃO DE ENUMS
CREATE TYPE public.sexo_enum AS ENUM ('Masculino', 'Feminino');
CREATE TYPE public.estado_civil_enum AS ENUM ('Solteiro(a)', 'Casado(a)', 'Viúvo(a)', 'União Estável');
CREATE TYPE public.cargo_eclesiastico_enum AS ENUM ('Nenhum', 'Auxiliar de Diácono(isa)', 'Presbítero(a)', 'Evangelista', 'Pastor(a)', 'Bispo(a)', 'Apóstolo(a)');
CREATE TYPE public.solicitacao_tipo_enum AS ENUM ('carteirinha', 'agendamento', 'batismo', 'transferencia', 'alteracao_dados', 'ministerio', 'rede');
CREATE TYPE public.solicitacao_status_enum AS ENUM ('pendente', 'aprovada', 'rejeitada');
CREATE TYPE public.movimentacao_tipo_enum AS ENUM ('entrada', 'saida');
CREATE TYPE public.ministerio_categoria_enum AS ENUM ('Louvor', 'Ensino', 'Evangelismo', 'Jovens', 'Crianças', 'Ação Social', 'Mídia', 'Recepção', 'Infraestrutura', 'Outro');
CREATE TYPE public.rede_tipo_enum AS ENUM ('Célula', 'Grupo de Estudo', 'Ponto de Pregação');
CREATE TYPE public.notificacao_tipo_enum AS ENUM ('info', 'sucesso', 'aviso', 'erro');

-- PASSO 2: CRIAÇÃO DAS TABELAS
CREATE TABLE public.congregacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    endereco TEXT,
    tipo TEXT DEFAULT 'filial' NOT NULL,
    lider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    telefone TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.congregacoes IS 'Armazena as congregações (sede e filiais).';

CREATE TABLE public.membros (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    matricula TEXT UNIQUE,
    nome_completo TEXT,
    data_nascimento DATE,
    telefone TEXT,
    email TEXT UNIQUE,
    cpf TEXT UNIQUE,
    sexo public.sexo_enum,
    estado_civil public.estado_civil_enum,
    batizado BOOLEAN DEFAULT false,
    cargo_eclesiastico public.cargo_eclesiastico_enum DEFAULT 'Nenhum',
    endereco JSONB,
    congregacao_id UUID REFERENCES public.congregacoes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.membros IS 'Perfil detalhado dos membros, vinculado à autenticação.';

CREATE TABLE public.solicitacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID NOT NULL REFERENCES public.membros(id) ON DELETE CASCADE,
    tipo public.solicitacao_tipo_enum NOT NULL,
    status public.solicitacao_status_enum DEFAULT 'pendente' NOT NULL,
    detalhes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.solicitacoes IS 'Solicitações feitas pelos membros à secretaria.';

CREATE TABLE public.movimentacoes_financeiras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo public.movimentacao_tipo_enum NOT NULL,
    categoria TEXT NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    descricao TEXT,
    data DATE NOT NULL,
    congregacao_id UUID NOT NULL REFERENCES public.congregacoes(id) ON DELETE CASCADE
);
COMMENT ON TABLE public.movimentacoes_financeiras IS 'Registros de entradas e saídas financeiras.';

CREATE TABLE public.ministerios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    lider_id UUID REFERENCES public.membros(id) ON DELETE SET NULL,
    categoria public.ministerio_categoria_enum NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.ministerios IS 'Departamentos e ministérios da igreja.';

CREATE TABLE public.redes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    tipo public.rede_tipo_enum NOT NULL,
    lider_id UUID REFERENCES public.membros(id) ON DELETE SET NULL,
    endereco TEXT,
    dia_semana TEXT,
    horario TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.redes IS 'Células, grupos de estudo e outros pequenos grupos.';

CREATE TABLE public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo public.notificacao_tipo_enum NOT NULL,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.notificacoes IS 'Notificações para os usuários.';

CREATE TABLE public.ministerios_membros (
    ministerio_id UUID NOT NULL REFERENCES public.ministerios(id) ON DELETE CASCADE,
    membro_id UUID NOT NULL REFERENCES public.membros(id) ON DELETE CASCADE,
    PRIMARY KEY (ministerio_id, membro_id)
);
COMMENT ON TABLE public.ministerios_membros IS 'Tabela de junção para membros e ministérios.';

CREATE TABLE public.redes_membros (
    rede_id UUID NOT NULL REFERENCES public.redes(id) ON DELETE CASCADE,
    membro_id UUID NOT NULL REFERENCES public.membros(id) ON DELETE CASCADE,
    PRIMARY KEY (rede_id, membro_id)
);
COMMENT ON TABLE public.redes_membros IS 'Tabela de junção para membros e redes.';

-- PASSO 3: FUNÇÕES E TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.membros (id, email, nome_completo, data_nascimento)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'nome_completo',
    (new.raw_user_meta_data->>'data_nascimento')::date
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.generate_matricula()
RETURNS TRIGGER AS $$
DECLARE
  ano_cadastro TEXT;
  ordem_cadastro TEXT;
  ano_nascimento TEXT;
BEGIN
  ano_cadastro := to_char(NEW.created_at, 'YYYY');
  ordem_cadastro := lpad((SELECT COUNT(*) + 1 FROM public.membros)::TEXT, 4, '0');
  ano_nascimento := to_char(NEW.data_nascimento, 'YYYY');
  NEW.matricula := ano_cadastro || ordem_cadastro || ano_nascimento;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_matricula_on_insert
  BEFORE INSERT ON public.membros
  FOR EACH ROW EXECUTE PROCEDURE public.generate_matricula();

-- PASSO 4: HABILITAÇÃO DO RLS
ALTER TABLE public.congregacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministerios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministerios_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redes_membros ENABLE ROW LEVEL SECURITY;

-- PASSO 5: CRIAÇÃO DAS POLÍTICAS DE SEGURANÇA
-- Congregacoes: Todos podem ver, apenas admins podem modificar.
CREATE POLICY "Allow authenticated read access on congregacoes" ON public.congregacoes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin full access on congregacoes" ON public.congregacoes FOR ALL USING ((SELECT cargo_eclesiastico FROM public.membros WHERE id = auth.uid()) IN ('Pastor(a)', 'Bispo(a)', 'Apóstolo(a)'));

-- Membros: Usuários podem ver/atualizar seu próprio perfil. Admins podem ver todos.
CREATE POLICY "Allow user to read/update their own profile" ON public.membros FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Allow secretaries and pastors to read all members" ON public.membros FOR SELECT USING ((SELECT cargo_eclesiastico FROM public.membros WHERE id = auth.uid()) IN ('Presbítero(a)', 'Pastor(a)', 'Bispo(a)', 'Apóstolo(a)'));

-- Solicitacoes: Usuário pode ver/criar suas próprias. Secretários/Pastores podem gerenciar todas.
CREATE POLICY "Allow user to manage their own solicitacoes" ON public.solicitacoes FOR ALL USING (membro_id = auth.uid()) WITH CHECK (membro_id = auth.uid());
CREATE POLICY "Allow secretaries/pastors to manage all solicitacoes" ON public.solicitacoes FOR ALL USING ((SELECT cargo_eclesiastico FROM public.membros WHERE id = auth.uid()) IN ('Presbítero(a)', 'Pastor(a)', 'Bispo(a)', 'Apóstolo(a)'));

-- Movimentacoes Financeiras: Todos podem ver. Tesoureiros/Pastores podem gerenciar.
CREATE POLICY "Allow authenticated read access on movimentacoes" ON public.movimentacoes_financeiras FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow treasurers/pastors to manage movimentacoes" ON public.movimentacoes_financeiras FOR ALL USING ((SELECT cargo_eclesiastico FROM public.membros WHERE id = auth.uid()) IN ('Presbítero(a)', 'Pastor(a)', 'Bispo(a)', 'Apóstolo(a)'));

-- Ministerios, Redes, e tabelas de junção: Todos podem ver, admins podem gerenciar.
CREATE POLICY "Allow authenticated read access on ministerios" ON public.ministerios FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin access on ministerios" ON public.ministerios FOR ALL USING ((SELECT cargo_eclesiastico FROM public.membros WHERE id = auth.uid()) IN ('Pastor(a)', 'Bispo(a)', 'Apóstolo(a)'));
CREATE POLICY "Allow authenticated read access on redes" ON public.redes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin access on redes" ON public.redes FOR ALL USING ((SELECT cargo_eclesiastico FROM public.membros WHERE id = auth.uid()) IN ('Pastor(a)', 'Bispo(a)', 'Apóstolo(a)'));
CREATE POLICY "Allow authenticated read access on ministerios_membros" ON public.ministerios_membros FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow members to join/leave ministerios" ON public.ministerios_membros FOR ALL USING (membro_id = auth.uid());
CREATE POLICY "Allow authenticated read access on redes_membros" ON public.redes_membros FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow members to join/leave redes" ON public.redes_membros FOR ALL USING (membro_id = auth.uid());

-- Notificacoes: Usuário só pode ver as suas próprias.
CREATE POLICY "Allow user to manage their own notifications" ON public.notificacoes FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
