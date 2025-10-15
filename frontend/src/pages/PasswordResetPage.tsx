import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, initCsrf } from '../lib/api';

export default function PasswordResetPage() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const token = sp.get('token') || '';
  const [email, setEmail] = useState('');
  const [valid, setValid] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!token) { setValid(false); return; }
      try {
        await initCsrf();
        const res = await api.get('/api/password/verify', { params: { token } });
        if (res.data?.valid) { setValid(true); setEmail(res.data.email); } else { setValid(false); }
      } catch {
        setValid(false);
      }
    };
    run();
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setMessage(null);
    try {
      await api.post('/api/password/reset', { token, password, password_confirmation: passwordConfirmation });
      setMessage('パスワードを変更しました。');
      setTimeout(()=>nav('/login'), 800);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'エラーが発生しました');
    }
  };

  if (valid === null) return <p>検証中...</p>;
  if (!valid) return <p className="text-red-500">無効なトークンです。</p>;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded border">
      <h1 className="text-lg font-semibold">パスワードリセット</h1>
      <p className="text-sm text-gray-600 mt-1">メール: {email}</p>
      <form className="space-y-4 mt-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm">新しいパスワード</label>
          <input type="password" className="mt-1 w-full border rounded px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">新しいパスワード（確認）</label>
          <input type="password" className="mt-1 w-full border rounded px-3 py-2" value={passwordConfirmation} onChange={e=>setPasswordConfirmation(e.target.value)} />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}
        <button className="px-4 py-2 rounded bg-blue-600 text-white">変更</button>
      </form>
    </div>
  );
}

