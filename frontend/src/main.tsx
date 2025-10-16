import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';
import LoginPage from './pages/LoginPage';
import TopPage from './pages/TopPage';
import UsersListPage from './pages/UsersListPage';
import UserFormPage from './pages/UserFormPage';
import SignupPage from './pages/SignupPage';
import PasswordForgotPage from './pages/PasswordForgotPage';
import PasswordResetPage from './pages/PasswordResetPage';
import AuthLayout from './AuthLayout';
import Gate from './pages/_Gate';
import Protected from './components/Protected';

const router = createBrowserRouter([
  { path: '/', element: <Gate /> },
  { element: <Protected><App /></Protected>, children: [
      { path: '/home', element: <TopPage /> },
      { path: '/users', element: <UsersListPage /> },
      { path: '/users/new', element: <UserFormPage /> },
      { path: '/users/:id/edit', element: <UserFormPage /> },
    ] },
  { element: <AuthLayout />, children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/password/forgot', element: <PasswordForgotPage /> },
      { path: '/password/reset', element: <PasswordResetPage /> },
    ] },
  { path: '*', element: <Navigate to="/" replace /> },
]);

const container = document.getElementById('root')!;
const qc = new QueryClient();
createRoot(container).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
