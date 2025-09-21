/*
# [Fix Security Advisories]
Este script corrige os avisos de segurança "Function Search Path Mutable" ao definir explicitamente o `search_path` para as funções `handle_new_user` e `generate_matricula`.

## Query Description: [Esta operação atualiza duas funções existentes no banco de dados para torná-las mais seguras. Não há impacto nos dados existentes e a operação é de baixo risco. Define o caminho de busca para `public`, prevenindo que as funções sejam exploradas por esquemas maliciosos.]

## Metadata:
- Schema-Category: ["Safe"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- Functions modified:
  - `public.handle_new_user()`
  - `public.generate_matricula()`

## Security Implications:
- RLS Status: [Enabled]
- Policy Changes: [No]
- Auth Requirements: [Admin privileges to alter functions]
- Description: Mitiga o risco de sequestro de caminho de busca (search path hijacking).

## Performance Impact:
- Indexes: [None]
- Triggers: [None]
- Estimated Impact: [Nenhum impacto de performance esperado.]
*/

-- Corrigir a função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.membros (id, email, nome_completo, data_nascimento, matricula, created_at)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'nome_completo',
    (new.raw_user_meta_data->>'data_nascimento')::date,
    public.generate_matricula((new.raw_user_meta_data->>'data_nascimento')::date),
    new.created_at
  );
  RETURN new;
END;
$$;

-- Corrigir a função generate_matricula
CREATE OR REPLACE FUNCTION public.generate_matricula(
    p_data_nascimento date
)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    ano_cadastro text;
    ordem_cadastro text;
    ano_nascimento text;
    nova_matricula text;
BEGIN
    ano_cadastro := to_char(current_date, 'YYYY');
    ano_nascimento := to_char(p_data_nascimento, 'YYYY');

    SELECT lpad((count(*) + 1)::text, 4, '0')
    INTO ordem_cadastro
    FROM public.membros
    WHERE to_char(created_at, 'YYYY') = ano_cadastro;

    nova_matricula := ano_cadastro || ordem_cadastro || ano_nascimento;
    RETURN nova_matricula;
END;
$$;
