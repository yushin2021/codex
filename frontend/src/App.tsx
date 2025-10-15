import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, initCsrf } from './lib/api';

const qc = new QueryClient();

function Header() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
        <nav className="flex items-center gap-4 text-sm">
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
    </header>
  );
}

export default function App() {
  useEffect(() => { initCsrf().catch(() => {}); }, []);
  return (
    <QueryClientProvider client={qc}>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-6">
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}
