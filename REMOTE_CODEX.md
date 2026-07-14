# iPhoneからCodexへ開発を依頼する環境

このリポジトリは、iPhone版ChatGPTからCodexクラウドへ依頼し、ローカルPCを起動せずに変更・検証・PR作成まで進める運用を想定しています。

## 初回だけ行う設定

1. [Codex](https://chatgpt.com/codex)でGitHubアカウントを接続します。
2. `kgsy-ganbaru/pokefuta-tracker-mock` へのアクセスを許可します。
3. [Codex environments](https://chatgpt.com/codex/settings/environments)で、このリポジトリ用のクラウド環境を作成します。
4. Setup scriptに次を設定します。

   ```bash
   bash scripts/codex-cloud-setup.sh
   ```

5. Node.jsは、`mock-pokefuta/package.json` と互換性のあるLTSバージョンを選びます。
6. 通常のコード変更ではagent phaseのインターネットアクセスは不要です。外部サイトの調査が必要なタスクだけ、必要なドメインへ限定して有効化します。
7. Supabaseデータを使った動作確認が必要なら、クラウド環境のEnvironment variablesへ次を設定します。

   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

   `SUPABASE_SERVICE_ROLE_KEY` は通常のUI確認には不要です。リポジトリや指示文へ秘密情報を書かないでください。

## iPhoneからの依頼テンプレート

ChatGPTアプリでCodexを開き、このリポジトリとクラウド環境を選んで、次の形式で依頼します。

```text
kgsy-ganbaru/pokefuta-tracker-mock を対象に作業してください。

目的:
- <実現したい変更>

完了条件:
- 変更したTypeScript/TSXファイルのlintを通す
- npm run buildを通す
- 画面変更なら対象ページを確認する
- 変更内容と残存リスクをまとめる
- feature branchへcommitしてdraft PRを作成する
- mainへ直接push・mergeはしない
```

## 推奨運用

- 1つの依頼につき1つのfeature branchとPRを使います。
- Codexが提示したdiffと検証結果をiPhoneで確認してからPRをマージします。
- Vercel PreviewがReadyになったら、Preview URLで画面を確認します。
- 本番反映はPRを`main`へマージした後に行います。

## ローカルPCとの違い

- クラウドタスクはGitHubから独立したコンテナへcheckoutするため、ローカルPCの未commit変更は見えません。
- 共有したいルールやスクリプトは、先にこのリポジトリへcommitしておく必要があります。
- `.env.local` はGitHubへcommitしません。必要な値はクラウド環境のEnvironment variablesへ登録します。
