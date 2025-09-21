import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  CreditCard, 
  Users, 
  ArrowRight,
  Check,
  X,
  Clock,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Secretaria: React.FC = () => {
  const { membroLogado, solicitacoes, adicionarSolicitacao, atualizarStatusSolicitacao } = useApp();
  const [tipoSolicitacao, setTipoSolicitacao] = useState<string>('');
  const [detalhes, setDetalhes] = useState('');
  const [showForm, setShowForm] = useState(false);

  const isSecretario = membroLogado?.cargo_eclesiastico === 'Presbítero(a)' || 
                      membroLogado?.cargo_eclesiastico === 'Pastor(a)' || 
                      membroLogado?.cargo_eclesiastico === 'Bispo(a)';

  const tiposSolicitacao = [
    { id: 'carteirinha', label: 'Carteirinha de Membro', icon: CreditCard },
    { id: 'agendamento', label: 'Agendamento', icon: Calendar },
    { id: 'batismo', label: 'Batismo', icon: Users },
    { id: 'transferencia', label: 'Transferência', icon: ArrowRight },
    { id: 'alteracao_dados', label: 'Alteração de Dados', icon: FileText },
    { id: 'ministerio', label: 'Criar Ministério', icon: Plus },
    { id: 'rede', label: 'Criar Rede', icon: Users },
  ];

  const handleSubmitSolicitacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!membroLogado) return;

    adicionarSolicitacao({
      tipo: tipoSolicitacao as any,
      status: 'pendente',
      detalhes,
    });

    setTipoSolicitacao('');
    setDetalhes('');
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'aprovada': return 'bg-green-100 text-green-800';
      case 'rejeitada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return Clock;
      case 'aprovada': return Check;
      case 'rejeitada': return X;
      default: return Clock;
    }
  };

  const minhasSolicitacoes = solicitacoes.filter(s => s.membro_id === membroLogado?.id);
  const solicitacoesParaGerenciar = isSecretario ? solicitacoes : [];

  const listaExibida = isSecretario ? solicitacoesParaGerenciar : minhasSolicitacoes;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Secretaria</h1>
            <p className="text-gray-600 mt-1">
              {isSecretario ? 'Gerenciar solicitações da congregação' : 'Faça suas solicitações'}
            </p>
          </div>
          {!isSecretario && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Solicitação</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {showForm && !isSecretario && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nova Solicitação</h2>
          <form onSubmit={handleSubmitSolicitacao} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Solicitação</label>
              <select value={tipoSolicitacao} onChange={(e) => setTipoSolicitacao(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                <option value="">Selecione o tipo</option>
                {tiposSolicitacao.map((tipo) => (<option key={tipo.id} value={tipo.id}>{tipo.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Detalhes</label>
              <textarea value={detalhes} onChange={(e) => setDetalhes(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Descreva os detalhes da sua solicitação..." required />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Enviar Solicitação</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
            </div>
          </form>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{isSecretario ? 'Solicitações Recebidas' : 'Minhas Solicitações'}</h2>
        {listaExibida.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma solicitação encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {listaExibida.map((solicitacao) => {
              const StatusIcon = getStatusIcon(solicitacao.status);
              const tipoInfo = tiposSolicitacao.find(t => t.id === solicitacao.tipo);
              const TipoIcon = tipoInfo?.icon || FileText;
              
              return (
                <motion.div
                  key={solicitacao.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg"><TipoIcon className="w-5 h-5 text-blue-600" /></div>
                      <div>
                        <h3 className="font-medium text-gray-900">{tipoInfo?.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">{solicitacao.detalhes}</p>
                        <p className="text-xs text-gray-400 mt-1">{format(new Date(solicitacao.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(solicitacao.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="capitalize">{solicitacao.status}</span>
                      </span>
                      {isSecretario && solicitacao.status === 'pendente' && (
                        <div className="flex space-x-2">
                          <button onClick={() => atualizarStatusSolicitacao(solicitacao.id, 'aprovada')} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check className="w-4 h-4" /></button>
                          <button onClick={() => atualizarStatusSolicitacao(solicitacao.id, 'rejeitada')} className="p-1 text-red-600 hover:bg-red-100 rounded"><X className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Secretaria;
