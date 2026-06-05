param(
  [string]$Remote = "origin",
  [string]$Branch = "gh-pages",
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Require-Command {
  param([string]$Name)

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $Name"
  }
}

Require-Command git

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$distPath = Join-Path $repoRoot "dist"
$deployPath = Join-Path ([System.IO.Path]::GetTempPath()) "sdl-lecture-gh-pages"
$tscPath = Join-Path $repoRoot "node_modules\.bin\tsc.cmd"
$vitePath = Join-Path $repoRoot "node_modules\.bin\vite.cmd"

if (-not (Test-Path $tscPath)) {
  throw "Missing TypeScript binary: $tscPath"
}

if (-not (Test-Path $vitePath)) {
  throw "Missing Vite binary: $vitePath"
}

if (-not $SkipBuild) {
  Write-Host "Building GitHub Pages bundle..."
  Push-Location $repoRoot
  try {
    & $tscPath -b --pretty false
    & $vitePath build --mode github-pages
  }
  finally {
    Pop-Location
  }
}

if (-not (Test-Path $distPath)) {
  throw "Build output not found: $distPath"
}

$remoteUrl = git -C $repoRoot remote get-url $Remote
if (-not $remoteUrl) {
  throw "Unable to resolve git remote '$Remote'."
}

if (Test-Path $deployPath) {
  Remove-Item -LiteralPath $deployPath -Recurse -Force
}

New-Item -ItemType Directory -Path $deployPath | Out-Null
Copy-Item -Path (Join-Path $distPath "*") -Destination $deployPath -Recurse -Force
New-Item -ItemType File -Path (Join-Path $deployPath ".nojekyll") -Force | Out-Null

$gitUserName = git -C $repoRoot config user.name
$gitUserEmail = git -C $repoRoot config user.email

if (-not $gitUserName) {
  $gitUserName = "Codex Deploy"
}

if (-not $gitUserEmail) {
  $gitUserEmail = "codex-deploy@local"
}

Push-Location $deployPath
try {
  git init -b $Branch | Out-Null
  git config user.name $gitUserName
  git config user.email $gitUserEmail
  git add .
  git commit -m "deploy: github pages" | Out-Null
  git remote add $Remote $remoteUrl
  git push --force $Remote HEAD:refs/heads/$Branch
}
finally {
  Pop-Location
}

Write-Host "GitHub Pages branch updated: $Branch"
