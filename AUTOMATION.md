# PR publishing automation

`scripts/publish-pr.cmd` verifies and publishes the current feature branch in one command. The command wrapper also works on Windows systems that block unsigned PowerShell scripts by default.

## What it does

1. Refuses to run on `main` or `master`.
2. Shows the files that will be included.
3. Checks the diff for whitespace errors.
4. Lints changed TypeScript and TSX files.
5. Runs the Next.js production build.
6. Stages the verified changes, creates a commit, and pushes the current branch.
7. Prints the pull request URL when GitHub CLI is available.

## Run it

From the repository root:

```powershell
.\scripts\publish-pr.cmd "Describe the change"
```

Vercel will create or update the preview deployment after the push through the repository's existing GitHub integration.

To run verification without committing or pushing:

```powershell
.\scripts\publish-pr.cmd "Verification only" -VerifyOnly
```

For development initiated from an iPhone or another remote device, use the Codex cloud workflow described in [`REMOTE_CODEX.md`](REMOTE_CODEX.md). The local publishing command is intended for the Windows checkout only.
