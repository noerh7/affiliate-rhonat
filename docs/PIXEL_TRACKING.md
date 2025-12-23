# Système de Tracking par Pixel

## Vue d'ensemble

Le système de tracking par pixel permet d'enregistrer automatiquement les ventes réalisées via les liens d'affiliation. Il utilise un cookie pour identifier quel lien a généré la vente.

## Fonctionnement

### 1. Création du lien d'affiliation

Lorsqu'un affilié crée un lien, il obtient une URL unique du type :
```
https://affiliate-rhonat-3c2b.vercel.app/go/AFF-QQK7WS
```

### 2. Clic sur le lien (Track-Clicks)

Lorsqu'un utilisateur clique sur ce lien :

1. **Edge Function `track-clicks`** est appelée avec le code du lien (ex: `AFF-QQK7WS`)
2. La fonction :
   - Récupère les informations du lien depuis Supabase
   - Enregistre le clic dans la table `clicks`
   - **Crée un cookie `aff_link_id`** contenant l'ID du lien (UUID)
   - Redirige l'utilisateur vers la page du produit

**Code du cookie :**
```typescript
const cookieMaxAge = 30 * 24 * 60 * 60; // 30 jours
Set-Cookie: aff_link_id={link.id}; Path=/; Max-Age=${cookieMaxAge}; SameSite=Lax
```

### 3. Page de confirmation de commande

Sur la page de confirmation de commande du site marchand, intégrez le pixel de tracking :

```html
<img src="https://[SUPABASE_URL]/functions/v1/record-sale?order_id=ORDER_123&amount=99.90" 
     width="1" 
     height="1" 
     style="display:none;" 
     alt="" />
```

**Paramètres :**
- `order_id` : ID unique de la commande
- `amount` : Montant total de la commande

### 4. Enregistrement de la vente (Record-Sale)

Lorsque le pixel se charge :

1. **Edge Function `record-sale`** est appelée en GET
2. La fonction :
   - Lit les paramètres `order_id` et `amount` depuis l'URL
   - **Lit le `link_id` depuis le cookie `aff_link_id`**
   - Récupère les informations du produit
   - Calcule la commission
   - Enregistre la vente dans la table `sales`
   - Retourne une image GIF 1x1 transparente

## Schéma du flux

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Utilisateur clique sur le lien d'affiliation                │
│    https://affiliate-rhonat.vercel.app/go/AFF-QQK7WS           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Edge Function: track-clicks                                  │
│    - Enregistre le clic                                         │
│    - Crée cookie: aff_link_id = {link_id UUID}                 │
│    - Redirige vers le site marchand                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Utilisateur navigue sur le site (cookie conservé 30 jours)  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Utilisateur effectue un achat                                │
│    Page de confirmation charge le pixel:                        │
│    <img src="...record-sale?order_id=X&amount=Y" />            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Edge Function: record-sale                                   │
│    - Lit order_id et amount depuis l'URL                       │
│    - Lit link_id depuis le cookie aff_link_id                  │
│    - Calcule la commission                                      │
│    - Enregistre la vente                                        │
│    - Retourne image 1x1 transparente                           │
└─────────────────────────────────────────────────────────────────┘
```

## Avantages du système

1. **Simplicité** : Pas besoin de passer le `link_id` dans l'URL du pixel
2. **Sécurité** : Le `link_id` n'est pas exposé publiquement
3. **Attribution longue durée** : Cookie valide 30 jours
4. **Compatibilité** : Fonctionne même sans JavaScript
5. **Léger** : Image 1x1 pixel, impact minimal sur les performances

## Edge Functions

### track-clicks

**Fichier** : `supabase/edge-functions/track-clicks/index.ts`

**Endpoint** : `GET /functions/v1/track-clicks?code={code}`

**Fonctionnalités** :
- Enregistre le clic
- Crée le cookie `aff_link_id`
- Redirige vers le produit

### record-sale

**Fichier** : `supabase/edge-functions/record-sale/index.ts`

**Endpoint** : `GET /functions/v1/record-sale?order_id={id}&amount={amount}`

**Fonctionnalités** :
- Support GET (pixel) et POST (API)
- Lit le `link_id` depuis le cookie
- Enregistre la vente
- Retourne une image GIF 1x1 pour les requêtes GET

## Test du système

### Page de test : `/test-sale-pixel`

Cette page permet de :
1. Vérifier la présence du cookie `aff_link_id`
2. Générer une URL de pixel de test
3. Déclencher le pixel et vérifier l'enregistrement

### Étapes de test

1. **Créer un cookie de test** :
   - Aller sur `/test-sale`
   - Sélectionner un lien d'affiliation
   - Cliquer sur "Simuler un clic"

2. **Tester le pixel** :
   - Aller sur `/test-sale-pixel`
   - Vérifier que le cookie est détecté
   - Entrer un Order ID et un montant
   - Générer l'URL du pixel
   - Déclencher le pixel

3. **Vérifier la vente** :
   - Aller sur le dashboard affilié
   - Vérifier que la vente apparaît

## Intégration dans un site marchand

### Exemple PHP

```php
<?php
// Page de confirmation de commande
$order_id = $_GET['order_id'];
$amount = $_GET['total'];
$pixel_url = "https://[SUPABASE_URL]/functions/v1/record-sale?order_id=" . urlencode($order_id) . "&amount=" . urlencode($amount);
?>

<!DOCTYPE html>
<html>
<head>
    <title>Commande confirmée</title>
</head>
<body>
    <h1>Merci pour votre commande !</h1>
    <p>Numéro de commande : <?= htmlspecialchars($order_id) ?></p>
    
    <!-- Pixel de tracking -->
    <img src="<?= htmlspecialchars($pixel_url) ?>" width="1" height="1" style="display:none;" alt="" />
</body>
</html>
```

### Exemple JavaScript

```javascript
// Page de confirmation de commande
const orderId = "ORDER_123";
const amount = 99.90;
const pixelUrl = `https://[SUPABASE_URL]/functions/v1/record-sale?order_id=${encodeURIComponent(orderId)}&amount=${encodeURIComponent(amount)}`;

// Créer et charger le pixel
const img = new Image();
img.src = pixelUrl;
img.width = 1;
img.height = 1;
img.style.display = 'none';
document.body.appendChild(img);
```

## Déploiement des Edge Functions

### Prérequis

- Compte Supabase
- Supabase CLI installé
- Variables d'environnement configurées

### Commandes de déploiement

```bash
# Déployer track-clicks
supabase functions deploy track-clicks

# Déployer record-sale
supabase functions deploy record-sale
```

### Variables d'environnement requises

Les Edge Functions utilisent automatiquement :
- `SUPABASE_URL` : URL de votre projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé de service (avec accès complet)

## Dépannage

### Le cookie n'est pas créé

- Vérifier que l'Edge Function `track-clicks` est déployée
- Vérifier les logs Supabase
- Vérifier que le domaine permet les cookies

### La vente n'est pas enregistrée

- Vérifier que le cookie `aff_link_id` existe
- Vérifier que l'Edge Function `record-sale` est déployée
- Vérifier les logs Supabase
- Vérifier que les paramètres `order_id` et `amount` sont corrects

### Erreur CORS

- Les Edge Functions Supabase gèrent automatiquement CORS
- Si problème, vérifier la configuration du projet Supabase

## Sécurité

- Le cookie utilise `SameSite=Lax` pour la protection CSRF
- Le `link_id` n'est jamais exposé dans l'URL publique
- Les Edge Functions utilisent la clé de service pour accéder à Supabase
- Validation des paramètres côté serveur

## Performance

- Image GIF 1x1 : ~35 bytes
- Temps de réponse moyen : < 200ms
- Pas d'impact sur le temps de chargement de la page
- Cookie léger : ~40 bytes
