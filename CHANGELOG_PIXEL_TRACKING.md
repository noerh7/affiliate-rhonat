# Changelog - Système de Tracking par Pixel

## [2025-12-17] - Implémentation du tracking par cookie

### Ajouté

#### Frontend
- **Page `/test-sale-pixel`** : Nouvelle page de test pour le pixel de tracking
  - Affichage du cookie `aff_link_id` actuel
  - Génération d'URL de pixel avec `order_id` et `amount`
  - Test en direct du pixel
  - Documentation intégrée
  - Exemples d'intégration HTML et JavaScript

- **Navigation** : Ajout du lien "Test Pixel" dans la sidebar
  - Icône personnalisée pour le pixel
  - Route protégée par authentification

#### Backend (Edge Functions)

- **track-clicks** : Création automatique du cookie `aff_link_id`
  - Cookie créé lors de la redirection vers le produit
  - Durée de vie : 30 jours
  - Attributs : `Path=/; SameSite=Lax`
  - Contient l'UUID du `link_id`

- **record-sale** : Support du mode pixel (GET) et API (POST)
  - Mode GET : Lecture des paramètres depuis l'URL
  - Lecture automatique du `link_id` depuis le cookie
  - Retour d'une image GIF 1x1 transparente pour les pixels
  - Fallback sur le cookie si `link_id` non fourni en POST
  - Fonction helper `getCookieValue()` pour parser les cookies

#### Documentation

- **PIXEL_TRACKING.md** : Documentation complète du système
  - Schéma du flux complet
  - Exemples d'intégration
  - Guide de test
  - Dépannage

- **EDGE_FUNCTIONS_DEPLOYMENT.md** : Guide de déploiement
  - Instructions d'installation de Supabase CLI
  - Commandes de déploiement
  - Tests des Edge Functions
  - Troubleshooting

### Modifié

#### Edge Functions

**track-clicks/index.ts** :
```diff
- return Response.redirect(product.landing_url, 302);
+ const cookieMaxAge = 30 * 24 * 60 * 60;
+ return new Response(null, {
+   status: 302,
+   headers: {
+     "Location": product.landing_url,
+     "Set-Cookie": `aff_link_id=${link.id}; Path=/; Max-Age=${cookieMaxAge}; SameSite=Lax`,
+   },
+ });
```

**record-sale/index.ts** :
```diff
- const body = await req.json();
- const { link_id, amount, order_id } = body;
+ let link_id: string | null = null;
+ let amount: number;
+ let order_id: string;
+ 
+ if (req.method === "GET") {
+   const url = new URL(req.url);
+   order_id = url.searchParams.get("order_id") || "";
+   amount = parseFloat(url.searchParams.get("amount") || "0");
+   const cookieHeader = req.headers.get("cookie");
+   link_id = getCookieValue(cookieHeader, "aff_link_id");
+ } else {
+   const body = await req.json();
+   link_id = body.link_id || getCookieValue(req.headers.get("cookie"), "aff_link_id");
+   amount = body.amount;
+   order_id = body.order_id;
+ }
```

#### Frontend

**TestSalePixel.tsx** :
- Ajout de la vérification du cookie au chargement
- Validation du cookie avant génération du pixel
- Affichage visuel du statut du cookie
- Lien vers `/test-sale` pour créer un cookie de test

### Flux de données

#### Avant (sans cookie)
```
Lien → Clic → Redirection → Achat → Pixel (avec link_id dans URL) → Vente
```

#### Après (avec cookie)
```
Lien → Clic → Cookie créé → Redirection → Achat → Pixel (link_id depuis cookie) → Vente
```

### Avantages

1. **Sécurité** : Le `link_id` n'est plus exposé dans l'URL publique du pixel
2. **Simplicité** : Pas besoin de passer le `link_id` au site marchand
3. **Fiabilité** : Attribution sur 30 jours
4. **Compatibilité** : Fonctionne sans JavaScript (image pixel)
5. **Performance** : Image 1x1 pixel (~35 bytes)

### Migration

#### Pour les développeurs

1. **Déployer les nouvelles Edge Functions** :
   ```bash
   supabase functions deploy track-clicks
   supabase functions deploy record-sale
   ```

2. **Tester le système** :
   - Aller sur `/test-sale` pour créer un cookie
   - Aller sur `/test-sale-pixel` pour tester le pixel

3. **Mettre à jour les intégrations** :
   - Ancienne méthode (POST avec link_id) : toujours supportée
   - Nouvelle méthode (GET avec cookie) : recommandée

#### Pour les sites marchands

**Ancienne intégration (toujours supportée)** :
```javascript
fetch('https://[URL]/functions/v1/record-sale', {
  method: 'POST',
  body: JSON.stringify({ link_id, order_id, amount })
});
```

**Nouvelle intégration (recommandée)** :
```html
<img src="https://[URL]/functions/v1/record-sale?order_id=X&amount=Y" 
     width="1" height="1" style="display:none;" />
```

### Tests

#### Tests manuels effectués

- ✅ Création du cookie lors du clic sur un lien
- ✅ Lecture du cookie par l'Edge Function
- ✅ Enregistrement de la vente via pixel (GET)
- ✅ Enregistrement de la vente via API (POST)
- ✅ Fallback sur le cookie si link_id non fourni en POST
- ✅ Affichage du cookie dans `/test-sale-pixel`
- ✅ Génération et test du pixel

#### Tests à effectuer en production

- [ ] Déployer les Edge Functions sur Supabase
- [ ] Tester avec un vrai lien d'affiliation
- [ ] Vérifier la création du cookie cross-domain
- [ ] Tester l'attribution sur plusieurs jours
- [ ] Vérifier les performances du pixel

### Notes techniques

#### Cookie

- **Nom** : `aff_link_id`
- **Valeur** : UUID du lien d'affiliation
- **Durée** : 30 jours (2 592 000 secondes)
- **Path** : `/` (disponible sur tout le domaine)
- **SameSite** : `Lax` (protection CSRF)
- **Secure** : Non (pour compatibilité HTTP/HTTPS)
- **HttpOnly** : Non (accessible en JavaScript si besoin)

#### Image pixel

- **Format** : GIF
- **Taille** : 1x1 pixel
- **Poids** : ~35 bytes
- **Transparence** : Oui
- **Cache** : Désactivé (`no-cache, no-store, must-revalidate`)

### Compatibilité

- ✅ Tous les navigateurs modernes
- ✅ Fonctionne sans JavaScript
- ✅ Compatible avec les bloqueurs de publicité (domaine Supabase)
- ✅ Compatible HTTPS et HTTP
- ⚠️ Nécessite les cookies activés

### Prochaines étapes

1. Déployer les Edge Functions sur Supabase production
2. Tester en conditions réelles
3. Documenter les cas d'usage spécifiques
4. Ajouter des métriques de performance
5. Implémenter un système de détection de fraude (optionnel)

### Support

Pour toute question ou problème :
1. Consulter `docs/PIXEL_TRACKING.md`
2. Consulter `docs/EDGE_FUNCTIONS_DEPLOYMENT.md`
3. Vérifier les logs Supabase
4. Tester avec `/test-sale-pixel`
