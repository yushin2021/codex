import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, initCsrf } from '../lib/api';

export default function PasswordForgotPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('alice@example.com');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null); setErr(null);
    try {
      await initCsrf();
      await api.post('/api/password/forgot', { email });
      setMsg('トークンを発行しました（DB保存のみ）。');
      // 発行後はログイン画面へ遷移し、そこでフラッシュ表示
      nav('/login', { state: { flash: 'パスワードリセット用トークンを発行しました。受け取ったトークンでリセットを続行してください。' } });
    } catch (error: any) {
      setErr(error?.response?.data?.message || 'エラーが発生しました');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded border">
      <h1 className="text-lg font-semibold">パスワードリセット（発行）</h1>
      <form onSubmit={onSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm">メールアドレス</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        {msg && <p className="text-green-600 text-sm">{msg}</p>}
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <button className="px-4 py-2 rounded bg-blue-600 text-white">発行</button>
      </form>
    </div>
  );
}
