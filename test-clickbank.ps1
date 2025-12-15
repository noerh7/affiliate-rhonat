# Script de diagnostic ClickBank
# Usage: .\test-clickbank.ps1

Write-Host "=== Diagnostic ClickBank ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend Health Check
Write-Host "1. Test du Backend ClickBank..." -ForegroundColor Yellow
Write-Host "   URL: https://affiliate-rhonat-delta.vercel.app/api/clickbank/health" -ForegroundColor Gray
Write-Host ""

try {
    $healthResponse = Invoke-RestMethod -Uri "https://affiliate-rhonat-delta.vercel.app/api/clickbank/health" -Method Get
    Write-Host "   Reponse:" -ForegroundColor White
    Write-Host "   Status: $($healthResponse.status)" -ForegroundColor $(if ($healthResponse.status -eq "ok") { "Green" } else { "Red" })
    Write-Host "   Message: $($healthResponse.message)" -ForegroundColor Gray
    
    if ($healthResponse.status -eq "ok") {
        Write-Host "   Backend OK!" -ForegroundColor Green
    }
    else {
        Write-Host "   PROBLEME: Le backend ne peut pas atteindre ClickBank API" -ForegroundColor Red
        Write-Host "   SOLUTION: Verifiez que CLICKBANK_DEV_KEY et CLICKBANK_API_KEY sont configures sur Vercel" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Test des Endpoints ClickBank..." -ForegroundColor Yellow
Write-Host ""

# Test 2: Orders Endpoint
Write-Host "   a) Test Orders..." -ForegroundColor Gray
try {
    $ordersUrl = "https://affiliate-rhonat-delta.vercel.app/api/clickbank/orders?startDate=2024-01-01&endDate=2024-12-31"
    $ordersResponse = Invoke-RestMethod -Uri $ordersUrl -Method Get
    
    if ($ordersResponse.success) {
        Write-Host "      OK - $($ordersResponse.count) commandes trouvees" -ForegroundColor Green
    }
    else {
        Write-Host "      ERREUR: $($ordersResponse.error)" -ForegroundColor Red
    }
}
catch {
    $errorMessage = $_.Exception.Message
    if ($errorMessage -like "*404*") {
        Write-Host "      ERREUR 404: Credentials ClickBank manquants ou invalides" -ForegroundColor Red
    }
    else {
        Write-Host "      ERREUR: $errorMessage" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Products Endpoint
Write-Host "   b) Test Products..." -ForegroundColor Gray
try {
    $productsUrl = "https://affiliate-rhonat-delta.vercel.app/api/clickbank/products"
    $productsResponse = Invoke-RestMethod -Uri $productsUrl -Method Get
    
    if ($productsResponse.success) {
        Write-Host "      OK - $($productsResponse.count) produits trouves" -ForegroundColor Green
    }
    else {
        Write-Host "      ERREUR: $($productsResponse.error)" -ForegroundColor Red
    }
}
catch {
    $errorMessage = $_.Exception.Message
    if ($errorMessage -like "*404*") {
        Write-Host "      ERREUR 404: Credentials ClickBank manquants ou invalides" -ForegroundColor Red
    }
    else {
        Write-Host "      ERREUR: $errorMessage" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "3. Verification de la Configuration..." -ForegroundColor Yellow
Write-Host ""

Write-Host "   Variables requises sur le backend (affiliate-rhonat-delta):" -ForegroundColor White
Write-Host "   - CLICKBANK_DEV_KEY (commence par API-)" -ForegroundColor Gray
Write-Host "   - CLICKBANK_API_KEY (la cle sans prefixe)" -ForegroundColor Gray
Write-Host "   - CLICKBANK_BASE_URL (https://api.clickbank.com)" -ForegroundColor Gray
Write-Host ""

Write-Host "   Pour les configurer:" -ForegroundColor White
Write-Host "   1. Allez sur https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host "   2. Selectionnez 'affiliate-rhonat-delta'" -ForegroundColor Gray
Write-Host "   3. Settings -> Environment Variables" -ForegroundColor Gray
Write-Host "   4. Ajoutez les 3 variables ci-dessus" -ForegroundColor Gray
Write-Host "   5. Redeployez le backend" -ForegroundColor Gray
Write-Host ""

Write-Host "=== Fin du Diagnostic ===" -ForegroundColor Cyan
