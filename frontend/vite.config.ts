import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Laravel の公開ディレクトリ（src/public）にビルド成果物を出力
// 開発: http://localhost:5173/ で配信（base: '/'）
// ビルド後: http://localhost:8080/build/ で配信（base: '/build/'）
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/build/' : '/',
  build: {
    outDir: '../src/public/build',
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 5173,
  },
}));
