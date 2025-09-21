// Este arquivo seria gerado automaticamente pelo Supabase CLI:
// npx supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts
// Como não posso executar comandos, estou criando uma estrutura básica.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      congregacoes: {
        Row: {
          id: string
          nome: string
          endereco: string | null
          tipo: "sede" | "filial"
          lider_id: string | null
          telefone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          endereco?: string | null
          tipo?: "sede" | "filial"
          lider_id?: string | null
          telefone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          endereco?: string | null
          tipo?: "sede" | "filial"
          lider_id?: string | null
          telefone?: string | null
          created_at?: string
        }
      }
      membros: {
        Row: {
          id: string
          nome_completo: string | null
          data_nascimento: string | null
          telefone: string | null
          email: string | null
          cpf: string | null
          sexo: "Masculino" | "Feminino" | null
          estado_civil: "Solteiro(a)" | "Casado(a)" | "Viúvo(a)" | "União Estável" | null
          batizado: boolean | null
          cargo_eclesiastico: "Nenhum" | "Auxiliar de Diácono(isa)" | "Presbítero(a)" | "Evangelista" | "Pastor(a)" | "Bispo(a)" | "Apóstolo(a)" | null
          endereco: Json | null
          congregacao_id: string | null
          matricula: string | null
          created_at: string
        }
        Insert: {
          id: string
          nome_completo?: string | null
          data_nascimento?: string | null
          // ... outros campos
        }
        Update: {
          id?: string
          nome_completo?: string | null
          // ... outros campos
        }
      }
      // ... Definições para outras tabelas
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
