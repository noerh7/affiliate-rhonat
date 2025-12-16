# ✅ ClickBank Analytics - Appel Backend Vercel Intégré

## 🎯 Configuration Finale

Le frontend appelle maintenant le **backend Vercel déployé** à l'adresse:
```
https://affiliate-rhonat-delta.vercel.app
```

## 📝 Code Modifié dans `frontend/src/api/clickbank.ts`

### URL Backend (en dur)
```typescript
const BACKEND_URL = 'https://affiliate-rhonat-delta.vercel.app';
```

### Fonction `getClicksAnalytics` - Version Finale

```typescript
export async function getClicksAnalytics(
  config: ClickBankConfig,
  filters: AnalyticsFilters = {}
): Promise<AnalyticsResponse> {
  // Backend déployé sur Vercel (URL en dur)
  const BACKEND_URL = 'https://affiliate-rhonat-delta.vercel.app';
  
  // Construire la clé API avec le préfixe API-
  const apiKey = config.apiKey.startsWith('API-') 
    ? config.apiKey 
    : `API-${config.apiKey}`;

  // Construction des paramètres de requête pour le backend
  const params = new URLSearchParams();
  
  // Paramètres obligatoires
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  
  // Paramètres optionnels avec valeurs par défaut
  params.append('role', filters.role || 'AFFILIATE');
  params.append('dimension', filters.dimension || 'TRACKING_ID');
  params.append('select', filters.select || 'HOP_COUNT,SALE_COUNT');
  
  // Account (requis pour dimension vendor)
  if (filters.account) {
    params.append('account', filters.account);
  } else if ((filters.dimension || 'TRACKING_ID').toLowerCase() === 'vendor') {
    params.append('account', 'freenzy');
  }
  
  // Tracking ID optionnel
  if (filters.trackingId) {
    params.append('tid', filters.trackingId);
  }

  // URL complète vers le backend
  const url = `${BACKEND_URL}/api/clickbank/analytics?${params.toString()}`;

  // Appel au backend Vercel
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': apiKey,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();
  const payload = result.success ? result.data : result;
  
  // Normaliser et retourner
  return {
    data: normalizeAnalyticsPayload(payload),
    period: {
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
    },
  };
}
```

## 🔄 Flux de Données

```
Frontend (localhost:5173)
    ↓
    Appelle: https://affiliate-rhonat-delta.vercel.app/api/clickbank/analytics
    Headers: Authorization: API-xxx, Accept: application/json
    Params: startDate, endDate, role, dimension, account, select
    ↓
Backend Vercel (affiliate-rhonat-delta)
    ↓
    Appelle: https://api.clickbank.com/rest/1.3/analytics/affiliate/vendor
    Headers: Authorization: API-xxx, Accept: application/json
    Params: startDate, endDate, account, select
    ↓
ClickBank API
    ↓
    Retourne: { rows: {...}, totals: {...} }
    ↓
Backend Vercel
    ↓
    Retourne: { success: true, data: { rows: {...}, totals: {...} } }
    ↓
Frontend
    ↓
    Affiche les résultats
```

## 🧪 Test Immédiat

### 1. Le serveur dev tourne déjà
```
http://localhost:5173
```

### 2. Rafraîchissez votre navigateur
- Appuyez sur F5 ou Ctrl+R
- Ouvrez la console (F12)

### 3. Testez "Statistiques de clics"
Remplissez le formulaire:
- **Date de début**: 2025-11-01
- **Date de fin**: 2025-12-11
- **Dimension**: vendor
- **Account**: freenzy
- **Metrics**: HOP_COUNT,SALE_COUNT

Cliquez sur **"Récupérer les clics"**

### 4. Vérifiez les logs console

Vous devriez voir:
```
[ClickBank Backend] Calling: https://affiliate-rhonat-delta.vercel.app/api/clickbank/analytics?startDate=2025-11-01&endDate=2025-12-11&role=AFFILIATE&dimension=vendor&select=HOP_COUNT,SALE_COUNT&account=freenzy
[ClickBank Backend] Params: {startDate: "2025-11-01", endDate: "2025-12-11", role: "AFFILIATE", dimension: "vendor", select: "HOP_COUNT,SALE_COUNT", account: "freenzy"}
[ClickBank Backend] Response status: 200
[ClickBank Backend] Response data: {success: true, data: {...}}
```

## ✅ Avantages de Cette Approche

1. **URL en dur** - Pas de configuration d'environnement nécessaire
2. **Toute la logique dans clickbank.ts** - Un seul fichier à maintenir
3. **Pas de CORS** - Le backend gère les appels à ClickBank
4. **Logs détaillés** - Facile à déboguer
5. **Backend déjà déployé** - Prêt à l'emploi

## 📊 Réponse Attendue

### Backend Response
```json
{
  "success": true,
  "data": {
    "rows": {
      "row": [
        {
          "dimensionValue": "mitolyn",
          "data": [
            {
              "attribute": "HOP_COUNT",
              "value": { "$": "5" }
            },
            {
              "attribute": "SALE_COUNT",
              "value": { "$": "0" }
            }
          ]
        }
      ]
    },
    "totals": {
      "total": [...]
    }
  }
}
```

### Frontend Display
Après normalisation, les données seront affichées dans l'interface avec:
- Vendor: mitolyn
- Clics (HOP_COUNT): 5
- Ventes (SALE_COUNT): 0

## 🔧 Si Erreur 404 Persiste

Si vous voyez toujours une erreur 404, cela signifie que le backend n'a pas encore été redéployé avec les modifications que nous avons faites au code backend.

**Solution:**
1. Vérifiez sur https://vercel.com/dashboard
2. Projet: `affiliate-rhonat-delta`
3. Onglet "Deployments"
4. Attendez que le dernier déploiement soit terminé
5. Ou déclenchez un nouveau déploiement manuellement

## 📝 Variables d'Environnement Backend (Rappel)

Le backend a besoin de ces variables sur Vercel:
- `CLICKBANK_DEV_KEY`: API-KM27URMQL9C2275OIUEIX7FBMX4NHIM6VCHT
- `CLICKBANK_API_KEY`: API-KM27URMQL9C2275OIUEIX7FBMX4NHIM6VCHT
- `CLICKBANK_BASE_URL`: https://api.clickbank.com

---

**Dernière mise à jour:** 16 Décembre 2025, 19:10  
**Status:** ✅ Code modifié, prêt à tester dans le navigateur  
**Backend URL:** https://affiliate-rhonat-delta.vercel.app (en dur)
