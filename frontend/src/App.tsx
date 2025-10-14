import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-3xl mx-auto py-16 px-6">
        <h1 className="text-3xl font-bold">React + Vite + TS + Tailwind</h1>
        <p className="mt-4 text-sm text-gray-600">
          ここは /frontend の SPA 雛形です。ビルドすると Laravel 側の
          <code className="px-1">/public/build</code>
          に成果物が出力され、Nginx が配信します。
        </p>
        <ul className="mt-6 list-disc pl-6 text-sm">
          <li>開発: npm run dev</li>
          <li>ビルド: npm run build</li>
          <li>プレビュー: npm run preview</li>
        </ul>
      </div>
    </div>
  );
}

