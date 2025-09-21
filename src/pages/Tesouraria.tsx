import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Eye,
  EyeOff,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Tesouraria: React.FC = () => {
  const { membroLogado, movimentacoes, adicionarMovimentacao } = useApp();
  const [showValues, setShowValues] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth());
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');

  const isTesoureiro = membroLogado?.cargo_eclesiastico === 'Presbítero(a)' || 
                      membroLogado?.cargo_eclesiastico === 'Pastor(a)' || 
                      membroLogado?.cargo_eclesiastico === 'Bispo(a)';

  const categoriasEntrada = ['Dízimo', 'Ofertas', 'Doações', 'Eventos', 'Vendas'];
  const categoriasSaida = ['Aluguel', 'Água', 'Energia', 'Internet', 'Materiais', 'Eventos', 'Manutenção'];

  const movimentacoesFiltradas = movimentacoes.filter(m => new Date(m.data).getMonth() === filtroMes);

  const totalEntradas = movimentacoesFiltradas.filter(m => m.tipo === 'entrada').reduce((acc, m) => acc + m.valor, 0);
  const totalSaidas = movimentacoesFiltradas.filter(m => m.tipo === 'saida').reduce((acc, m) => acc + m.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  const handleSubmitMovimentacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!membroLogado) return;

    adicionarMovimentacao({
      tipo,
      categoria,
      valor: parseFloat(valor),
      descricao,
      congregacao_id: membroLogado.congregacao_id
    });

    setTipo('entrada');
    setCategoria('');
    setValor('');
    setDescricao('');
    setShowForm(false);
  };

  const formatCurrency = (value: number) => {
    if (!showValues) return 'R$ ***,**';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tesouraria</h1>
            <p className="text-gray-600 mt-1">{isTesoureiro ? 'Gestão financeira da congregação' : 'Transparência financeira'}</p>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowValues(!showValues)} className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </motion.button>
            {isTesoureiro && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" /><span>Nova Movimentação</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-100 rounded-lg"><TrendingUp className="w-6 h-6 text-green-600" /></div>
            <div className="text-right"><p className="text-sm text-gray-600">Total Entradas</p><p className="text-2xl font-bold text-green-600">{formatCurrency(totalEntradas)}</p></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-red-100 rounded-lg"><TrendingDown className="w-6 h-6 text-red-600" /></div>
            <div className="text-right"><p className="text-sm text-gray-600">Total Saídas</p><p className="text-2xl font-bold text-red-600">{formatCurrency(totalSaidas)}</p></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-lg ${saldo >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}><DollarSign className={`w-6 h-6 ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`} /></div>
            <div className="text-right"><p className="text-sm text-gray-600">Saldo Atual</p><p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(saldo)}</p></div>
          </div>
        </motion.div>
      </div>

      {showForm && isTesoureiro && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nova Movimentação</h2>
          <form onSubmit={handleSubmitMovimentacao} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value as 'entrada' | 'saida')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                  <option value="entrada">Entrada</option><option value="saida">Saída</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Selecione</option>
                  {(tipo === 'entrada' ? categoriasEntrada : categoriasSaida).map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                <input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="0,00" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="Descrição" required />
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Registrar</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
            </div>
          </form>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Movimentações Recentes</h2>
          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={filtroMes} onChange={(e) => setFiltroMes(parseInt(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500">
              {Array.from({ length: 12 }, (_, i) => (<option key={i} value={i}>{format(new Date(2025, i, 1), 'MMMM', { locale: ptBR })}</option>))}
            </select>
          </div>
        </div>
        <div className="space-y-3">
          {movimentacoesFiltradas.map((mov) => (
            <motion.div key={mov.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${mov.tipo === 'entrada' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {mov.tipo === 'entrada' ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{mov.categoria}</h3>
                  <p className="text-sm text-gray-600">{mov.descricao}</p>
                  <p className="text-xs text-gray-400">{format(new Date(mov.data), "d 'de' MMMM", { locale: ptBR })}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                  {mov.tipo === 'entrada' ? '+' : '-'} {formatCurrency(mov.valor)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Tesouraria;
