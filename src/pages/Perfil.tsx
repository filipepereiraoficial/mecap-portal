import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit, Save, X, Key } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../lib/supabaseClient';

const Perfil: React.FC = () => {
  const { membroLogado, user } = useApp();
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [dadosEdicao, setDadosEdicao] = useState(membroLogado);
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  if (!membroLogado) return null;

  const handleSave = async () => {
    if (!user || !dadosEdicao) return;
    const { error } = await supabase
      .from('membros')
      .update({
        nome_completo: dadosEdicao.nome_completo,
        telefone: dadosEdicao.telefone,
        estado_civil: dadosEdicao.estado_civil,
        endereco: dadosEdicao.endereco,
      })
      .eq('id', user.id);
    
    if (error) {
      setFeedback({ type: 'error', message: 'Erro ao salvar alterações.' });
    } else {
      setFeedback({ type: 'success', message: 'Dados salvos com sucesso!' });
      setEditMode(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setFeedback({ type: 'error', message: `Erro ao alterar senha: ${error.message}` });
    } else {
      setFeedback({ type: 'success', message: 'Senha alterada com sucesso!' });
      setNewPassword('');
      setShowPasswordModal(false);
    }
  };

  const getNestedValue = (obj: any, path: string) => path.split('.').reduce((current, key) => current?.[key], obj);
  const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => (current[key] = current[key] || {}), obj);
    target[lastKey] = value;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">{membroLogado.nome_completo.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{membroLogado.nome_completo}</h1>
              <p className="text-gray-600">{membroLogado.cargo_eclesiastico}</p>
              <p className="text-sm text-gray-500">Matrícula: {membroLogado.matricula}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowPasswordModal(true)} className="px-4 py-2 border rounded-lg flex items-center space-x-2"><Key className="w-4 h-4" /><span>Alterar Senha</span></motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => editMode ? handleSave() : setEditMode(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2">{editMode ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}<span>{editMode ? 'Salvar' : 'Editar'}</span></motion.button>
            {editMode && <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setEditMode(false); setDadosEdicao(membroLogado); }} className="px-4 py-2 border rounded-lg flex items-center space-x-2"><X className="w-4 h-4" /><span>Cancelar</span></motion.button>}
          </div>
        </div>
      </motion.div>

      {feedback && <div className={`p-4 rounded-lg ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{feedback.message}</div>}

      {/* Renderização das seções */}
      {/* Informações Pessoais */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campos como nome, email, etc. */}
        </div>
      </motion.div>
      {/* Endereço */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Endereço</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campos de endereço */}
        </div>
      </motion.div>

      {showPasswordModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Digite a nova senha" required />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Alterar Senha</button>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancelar</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Perfil;
