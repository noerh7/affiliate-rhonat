# Test ClickBank Analytics API - Version Corrigée
# Ce script teste l'API analytics avec les mêmes paramètres que l'exemple PowerShell qui fonctionne

Write-Host "🧪 Test de l'API ClickBank Analytics" -ForegroundColor Cyan
Write-Host "=" * 60

# Paramètres de test
$backendUrl = "https://affiliate-rhonat-delta.vercel.app"
$params = @{
    startDate = "2025-11-01"
    endDate   = "2025-12-11"
    role      = "AFFILIATE"
    dimension = "vendor"
    account   = "freenzy"
    select    = "HOP_COUNT,SALE_COUNT"
}

# Construction de la query string
$queryString = ($params.GetEnumerator() | ForEach-Object { 
        "$($_.Key)=$($_.Value)" 
    }) -join "&"

$url = "$backendUrl/api/clickbank/analytics?$queryString"

Write-Host "`n📍 URL de test:" -ForegroundColor Yellow
Write-Host $url

Write-Host "`n🔄 Envoi de la requête..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $url -Method GET
    
    Write-Host "`n✅ Succès!" -ForegroundColor Green
    Write-Host "`n📊 Réponse:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
    # Vérifier la structure de la réponse
    if ($response.success) {
        Write-Host "`n✅ La réponse contient 'success: true'" -ForegroundColor Green
        
        if ($response.data.rows) {
            Write-Host "✅ La réponse contient des données (rows)" -ForegroundColor Green
            
            if ($response.data.rows.row) {
                $rowCount = if ($response.data.rows.row -is [Array]) { 
                    $response.data.rows.row.Count 
                }
                else { 
                    1 
                }
                Write-Host "✅ Nombre de lignes: $rowCount" -ForegroundColor Green
            }
        }
    }
    
}
catch {
    Write-Host "`n❌ Erreur!" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "`nDétails:" -ForegroundColor Yellow
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 10
    }
}

Write-Host "`n" + ("=" * 60)
Write-Host "🏁 Test terminé" -ForegroundColor Cyan
