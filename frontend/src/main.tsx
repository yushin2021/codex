import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App';
import LoginPage from './pages/LoginPage';
import TopPage from './pages/TopPage';
import UsersListPage from './pages/UsersListPage';
import UserFormPage from './pages/UserFormPage';

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
      { path: '/signup', element: <div className="text-sm text-gray-500">未実装（トークン処理画面）</div> },
      { path: '/password/forgot', element: <div className="text-sm text-gray-500">未実装（パスワードリセット送信）</div> },
      { path: '/password/reset', element: <div className="text-sm text-gray-500">未実装（リセットフォーム）</div> },
    ],
  },
]);

const container = document.getElementById('root')!;
createRoot(container).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
