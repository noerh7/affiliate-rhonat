# ⚡ Conversions - Démarrage Ultra-Rapide

## 🎯 En 3 Étapes

### 1️⃣ Accéder
```
http://localhost:5173/conversions
```

### 2️⃣ Générer
1. Cliquer sur "Afficher"
2. Sélectionner un lien
3. Cliquer sur "Générer"
4. Copier le code

### 3️⃣ Intégrer
```javascript
<script>
(function() {
  var orderId = 'ORD-12345';  // ⚠️ CHANGER
  var amount = 99.90;          // ⚠️ CHANGER
  
  var img = new Image(1, 1);
  img.src = 'https://votre-url.supabase.co/functions/v1/record-sale?order_id=' + orderId + '&amount=' + amount;
  img.style.display = 'none';
  document.body.appendChild(img);
})();
</script>
```

## ✅ C'est Tout !

Les ventes apparaîtront automatiquement dans `/conversions`

## 📚 Plus d'Infos

- **Guide complet** : [GUIDE_CONVERSIONS_PIXEL.md](./GUIDE_CONVERSIONS_PIXEL.md)
- **Référence** : [CONVERSIONS_QUICK_REFERENCE.md](./CONVERSIONS_QUICK_REFERENCE.md)
- **Index** : [CONVERSIONS_DOCUMENTATION_INDEX.md](./CONVERSIONS_DOCUMENTATION_INDEX.md)

## 🆘 Problème ?

1. Vérifier le cookie : DevTools → Application → Cookies → `aff_link_id`
2. Vérifier le pixel : DevTools → Network → `record-sale`
3. Consulter : [CONVERSIONS_QUICK_REFERENCE.md](./CONVERSIONS_QUICK_REFERENCE.md) → "Problèmes Courants"

---

**Version** : 1.0.0 | **Statut** : ✅ Production Ready
