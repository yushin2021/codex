import React, { PropsWithChildren } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import Spinner from './Spinner';

export default function Protected({ children }: PropsWithChildren) {
  const location = useLocation();
  const { data, isLoading } = useQuery({
    queryKey: ['me:protected'],
    queryFn: async () => {
      try { return (await api.get('/api/me')).data; } catch { return null; }
    }
  });
  if (isLoading) return <Spinner className="py-20" />;
  if (!data?.user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}

