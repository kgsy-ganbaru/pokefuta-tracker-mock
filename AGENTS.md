# Repository workflow

## Project layout

- The Next.js application is in `mock-pokefuta/`.
- Run Node.js commands from `mock-pokefuta/`.
- In Codex cloud, install dependencies with `bash scripts/codex-cloud-setup.sh` during environment setup.

## Verification

- After changing TypeScript or TSX files, lint the changed files with `npx.cmd eslint <files>`.
- Run `npm.cmd run build` before publishing changes.
- Run `git diff --check` before committing.
- The repository has pre-existing lint errors outside the board feature. Do not expand an unrelated change merely to make the repository-wide lint command pass.

## Publishing

- When the user explicitly asks to commit and push, use `scripts/publish-pr.cmd`.
- Supply a concise commit message as the first argument.
- Never publish unrelated changes silently.
- Never push directly to `main` or `master`; the publishing script enforces this.
- After pushing, confirm the current PR and Vercel deployment state through the GitHub connector.

## Codex cloud and mobile requests

- Cloud tasks must work from a clean GitHub checkout and must not depend on files that exist only on a local PC.
- Follow `REMOTE_CODEX.md` for the mobile-to-cloud workflow.
- Create a feature branch and draft pull request for remote tasks unless the user explicitly requests a different review state.
- Never push directly to or merge `main` from a remote task.
- Do not place Supabase keys, GitHub tokens, or other secrets in source files, logs, commits, or PR descriptions.
- Use `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the cloud environment only when data-backed verification is required.
