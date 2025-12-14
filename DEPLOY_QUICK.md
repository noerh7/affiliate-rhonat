# 🚀 Scripts de Déploiement Rapide

## Déploiement Backendd

```bash
# Depuis la racine du projet
cd backend-serverless

# Première fois : installer les dépendances
npm install

# Déployer en production
vercel --prod
```

## Déploiement Frontend

```bash
# Depuis la racine du projet
cd frontend

# Première fois : installer les dépendances
npm install

# Déployer en production
vercel --prod
```

## Déploiement Complet (Backend + Frontend)

```bash
# Backend
cd backend-serverless
npm install
vercel --prod

# Frontend
cd ../frontend
npm install
vercel --prod
```

## Configuration des Variables d'Environnement

### Backend (à faire une seule fois)

```bash
cd backend-serverless

# Clés ClickBank
vercel env add CLICKBANK_DEV_KEY
vercel env add CLICKBANK_API_KEY
vercel env add CLICKBANK_CLERK_KEY

# URL de base ClickBank
vercel env add CLICKBANK_BASE_URL
# Valeur : https://api.clickbank.com

# URL du frontend (à mettre à jour après déploiement frontend)
vercel env add FRONTEND_URL
# Valeur : https://ton-frontend.vercel.app
```

### Frontend (via Vercel Dashboard)

1. Va sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionne ton projet frontend
3. Va dans **Settings** → **Environment Variables**
4. Ajoute :
   - **Name** : `VITE_API_URL`
   - **Value** : `https://affiliate-clickbank-api.vercel.app` (URL de ton backend)
   - **Environments** : Production, Preview, Development

## Vérification Post-Déploiement

```bash
# Tester le backend
curl https://affiliate-clickbank-api.vercel.app/api/clickbank/health

# Voir les logs backend
vercel logs https://affiliate-clickbank-api.vercel.app --follow

# Voir les logs frontend
vercel logs https://ton-frontend.vercel.app --follow
```

## Mise à Jour Rapide

### Backend

```bash
cd backend-serverless
# Faire tes modifications...
vercel --prod
```

### Frontend

```bash
cd frontend
# Faire tes modifications...
vercel --prod
```

## Rollback en cas de problème

```bash
# Lister les déploiements
vercel ls

# Promouvoir un ancien déploiement en production
vercel promote <deployment-url>
```
