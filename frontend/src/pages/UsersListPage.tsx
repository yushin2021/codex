import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Spinner from '../components/Spinner';

type User = { id:number; code:string; name:string; mail:string; enabled:number };

function useParamsState() {
  const [sp] = useSearchParams();
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
      if (q) params.set('filter[q]', q);
      if (enabled!=='' && (enabled==='0'||enabled==='1')) params.set('filter[enabled]', enabled);
      params.set('sort', (dir==='desc' ? '-' : '') + sort);
      params.set('page', page);
      const url = `/api/users?${params.toString()}`;
      const res = await api.get(url);
      const raw = res.data;
      if (!raw?.meta && typeof raw?.current_page !== 'undefined') {
        return {
          data: raw.data,
          meta: {
            current_page: raw.current_page,
            last_page: raw.last_page,
            per_page: raw.per_page,
            total: raw.total,
          },
        } as any;
      }
      return raw;
    },
    keepPreviousData: true,
  });

  const setSort = (key:string) => {
    const nextDir = (sort===key && dir==='asc') ? 'desc' : 'asc';
    update({ sort: key, dir: nextDir, page: 1 });
  };

  if (isLoading) return <Spinner className="py-10" />;
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
        <div className="mt-3 flex items-center flex-wrap gap-2">
          <button className="px-2 py-1 border rounded" disabled={meta.current_page<=1} onClick={()=>update({ page: 1 })}>最初</button>
          <button className="px-2 py-1 border rounded" disabled={meta.current_page<=1} onClick={()=>update({ page: Math.max(1, Number(page)-1) })}>前へ</button>
          {buildPages(meta.current_page, meta.last_page).map((p) => (
            <button
              key={p.key}
              disabled={p.disabled}
              onClick={()=>{ if(typeof p.page==='number') update({ page: p.page }); }}
              className={`px-3 py-1 rounded border ${p.active ? 'bg-blue-600 text-white border-blue-600' : ''}`}
            >
              {p.label}
            </button>
          ))}
          <button className="px-2 py-1 border rounded" disabled={meta.current_page>=meta.last_page} onClick={()=>update({ page: Number(page)+1 })}>次へ</button>
          <button className="px-2 py-1 border rounded" disabled={meta.current_page>=meta.last_page} onClick={()=>update({ page: meta.last_page })}>最後</button>
        </div>
      )}
    </div>
  );
}

function buildPages(current:number, last:number) {
  const pages: { key:string; label:string|number; page:number|undefined; active?:boolean; disabled?:boolean }[] = [];
  const window = 2;
  const start = Math.max(1, current - window);
  const end = Math.min(last, current + window);
  if (start > 1) {
    pages.push({ key: 'p1', label: 1, page: 1 });
    if (start > 2) pages.push({ key: 'dots-start', label: '…', page: undefined, disabled: true });
  }
  for (let p = start; p <= end; p++) {
    pages.push({ key: `p${p}`, label: p, page: p, active: p === current });
  }
  if (end < last) {
    if (end < last - 1) pages.push({ key: 'dots-end', label: '…', page: undefined, disabled: true });
    pages.push({ key: `plast`, label: last, page: last });
  }
  return pages;
}
