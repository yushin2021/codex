import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Laravel の公開ディレクトリ（src/public）にビルド成果物を出力
// 開発では http://localhost:5173、ビルド後は http://localhost:8080/build/ で配信
export default defineConfig({
  plugins: [react()],
  base: '/build/',
  build: {
    outDir: '../src/public/build',
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 5173,
  },
});

