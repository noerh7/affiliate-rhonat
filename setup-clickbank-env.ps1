# Script pour configurer les variables d'environnement ClickBank sur Vercel
# Usage: .\setup-clickbank-env.ps1

Write-Host "=== Configuration des Variables d'Environnement ClickBank ===" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Vercel CLI est installé
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI n'est pas installé." -ForegroundColor Red
    Write-Host "Installation de Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "✅ Vercel CLI est installé" -ForegroundColor Green
Write-Host ""

# Demander les credentials
Write-Host "Veuillez entrer vos credentials ClickBank:" -ForegroundColor Yellow
Write-Host ""

$devKey = Read-Host "CLICKBANK_DEV_KEY (votre clé développeur)"
$apiKey = Read-Host "CLICKBANK_API_KEY (votre clé API)"

# Demander l'environnement (sandbox ou production)
Write-Host ""
Write-Host "Quel environnement voulez-vous utiliser?" -ForegroundColor Yellow
Write-Host "1. Production (https://api.clickbank.com)"
Write-Host "2. Sandbox/Test (https://api.sandbox.clickbank.com)"
$envChoice = Read-Host "Choix (1 ou 2)"

$baseUrl = if ($envChoice -eq "2") { "https://api.sandbox.clickbank.com" } else { "https://api.clickbank.com" }

Write-Host ""
Write-Host "Configuration sélectionnée:" -ForegroundColor Cyan
Write-Host "  - CLICKBANK_DEV_KEY: $($devKey.Substring(0, [Math]::Min(10, $devKey.Length)))..." -ForegroundColor Gray
Write-Host "  - CLICKBANK_API_KEY: $($apiKey.Substring(0, [Math]::Min(10, $apiKey.Length)))..." -ForegroundColor Gray
Write-Host "  - CLICKBANK_BASE_URL: $baseUrl" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Confirmer et déployer? (y/n)"
if ($confirm -ne "y") {
    Write-Host "❌ Annulé" -ForegroundColor Red
    exit
}

# Se déplacer dans le dossier backend-serverless
Set-Location "$PSScriptRoot\backend-serverless"

Write-Host ""
Write-Host "🔐 Configuration des variables d'environnement sur Vercel..." -ForegroundColor Cyan

# Ajouter les variables d'environnement
Write-Host "Ajout de CLICKBANK_DEV_KEY..." -ForegroundColor Yellow
echo $devKey | vercel env add CLICKBANK_DEV_KEY production

Write-Host "Ajout de CLICKBANK_API_KEY..." -ForegroundColor Yellow
echo $apiKey | vercel env add CLICKBANK_API_KEY production

Write-Host "Ajout de CLICKBANK_BASE_URL..." -ForegroundColor Yellow
echo $baseUrl | vercel env add CLICKBANK_BASE_URL production

Write-Host ""
Write-Host "✅ Variables d'environnement configurées!" -ForegroundColor Green
Write-Host ""

# Demander si on doit redéployer
$deploy = Read-Host "Voulez-vous redéployer maintenant? (y/n)"
if ($deploy -eq "y") {
    Write-Host ""
    Write-Host "🚀 Déploiement en cours..." -ForegroundColor Cyan
    vercel --prod
    
    Write-Host ""
    Write-Host "✅ Déploiement terminé!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🧪 Test de l'endpoint de santé..." -ForegroundColor Cyan
    
    # Attendre quelques secondes pour que le déploiement soit actif
    Start-Sleep -Seconds 5
    
    try {
        $response = Invoke-RestMethod -Uri "https://affiliate-rhonat-delta.vercel.app/api/clickbank/health" -Method Get
        Write-Host ""
        Write-Host "Réponse du serveur:" -ForegroundColor Cyan
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor Gray
        
        if ($response.status -eq "ok") {
            Write-Host ""
            Write-Host "✅ Configuration réussie! Le backend peut communiquer avec ClickBank." -ForegroundColor Green
        }
        else {
            Write-Host ""
            Write-Host "⚠️  Le backend est déployé mais ne peut pas atteindre ClickBank." -ForegroundColor Yellow
            Write-Host "Vérifiez vos credentials ClickBank." -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host ""
        Write-Host "⚠️  Impossible de tester l'endpoint. Vérifiez manuellement:" -ForegroundColor Yellow
        Write-Host "https://affiliate-rhonat-delta.vercel.app/api/clickbank/health" -ForegroundColor Gray
    }
}
else {
    Write-Host ""
    Write-Host "⚠️  N'oubliez pas de redéployer pour que les changements prennent effet:" -ForegroundColor Yellow
    Write-Host "cd backend-serverless && vercel --prod" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Configuration terminée ===" -ForegroundColor Cyan
