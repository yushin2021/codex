# Laravel 11 + PHP 8.4 + MySQL 8.4 + Nginx + Node (Docker)

最小構成の Docker 環境です。Laravel プロジェクトは `src` ディレクトリに作成します（コンテナ内 `/var/www` にマウント）。`composer -n create-project laravel/laravel:^11.0 .` を `app` コンテナ内で実行します。

- PHP: 8.4 (FPM)
- Laravel: 11
- MySQL: 8.4 (`caching_sha2_password`)
- Node: 20 (Alpine)
- Nginx: Alpine
- パッケージマネージャ: npm を想定（lock 方針に従い `package-lock.json` をコミット）

## 事前準備
- Docker Desktop for Windows (WSL2)
- リポジトリを任意の場所に clone 済み

## 初回セットアップ

1) 画像のビルド

```
Docker Compose v2（version キー無し）
$ docker compose build
```

2) Laravel プロジェクトの作成（非対話／出力先: `src`）

```
$ docker compose run --rm app bash -lc "composer -n create-project laravel/laravel:^11.0 ."
```

3) .env / .env.example を Docker 用に更新（DB 接続先）

- 設定値
  - `DB_HOST=mysql`
  - `DB_PORT=3306`
  - `DB_DATABASE=app`
  - `DB_USERNAME=app`
  - `DB_PASSWORD=secret`

自動更新コマンド（.env と .env.example を両方書換）:

```
$ docker compose run --rm app bash -lc '
  for f in .env.example .env; do 
    [ -f "$f" ] || continue; 
    php -r "file_put_contents(\"$f\", preg_replace(\"/^(DB_HOST)=.*/m\", \"$1=mysql\", file_get_contents(\"$f\")));"; 
    php -r "file_put_contents(\"$f\", preg_replace(\"/^(DB_PORT)=.*/m\", \"$1=3306\", file_get_contents(\"$f\")));"; 
    php -r "file_put_contents(\"$f\", preg_replace(\"/^(DB_DATABASE)=.*/m\", \"$1=app\", file_get_contents(\"$f\")));"; 
    php -r "file_put_contents(\"$f\", preg_replace(\"/^(DB_USERNAME)=.*/m\", \"$1=app\", file_get_contents(\"$f\")));"; 
    php -r "file_put_contents(\"$f\", preg_replace(\"/^(DB_PASSWORD)=.*/m\", \"$1=secret\", file_get_contents(\"$f\")));"; 
  done; 
  [ -f .env ] || cp .env.example .env; 
  php artisan key:generate 
'
```

4) 依存インストール（フロントエンド・任意）

- 推奨バージョン
  - react:^18.2.0, react-dom:^18.2.0
  - vite:^5.4.0, @vitejs/plugin-react:^4.3.0
  - typescript:^5.4.0
  - tailwindcss:^3.4.0, postcss:^8.4.0, autoprefixer:^10.4.0
  - axios:^1.7.0, react-router-dom:^6.26.0
  - @tanstack/react-query:^5.51.0

npm 方針（lock をコミット）:

```
$ docker compose run --rm node bash -lc "npm init -y && npm i -D vite@^5.4.0 @vitejs/plugin-react@^4.3.0 typescript@^5.4.0 tailwindcss@^3.4.0 postcss@^8.4.0 autoprefixer@^10.4.0 && npm i react@^18.2.0 react-dom@^18.2.0 axios@^1.7.0 react-router-dom@^6.26.0 @tanstack/react-query@^5.51.0"
```

必要に応じて Vite 設定や Laravel 側のアセット設定を追加してください。

## 起動・確認手順

1) コンテナ起動（ビルド含む）

```
$ docker compose up -d --build
```

2) 動作確認

- Nginx: http://localhost:8080/
  - 本構成では静的ファイルは `/public` から配信
  - `/api` 配下は PHP-FPM（Laravel）へプロキシされます（例: `http://localhost:8080/api`）
- MySQL: `localhost:13306` (ユーザ: `app` / パスワード: `secret`)

3) ログ確認

```
$ docker compose logs -f web
$ docker compose logs -f app
$ docker compose logs -f mysql
```

4) Artisan / Composer 実行例

- マイグレーション:
```
$ docker compose run --rm app php artisan migrate
```
- パッケージ追加（非対話・明示バージョン例）:
```
$ docker compose run --rm app bash -lc "composer -n require laravel/sanctum:^4.0 spatie/laravel-query-builder:^5.0 doctrine/dbal:^4.0"
```

5) Vite（フロントエンド）

- 依存が入っていれば、開発サーバ起動:
```
$ docker compose run --rm --service-ports -w /frontend node npm run dev
```
  - Vite: http://localhost:5173/

## フロントエンド SPA（/frontend）

React + Vite + TypeScript + Tailwind の雛形を `frontend` に配置しています。ビルド成果物は Laravel 側の `src/public/build` に出力され、Nginx から配信されます。

1) 依存インストール（npm / lock コミット方針）

PowerShell でも動くよう、コンテナ内で `sh -lc` を使って分岐しています。

```
$ docker compose run --rm -w /frontend node sh -lc "npm ci || npm install"
```

2) 開発サーバ（Vite）

```
$ docker compose run --rm --service-ports -w /frontend node npm run dev
```
- http://localhost:5173/

3) 本番ビルド（Laravel の `src/public/build` へ出力）

```
$ docker compose run --rm -w /frontend node npm run build
```
- ビルド後は http://localhost:8080/build/ で SPA を確認可能

4) 主要ライブラリのバージョン（明示）
- react:^18.2.0, react-dom:^18.2.0
- vite:^5.4.0, @vitejs/plugin-react:^4.3.0
- typescript:^5.4.0
- tailwindcss:^3.4.0, postcss:^8.4.0, autoprefixer:^10.4.0
- axios:^1.7.0, react-router-dom:^6.26.0
- @tanstack/react-query:^5.51.0

## 権限エラーの対処（Windows での bind mount）
Windows で `storage` や `bootstrap/cache` の書き込みで `Permission denied` が出る場合は、以下を実行してください（開発用途）。

```
$ docker compose run --rm app bash -lc "cd /var/www && mkdir -p storage/framework/{cache,sessions,views} && chown -R www-data:www-data storage bootstrap/cache || true && chmod -R 777 storage bootstrap/cache && php artisan optimize:clear"
```

それでも改善しない場合は、いったんコンテナを再起動のうえ、Laravel のキャッシュをクリアしてください。

```
$ docker compose restart app
$ docker compose run --rm app bash -lc "php artisan optimize:clear"
```

## 補足
- Compose は v2 記法（`version:` キー無し）
- MySQL 8.4 は `caching_sha2_password` を使用（`--default-authentication-plugin` は指定しません）
- 共有ボリューム: リポジトリ直下の `src` → `/var/www`
- Nginx ルーティング: 静的は `/public` を配信、`/api` は PHP-FPM へプロキシ

## ディレクトリ構成（抜粋）
```
.
├─ docker-compose.yml
├─ docker/
│  ├─ nginx/
│  │  └─ app.conf
│  └─ php/
│     └─ Dockerfile
├─ src/   ← Laravel 本体（`/var/www` にマウント）
└─ README.md
```
