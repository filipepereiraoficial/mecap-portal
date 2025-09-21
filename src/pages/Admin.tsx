import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Database, Shield, BarChart2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';

const Admin: React.FC = () => {
  const { membros, congregacoes, ministerios, redes } = useApp();

  const adminCards = [
    { title: 'Gerenciar Membros', icon: Users, description: 'Adicionar, editar e remover membros do sistema.', path: '/admin/membros' },
    { title: 'Configurações do Sistema', icon: Settings, description: 'Ajustar parâmetros gerais da aplicação.', path: '/admin/config' },
    { title: 'Backup e Restauração', icon: Database, description: 'Realizar backups e restaurar dados do sistema.', path: '/admin/backup' },
    { title: 'Controle de Acesso', icon: Shield, description: 'Definir permissões para cada cargo eclesiástico.', path: '/admin/acesso' },
    { title: 'Relatórios Gerais', icon: BarChart2, description: 'Visualizar relatórios consolidados da igreja.', path: '/admin/relatorios' },
  ];

  const stats = [
    { label: 'Total de Membros', value: membros.length },
    { label: 'Total de Congregações', value: congregacoes.length },
    { label: 'Total de Ministérios', value: ministerios.length },
    { label: 'Total de Redes/Células', value: redes.length },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600 mt-1">Gestão completa do sistema da igreja.</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ferramentas Administrativas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              className="border border-gray-200 rounded-lg p-5 space-y-3 cursor-pointer"
            >
              <div className="p-3 bg-blue-100 rounded-lg w-max">
                <card.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{card.title}</h3>
              <p className="text-sm text-gray-600">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Admin;
