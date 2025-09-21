import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Plus, Search, Users, MapPin, Phone, User as UserIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Congregacoes: React.FC = () => {
  const { congregacoes, membros } = useApp();
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCongregacoes = congregacoes.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMembros = congregacoes.reduce((sum, c) => sum + (c.membros?.length || 0), 0);

  const stats = [
    { label: 'Total de Congregações', value: congregacoes.length, icon: Building },
    { label: 'Congregações Sede', value: congregacoes.filter(c => c.tipo === 'sede').length, icon: Building },
    { label: 'Filiais', value: congregacoes.filter(c => c.tipo === 'filial').length, icon: Building },
    { label: 'Total de Membros', value: totalMembros, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Adicionar Nova Congregação">
        <form className="space-y-4">
          {/* Formulário de criação */}
        </form>
      </Modal>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Congregações</h1>
            <p className="text-gray-600 mt-1">Gerencie as congregações da sua igreja.</p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2"><Plus className="w-4 h-4" /><span>Adicionar</span></motion.button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg"><stat.icon className="w-6 h-6 text-blue-600" /></div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Congregações</h2>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar congregação..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCongregacoes.map(congregacao => {
            const lider = membros.find(m => m.id === congregacao.lider_id);
            return (
              <motion.div key={congregacao.id} layout className="border rounded-lg p-5 space-y-3 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{congregacao.nome}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${congregacao.tipo === 'sede' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{congregacao.tipo}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800 flex items-center justify-end"><Users className="w-4 h-4 mr-1.5 text-gray-500" /> {congregacao.membros?.length || 0}</p>
                    <p className="text-xs text-gray-500">membros</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-2 pt-2 border-t">
                  <p className="flex items-start"><UserIcon className="w-4 h-4 mr-2 mt-0.5 text-gray-400" /> <strong>Líder:</strong> {lider?.nome_completo || 'Não definido'}</p>
                  <p className="flex items-start"><MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" /> {congregacao.endereco}</p>
                  <p className="flex items-start"><Phone className="w-4 h-4 mr-2 mt-0.5 text-gray-400" /> {congregacao.telefone}</p>
                </div>
                <p className="text-xs text-gray-400 text-right pt-2">Criada em {format(new Date(congregacao.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
              </motion.div>
            )
          })}
        </div>
      </Card>
    </div>
  );
};

export default Congregacoes;
