import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Plus, Search, MapPin, Calendar, Clock, User, Mic, BookOpen, Users as UsersIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { RedeTipo } from '../types';

const RedeIcon: React.FC<{ tipo: RedeTipo, className?: string }> = ({ tipo, className }) => {
  const props = { className: className || "w-6 h-6" };
  switch (tipo) {
    case 'Célula': return <UsersIcon {...props} />;
    case 'Grupo de Estudo': return <BookOpen {...props} />;
    case 'Ponto de Pregação': return <Mic {...props} />;
    default: return <Network {...props} />;
  }
};

const tipos: RedeTipo[] = ['Célula', 'Grupo de Estudo', 'Ponto de Pregação'];

const Rede: React.FC = () => {
  const { redes, membros } = useApp();
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<RedeTipo | 'Todos'>('Todos');

  const filteredRedes = redes.filter(r => {
    const searchMatch = r.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = filtroTipo === 'Todos' || r.tipo === filtroTipo;
    return searchMatch && typeMatch;
  });

  return (
    <div className="space-y-6">
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Criar Nova Rede">
        <form className="space-y-4">{/* Formulário */}</form>
      </Modal>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Redes e Células</h1>
            <p className="text-gray-600 mt-1">Conecte-se com pequenos grupos.</p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2"><Plus className="w-4 h-4" /><span>Criar</span></motion.button>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <button onClick={() => setFiltroTipo('Todos')} className={`px-4 py-1.5 text-sm font-medium rounded-full ${filtroTipo === 'Todos' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Todos</button>
            {tipos.map(t => (<button key={t} onClick={() => setFiltroTipo(t)} className={`px-4 py-1.5 text-sm font-medium rounded-full ${filtroTipo === t ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>{t}</button>))}
          </div>
          <div className="relative w-full md:w-auto md:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar rede..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRedes.map(rede => {
            const lider = membros.find(m => m.id === rede.lider_id);
            return (
              <motion.div key={rede.id} layout className="border rounded-lg p-5 space-y-3 hover:shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg"><RedeIcon tipo={rede.tipo} className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900">{rede.nome}</h3>
                    <p className="text-sm text-gray-500">{rede.tipo}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1.5 pt-2 border-t">
                  <p className="flex items-center"><User className="w-4 h-4 mr-2 text-gray-400" /> <strong>Líder:</strong> {lider?.nome_completo || 'Não definido'}</p>
                  <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400" /> {rede.endereco}</p>
                  <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-400" /> {rede.dia_semana}</p>
                  <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-400" /> {rede.horario}</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center"><UsersIcon className="w-4 h-4 mr-1.5 text-gray-500" /> <span className="text-sm font-medium">{rede.membros_ids?.length || 0} participantes</span></div>
                  <button className="text-sm font-semibold text-blue-600 hover:underline">Ver mais</button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </Card>
    </div>
  );
};

export default Rede;
