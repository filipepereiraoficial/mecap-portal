import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Heart,
  Building
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const { membroLogado, solicitacoes, movimentacoes, membros, congregacoes } = useApp();

  const totalEntradas = movimentacoes.filter(m => m.tipo === 'entrada').reduce((acc, m) => acc + m.valor, 0);

  const estatisticas = [
    {
      titulo: 'Membros Ativos',
      valor: membros.length.toString(),
      icone: Users,
      cor: 'bg-blue-500',
      tendencia: '+5' // Demo
    },
    {
      titulo: 'Solicitações Pendentes',
      valor: solicitacoes.filter(s => s.status === 'pendente').length.toString(),
      icone: FileText,
      cor: 'bg-yellow-500',
      tendencia: '+2' // Demo
    },
    {
      titulo: 'Arrecadação Mensal',
      valor: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEntradas),
      icone: DollarSign,
      cor: 'bg-green-500',
      tendencia: '+8%' // Demo
    },
    {
      titulo: 'Congregações',
      valor: congregacoes.length.toString(),
      icone: Building,
      cor: 'bg-purple-500',
      tendencia: '+1' // Demo
    }
  ];

  const atividadesRecentes = [
    { tipo: 'Novo Membro', descricao: 'Maria Silva se cadastrou na congregação sede', tempo: '2 horas atrás', icone: Users },
    { tipo: 'Solicitação', descricao: 'Pedro Santos solicitou carteirinha de membro', tempo: '4 horas atrás', icone: FileText },
    { tipo: 'Financeiro', descricao: 'Dízimo de R$ 1.200 foi registrado', tempo: '6 horas atrás', icone: DollarSign },
  ];

  const proximosEventos = [
    { titulo: 'Culto de Oração', data: new Date('2025-01-15T19:00:00'), local: 'Templo Principal' },
    { titulo: 'Escola Dominical', data: new Date('2025-01-19T09:00:00'), local: 'Sala 1' },
  ];

  if (!membroLogado) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bem-vindo, {membroLogado?.nome_completo?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 mt-1">
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-lg">
              {membroLogado?.nome_completo?.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estatisticas.map((stat, index) => {
          const Icon = stat.icone;
          return (
            <motion.div
              key={stat.titulo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.cor}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-green-500 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.tendencia}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">{stat.valor}</h3>
                <p className="text-gray-600 text-sm">{stat.titulo}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h2>
          <div className="space-y-4">
            {atividadesRecentes.map((atividade, index) => {
              const Icon = atividade.icone;
              return (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-gray-100 rounded-lg"><Icon className="w-4 h-4 text-gray-600" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{atividade.tipo}</p>
                    <p className="text-sm text-gray-600">{atividade.descricao}</p>
                    <p className="text-xs text-gray-400 mt-1">{atividade.tempo}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximos Eventos</h2>
          <div className="space-y-4">
            {proximosEventos.map((evento, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900">{evento.titulo}</h3>
                <p className="text-sm text-gray-600 mt-1">{format(evento.data, "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}</p>
                <div className="flex items-center mt-2 text-xs text-gray-500"><Building className="w-3 h-3 mr-1" />{evento.local}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Suas Informações</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Heart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Matrícula</h3>
            <p className="text-blue-600 font-mono">{membroLogado?.matricula}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Cargo</h3>
            <p className="text-green-600">{membroLogado?.cargo_eclesiastico}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Membro desde</h3>
            <p className="text-purple-600">{membroLogado && format(new Date(membroLogado.created_at), 'MMMM yyyy', { locale: ptBR })}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
