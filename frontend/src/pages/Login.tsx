import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useNavigate } from 'react-router-dom';

type Mode = 'login' | 'signup' | 'reset' | 'recovery';

export default function Login() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  // Détecte un lien de récupération de Supabase (type=recovery dans le hash)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const accessToken = params.get('access_token') || params.get('token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        setLoading(true);
        supabase.auth
          .setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          .then(({ error }) => {
            if (error) {
              alert(`Erreur lors de l'établissement de la session de récupération: ${error.message}`);
            } else {
              setMode('recovery');
              // Nettoie l'URL pour éviter de retraiter le hash
              window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
            }
          })
          .finally(() => setLoading(false));
      }
    }
  }, []);

  async function handleLogin() {
    if (!email || !password) {
      alert('Veuillez remplir email et mot de passe');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      nav('/dashboard');
    }
  }

  async function handleSignUp() {
    if (!email || !password) {
      alert('Veuillez remplir email et mot de passe');
      return;
    }
    if (password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    setLoading(false);
    if (error) {
      alert(`Erreur: ${error.message}`);
    } else {
      alert('Compte créé ! Vérifie tes emails pour confirmer ton compte.');
      setMode('login');
    }
  }

  async function handleResetRequest() {
    if (!email) {
      alert('Veuillez saisir votre email pour réinitialiser le mot de passe.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) {
      alert(`Erreur: ${error.message}`);
    } else {
      alert('Email de réinitialisation envoyé. Consulte ta boîte mail.');
      setMode('login');
    }
  }

  async function handlePasswordUpdate() {
    if (!password || !passwordConfirm) {
      alert('Veuillez saisir et confirmer le nouveau mot de passe.');
      return;
    }
    if (password !== passwordConfirm) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      alert(`Erreur lors de la mise à jour: ${error.message}`);
    } else {
      alert('Mot de passe mis à jour. Vous pouvez vous connecter.');
      setMode('login');
      setPassword('');
      setPasswordConfirm('');
    }
  }

  return (
    <div className="app-background flex items-center justify-center">
      <div className="card w-full max-w-md p-7 flex flex-col gap-5">
        <div className="flex items-center gap-3 justify-center">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white flex items-center justify-center font-bold">
            RH
          </div>
          <div>
            <h2 className="text-xl font-semibold leading-tight">Espace affilié</h2>
            <p className="text-sm text-gray-500">Connectez-vous ou créez votre accès</p>
          </div>
        </div>
        <div className="flex gap-2 justify-center text-sm">
          <button
            className={`btn-ghost ${mode === 'login' ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}`}
            onClick={() => setMode('login')}
          >
            Connexion
          </button>
          <button
            className={`btn-ghost ${mode === 'signup' ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}`}
            onClick={() => setMode('signup')}
          >
            Création de compte
          </button>
          <button
            className={`btn-ghost ${mode === 'reset' ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}`}
            onClick={() => setMode('reset')}
          >
            Mot de passe oublié
          </button>
        </div>

        {mode === 'login' && (
          <>
            <input
              className="input text-sm"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="input text-sm"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button className="btn-primary text-sm" onClick={handleLogin} disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            <button className="text-xs underline self-start text-gray-600 hover:text-blue-700" onClick={() => setMode('reset')}>
              Mot de passe oublié ?
            </button>
          </>
        )}

        {mode === 'signup' && (
          <>
            <input
              className="input text-sm"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="input text-sm"
              type="password"
              placeholder="Mot de passe (min 6 caractères)"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button className="btn-primary text-sm" onClick={handleSignUp} disabled={loading}>
              {loading ? 'Création...' : 'Créer un compte'}
            </button>
            <p className="text-xs text-gray-500">
              Un email de confirmation est envoyé. Après validation, connectez-vous.
            </p>
          </>
        )}

        {mode === 'reset' && (
          <>
            <input
              className="input text-sm"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button className="btn-primary text-sm" onClick={handleResetRequest} disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
            </button>
            <p className="text-xs text-gray-500">
              Vous recevrez un lien email. Ouvrez-le pour définir un nouveau mot de passe.
            </p>
          </>
        )}

        {mode === 'recovery' && (
          <>
            <p className="text-sm">Définissez un nouveau mot de passe.</p>
            <input
              className="input text-sm"
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <input
              className="input text-sm"
              type="password"
              placeholder="Confirmer le mot de passe"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
            />
            <button className="btn-primary text-sm" onClick={handlePasswordUpdate} disabled={loading}>
              {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
