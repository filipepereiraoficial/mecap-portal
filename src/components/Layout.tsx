import React, 'useState'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  FileText,
  User,
  Settings,
  DollarSign,
  Building,
  Users,
  Network,
  LogOut,
  Church,
  Bell,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import NotificationsPanel from './NotificationsPanel'
import { supabase } from '../lib/supabaseClient'

const Layout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { membroLogado, notificacoes } = useApp()
  const [isNotificationsOpen, setNotificationsOpen] = useState(false)

  const unreadCount = notificacoes.filter((n) => !n.lida).length

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/secretaria', icon: FileText, label: 'Secretaria' },
    { path: '/tesouraria', icon: DollarSign, label: 'Tesouraria' },
    { path: '/perfil', icon: User, label: 'Perfil' },
    { path: '/congregacoes', icon: Building, label: 'Congregações' },
    { path: '/ministerios', icon: Users, label: 'Ministérios' },
    { path: '/rede', icon: Network, label: 'Rede' },
    { path: '/admin', icon: Settings, label: 'Administração' },
  ]

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Church className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Igreja</h1>
              <p className="text-sm text-gray-500">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        {membroLogado && (
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {membroLogado.nome_completo
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {membroLogado.nome_completo}
                </p>
                <p className="text-xs text-gray-500">
                  {membroLogado.cargo_eclesiastico}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-end">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white"></span>
              )}
            </motion.button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
