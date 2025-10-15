import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

type User = { id:number; code:string; name:string; mail:string; enabled:number };

function useParamsState() {
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const update = (patch:Record<string,string|number|undefined>) => {
    const next = new URLSearchParams(sp as any);
    Object.entries(patch).forEach(([k,v]) => {
      if (v===undefined || v==='') next.delete(k); else next.set(k, String(v));
    });
    nav({ pathname: '/users', search: `?${next.toString()}` });
  };
  return { sp, update };
}

export default function UsersListPage() {
  const { sp, update } = useParamsState();
  const q = sp.get('q') ?? '';
  const enabled = sp.get('enabled') ?? '';
  const sort = sp.get('sort') ?? 'code';
  const dir = sp.get('dir') ?? 'asc';
  const page = sp.get('page') ?? '1';

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', q, enabled, sort, dir, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (q) params.set('filter[q]', q); // spatie query builder uses filter[q]
      if (enabled!=='' && (enabled==='0'||enabled==='1')) params.set('filter[enabled]', enabled);
      params.set('sort', (dir==='desc' ? '-' : '') + sort);
      params.set('page', page);
      const url = `/api/users?${params.toString()}`;
      const res = await api.get(url);
      return res.data;
    },
    keepPreviousData: true,
  });

  const setSort = (key:string) => {
    const nextDir = (sort===key && dir==='asc') ? 'desc' : 'asc';
    update({ sort: key, dir: nextDir, page: 1 });
  };

  if (isLoading) return <p>読み込み中...</p>;
  if (error) return <p className="text-red-500">読み込みに失敗しました</p>;

  const rows: User[] = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div>
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-xs">検索(q)</label>
          <input className="border rounded px-2 py-1" value={q} onChange={e=>update({ q: e.target.value, page: 1 })} />
        </div>
        <div>
          <label className="block text-xs">enabled</label>
          <select className="border rounded px-2 py-1" value={enabled} onChange={e=>update({ enabled: e.target.value, page: 1 })}>
            <option value="">(すべて)</option>
            <option value="1">1</option>
            <option value="0">0</option>
          </select>
        </div>
        <Link to="/users/new" className="ml-auto px-3 py-2 rounded bg-blue-600 text-white">新規</Link>
      </div>

      <div className="mt-4 overflow-x-auto bg-white border rounded">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {['code','name','mail','enabled'].map(k => (
                <th key={k} className="px-3 py-2 text-left">
                  <button className="font-medium" onClick={()=>setSort(k)}>{k}{sort===k ? (dir==='asc'?' ▲':' ▼') : ''}</button>
                </th>
              ))}
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map(u => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-2 font-mono">{u.code}</td>
                <td className="px-3 py-2">{u.name}</td>
                <td className="px-3 py-2">{u.mail}</td>
                <td className="px-3 py-2">{u.enabled}</td>
                <td className="px-3 py-2 text-right"><Link className="text-blue-600" to={`/users/${u.id}/edit`}>編集</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="mt-3 flex items-center gap-2">
          <button className="px-2 py-1 border rounded" disabled={!meta?.links?.prev} onClick={()=>update({ page: Math.max(1, Number(page)-1) })}>前へ</button>
          <span className="text-sm">{meta.current_page} / {meta.last_page}</span>
          <button className="px-2 py-1 border rounded" disabled={!meta?.links?.next} onClick={()=>update({ page: Number(page)+1 })}>次へ</button>
        </div>
      )}
    </div>
  );
}

