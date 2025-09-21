/*
# [SECURITY] Fix Function Search Path
Este script atualiza todas as funções do banco de dados para incluir um `search_path` explícito, resolvendo os avisos de segurança "Function Search Path Mutable".

## Query Description:
Esta operação redefine as funções `handle_new_user`, `generate_matricula`, e `handle_new_user_v2` para definir `SET search_path = 'public';`. Isso garante que as funções só procurem por tabelas e outros objetos no schema 'public', prevenindo potenciais ataques de sequestro de caminho de busca. A operação é segura e não afeta os dados existentes.

## Metadata:
- Schema-Category: ["Safe"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Functions modified:
  - public.handle_new_user()
  - public.generate_matricula()
  - public.handle_new_user_v2()

## Security Implications:
- RLS Status: Not changed
- Policy Changes: No
- Auth Requirements: Admin privileges to alter functions.
- Description: Melhora a segurança das funções contra ataques de sequestro de caminho de busca.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Nenhum impacto de performance esperado.
*/

-- Redefine a função handle_new_user com search_path seguro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set a secure search path
  SET search_path = 'public';

  INSERT INTO public.membros (id, email, nome_completo, data_nascimento)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'nome_completo',
    (new.raw_user_meta_data->>'data_nascimento')::date
  );
  RETURN new;
END;
$$;

-- Redefine a função generate_matricula com search_path seguro
CREATE OR REPLACE FUNCTION public.generate_matricula()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    ano_cadastro TEXT;
    ordem_cadastro TEXT;
    ano_nascimento TEXT;
BEGIN
    -- Set a secure search path
    SET search_path = 'public';

    ano_cadastro := to_char(NEW.created_at, 'YYYY');
    ordem_cadastro := lpad((SELECT COUNT(*) + 1 FROM public.membros WHERE date_trunc('year', created_at) = date_trunc('year', NEW.created_at))::TEXT, 4, '0');
    ano_nascimento := to_char(NEW.data_nascimento, 'YYYY');
    
    NEW.matricula := ano_cadastro || ordem_cadastro || ano_nascimento;
    RETURN NEW;
END;
$$;

-- Redefine a função handle_new_user_v2 com search_path seguro
CREATE OR REPLACE FUNCTION public.handle_new_user_v2()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set a secure search path
  SET search_path = 'public';

  INSERT INTO public.membros (id, email, nome_completo, data_nascimento)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'nome_completo',
    (new.raw_user_meta_data->>'data_nascimento')::date
  );
  RETURN new;
END;
$$;
