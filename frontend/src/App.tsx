import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, initCsrf } from './lib/api';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Spinner from './components/Spinner';

function Header() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/me');
        return res.data;
      } catch {
        return null;
      }
    },
  });

  const onLogout = async () => {
    await api.post('/api/logout');
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    navigate('/login');
  };

  return (
    <header className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold">My App</Link>
        <div className="md:hidden">
          <button aria-label="menu" onClick={()=>setOpen(!open)} className="p-2 rounded hover:bg-gray-100">
            {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </div>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link to="/users" className="text-gray-700 hover:text-black">ユーザー一覧</Link>
          {data?.user ? (
            <>
              <span className="text-gray-500">{data.user.name}</span>
              <button onClick={onLogout} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">ログオフ</button>
            </>
          ) : (
            <Link to="/login" className="text-gray-700 hover:text-black">ログイン</Link>
          )}
        </nav>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-3 flex flex-col gap-2">
          <Link to="/users" className="text-gray-700 hover:text-black" onClick={()=>setOpen(false)}>ユーザー一覧</Link>
          {data?.user ? (
            <button onClick={()=>{ setOpen(false); onLogout(); }} className="text-left px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">ログオフ</button>
          ) : (
            <Link to="/login" className="text-gray-700 hover:text-black" onClick={()=>setOpen(false)}>ログイン</Link>
          )}
        </div>
      )}
    </header>
  );
}

export default function App() {
  useEffect(() => { initCsrf().catch(() => {}); }, []);
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
