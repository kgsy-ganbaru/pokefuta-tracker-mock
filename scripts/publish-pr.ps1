[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Message,

    [switch]$VerifyOnly
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$appRoot = Join-Path $repoRoot "mock-pokefuta"

function Invoke-CheckedCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Executable,
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Arguments
    )

    & $Executable @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed ($LASTEXITCODE): $Executable $($Arguments -join ' ')"
    }
}

Push-Location $repoRoot
try {
    $branch = (git branch --show-current).Trim()
    if (-not $branch) {
        throw "Cannot publish from a detached HEAD."
    }
    if ($branch -in @("main", "master")) {
        throw "Direct pushes to '$branch' are blocked. Create or switch to a feature branch first."
    }

    $changes = @(git status --porcelain)
    if ($changes.Count -eq 0) {
        throw "There are no changes to publish."
    }

    Write-Host "Publishing branch: $branch" -ForegroundColor Cyan
    Write-Host "Changes:" -ForegroundColor Cyan
    $changes | ForEach-Object { Write-Host "  $_" }

    Invoke-CheckedCommand git diff --check

    $changedCodeFiles = @(
        git status --porcelain |
            ForEach-Object { $_.Substring(3) } |
            Where-Object { $_ -match '^mock-pokefuta/.+\.(ts|tsx)$' } |
            ForEach-Object { $_ -replace '^mock-pokefuta/', '' }
    )

    Push-Location $appRoot
    try {
        if ($changedCodeFiles.Count -gt 0) {
            Write-Host "Linting changed TypeScript files..." -ForegroundColor Cyan
            Invoke-CheckedCommand npx.cmd eslint @changedCodeFiles
        }

        Write-Host "Running production build..." -ForegroundColor Cyan
        Invoke-CheckedCommand npm.cmd run build
    }
    finally {
        Pop-Location
    }

    if ($VerifyOnly) {
        Write-Host "Verification completed. No commit or push was performed." -ForegroundColor Green
        return
    }

    Write-Host "Staging verified changes..." -ForegroundColor Cyan
    Invoke-CheckedCommand git add --all
    Invoke-CheckedCommand git diff --cached --check

    Write-Host "Creating commit..." -ForegroundColor Cyan
    Invoke-CheckedCommand git commit -m $Message

    Write-Host "Pushing to origin/$branch..." -ForegroundColor Cyan
    Invoke-CheckedCommand git push --set-upstream origin $branch

    $commit = (git rev-parse --short HEAD).Trim()
    Write-Host "Published $commit to origin/$branch" -ForegroundColor Green

    $gh = Get-Command gh -ErrorAction SilentlyContinue
    if ($gh) {
        try {
            & $gh.Source pr view --json url --jq '.url'
        }
        catch {
            Write-Warning "Push succeeded, but the PR URL could not be read with GitHub CLI."
        }
    }
}
finally {
    Pop-Location
}
