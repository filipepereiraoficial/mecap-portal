import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Membro, Congregacao, Solicitacao, MovimentacaoFinanceira, Ministerio, Notificacao, Rede } from '../types';
import { User } from '@supabase/supabase-js';

interface AppContextType {
  user: User | null;
  membroLogado: Membro | null;
  membros: Membro[];
  congregacoes: Congregacao[];
  solicitacoes: Solicitacao[];
  movimentacoes: MovimentacaoFinanceira[];
  ministerios: Ministerio[];
  notificacoes: Notificacao[];
  redes: Rede[];
  loading: boolean;
  adicionarSolicitacao: (solicitacao: Omit<Solicitacao, 'id' | 'created_at' | 'membro_id'>) => Promise<void>;
  atualizarStatusSolicitacao: (id: string, status: 'aprovada' | 'rejeitada') => Promise<void>;
  adicionarMovimentacao: (movimentacao: Omit<MovimentacaoFinanceira, 'id' | 'data'>) => Promise<void>;
  marcarNotificacaoComoLida: (id: string) => Promise<void>;
  marcarTodasNotificacoesComoLidas: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [membroLogado, setMembroLogado] = useState<Membro | null>(null);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [congregacoes, setCongregacoes] = useState<Congregacao[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoFinanceira[]>([]);
  const [ministerios, setMinisterios] = useState<Ministerio[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [redes, setRedes] = useState<Rede[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (currentUser: User) => {
    setLoading(true);
    try {
      const [
        membroData,
        membrosData,
        congregacoesData,
        solicitacoesData,
        movimentacoesData,
        ministeriosData,
        redesData,
        notificacoesData,
      ] = await Promise.all([
        supabase.from('membros').select('*').eq('id', currentUser.id).single(),
        supabase.from('membros').select('*'),
        supabase.from('congregacoes').select('*, membros:membros(*)'),
        supabase.from('solicitacoes').select('*').order('created_at', { ascending: false }),
        supabase.from('movimentacoes_financeiras').select('*').order('data', { ascending: false }),
        supabase.from('ministerios').select('*, membros_ids:ministerios_membros(membro_id)'),
        supabase.from('redes').select('*, membros_ids:redes_membros(membro_id)'),
        supabase.from('notificacoes').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
      ]);

      if (membroData.error) throw membroData.error;
      setMembroLogado(membroData.data as Membro);

      if (membrosData.data) setMembros(membrosData.data as Membro[]);
      if (congregacoesData.data) setCongregacoes(congregacoesData.data as any[]);
      if (solicitacoesData.data) setSolicitacoes(solicitacoesData.data as Solicitacao[]);
      if (movimentacoesData.data) setMovimentacoes(movimentacoesData.data as MovimentacaoFinanceira[]);
      if (ministeriosData.data) setMinisterios(ministeriosData.data as any[]);
      if (redesData.data) setRedes(redesData.data as any[]);
      if (notificacoesData.data) setNotificacoes(notificacoesData.data as Notificacao[]);

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const session = supabase.auth.getSession();
    session.then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        fetchData(data.session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (event === 'SIGNED_IN' && currentUser) {
        fetchData(currentUser);
      }
      if (event === 'SIGNED_OUT') {
        setMembroLogado(null);
        setMembros([]);
        setCongregacoes([]);
        setSolicitacoes([]);
        setMovimentacoes([]);
        setMinisterios([]);
        setNotificacoes([]);
        setRedes([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchData]);

  const adicionarSolicitacao = async (dadosSolicitacao: Omit<Solicitacao, 'id' | 'created_at' | 'membro_id'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('solicitacoes').insert({ ...dadosSolicitacao, membro_id: user.id }).select().single();
    if (data) setSolicitacoes(prev => [data as Solicitacao, ...prev]);
    if (error) console.error("Erro ao adicionar solicitação:", error);
  };

  const atualizarStatusSolicitacao = async (id: string, status: 'aprovada' | 'rejeitada') => {
    const { data, error } = await supabase.from('solicitacoes').update({ status }).eq('id', id).select().single();
    if (data) setSolicitacoes(prev => prev.map(s => s.id === id ? data as Solicitacao : s));
    if (error) console.error("Erro ao atualizar solicitação:", error);
  };

  const adicionarMovimentacao = async (dadosMovimentacao: Omit<MovimentacaoFinanceira, 'id' | 'data'>) => {
    const { data, error } = await supabase.from('movimentacoes_financeiras').insert({ ...dadosMovimentacao, data: new Date().toISOString() }).select().single();
    if (data) setMovimentacoes(prev => [data as MovimentacaoFinanceira, ...prev]);
    if (error) console.error("Erro ao adicionar movimentação:", error);
  };

  const marcarNotificacaoComoLida = async (id: string) => {
    const { data, error } = await supabase.from('notificacoes').update({ lida: true }).eq('id', id).select().single();
    if (data) setNotificacoes(prev => prev.map(n => n.id === id ? data as Notificacao : n));
    if (error) console.error("Erro ao marcar notificação como lida:", error);
  };

  const marcarTodasNotificacoesComoLidas = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('notificacoes').update({ lida: true }).eq('user_id', user.id).eq('lida', false).select();
    if (data) setNotificacoes(prev => prev.map(n => ({...n, lida: true})));
    if (error) console.error("Erro ao marcar todas as notificações como lidas:", error);
  };

  return (
    <AppContext.Provider value={{
      user,
      membroLogado,
      membros,
      congregacoes,
      solicitacoes,
      movimentacoes,
      ministerios,
      notificacoes,
      redes,
      loading,
      adicionarSolicitacao,
      atualizarStatusSolicitacao,
      adicionarMovimentacao,
      marcarNotificacaoComoLida,
      marcarTodasNotificacoesComoLidas,
    }}>
      {children}
    </AppContext.Provider>
  );
};
