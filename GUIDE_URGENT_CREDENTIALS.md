# 🔐 GUIDE URGENT : Configurer les Credentials ClickBank

## ⚠️ PROBLÈME ACTUEL

```
https://affiliate-rhonat-delta.vercel.app/api/clickbank/health
→ {"status":"error","message":"Cannot reach ClickBank API"}
```

**Cause :** Les credentials ClickBank ne sont PAS configurés sur Vercel.

---

## ✅ SOLUTION (5 MINUTES)

### **Étape 1 : Aller sur Vercel**

1. Ouvrez votre navigateur
2. Allez sur https://vercel.com/dashboard
3. Connectez-vous si nécessaire

### **Étape 2 : Sélectionner le Bon Projet**

1. Dans la liste de vos projets, cliquez sur **`affiliate-rhonat-delta`**
   - ⚠️ Attention : PAS `affiliate-rhonat-3c2b` (c'est le frontend)
   - ✅ Choisissez bien `affiliate-rhonat-delta` (c'est le backend ClickBank)

### **Étape 3 : Accéder aux Variables d'Environnement**

1. Cliquez sur l'onglet **Settings** (en haut de la page)
2. Dans le menu de gauche, cliquez sur **Environment Variables**

### **Étape 4 : Ajouter les 3 Variables**

Vous devez ajouter **3 variables** une par une :

#### **Variable 1 : CLICKBANK_DEV_KEY**

1. Cliquez sur le bouton **"Add New"** ou **"Add Variable"**
2. Remplissez :
   - **Name** : `CLICKBANK_DEV_KEY`
   - **Value** : `API-KM27URMQL9C2275OIUEIX7FBMX4NHIM6VCHT`
   - **Environments** : Cochez ✅ Production, ✅ Preview, ✅ Development
3. Cliquez sur **"Save"**

#### **Variable 2 : CLICKBANK_API_KEY**

1. Cliquez à nouveau sur **"Add New"**
2. Remplissez :
   - **Name** : `CLICKBANK_API_KEY`
   - **Value** : `KM27URMQL9C2275OIUEIX7FBMX4NHIM6VCHT`
   - **Environments** : Cochez ✅ Production, ✅ Preview, ✅ Development
3. Cliquez sur **"Save"**

#### **Variable 3 : CLICKBANK_BASE_URL**

1. Cliquez à nouveau sur **"Add New"**
2. Remplissez :
   - **Name** : `CLICKBANK_BASE_URL`
   - **Value** : `https://api.clickbank.com`
   - **Environments** : Cochez ✅ Production, ✅ Preview, ✅ Development
3. Cliquez sur **"Save"**

### **Étape 5 : Redéployer**

**IMPORTANT :** Les variables ne seront actives qu'après un redéploiement !

1. Allez dans l'onglet **Deployments** (en haut)
2. Trouvez le dernier déploiement (en haut de la liste)
3. Cliquez sur les **3 points (...)** à droite
4. Cliquez sur **"Redeploy"**
5. Confirmez en cliquant à nouveau sur **"Redeploy"**
6. Attendez 2-3 minutes que le déploiement se termine

---

## 🧪 VÉRIFICATION

Une fois le redéploiement terminé (statut "Ready"), testez :

### **Dans PowerShell :**
```powershell
Invoke-RestMethod -Uri "https://affiliate-rhonat-delta.vercel.app/api/clickbank/health"
```

### **Résultat Attendu (SUCCÈS) :**
```json
{
  "status": "ok",
  "message": "ClickBank API is reachable"
}
```

### **Si vous voyez toujours "Cannot reach ClickBank API" :**
1. Vérifiez que les 3 variables sont bien enregistrées (Settings → Environment Variables)
2. Vérifiez que vous avez bien redéployé
3. Attendez 2-3 minutes supplémentaires
4. Vérifiez que les valeurs sont exactement celles indiquées ci-dessus

---

## 📋 RÉCAPITULATIF DES VALEURS

| Variable | Valeur Exacte |
|----------|---------------|
| `CLICKBANK_DEV_KEY` | `API-KM27URMQL9C2275OIUEIX7FBMX4NHIM6VCHT` |
| `CLICKBANK_API_KEY` | `KM27URMQL9C2275OIUEIX7FBMX4NHIM6VCHT` |
| `CLICKBANK_BASE_URL` | `https://api.clickbank.com` |

**Projet Vercel :** `affiliate-rhonat-delta`

**Environnements :** Production + Preview + Development (tous cochés)

---

## ⏱️ TEMPS ESTIMÉ

- Ajout des 3 variables : **2 minutes**
- Redéploiement : **2-3 minutes**
- **Total : ~5 minutes**

---

## 🆘 EN CAS DE PROBLÈME

### **Je ne trouve pas le projet `affiliate-rhonat-delta`**
- Vérifiez que vous êtes connecté au bon compte Vercel
- Le projet existe bien (on a testé l'URL et elle fonctionne)

### **Les variables ne se sauvegardent pas**
- Vérifiez que vous avez les droits d'administration sur le projet
- Essayez de rafraîchir la page

### **Toujours "Cannot reach ClickBank API" après redéploiement**
- Vérifiez que les valeurs sont EXACTEMENT celles indiquées (copier-coller)
- Vérifiez qu'il n'y a pas d'espaces avant ou après les valeurs
- Attendez 5 minutes et réessayez

---

## 🎯 APRÈS CONFIGURATION

Une fois que le health check retourne `"status": "ok"` :

1. ✅ Le backend peut communiquer avec ClickBank
2. ✅ Vous pourrez récupérer vos commandes
3. ✅ Le frontend affichera les données ClickBank
4. ✅ Plus d'erreur 404 !

---

**C'est la DERNIÈRE étape !** Une fois les credentials configurés, tout fonctionnera ! 🚀
