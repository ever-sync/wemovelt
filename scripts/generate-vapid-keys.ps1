Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot

Push-Location $repoRoot
try {
    Write-Host "Gerando chaves VAPID com web-push..."
    & npx --yes web-push generate-vapid-keys

    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao gerar as chaves VAPID."
    }

    Write-Host ""
    Write-Host "Use a public key no frontend como VITE_VAPID_PUBLIC_KEY."
    Write-Host "Use public/private key e o subject nas secrets da Edge Function:"
    Write-Host " - VAPID_PUBLIC_KEY"
    Write-Host " - VAPID_PRIVATE_KEY"
    Write-Host " - VAPID_SUBJECT"
}
finally {
    Pop-Location
}
