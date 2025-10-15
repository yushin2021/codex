import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, initCsrf } from '../lib/api';

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('Password!1');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await initCsrf();
      await api.post('/api/login', { email, password });
      nav('/');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold">ログイン</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm">メールアドレス</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">パスワード</label>
          <input type="password" className="mt-1 w-full border rounded px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">{loading?'処理中...':'ログイン'}</button>
      </form>
    </div>
  );
}

