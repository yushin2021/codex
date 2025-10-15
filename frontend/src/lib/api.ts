import axios from 'axios';

const base = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export const api = axios.create({
  baseURL: base,
  withCredentials: true,
});
// 明示設定（既定値だが明文化）
api.defaults.xsrfCookieName = 'XSRF-TOKEN';
api.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

function getCookie(name: string): string | null {
  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='))
    ?.split('=')[1];
  return value ? decodeURIComponent(value) : null;
}

// Cross-origin (5173 -> 8080) でも確実に XSRF ヘッダを付与する
api.interceptors.request.use(async (config) => {
  try {
    // CSRF 初期化が未済なら実施（循環防止: 自身の呼び出しはスキップ）
    if (!csrfInitialized && !(config.url || '').includes('/sanctum/csrf-cookie')) {
      await initCsrf();
    }
    const token = getCookie('XSRF-TOKEN');
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)['X-XSRF-TOKEN'] = token;
    }
  } catch {}
  return config;
});

let csrfInitialized = false;
export async function initCsrf() {
  if (csrfInitialized) return;
  await api.get('/sanctum/csrf-cookie');
  csrfInitialized = true;
}
