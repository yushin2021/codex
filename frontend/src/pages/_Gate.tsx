import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Navigate } from 'react-router-dom';
import AuthLayout from '../AuthLayout';
import LoginPage from './LoginPage';
import Spinner from '../components/Spinner';

export default function Gate() {
  const { data, isLoading } = useQuery({
    queryKey: ['me:gate'],
    queryFn: async () => {
      try { return (await api.get('/api/me')).data; } catch { return null; }
    }
  });
  if (isLoading) return <Spinner className="py-20" />;
  if (data?.user) return <Navigate to="/home" replace />;
  // 認証されていない場合は /login にリダイレクト
  return <Navigate to="/login" replace />;
}
