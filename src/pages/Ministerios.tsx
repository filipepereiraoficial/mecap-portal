import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Heart, BookOpen, Mic, Handshake, Tv, Wrench, Baby, HandHelping } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { MinisterioCategoria } from '../types';

const MinisterioIcon: React.FC<{ categoria: MinisterioCategoria, className?: string }> = ({ categoria, className }) => {
  const props = { className: className || "w-8 h-8" };
  switch (categoria) {
    case 'Louvor': return <Mic {...props} />;
    case 'Ensino': return <BookOpen {...props} />;
    case 'Evangelismo': return <Heart {...props} />;
    case 'Jovens': return <Users {...props} />;
    case 'Crianças': return <Baby {...props} />;
    case 'Ação Social': return <HandHelping {...props} />;
    case 'Mídia': return <Tv {...props} />;
    case 'Recepção': return <Handshake {...props} />;
    case 'Infraestrutura': return <Wrench {...props} />;
    default: return <Users {...props} />;
  }
};

const categorias: MinisterioCategoria[] = ['Louvor', 'Ensino', 'Evangelismo', 'Jovens', 'Crianças', 'Ação Social', 'Mídia', 'Recepção', 'Infraestrutura', 'Outro'];

const Ministerios: React.FC = () => {
  const { ministerios, membros } = useApp();
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<MinisterioCategoria | 'Todos'>('Todos');

  const filteredMinisterios = ministerios.filter(m => {
    const searchMatch = m.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = filtroCategoria === 'Todos' || m.categoria === filtroCategoria;
    return searchMatch && categoryMatch;
  });

  return (
    <div className="space-y-6">
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Criar Novo Ministério">
        <form className="space-y-4">{/* Formulário */}</form>
      </Modal>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ministérios</h1>
            <p className="text-gray-600 mt-1">Explore e participe dos ministérios da igreja.</p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2"><Plus className="w-4 h-4" /><span>Criar</span></motion.button>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <button onClick={() => setFiltroCategoria('Todos')} className={`px-4 py-1.5 text-sm font-medium rounded-full ${filtroCategoria === 'Todos' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Todos</button>
            {categorias.map(cat => (
              <button key={cat} onClick={() => setFiltroCategoria(cat)} className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap ${filtroCategoria === cat ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>{cat}</button>
            ))}
          </div>
          <div className="relative w-full md:w-auto md:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar ministério..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMinisterios.map(min => {
            const lider = membros.find(m => m.id === min.lider_id);
            return (
              <motion.div key={min.id} layout className="border rounded-lg p-5 flex flex-col space-y-3 hover:shadow-md">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg"><MinisterioIcon categoria={min.categoria} className="w-6 h-6 text-blue-600" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{min.nome}</h3>
                    <p className="text-sm text-gray-500">{min.categoria}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 flex-grow">{min.descricao}</p>
                <div className="pt-3 border-t text-sm">
                  <p><strong>Líder:</strong> {lider?.nome_completo || 'Não definido'}</p>
                  <p><strong>Participantes:</strong> {min.membros_ids?.length || 0}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Ministerios;
