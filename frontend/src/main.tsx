import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App';
import LoginPage from './pages/LoginPage';
import TopPage from './pages/TopPage';
import UsersListPage from './pages/UsersListPage';
import UserFormPage from './pages/UserFormPage';
import SignupPage from './pages/SignupPage';
import PasswordForgotPage from './pages/PasswordForgotPage';
import PasswordResetPage from './pages/PasswordResetPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <TopPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/users', element: <UsersListPage /> },
      { path: '/users/new', element: <UserFormPage /> },
      { path: '/users/:id/edit', element: <UserFormPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/password/forgot', element: <PasswordForgotPage /> },
      { path: '/password/reset', element: <PasswordResetPage /> },
    ],
  },
]);

const container = document.getElementById('root')!;
createRoot(container).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
