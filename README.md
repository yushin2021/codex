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

## DB マイグレーション／シーディング

要件テーブル（m_users, m_auth, t_news, t_news_reads, signup_tokens, password_reset_tokens）を追加済みです。

1) マイグレーション実行
```
$ docker compose run --rm app php artisan migrate
```

2) シーディング（ダミーユーザー3件 + 対応する認証3件）
```
$ docker compose run --rm app php artisan db:seed
```

テーブル概要
- m_users: id, code(uniq), name, mail(uniq), enabled, timestamps
- m_auth: id, user_id(uniq, FK m_users.id), email(uniq), password, remember_token, timestamps
- t_news: id, type, title, content, created_id(FK), created_timestamp, updated_id(FK, nullable), updated_timestamp(nullable)
- t_news_reads: id, news_id(FK), user_id(FK), read_at
- signup_tokens: id, email, token(uniq), expires_at, used_at(nullable), created_at
- password_reset_tokens: id, email, token(uniq), expires_at, used_at(nullable), created_at

## SPA 認証 API（Sanctum + m_auth）

依存パッケージを追加（非対話・明示バージョン）。ネットワーク環境で以下を実行してください。

```
$ docker compose run --rm app bash -lc "composer -n require laravel/sanctum:^4.0 spatie/laravel-query-builder:^5.0 doctrine/dbal:^4.0"
```

アプリ構成
- 認証プロバイダ: `m_auth`（モデル: `App\Models\UserAuth`）を `session` ガード（web）で使用
- ユーザー本体: `m_users`（モデル: `App\Models\User`）を `UserAuth::user()` で参照
- ルート: `/api/login`, `/api/logout`, `/api/me`（`bootstrap/app.php` で `api.php` を有効化済み）
- ミドルウェア: `EnsureFrontendRequestsAreStateful` を `web` に付与（SPA 用）

動作確認フロー（PowerShell 例）
1) CSRF 初期化（クッキー取得）
```
Invoke-WebRequest -UseBasicParsing http://localhost:8080/sanctum/csrf-cookie -SessionVariable s
```

2) ログイン（email/password はシーダーの値: alice@example.com / Password!1 等）
```
$body = @{ email = 'alice@example.com'; password = 'Password!1' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/login -WebSession $s -ContentType 'application/json' -Body $body
```

3) ログイン後の状態確認
```
Invoke-RestMethod -Method Get -Uri http://localhost:8080/api/me -WebSession $s
```

4) ログアウト
```
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/logout -WebSession $s
```

補足
- `.env` は `SESSION_DRIVER=file`、`CACHE_STORE=file` を推奨（既に変更済み）
- SPA からは `axios` 等で `withCredentials: true` を設定し、まず `/sanctum/csrf-cookie` を叩いてから `/api/login`→`/api/me`

## Users API（一覧/新規/取得/更新）

エンドポイント（認証必須: `auth:sanctum`）
- GET  `/api/users?q=&enabled=&sort=&dir=&page=`
- POST `/api/users`（新規: 成功時 `t_news` に登録ログ）
- GET  `/api/users/{id}`
- PUT  `/api/users/{id}`

バリデーション
- code: required|max:10|regex(/^[0-9A-Za-z]+$/)|unique（更新時は自分を除外）
- name: required|max:100
- mail: required|email|unique（更新時は自分を除外）

検索・絞込・ソート
- `q`: code/name/mail の部分一致
- `enabled`: 0 or 1 の絞込
- `sort`: code|name|mail|created_at（`dir` に asc/desc）
- ページング: `page`（必要に応じ `per_page` も指定可）

PowerShell 例（ログイン済みの前提）
```
# 一覧
Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/users?q=alice&enabled=1&sort=code&dir=asc&page=1" -WebSession $s

# 新規（CSRF 必須）
$xsrf = ([System.Web.HttpUtility]::UrlDecode(($s.Cookies.GetCookies('http://localhost:8080') | ? { $_.Name -eq 'XSRF-TOKEN' }).Value))
$body = @{ code='U9000'; name='New User'; mail='new.user@example.com'; enabled=1 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/users -WebSession $s -ContentType 'application/json' -Headers @{ 'X-XSRF-TOKEN'=$xsrf } -Body $body

# 取得
Invoke-RestMethod -Method Get -Uri http://localhost:8080/api/users/1 -WebSession $s

# 更新（CSRF 必須）
$body2 = @{ code='U9000'; name='Renamed'; mail='new.user@example.com'; enabled=0 } | ConvertTo-Json
Invoke-RestMethod -Method Put -Uri http://localhost:8080/api/users/1 -WebSession $s -ContentType 'application/json' -Headers @{ 'X-XSRF-TOKEN'=$xsrf } -Body $body2
```

## News API（未読一覧 / 既読登録）

エンドポイント（認証必須: `auth:sanctum`）
- GET  `/api/news/unread?per_page=` … 自分の既読（t_news_reads）を除外して作成日時降順で返却
- POST `/api/news/read` { `news_id` } … 既読登録（idempotent: 同じ組み合わせは1件に集約）

PowerShell 例（ログイン・CSRF 初期化済みの前提）
```
# 未読一覧（必要に応じて per_page を指定）
Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/news/unread?per_page=10" -WebSession $s

# 既読登録（CSRF 必須）
$xsrf = ([System.Web.HttpUtility]::UrlDecode(($s.Cookies.GetCookies('http://localhost:8080') | ? { $_.Name -eq 'XSRF-TOKEN' }).Value))
$body = @{ news_id = 1 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/news/read -WebSession $s -ContentType 'application/json' -Headers @{ 'X-XSRF-TOKEN'=$xsrf } -Body $body
```

レスポンス例（概略）
- 未読一覧: `data` に `{ id, type, title, created_timestamp }` の配列、`meta`/`links` にページング情報
- 既読登録: `{ news_id, user_id, read_at }`

## .env 追記項目（Sanctum / SPA 用）

以下を `.env`（必要なら `.env.example` も）に設定してください。

```
# アプリURL（Nginx ポートに合わせる）
APP_URL=http://localhost:8080

# セッションクッキーのドメイン
SESSION_DOMAIN=localhost

# Vite 開発サーバからのクッキー共有（stateful ドメイン）
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173

# ローカル開発では HTTPS ではないため false
SESSION_SECURE_COOKIE=false

# 推奨（既に反映済み）
SESSION_DRIVER=file
CACHE_STORE=file
```

反映コマンド（設定変更後）:

```
docker compose run --rm app php artisan config:clear
```

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
