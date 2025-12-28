# Pokefuta Tracker

ポケモンマンホール「ポケふた」の取得状況を管理・閲覧する Web アプリです。  
ゲストは一覧・詳細を閲覧でき、ログインユーザーは取得枚数の登録・更新ができます。

---

## 技術スタック

- Frontend
  - Next.js (App Router)
  - TypeScript
  - Tailwind CSS
- Backend
  - Supabase
    - PostgreSQL
    - Auth
    - Storage
- その他
  - bcrypt（パスワードハッシュ）

---

## 基本仕様

### 閲覧

- 未ログイン（ゲスト）でも以下は可能
  - ポケふた一覧の閲覧
  - ポケふた詳細画面の閲覧
  - 所持者一覧の閲覧

### 更新

- ログインユーザーのみ可能
  - 自分の取得枚数の登録・更新
- ゲストが更新操作を行った場合
  - 「ポケふたを登録するにはログインが必要です」と表示

---

## 画面構成

### 一覧画面（トップページ）

- 地域 → 都道府県公式順で全ポケふたを表示
- 地域ジャンプボタンあり
- ページ下部に「トップへ戻る」ボタン
- 表示内容
  - ポケふた画像（Supabase Storage）
  - ポケモン名（複数対応）
  - 住所
  - 難易度
  - 自分が1枚以上所持している場合のみアイコン表示

#### 最近ゲット

- 最近取得されたポケふたを横スクロール表示
- 表示内容
  - ポケふた画像
  - ポケモン名
  - 住所
  - 取得したユーザー名（枚数は表示しない）

---

### 詳細画面 `/pokefuta/[id]`

- ゲスト・ログイン共通で閲覧可能
- 表示内容
  - ポケふた画像
  - ポケモン名（複数）
  - 住所
  - 地域・都道府県
  - 難易度
- 所持者一覧
  - 誰が何枚持っているかを表示
  - 人数が増えても縦スクロール対応

#### 取得枚数更新UI

- プラス / マイナスボタン
- 更新ボタン
- ログイン状態で挙動切替
  - ログイン中：DB更新
  - ゲスト：警告メッセージ表示

---

### アカウント画面

- ヘッダー右上のアイコンから遷移

#### ゲスト時

- 「ゲスト」と表示
- ログインフォーム
  - ユーザーID
  - パスワード
- 新規登録画面への遷移ボタン

#### ログイン時

- ニックネーム表示
- ユーザーID表示
- ログアウトボタン

---

## 認証方針

- Supabase Auth を使用
- メール認証は使用しない
- ユーザーID + パスワード方式
- パスワードは bcrypt でハッシュ化
- 認証状態は Supabase セッションで管理

---

## データベース設計（概要）

### users

- id
- user_id（ユーザー指定ID）
- nickname
- password_hash
- created_at
- updated_at

### pokefuta

- id
- region_id（数値管理）
- prefecture_id（数値管理）
- prefecture_order（公式サイト順）
- address
- difficulty_code（S〜I）
- image_url
- created_at
- updated_at

### pokefuta_pokemon

- pokefuta_id
- pokemon_name
- display_order

### ownership

- user_id
- pokefuta_id
- count
- updated_at

### difficulty_master
- code
- label
- sort_order
---

## 並び順ルール

- 地域 → 都道府県 → prefecture_order
- IDの大小とは無関係
- 新規追加時は prefecture_order を調整

---

## 画像管理

- Supabase Storage を使用
- DBには画像URLのみ保存
- 一覧・最近ゲット・詳細画面で共通利用

---

## 将来拡張（未実装）

- 交換希望掲示板
- コメント機能
- 通知機能

※ 現在のDB設計で大きな変更なく追加可能な構成を前提
