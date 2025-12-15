# Documentation API ClickBank

Ce document explique comment utiliser le service API ClickBank pour récupérer les ventes, les statistiques de clics et créer des liens d'affiliation.

## Installation

Le service est déjà intégré dans le projet. Importez les fonctions depuis `./clickbank` :

```typescript
import {
  getOrders,
  getAllOrders,
  getClicksAnalytics,
  createAffiliateLink,
  testConnection,
} from './api/clickbank';
```

## Configuration

Toutes les fonctions nécessitent une configuration avec votre clé API ClickBank :

```typescript
const config = {
  apiKey: 'DEV-123456789012345678901234567890123456', // Votre clé API
  developerKey: 'DEV-123456789012345678901234567890123456', // Optionnel
};

// Si vous utilisez le proxy (recommandé pour le front afin d'éviter le CORS) :
// VITE_CLICKBANK_PROXY_URL=/api/clickbank/proxy
// VITE_CLICKBANK_API_BASE_URL=https://api.clickbank.com/rest (par défaut)

En local avec Vite (http://localhost:5173), pointez le proxy vers l'URL déployée pour éviter le 404 du front :

VITE_CLICKBANK_PROXY_URL=https://affiliate-rhonat.vercel.app/api/clickbank/proxy
```

**Note:** Pour les tests, utilisez la clé developer fournie : `DEV-123456789012345678901234567890123456`

## Fonctionnalitése
### 1. Tester la connexion

Vérifiez que votre clé API fonctionne correctement :

```typescript
const isConnected = await testConnection(config);
if (isConnected) {
  console.log('✅ Connexion réussie !');
}
```

### 2. Récupérer les ventes

#### Récupérer une page de ventes

```typescript
const filters = {
  startDate: '2024-01-01', // Format: yyyy-mm-dd
  endDate: '2024-12-31',
  type: 'SALE', // SALE, RFND, CGBK, etc.
  affiliate: 'monaffilie', // Optionnel
  tid: 'campagne_fb_1', // Optionnel: Tracking ID
  page: 1, // Numéro de page
};

const response = await getOrders(config, filters);
console.log(`Trouvé ${response.orders.length} commande(s)`);
console.log(response.orders); // Tableau de commandes avec tous les détails
```

#### Récupérer toutes les ventes (avec pagination automatique)

```typescript
const allOrders = await getAllOrders(config, {
  startDate: '2024-01-01',
  endDate: '2024-12-31',
});

console.log(`Total: ${allOrders.length} commandes`);
```

**Format de réponse JSON des ventes :**

```json
{
  "orders": [
    {
      "receipt": "ABC123",
      "transactionTime": "2024-01-15T10:30:00Z",
      "transactionType": "SALE",
      "vendor": "vendornickname",
      "vendorId": "12345",
      "productTitle": "Mon Produit",
      "productId": "PROD123",
      "amount": 99.99,
      "account": "accountname",
      "currency": "USD",
      "paymentType": "CREDIT_CARD",
      "paymentMethod": "VISA",
      "role": "AFFILIATE",
      "affiliate": "monaffilie",
      "trackingId": "campagne_fb_1"
    }
  ],
  "page": 1,
  "hasMore": false
}
```

### 3. Récupérer les statistiques de clics

Récupérez les détails des clics (Hops) pour chaque lien d'affiliation :

```typescript
const filters = {
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  trackingId: 'campagne_fb_1', // Optionnel: filtrer par Tracking ID
};

const response = await getClicksAnalytics(config, filters);
console.log(`Statistiques pour ${response.data.length} Tracking ID(s)`);

response.data.forEach((clickData) => {
  console.log(`Tracking ID: ${clickData.trackingId}`);
  console.log(`  - Clics (Hops): ${clickData.hops}`);
  console.log(`  - Ventes: ${clickData.sales}`);
  console.log(`  - Remboursements: ${clickData.refunds}`);
  console.log(`  - Chargebacks: ${clickData.chargebacks}`);
  console.log(`  - Gains: ${clickData.earnings}`);
});
```

**Format de réponse JSON des clics :**

```json
{
  "data": [
    {
      "trackingId": "campagne_fb_1",
      "hops": 150,
      "sales": 12,
      "refunds": 1,
      "chargebacks": 0,
      "earnings": 599.88
    }
  ],
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
}
```

### 4. Créer un lien d'affiliation (HopLink)

Créez un lien d'affiliation avec un Tracking ID personnalisé :

```typescript
const request = {
  affiliateNickname: 'monaffilie',
  vendorNickname: 'produitx',
  trackingId: 'campagne_fb_1',
};

const response = await createAffiliateLink(config, request);

if (response.success) {
  console.log('✅ Lien créé avec succès !');
  console.log(`URL: ${response.link.url}`);
  // https://monaffilie.produitx.hop.clickbank.net/?tid=campagne_fb_1
}
```

**Format de réponse JSON :**

```json
{
  "success": true,
  "link": {
    "url": "https://monaffilie.produitx.hop.clickbank.net/?tid=campagne_fb_1",
    "affiliateNickname": "monaffilie",
    "vendorNickname": "produitx",
    "trackingId": "campagne_fb_1",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "status": "created"
  },
  "message": "Affiliate link created successfully"
}
```

**Note importante :** ClickBank ne fournit pas d'API POST pour créer des HopLinks. Cette fonction construit l'URL selon le format standard ClickBank et retourne les détails en JSON. Le lien est immédiatement utilisable.

## Utilisation dans l'interface

La page `Clickbank.tsx` intègre une interface complète pour tester toutes ces fonctionnalités :

1. **Test de connexion** : Vérifiez que votre clé API fonctionne
2. **Récupération des ventes** : Testez avec des filtres personnalisés
3. **Statistiques de clics** : Visualisez les données de performance
4. **Création de liens** : Générez des HopLinks avec Tracking ID

## Endpoints API ClickBank utilisés

- **GET /1.3/orders2/list** : Récupération des ventes
- **GET /1.3/analytics/AFFILIATE/TRACKING_ID** : Statistiques de clics

## Gestion des erreurs

Toutes les fonctions lancent des erreurs en cas d'échec. Utilisez try/catch pour les gérer :

```typescript
try {
  const orders = await getOrders(config, filters);
  // Traiter les données
} catch (error) {
  console.error('Erreur API ClickBank:', error.message);
  // Gérer l'erreur
}
```

## Pagination

L'API ClickBank retourne un maximum de 100 commandes par page. Si plus de 100 résultats sont disponibles :
- Le statut HTTP sera `206 (Partial Content)`
- Utilisez `getAllOrders()` pour récupérer automatiquement toutes les pages
- Ou utilisez le paramètre `page` dans `getOrders()` pour naviguer manuellement

## Exemples complets

Consultez le fichier `clickbank-example.ts` pour des exemples d'utilisation complets.

## Support

Pour plus d'informations sur l'API ClickBank, consultez :
- [Documentation ClickBank](https://support.clickbank.com/hc/en-us/articles/220364807)
- Le fichier `clickbankdevelopperkey.md` dans le projet

The ClickBank Application Program Interfaces, or APIs, are tools that let you create applications to get information on your account.
 
Using information from the ClickBank APIs, you can create an application that displays or uses this data in useful ways.
 
Note: This service is designed for experienced programmers.
If you are using an integration that requires a ClickBank developer API key (aka DEV Key) please use this captain API Key:
DEV-123456789012345678901234567890123456.
 
For more information on API, please see the following:
https://support.clickbank.com/en/articles/10535400-clickbank-apis
https://support.clickbank.com/en/articles/10535398-clickbank-api-resources
https://support.clickbank.com/en/articles/10535394-how-do-i-manage-api-permissions
