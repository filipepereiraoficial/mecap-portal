import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Notificacao } from '../types';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationIcon = ({ tipo }: { tipo: Notificacao['tipo'] }) => {
  switch (tipo) {
    case 'sucesso': return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'aviso': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'erro': return <XCircle className="w-5 h-5 text-red-500" />;
    case 'info': default: return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const { notificacoes, marcarNotificacaoComoLida, marcarTodasNotificacoesComoLidas } = useApp();
  const unreadCount = notificacoes.filter(n => !n.lida).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <Bell className="w-6 h-6 text-gray-800" />
                <h2 className="text-xl font-bold text-gray-900">Notificações</h2>
                {unreadCount > 0 && <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">{unreadCount}</span>}
              </div>
              <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {notificacoes.length === 0 ? (
                <div className="text-center py-20">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma notificação por aqui.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notificacoes.map(notificacao => (
                    <div key={notificacao.id} onClick={() => !notificacao.lida && marcarNotificacaoComoLida(notificacao.id)} className={`p-4 flex items-start space-x-4 transition-colors ${!notificacao.lida ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer' : 'hover:bg-gray-50'}`}>
                      <NotificationIcon tipo={notificacao.tipo} />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{notificacao.titulo}</p>
                        <p className="text-sm text-gray-600">{notificacao.mensagem}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(notificacao.created_at), { addSuffix: true, locale: ptBR })}</p>
                      </div>
                      {!notificacao.lida && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full self-center"></div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              <button onClick={marcarTodasNotificacoesComoLidas} disabled={unreadCount === 0} className="w-full py-2 px-4 text-sm font-medium text-blue-600 rounded-lg hover:bg-blue-50 disabled:text-gray-400 disabled:cursor-not-allowed">Marcar todas como lidas</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationsPanel;
