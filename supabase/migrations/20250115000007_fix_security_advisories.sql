/*
# [SECURITY] Fix Function Search Path
This migration updates existing database functions to explicitly set the `search_path`. This is a recommended security practice to prevent potential hijacking attacks by ensuring functions only search for objects within the 'public' schema.

## Query Description:
- This operation modifies the `handle_new_user` and `generate_matricula` functions.
- It is a safe, non-destructive change that enhances security.
- No data will be affected.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by reverting to the previous function definition)

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: Admin privileges to alter functions.
- Mitigates: "Function Search Path Mutable" security advisory.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = 'public';
  INSERT INTO public.membros (id, email, nome_completo, data_nascimento, matricula, cargo_eclesiastico, batizado, estado_civil, sexo)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'nome_completo',
    (new.raw_user_meta_data->>'data_nascimento')::date,
    public.generate_matricula((new.raw_user_meta_data->>'data_nascimento')::date),
    'Nenhum',
    false,
    'Solteiro(a)',
    'Masculino'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION public.generate_matricula(p_data_nascimento date)
RETURNS text AS $$
DECLARE
    ano_cadastro text;
    ordem_cadastro text;
    ano_nascimento text;
BEGIN
    SET search_path = 'public';
    ano_cadastro := to_char(CURRENT_DATE, 'YYYY');
    ordem_cadastro := lpad((SELECT count(*) + 1 FROM public.membros WHERE date_trunc('year', created_at) = date_trunc('year', CURRENT_DATE))::text, 4, '0');
    ano_nascimento := to_char(p_data_nascimento, 'YYYY');
    RETURN ano_cadastro || ordem_cadastro || ano_nascimento;
END;
$$ LANGUAGE plpgsql;
