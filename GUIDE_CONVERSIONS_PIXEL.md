# 📊 Guide Complet - Tracking des Conversions par Pixel

## 🎯 Vue d'ensemble

Le système de tracking des conversions permet de comptabiliser les ventes réalisées via vos liens d'affiliation en utilisant la méthode **pixel de conversion**. Cette méthode est simple à implémenter et permet de suivre précisément les revenus générés par chaque influenceur.

## 🔄 Fonctionnement du Système

### 1. **Flux de tracking complet**

```
┌─────────────────┐
│  Utilisateur    │
│  clique sur le  │
│  lien affilié   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Edge Function:             │
│  track-clicks               │
│  • Enregistre le clic       │
│  • Définit cookie           │
│    aff_link_id              │
│  • Redirige vers produit    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────┐
│  Page produit   │
│  (landing page) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Achat effectué │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Page "Merci"               │
│  • Pixel chargé             │
│  • Cookie lu                │
│  • Vente enregistrée        │
└─────────────────────────────┘
```

### 2. **Mécanisme du Cookie**

Lorsqu'un utilisateur clique sur un lien d'affiliation :
- Un cookie `aff_link_id` est créé dans le navigateur
- Ce cookie est valide pendant **30 jours**
- Il contient l'ID du lien d'affiliation

### 3. **Enregistrement de la Conversion**

Sur la page de confirmation (page "Merci") :
- Le pixel charge une image invisible (1x1 transparent GIF)
- Le cookie `aff_link_id` est automatiquement envoyé
- La vente est enregistrée avec :
  - `link_id` : récupéré du cookie
  - `order_id` : ID de la commande
  - `amount` : Montant de la vente
  - `commission` : Calculée automatiquement

## 🛠️ Utilisation

### Étape 1 : Accéder à la page Conversions

1. Connectez-vous à votre compte
2. Cliquez sur **"Conversions"** dans le menu latéral
3. Vous verrez :
   - Les statistiques globales
   - Le générateur de pixel
   - L'historique des conversions

### Étape 2 : Générer le Code Pixel

1. Cliquez sur **"Afficher"** dans la section "Générateur de Pixel de Conversion"
2. Sélectionnez le lien d'affiliation concerné
3. Cliquez sur **"Générer le Code Pixel"**
4. Deux versions du code sont générées :
   - **Version HTML** : Simple image pixel
   - **Version JavaScript** : Plus fiable, recommandée

### Étape 3 : Intégrer le Pixel

#### Option 1 : Pixel HTML (Simple)

```html
<!-- À placer sur la page de confirmation -->
<img 
  src="https://votre-url.supabase.co/functions/v1/record-sale?order_id={{ORDER_ID}}&amount={{AMOUNT}}" 
  width="1" 
  height="1" 
  style="display:none;" 
  alt=""
/>
```

#### Option 2 : Pixel JavaScript (Recommandé)

```html
<!-- Alternative JavaScript - Plus fiable -->
<script>
(function() {
  var orderId = '{{ORDER_ID}}'; // Remplacer par l'ID de commande réel
  var amount = {{AMOUNT}}; // Remplacer par le montant réel
  
  var img = new Image(1, 1);
  img.src = 'https://votre-url.supabase.co/functions/v1/record-sale?order_id=' + orderId + '&amount=' + amount;
  img.style.display = 'none';
  document.body.appendChild(img);
})();
</script>
```

### Étape 4 : Remplacer les Variables

⚠️ **Important** : Vous devez remplacer les placeholders par les vraies valeurs :

- `{{ORDER_ID}}` → ID unique de la commande (ex: "ORD-12345")
- `{{AMOUNT}}` → Montant de la vente en euros (ex: 99.90)

**Exemple concret** :

```javascript
// ❌ MAUVAIS
var orderId = '{{ORDER_ID}}';
var amount = {{AMOUNT}};

// ✅ BON
var orderId = 'ORD-2025-001234';
var amount = 99.90;
```

### Étape 5 : Intégration dans votre Page de Confirmation

**Exemple avec PHP** :

```php
<!DOCTYPE html>
<html>
<head>
    <title>Merci pour votre achat !</title>
</head>
<body>
    <h1>Merci pour votre commande !</h1>
    <p>Votre commande #<?php echo $order_id; ?> a été confirmée.</p>
    
    <!-- Pixel de conversion -->
    <script>
    (function() {
      var orderId = '<?php echo $order_id; ?>';
      var amount = <?php echo $order_total; ?>;
      
      var img = new Image(1, 1);
      img.src = 'https://votre-url.supabase.co/functions/v1/record-sale?order_id=' + orderId + '&amount=' + amount;
      img.style.display = 'none';
      document.body.appendChild(img);
    })();
    </script>
</body>
</html>
```

**Exemple avec JavaScript (SPA)** :

```javascript
// Dans votre composant de confirmation
function OrderConfirmation({ orderId, orderTotal }) {
  useEffect(() => {
    // Charger le pixel de conversion
    const img = new Image(1, 1);
    img.src = `https://votre-url.supabase.co/functions/v1/record-sale?order_id=${orderId}&amount=${orderTotal}`;
    img.style.display = 'none';
    document.body.appendChild(img);
    
    // Nettoyage
    return () => {
      if (img.parentNode) {
        img.parentNode.removeChild(img);
      }
    };
  }, [orderId, orderTotal]);
  
  return (
    <div>
      <h1>Merci pour votre commande !</h1>
      <p>Commande #{orderId} confirmée</p>
    </div>
  );
}
```

## 📊 Visualisation des Conversions

### Statistiques Disponibles

1. **Total Conversions** : Nombre total de ventes
2. **Revenu Total** : Somme de tous les montants
3. **Commission Totale** : Somme des commissions
4. **Taux de Conversion** : (Conversions / Clics) × 100

### Tableau des Conversions

Pour chaque conversion, vous pouvez voir :
- Date et heure de la vente
- Produit vendu
- Code du lien d'affiliation
- ID de commande
- Montant de la vente
- Commission gagnée

## ⚙️ Architecture Technique

### Base de Données

**Table `sales`** (alias `conversions`) :

```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES affiliate_links(id),
  order_id TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  commission DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Edge Functions

#### 1. `track-clicks`

**Rôle** : Enregistrer les clics et définir le cookie

```typescript
// Définit un cookie avec le link_id
const cookieMaxAge = 30 * 24 * 60 * 60; // 30 jours

return new Response(null, {
  status: 302,
  headers: {
    "Location": product.landing_url,
    "Set-Cookie": `aff_link_id=${link.id}; Path=/; Max-Age=${cookieMaxAge}; SameSite=Lax`,
  },
});
```

#### 2. `record-sale`

**Rôle** : Enregistrer les ventes

**Méthodes supportées** :
- **GET** : Pour les pixels (lecture du cookie)
- **POST** : Pour les appels API directs

```typescript
// Lecture du cookie
const cookieHeader = req.headers.get("cookie");
link_id = getCookieValue(cookieHeader, "aff_link_id");

// Calcul de la commission
const commission = (amount * product.commission_percent) / 100;

// Enregistrement
await supabase.from("sales").insert({
  link_id,
  order_id,
  amount,
  commission,
});
```

## ✅ Avantages de la Méthode Pixel

1. **Simplicité** : Facile à implémenter
2. **Compatibilité** : Fonctionne avec tous les types de sites
3. **Automatique** : Le cookie est géré automatiquement
4. **Durée** : Cookie valide 30 jours
5. **Fiabilité** : Pas besoin de passer le link_id manuellement

## ⚠️ Limitations et Solutions

### 1. Bloqueurs de Publicité

**Problème** : Les adblockers peuvent bloquer les pixels

**Solutions** :
- Utiliser un nom de domaine personnalisé
- Implémenter un tracking server-side en parallèle
- Utiliser la version JavaScript qui est moins détectable

### 2. Cookies Tiers

**Problème** : Certains navigateurs bloquent les cookies tiers

**Solution** : Le cookie est défini en `SameSite=Lax`, ce qui le rend compatible avec la plupart des navigateurs modernes

### 3. Navigation Privée

**Problème** : Les cookies ne persistent pas en mode privé

**Solution** : Aucune solution parfaite, mais c'est une limitation acceptée

## 🔒 Sécurité

### Validation des Données

- Tous les montants sont validés côté serveur
- Les commissions sont calculées automatiquement
- Protection contre les duplications via `order_id` unique

### Protection CORS

Les Edge Functions sont configurées pour accepter uniquement les requêtes depuis vos domaines autorisés.

## 📈 Optimisations Futures

1. **Déduplication** : Éviter les conversions en double
2. **Webhooks** : Notifications en temps réel
3. **Attribution Multi-Touch** : Créditer plusieurs affiliés
4. **Rapports Avancés** : Graphiques et analyses détaillées
5. **Export de Données** : CSV, Excel, PDF

## 🆘 Dépannage

### Le pixel ne s'affiche pas

1. Vérifiez que le code est bien sur la page de confirmation
2. Vérifiez la console du navigateur pour les erreurs
3. Testez avec les DevTools réseau

### Les conversions ne sont pas enregistrées

1. Vérifiez que l'utilisateur a bien cliqué sur un lien affilié
2. Vérifiez que le cookie `aff_link_id` existe
3. Vérifiez les logs de l'Edge Function `record-sale`
4. Vérifiez que `order_id` et `amount` sont corrects

### Le cookie n'est pas défini

1. Vérifiez que l'Edge Function `track-clicks` fonctionne
2. Vérifiez la configuration CORS
3. Vérifiez que le domaine est autorisé

## 📞 Support

Pour toute question ou problème :
1. Consultez les logs Supabase
2. Vérifiez la page `/test-sale-pixel` pour tester
3. Contactez le support technique

---

**Dernière mise à jour** : 23 décembre 2025
**Version** : 1.0.0
