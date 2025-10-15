import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

type NewsItem = { id:number; type:number; title:string; created_timestamp:string };

export default function TopPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['news','unread'],
    queryFn: async () => (await api.get('/api/news/unread?per_page=10')).data,
  });
  const [openId, setOpenId] = useState<number|null>(null);

  const markRead = async (id:number) => {
    await api.post('/api/news/read', { news_id: id });
    await qc.invalidateQueries({ queryKey: ['news','unread'] });
    setOpenId(null);
  };

  if (isLoading) return <p>読み込み中...</p>;
  if (error) return <p className="text-red-500">読み込みに失敗しました</p>;

  const items: NewsItem[] = data?.data ?? [];

  return (
    <div>
      <h2 className="text-lg font-semibold">未読のお知らせ</h2>
      <ul className="mt-4 divide-y bg-white rounded border">
        {items.map((n:NewsItem)=> (
          <li key={n.id} className="p-3 hover:bg-gray-50 flex items-center justify-between">
            <div>
              <div className="font-medium">{n.title}</div>
              <div className="text-xs text-gray-500">{new Date(n.created_timestamp).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-2 py-1 text-sm rounded bg-gray-100" onClick={()=>setOpenId(n.id)}>詳細</button>
              <button className="px-2 py-1 text-sm rounded bg-blue-600 text-white" onClick={()=>markRead(n.id)}>既読</button>
            </div>
          </li>
        ))}
        {items.length===0 && <li className="p-3 text-sm text-gray-500">未読はありません</li>}
      </ul>

      {openId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center" onClick={()=>setOpenId(null)}>
          <div className="bg-white rounded shadow p-6 w-full max-w-md" onClick={e=>e.stopPropagation()}>
            <h3 className="font-semibold">詳細</h3>
            <p className="text-sm text-gray-600 mt-2">このAPIは概要のみを返します。必要に応じて詳細APIを実装してください。</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-1 rounded" onClick={()=>setOpenId(null)}>閉じる</button>
              <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={()=>markRead(openId)}>既読にする</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

