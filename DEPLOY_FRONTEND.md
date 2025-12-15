# 🚀 Guide de Déploiement Frontend - COMPLET

## ✅ Prérequis

- ✅ Backend déployé et fonctionnel : `https://affiliate-rhonat-99syrx7q1-spacemen100s-projects.vercel.app`
- ✅ Compte Vercel configuré
- ✅ Vercel CLI installé (si non: `npm i -g vercel`)

---

## ⚠️ IMPORTANT: Configuration vercel.json (Éviter les 404)

Le fichier `vercel.json` a été créé dans le dossier `frontend/` pour éviter les **erreurs 404** lors du déploiement.

### Pourquoi c'est nécessaire?

Avec React Router, quand un utilisateur visite directement une URL comme `/clickbank`, Vercel cherche un fichier `clickbank.html` qui n'existe pas. Le fichier `vercel.json` redirige **toutes les routes** vers `index.html`, permettant à React Router de gérer la navigation.

### Configuration actuelle:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

✅ **Ce fichier est déjà créé** - Aucune action nécessaire!

---

## 📋 Déploiement en 3 Étapes

### Étape 1: Vérifier la Configuration

Le fichier `.env.production` a été mis à jour avec la bonne URL du backend:

```env
VITE_API_URL=https://affiliate-rhonat-99syrx7q1-spacemen100s-projects.vercel.app
```

✅ **Déjà fait!**

### Étape 2: Tester en Local (Optionnel mais Recommandé)

Avant de déployer, teste que tout fonctionne en local:

```bash
cd frontend
npm install
npm run dev
```

Ouvre `http://localhost:5173` et vérifie que:
- La page ClickBank se charge
- Les données s'affichent (ou une erreur claire si les credentials ClickBank ne sont pas valides)

### Étape 3: Déployer sur Vercel

#### Option A: Via Vercel CLI (Recommandé)

```bash
cd frontend
vercel login
vercel --prod
```

**Répondre aux questions:**
- Set up and deploy? → **Y**
- Which scope? → Sélectionne ton compte
- Link to existing project? → **N** (première fois) ou **Y** (si déjà créé)
- Project name? → `affiliate-rhonat-frontend` (ou le nom de ton choix)
- In which directory is your code located? → `.` (appuie sur Entrée)
- Want to override settings? → **N**

Vercel va:
1. Build ton frontend
2. Le déployer
3. Te donner une URL de production

#### Option B: Via Vercel Dashboard

1. Va sur https://vercel.com/dashboard
2. Clique sur **Add New** → **Project**
3. Importe ton repository GitHub
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: Ajoute `VITE_API_URL` avec la valeur du backend
5. Clique sur **Deploy**

---

## 🔧 Configuration des Variables d'Environnement sur Vercel

### Via le Dashboard:

1. Va sur ton projet frontend dans Vercel
2. **Settings** → **Environment Variables**
3. Ajoute:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_API_URL` | `https://affiliate-rhonat-99syrx7q1-spacemen100s-projects.vercel.app` | Production, Preview, Development |

### Via CLI:

```bash
cd frontend
vercel env add VITE_API_URL production
# Entre: https://affiliate-rhonat-99syrx7q1-spacemen100s-projects.vercel.app

vercel env add VITE_API_URL preview
# Entre: https://affiliate-rhonat-99syrx7q1-spacemen100s-projects.vercel.app

vercel env add VITE_API_URL development
# Entre: https://affiliate-rhonat-99syrx7q1-spacemen100s-projects.vercel.app
```

---

## ✅ Vérification Post-Déploiement

Une fois déployé, Vercel te donnera une URL (ex: `https://affiliate-rhonat-frontend.vercel.app`).

### Teste les fonctionnalités:

1. **Page d'accueil** : Vérifie qu'elle se charge
2. **Page ClickBank** : Va sur `/clickbank` ou la route configurée
3. **Console du navigateur** : Vérifie qu'il n'y a pas d'erreurs CORS
4. **Network tab** : Vérifie que les requêtes vers le backend fonctionnent

### Endpoints à tester:

```
https://ton-frontend.vercel.app/
https://ton-frontend.vercel.app/clickbank (ou ta route)
```

---

## 🔄 Mettre à Jour le CORS du Backend

Une fois le frontend déployé, configure le CORS du backend pour accepter uniquement ton frontend:

1. Va sur Vercel Dashboard → Projet Backend
2. **Settings** → **Environment Variables**
3. Ajoute ou modifie `FRONTEND_URL`:
   - **Name**: `FRONTEND_URL`
   - **Value**: `https://ton-frontend.vercel.app`
   - **Environments**: Production, Preview, Development

4. Redéploie le backend:
```bash
cd backend-serverless
vercel --prod
```

---

## 📊 Architecture Finale

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION                                    │
└─────────────────────────────────────────────────────────────────┘

Frontend (Vercel) ✅                 Backend (Vercel) ✅
├─ https://ton-frontend.vercel.app  → https://affiliate-rhonat-99syrx7q1...
│                                              ↓
│                                        ClickBank API
│                                        (credentials sécurisées)
└─────────────────────────────────────────────────────────────────┘
```

---

## 🐛 Dépannage

### Erreur: "Network Error" ou "CORS Error"

**Solution**: Vérifie que `FRONTEND_URL` est configuré dans le backend avec l'URL exacte de ton frontend.

### Erreur: "VITE_API_URL is not defined"

**Solution**: Vérifie que la variable d'environnement est bien configurée dans Vercel Dashboard.

### Le build échoue

**Solution**: 
1. Vérifie que `package.json` contient les bonnes dépendances
2. Teste le build en local: `npm run build`
3. Vérifie les logs de build dans Vercel

### Les données ne se chargent pas

**Solution**:
1. Ouvre la console du navigateur (F12)
2. Vérifie l'onglet Network pour voir les requêtes
3. Vérifie que l'URL du backend est correcte
4. Teste le backend directement: `https://affiliate-rhonat-99syrx7q1-spacemen100s-projects.vercel.app/api/clickbank/health`

---

## 📝 Checklist de Déploiement

- [ ] `.env.production` mis à jour avec la bonne URL backend
- [ ] Test en local réussi (`npm run dev`)
- [ ] Connexion à Vercel (`vercel login`)
- [ ] Déploiement lancé (`vercel --prod`)
- [ ] Variables d'environnement configurées dans Vercel
- [ ] Frontend accessible via l'URL Vercel
- [ ] Page ClickBank fonctionne
- [ ] Pas d'erreurs CORS
- [ ] `FRONTEND_URL` configuré dans le backend
- [ ] Backend redéployé avec le nouveau CORS

---

## 🚀 Commandes Rapides

```bash
# Déploiement complet
cd c:\Users\stagiaire\Desktop\affiliate-rhonat\frontend
vercel --prod

# Redéploiement après modifications
vercel --prod

# Voir les logs
vercel logs

# Voir les déploiements
vercel ls
```

---

## 📚 Documentation Complémentaire

- **BACKEND_CONFIG.md** - Configuration du backend
- **CLICKBANK_PAGE.md** - Détails sur la page ClickBank
- **SUCCESS.md** - État actuel du backend

---

## ✅ Résultat Attendu

Après le déploiement, tu auras:

✅ Frontend déployé sur Vercel  
✅ Backend déployé sur Vercel  
✅ Communication frontend ↔ backend fonctionnelle  
✅ CORS configuré correctement  
✅ Application complète en production  

---

**Prêt à déployer?** Lance `vercel --prod` depuis le dossier `frontend`! 🚀
