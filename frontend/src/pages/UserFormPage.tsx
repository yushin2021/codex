import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';

type Errors = Record<string, string[]>;

export default function UserFormPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [enabled, setEnabled] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/api/users/${id}`).then(res => {
        const u = res.data;
        setCode(u.code); setName(u.name); setMail(u.mail); setEnabled(u.enabled);
      });
    }
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErrors({});
    try {
      const payload = { code, name, mail, enabled };
      if (isEdit) {
        await api.put(`/api/users/${id}`, payload);
      } else {
        await api.post('/api/users', payload);
      }
      nav('/users');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        alert('エラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (k:string) => errors?.[k]?.[0];

  return (
    <div className="max-w-lg bg-white p-6 rounded border">
      <h1 className="text-lg font-semibold">{isEdit? 'ユーザー編集':'ユーザー新規'}</h1>
      <form className="mt-4 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm">code</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={code} onChange={e=>setCode(e.target.value)} />
          {fieldError('code') && <p className="text-red-500 text-sm mt-1">{fieldError('code')}</p>}
        </div>
        <div>
          <label className="block text-sm">name</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={name} onChange={e=>setName(e.target.value)} />
          {fieldError('name') && <p className="text-red-500 text-sm mt-1">{fieldError('name')}</p>}
        </div>
        <div>
          <label className="block text-sm">mail</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={mail} onChange={e=>setMail(e.target.value)} />
          {fieldError('mail') && <p className="text-red-500 text-sm mt-1">{fieldError('mail')}</p>}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">enabled</label>
          <input type="checkbox" checked={enabled===1} onChange={e=>setEnabled(e.target.checked?1:0)} />
        </div>
        <div className="flex gap-3">
          <button disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">保存</button>
          <button type="button" className="px-4 py-2 rounded border" onClick={()=>nav(-1)}>戻る</button>
        </div>
      </form>
    </div>
  );
}

