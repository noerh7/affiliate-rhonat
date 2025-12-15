# Configuration des Variables d'Environnement Vercel

## Problème Résolu
Le crash de la fonction serverless était causé par l'absence des variables d'environnement ClickBank. Le code a été modifié pour gérer cette situation gracieusement au lieu de crasher.

## Variables d'Environnement Requises

Vous devez configurer les variables suivantes dans Vercel :

### 1. CLICKBANK_DEV_KEY
- **Description** : Votre clé développeur ClickBank
- **Où la trouver** : Dans votre compte ClickBank > Settings > API Keys

### 2. CLICKBANK_API_KEY
- **Description** : Votre clé API ClickBank
- **Où la trouver** : Dans votre compte ClickBank > Settings > API Keys

### 3. CLICKBANK_BASE_URL (Optionnel)
- **Description** : URL de base de l'API ClickBank
- **Valeur par défaut** : `https://api.clickbank.com`
- **Note** : Utilisez `https://api.sandbox.clickbank.com` pour les tests

### 4. FRONTEND_URL (Optionnel)
- **Description** : URL de votre frontend pour CORS
- **Exemple** : `https://votre-frontend.vercel.app`
- **Valeur par défaut** : `*` (accepte toutes les origines)

## Comment Configurer sur Vercel

### Méthode 1 : Via le Dashboard Vercel (Recommandé)

1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet `affiliate-rhonat`
3. Allez dans **Settings** > **Environment Variables**
4. Ajoutez chaque variable :
   - Nom : `CLICKBANK_DEV_KEY`
   - Valeur : Votre clé développeur
   - Environnement : Cochez **Production**, **Preview**, et **Development**
   - Cliquez sur **Save**
5. Répétez pour `CLICKBANK_API_KEY`
6. **Redéployez** votre application

### Méthode 2 : Via Vercel CLI

```bash
# Installer Vercel CLI si ce n'est pas déjà fait
npm i -g vercel

# Se connecter
vercel login

# Ajouter les variables d'environnement
vercel env add CLICKBANK_DEV_KEY production
# Entrez votre clé quand demandé

vercel env add CLICKBANK_API_KEY production
# Entrez votre clé quand demandé

# Redéployer
vercel --prod
```

## Vérification

Une fois les variables configurées et le redéploiement effectué :

1. Testez l'endpoint de santé :
   ```
   https://votre-backend.vercel.app/api/clickbank/health
   ```

2. Vous devriez recevoir :
   - **Si les credentials sont corrects** :
     ```json
     {
       "status": "ok",
       "message": "ClickBank API is reachable"
     }
     ```
   
   - **Si les credentials ne sont pas configurés** :
     ```json
     {
       "status": "error",
       "message": "ClickBank credentials (CLICKBANK_DEV_KEY and CLICKBANK_API_KEY) are not configured. Please set them in your Vercel environment variables."
     }
     ```

## Modifications Apportées au Code

1. **Suppression du throw dans le constructeur** : Le service ne crash plus au démarrage
2. **Ajout de `checkCredentials()`** : Vérifie les credentials avant chaque requête
3. **Messages d'erreur clairs** : Indique exactement quelles variables manquent
4. **Gestion gracieuse** : Retourne des erreurs HTTP 500 avec des messages informatifs

## Prochaines Étapes

1. ✅ Configurez les variables d'environnement sur Vercel
2. ✅ Redéployez l'application (automatique après ajout des variables)
3. ✅ Testez l'endpoint `/api/clickbank/health`
4. ✅ Testez les autres endpoints une fois que le health check fonctionne

## Sécurité

⚠️ **IMPORTANT** :
- Ne commitez JAMAIS vos clés API dans Git
- Utilisez toujours les variables d'environnement
- Les clés sont sensibles et donnent accès à votre compte ClickBank
- Utilisez l'environnement sandbox pour les tests
