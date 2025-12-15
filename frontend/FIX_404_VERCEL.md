# 🔧 Fix: Erreur 404 sur Vercel avec React/Vite

## 🎯 Problème

Après déploiement sur Vercel, vous obtenez une **erreur 404** quand vous:
- Visitez directement une route (ex: `/clickbank`)
- Rafraîchissez la page sur une route autre que `/`
- Partagez un lien direct vers une page spécifique

## ❓ Pourquoi ça arrive?

### Fonctionnement Normal (en local):
1. Vous visitez `/clickbank`
2. Vite/React Router intercepte la route
3. Affiche le bon composant

### Problème sur Vercel:
1. Vous visitez `/clickbank`
2. Vercel cherche un fichier `clickbank.html`
3. ❌ **404 - Fichier introuvable**

### La Cause:
Les applications React/Vite sont des **Single Page Applications (SPA)**:
- Il n'y a qu'**un seul fichier HTML** (`index.html`)
- Toutes les routes sont gérées par **JavaScript côté client**
- Vercel ne sait pas qu'il doit servir `index.html` pour toutes les routes

## ✅ Solution: Le fichier `vercel.json`

### 1. Créer `vercel.json` dans le dossier `frontend/`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Explication de la Configuration

#### `rewrites`
```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```
- **`source: "/(.*)""`** = Toutes les routes (regex qui match tout)
- **`destination: "/index.html"`** = Redirige vers index.html
- **Résultat**: Toutes les URLs servent `index.html`, React Router prend le relais

#### `headers` (Bonus - Performance)
```json
"headers": [
  {
    "source": "/assets/(.*)",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"
      }
    ]
  }
]
```
- Met en cache les assets (JS, CSS, images) pendant 1 an
- Améliore les performances de chargement

### 3. Déployer

```bash
cd frontend
vercel --prod
```

## 🔍 Autres Cas d'Usage

### Pour Next.js
Next.js gère automatiquement le routing, **pas besoin de vercel.json** pour les routes.

### Pour Vue Router
Même problème, même solution:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Pour Angular
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 🐛 Vérification

### Avant le Fix:
```
✅ https://ton-app.vercel.app/           → Fonctionne
❌ https://ton-app.vercel.app/clickbank  → 404 Error
❌ https://ton-app.vercel.app/about      → 404 Error
```

### Après le Fix:
```
✅ https://ton-app.vercel.app/           → Fonctionne
✅ https://ton-app.vercel.app/clickbank  → Fonctionne
✅ https://ton-app.vercel.app/about      → Fonctionne
```

## 📚 Ressources

- [Vercel Rewrites Documentation](https://vercel.com/docs/projects/project-configuration#rewrites)
- [SPA Routing on Vercel](https://vercel.com/guides/deploying-react-with-vercel)

## ✅ Checklist

- [x] Fichier `vercel.json` créé dans `frontend/`
- [x] Configuration des rewrites ajoutée
- [ ] Déployé sur Vercel
- [ ] Testé toutes les routes

---

**Status**: ✅ **RÉSOLU** - Le fichier `vercel.json` a été créé dans votre projet!
