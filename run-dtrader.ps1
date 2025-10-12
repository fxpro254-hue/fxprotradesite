# Run Deriv Trader Development Server
# Usage: .\run-dtrader.ps1 [core|trader]

param(
    [string]$package = "core"
)

$ErrorActionPreference = "Stop"

Write-Host "Starting Deriv Trader - $package package..." -ForegroundColor Green

# Navigate to the appropriate package directory
$packagePath = Join-Path $PSScriptRoot "dtrader\packages\$package"

if (-not (Test-Path $packagePath)) {
    Write-Host "Error: Package '$package' not found at $packagePath" -ForegroundColor Red
    Write-Host "Available packages: core, trader, reports, components" -ForegroundColor Yellow
    exit 1
}

Set-Location $packagePath

# Run webpack serve with the correct config
Write-Host "Running webpack dev server from: $packagePath" -ForegroundColor Cyan
npx webpack serve --config "./build/webpack.config.js"
