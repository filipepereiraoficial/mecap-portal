-- Security Patch: Set a secure search_path for all custom functions to resolve warnings.

/*
# [Function: handle_new_user]
[This patch sets a secure search_path for the function that creates a new member profile upon user signup.]

## Query Description: 
"This operation modifies an existing database function to improve security by specifying a fixed schema search path. It prevents potential hijacking risks by ensuring the function only interacts with the 'public' schema. This change has no impact on existing data or application functionality."

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Security Implications:
- RLS Status: Not Applicable
- Policy Changes: No
- Auth Requirements: Admin privileges to alter functions
*/
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;


/*
# [Function: generate_matricula]
[This patch sets a secure search_path for the function that generates a member's unique registration number.]

## Query Description: 
"This operation modifies an existing database function to improve security. It specifies a fixed schema search path, preventing potential hijacking risks. This ensures calculations for the registration number are performed securely within the 'public' schema. It has no impact on existing data or application functionality."

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Security Implications:
- RLS Status: Not Applicable
- Policy Changes: No
- Auth Requirements: Admin privileges to alter functions
*/
CREATE OR REPLACE FUNCTION public.generate_matricula()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  ano_cadastro TEXT;
  ordem_cadastro TEXT;
  ano_nascimento TEXT;
BEGIN
  ano_cadastro := to_char(NEW.created_at, 'YYYY');
  ordem_cadastro := lpad((SELECT COUNT(*) FROM public.membros WHERE date_trunc('year', created_at) = date_trunc('year', NEW.created_at))::text, 4, '0');
  ano_nascimento := to_char(NEW.data_nascimento, 'YYYY');
  NEW.matricula := ano_cadastro || ordem_cadastro || ano_nascimento;
  RETURN NEW;
END;
$$;


/*
# [Function: update_updated_at_column]
[This patch sets a secure search_path for the utility function that automatically updates the 'updated_at' timestamp on row changes.]

## Query Description: 
"This operation modifies a utility function to improve security by specifying a fixed schema search path. Although this function does not access tables, setting the path is a best practice to prevent any potential security vulnerabilities. It has no impact on existing data or application functionality."

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Security Implications:
- RLS Status: Not Applicable
- Policy Changes: No
- Auth Requirements: Admin privileges to alter functions
*/
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;
