import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Secretaria from './pages/Secretaria';
import Tesouraria from './pages/Tesouraria';
import Perfil from './pages/Perfil';
import Congregacoes from './pages/Congregacoes';
import Ministerios from './pages/Ministerios';
import Rede from './pages/Rede';
import Admin from './pages/Admin';
import SignUp from './pages/SignUp';
import { supabase } from './lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AppProvider>
      <Router>
        <Routes>
          {!session ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="secretaria" element={<Secretaria />} />
              <Route path="tesouraria" element={<Tesouraria />} />
              <Route path="perfil" element={<Perfil />} />
              <Route path="congregacoes" element={<Congregacoes />} />
              <Route path="ministerios" element={<Ministerios />} />
              <Route path="rede" element={<Rede />} />
              <Route path="admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          )}
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
