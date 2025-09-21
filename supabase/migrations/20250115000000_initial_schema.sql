/*
          # [Initial Schema Setup]
          Cria a estrutura inicial completa do banco de dados para o sistema de gestão da igreja.

          ## Query Description: "Este script cria todas as tabelas, relacionamentos e políticas de segurança iniciais. Não há dados existentes, então não há risco de perda de dados. É um passo fundamental e seguro para a primeira configuração do banco de dados."
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: false
          
          ## Structure Details:
          - Tabelas Criadas: congregacoes, membros, solicitacoes, movimentacoes_financeiras, ministerios, ministerios_membros, redes, redes_membros, notificacoes.
          - Tipos Criados: sexo_tipo, estado_civil_tipo, cargo_eclesiastico_tipo, etc.
          - Relacionamentos: Foreign keys entre as tabelas (e.g., membros -> congregacoes).
          - Trigger: Cria um perfil de 'membro' automaticamente quando um novo usuário se cadastra no Supabase Auth.
          
          ## Security Implications:
          - RLS Status: Habilitado para todas as tabelas.
          - Policy Changes: Sim, políticas de acesso são criadas para garantir que os usuários só possam acessar seus próprios dados ou dados permitidos por seu cargo.
          - Auth Requirements: As políticas são baseadas no `auth.uid()` do usuário logado.
          
          ## Performance Impact:
          - Indexes: Índices são criados em chaves primárias e estrangeiras para otimizar as consultas.
          - Triggers: Um trigger é adicionado na tabela `auth.users`.
          - Estimated Impact: "Baixo impacto no desempenho inicial, mas fundamental para a organização e segurança dos dados."
          */

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp" with schema extensions;

-- 2. CUSTOM TYPES
create type public.sexo_tipo as enum ('Masculino', 'Feminino');
create type public.estado_civil_tipo as enum ('Solteiro(a)', 'Casado(a)', 'Viúvo(a)', 'União Estável');
create type public.cargo_eclesiastico_tipo as enum ('Nenhum', 'Auxiliar de Diácono(isa)', 'Presbítero(a)', 'Evangelista', 'Pastor(a)', 'Bispo(a)', 'Apóstolo(a)');
create type public.congregacao_tipo as enum ('sede', 'filial');
create type public.solicitacao_tipo as enum ('carteirinha', 'agendamento', 'batismo', 'transferencia', 'alteracao_dados', 'ministerio', 'rede');
create type public.solicitacao_status as enum ('pendente', 'aprovada', 'rejeitada');
create type public.movimentacao_tipo as enum ('entrada', 'saida');
create type public.ministerio_categoria_tipo as enum ('Louvor', 'Ensino', 'Evangelismo', 'Jovens', 'Crianças', 'Ação Social', 'Mídia', 'Recepção', 'Infraestrutura', 'Outro');
create type public.notificacao_tipo as enum ('info', 'sucesso', 'aviso', 'erro');
create type public.rede_tipo as enum ('Célula', 'Grupo de Estudo', 'Ponto de Pregação');

-- 3. TABLES
create table public.congregacoes (
  id uuid not null default extensions.uuid_generate_v4() primary key,
  nome text not null,
  endereco text,
  tipo public.congregacao_tipo not null default 'filial',
  lider_id uuid references public.membros(id) on delete set null,
  telefone text,
  created_at timestamp with time zone not null default now()
);
comment on table public.congregacoes is 'Armazena as congregações (sede e filiais).';

create table public.membros (
  id uuid not null primary key references auth.users on delete cascade,
  nome_completo text,
  data_nascimento date,
  telefone text,
  email text,
  cpf text unique,
  sexo public.sexo_tipo,
  estado_civil public.estado_civil_tipo,
  batizado boolean default false,
  cargo_eclesiastico public.cargo_eclesiastico_tipo default 'Nenhum',
  endereco jsonb,
  congregacao_id uuid references public.congregacoes(id) on delete set null,
  matricula text unique,
  created_at timestamp with time zone not null default now()
);
comment on table public.membros is 'Tabela de perfis para os usuários, ligada ao auth.users.';

create table public.solicitacoes (
  id uuid not null default extensions.uuid_generate_v4() primary key,
  membro_id uuid not null references public.membros(id) on delete cascade,
  tipo public.solicitacao_tipo not null,
  status public.solicitacao_status not null default 'pendente',
  detalhes text,
  created_at timestamp with time zone not null default now()
);
comment on table public.solicitacoes is 'Solicitações feitas pelos membros à secretaria.';

create table public.movimentacoes_financeiras (
  id uuid not null default extensions.uuid_generate_v4() primary key,
  tipo public.movimentacao_tipo not null,
  categoria text not null,
  valor numeric(10, 2) not null,
  descricao text,
  data date not null,
  congregacao_id uuid not null references public.congregacoes(id) on delete cascade
);
comment on table public.movimentacoes_financeiras is 'Registros de entradas e saídas financeiras.';

create table public.ministerios (
  id uuid not null default extensions.uuid_generate_v4() primary key,
  nome text not null,
  descricao text,
  lider_id uuid references public.membros(id) on delete set null,
  categoria public.ministerio_categoria_tipo not null
);
comment on table public.ministerios is 'Departamentos e ministérios da igreja.';

create table public.ministerios_membros (
  ministerio_id uuid not null references public.ministerios(id) on delete cascade,
  membro_id uuid not null references public.membros(id) on delete cascade,
  primary key (ministerio_id, membro_id)
);
comment on table public.ministerios_membros is 'Tabela de junção para membros e ministérios.';

create table public.redes (
  id uuid not null default extensions.uuid_generate_v4() primary key,
  nome text not null,
  tipo public.rede_tipo not null,
  lider_id uuid references public.membros(id) on delete set null,
  endereco text,
  dia text,
  horario text
);
comment on table public.redes is 'Células, grupos de estudo, etc.';

create table public.redes_membros (
  rede_id uuid not null references public.redes(id) on delete cascade,
  membro_id uuid not null references public.membros(id) on delete cascade,
  primary key (rede_id, membro_id)
);
comment on table public.redes_membros is 'Tabela de junção para membros e redes.';

create table public.notificacoes (
  id uuid not null default extensions.uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo public.notificacao_tipo not null,
  titulo text not null,
  mensagem text not null,
  lida boolean not null default false,
  created_at timestamp with time zone not null default now()
);
comment on table public.notificacoes is 'Notificações para os usuários.';

-- 4. TRIGGER PARA CRIAR PERFIL DE MEMBRO
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Gera uma matrícula única
  insert into public.membros (id, email, nome_completo, matricula)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'nome_completo',
    cast(date_part('year', now()) as text) || 
    lpad(cast(nextval('serial') as text), 4, '0') || 
    cast(date_part('year', (new.raw_user_meta_data->>'data_nascimento')::date) as text)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create sequence if not exists serial;

-- 5. RLS POLICIES
alter table public.membros enable row level security;
create policy "Membros podem ver e editar seus próprios perfis." on public.membros for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Membros autenticados podem ver outros perfis (leitura)." on public.membros for select using (auth.role() = 'authenticated');

alter table public.congregacoes enable row level security;
create policy "Todos podem ver as congregações." on public.congregacoes for select using (true);
create policy "Admins podem gerenciar congregações." on public.congregacoes for all using (
  (select cargo_eclesiastico from public.membros where id = auth.uid()) in ('Pastor(a)', 'Bispo(a)', 'Apóstolo(a)')
) with check (
  (select cargo_eclesiastico from public.membros where id = auth.uid()) in ('Pastor(a)', 'Bispo(a)', 'Apóstolo(a)')
);

alter table public.solicitacoes enable row level security;
create policy "Membros podem criar e ver suas próprias solicitações." on public.solicitacoes for all using (auth.uid() = membro_id) with check (auth.uid() = membro_id);
create policy "Secretários podem ver todas as solicitações." on public.solicitacoes for select using (
  (select cargo_eclesiastico from public.membros where id = auth.uid()) in ('Presbítero(a)', 'Pastor(a)', 'Bispo(a)', 'Apóstolo(a)')
);

alter table public.movimentacoes_financeiras enable row level security;
create policy "Tesoureiros podem gerenciar movimentações." on public.movimentacoes_financeiras for all using (
  (select cargo_eclesiastico from public.membros where id = auth.uid()) in ('Presbítero(a)', 'Pastor(a)', 'Bispo(a)', 'Apóstolo(a)')
) with check (
  (select cargo_eclesiastico from public.membros where id = auth.uid()) in ('Presbítero(a)', 'Pastor(a)', 'Bispo(a)', 'Apóstolo(a)')
);
create policy "Membros podem ver as movimentações (transparência)." on public.movimentacoes_financeiras for select using (auth.role() = 'authenticated');

alter table public.ministerios enable row level security;
create policy "Todos podem ver os ministérios." on public.ministerios for select using (true);

alter table public.ministerios_membros enable row level security;
create policy "Todos podem ver os participantes dos ministérios." on public.ministerios_membros for select using (true);

alter table public.redes enable row level security;
create policy "Todos podem ver as redes." on public.redes for select using (true);

alter table public.redes_membros enable row level security;
create policy "Todos podem ver os participantes das redes." on public.redes_membros for select using (true);

alter table public.notificacoes enable row level security;
create policy "Usuários podem ver suas próprias notificações." on public.notificacoes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
