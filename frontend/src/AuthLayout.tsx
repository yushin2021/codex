import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="max-w-md mx-auto px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}
