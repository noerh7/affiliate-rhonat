# Déploiement des Edge Functions Supabase

## Modifications apportées

Les Edge Functions ont été modifiées pour supporter le tracking par cookie :

### 1. track-clicks

**Modification** : Création d'un cookie `aff_link_id` lors de la redirection

**Changements** :
- Ajout du header `Set-Cookie` avec le `link_id`
- Cookie valide 30 jours
- Utilisation de `SameSite=Lax` pour la sécurité

### 2. record-sale

**Modification** : Support du mode pixel (GET) avec lecture du cookie

**Changements** :
- Support des requêtes GET en plus de POST
- Lecture du `link_id` depuis le cookie `aff_link_id`
- Retour d'une image GIF 1x1 transparente pour les requêtes GET
- Fallback sur le cookie si `link_id` n'est pas fourni dans le body (POST)

## Déploiement

### Prérequis

1. **Installer Supabase CLI** :
```bash
# Windows (via Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# macOS (via Homebrew)
brew install supabase/tap/supabase

# Linux
curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/install.sh | sh
```

2. **Se connecter à Supabase** :
```bash
supabase login
```

3. **Lier le projet** :
```bash
# Depuis le répertoire racine du projet
supabase link --project-ref [VOTRE_PROJECT_REF]
```

Pour trouver votre `project-ref` :
- Aller sur https://app.supabase.com
- Sélectionner votre projet
- L'URL sera : `https://app.supabase.com/project/[PROJECT_REF]`

### Déployer les Edge Functions

```bash
# Déployer track-clicks
supabase functions deploy track-clicks

# Déployer record-sale
supabase functions deploy record-sale

# Ou déployer les deux en une commande
supabase functions deploy
```

### Vérifier le déploiement

```bash
# Lister les fonctions déployées
supabase functions list
```

Vous devriez voir :
```
┌──────────────┬────────┬─────────────────────────┬──────────┐
│ NAME         │ STATUS │ VERSION                 │ UPDATED  │
├──────────────┼────────┼─────────────────────────┼──────────┤
│ track-clicks │ ACTIVE │ v1                      │ 1m ago   │
│ record-sale  │ ACTIVE │ v1                      │ 1m ago   │
└──────────────┴────────┴─────────────────────────┴──────────┘
```

## Test des Edge Functions

### Tester track-clicks

```bash
# Remplacer [PROJECT_REF] par votre référence de projet
curl "https://[PROJECT_REF].supabase.co/functions/v1/track-clicks?code=AFF-QQK7WS" -v
```

Vérifier :
- Status 302 (redirection)
- Header `Set-Cookie` présent avec `aff_link_id`
- Header `Location` pointe vers le produit

### Tester record-sale (mode pixel)

```bash
# D'abord, créer un cookie de test
# Puis tester le pixel
curl "https://[PROJECT_REF].supabase.co/functions/v1/record-sale?order_id=TEST_123&amount=99.90" \
  -H "Cookie: aff_link_id=[LINK_ID_UUID]" \
  -v
```

Vérifier :
- Status 200
- Content-Type: image/gif
- Vente enregistrée dans Supabase

### Tester record-sale (mode API)

```bash
curl -X POST "https://[PROJECT_REF].supabase.co/functions/v1/record-sale" \
  -H "Content-Type: application/json" \
  -d '{
    "link_id": "[LINK_ID_UUID]",
    "order_id": "TEST_456",
    "amount": 149.90
  }'
```

Vérifier :
- Status 200
- Response: `{"success": true}`
- Vente enregistrée dans Supabase

## Logs et Debugging

### Voir les logs en temps réel

```bash
# Logs de track-clicks
supabase functions logs track-clicks --follow

# Logs de record-sale
supabase functions logs record-sale --follow
```

### Voir les logs récents

```bash
# Derniers logs de track-clicks
supabase functions logs track-clicks --limit 50

# Derniers logs de record-sale
supabase functions logs record-sale --limit 50
```

## Variables d'environnement

Les Edge Functions utilisent automatiquement :

- `SUPABASE_URL` : URL de votre projet (automatique)
- `SUPABASE_SERVICE_ROLE_KEY` : Clé de service (automatique)

Pas besoin de les configurer manuellement.

## Rollback

Si vous devez revenir à une version précédente :

```bash
# Lister les versions
supabase functions list --version

# Déployer une version spécifique
supabase functions deploy track-clicks --version [VERSION_ID]
```

## Troubleshooting

### Erreur "Function not found"

- Vérifier que la fonction est déployée : `supabase functions list`
- Redéployer si nécessaire

### Erreur "Invalid JWT"

- Vérifier que vous êtes connecté : `supabase login`
- Vérifier que le projet est lié : `supabase link --project-ref [REF]`

### Cookie non créé

- Vérifier les logs : `supabase functions logs track-clicks`
- Vérifier que le code du lien existe dans la base de données
- Tester avec curl pour voir les headers

### Vente non enregistrée

- Vérifier les logs : `supabase functions logs record-sale`
- Vérifier que le cookie existe
- Vérifier que le `link_id` dans le cookie est valide
- Vérifier les permissions RLS sur la table `sales`

## Mise à jour du frontend

Après le déploiement, mettre à jour la variable d'environnement frontend :

```env
VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co
```

Redémarrer le serveur de développement :

```bash
npm run dev
```

## Production

Pour la production, assurez-vous que :

1. Les Edge Functions sont déployées sur Supabase
2. Les variables d'environnement sont configurées sur Vercel
3. Le domaine du site marchand autorise les cookies du domaine Supabase

## Support

En cas de problème :

1. Vérifier les logs des Edge Functions
2. Vérifier les logs du navigateur (Console et Network)
3. Tester avec curl pour isoler le problème
4. Consulter la documentation Supabase : https://supabase.com/docs/guides/functions
