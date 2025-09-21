/*
# [SECURITY] Fix Function Search Path
This script updates all custom functions to explicitly set the 'search_path'. This is a security best practice to prevent potential hijacking vulnerabilities, addressing the "Function Search Path Mutable" warning from Supabase.

## Query Description:
This operation re-creates existing functions with an added security setting. It is a non-destructive change and will not affect your data.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Admin privileges to run.
*/

-- 1. Function: generate_matricula()
CREATE OR REPLACE FUNCTION public.generate_matricula(p_ano_nascimento integer)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ano_cadastro integer;
    v_ordem_cadastro integer;
    v_matricula_gerada text;
BEGIN
    v_ano_cadastro := EXTRACT(YEAR FROM NOW());
    
    SELECT COUNT(*) + 1 INTO v_ordem_cadastro FROM membros WHERE EXTRACT(YEAR FROM created_at) = v_ano_cadastro;

    v_matricula_gerada := v_ano_cadastro::text ||
                          LPAD(v_ordem_cadastro::text, 4, '0') ||
                          p_ano_nascimento::text;
                          
    RETURN v_matricula_gerada;
END;
$$;

-- 2. Function: handle_new_user()
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ano_nascimento integer;
    v_matricula text;
BEGIN
    v_ano_nascimento := EXTRACT(YEAR FROM (NEW.raw_user_meta_data->>'data_nascimento')::date);
    
    v_matricula := public.generate_matricula(v_ano_nascimento);

    INSERT INTO public.membros (id, nome_completo, email, data_nascimento, matricula, cargo_eclesiastico, batizado, sexo, estado_civil)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'nome_completo',
        NEW.email,
        (NEW.raw_user_meta_data->>'data_nascimento')::date,
        v_matricula,
        'Nenhum',
        false,
        'Masculino', -- Default value, user can change later
        'Solteiro(a)' -- Default value
    );
    RETURN NEW;
END;
$$;

-- Grant usage on functions to authenticated role
GRANT EXECUTE ON FUNCTION public.generate_matricula(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
