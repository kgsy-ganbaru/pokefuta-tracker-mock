# 招待制認証の設定

このアプリは、利用者にメールアドレスを入力させず、ユーザIDとパスワードで認証します。
Supabase Auth 内部では、ユーザIDから生成した非配信用の識別子
`<ユーザID>@pokefuta.local` を使用します。

## 必須の環境変数

Vercel の対象プロジェクトに次を設定します。

- `REGISTRATION_INVITE_CODE`: 仲間内で共有する共通招待コード
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase の Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase の anon key
- `SUPABASE_SERVICE_ROLE_KEY`: 既存ユーザーのID解決と管理者によるパスワード再設定に使用

`REGISTRATION_INVITE_CODE` と `SUPABASE_SERVICE_ROLE_KEY` は公開変数にせず、ソースコードにも保存しません。

## Supabase Authentication

- `Allow new users to sign up`: ON
- `Confirm email`: OFF
- `Email provider`: ON（内部識別子をパスワード認証に利用するため）
- `Custom SMTP`: OFF

確認メール、パスワード再設定メール、Gmail SMTP、Brevo は使用しません。

## 管理者によるパスワード再設定

管理者のPCで環境変数を設定したうえで、`mock-pokefuta` ディレクトリから実行します。

```powershell
npm run auth:reset-password -- <ユーザID> <新しいパスワード>
```

サービスロールキーは管理者だけが保持し、ブラウザや利用者へ共有しないでください。
