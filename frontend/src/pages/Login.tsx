import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type Mode = 'login' | 'signup' | 'reset' | 'recovery';

export default function Login() {
  const { t } = useTranslation();
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
              alert(`${t('auth.success.sessionRecoveryError')}: ${error.message}`);
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
      alert(t('auth.errors.fillEmailPassword'));
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
      alert(t('auth.errors.fillEmailPassword'));
      return;
    }
    if (password.length < 6) {
      alert(t('auth.errors.passwordLength'));
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
      alert(`${t('common.error')}: ${error.message}`);
    } else {
      alert(t('auth.success.accountCreated'));
      setMode('login');
    }
  }

  async function handleResetRequest() {
    if (!email) {
      alert(t('auth.errors.enterEmail'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) {
      alert(`${t('common.error')}: ${error.message}`);
    } else {
      alert(t('auth.success.resetEmailSent'));
      setMode('login');
    }
  }

  async function handlePasswordUpdate() {
    if (!password || !passwordConfirm) {
      alert(t('auth.errors.enterConfirmPassword'));
      return;
    }
    if (password !== passwordConfirm) {
      alert(t('auth.errors.passwordMismatch'));
      return;
    }
    if (password.length < 6) {
      alert(t('auth.errors.passwordLength'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      alert(`${t('common.error')}: ${error.message}`);
    } else {
      alert(t('auth.success.passwordUpdated'));
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
            <h2 className="text-xl font-semibold leading-tight">{t('auth.title')}</h2>
            <p className="text-sm text-gray-500">{t('auth.subtitle')}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-center text-sm">
          <button
            className={`btn-ghost ${mode === 'login' ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}`}
            onClick={() => setMode('login')}
          >
            {t('auth.login')}
          </button>
          <button
            className={`btn-ghost ${mode === 'signup' ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}`}
            onClick={() => setMode('signup')}
          >
            {t('auth.signup')}
          </button>
          <button
            className={`btn-ghost ${mode === 'reset' ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}`}
            onClick={() => setMode('reset')}
          >
            {t('auth.forgotPassword')}
          </button>
        </div>

        {mode === 'login' && (
          <>
            <input
              className="input text-sm"
              placeholder={t('auth.email')}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="input text-sm"
              type="password"
              placeholder={t('auth.password')}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button className="btn-primary text-sm" onClick={handleLogin} disabled={loading}>
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
            <button className="text-xs underline self-start text-gray-600 hover:text-blue-700" onClick={() => setMode('reset')}>
              {t('auth.forgotPasswordLink')}
            </button>
          </>
        )}

        {mode === 'signup' && (
          <>
            <input
              className="input text-sm"
              placeholder={t('auth.email')}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="input text-sm"
              type="password"
              placeholder={t('auth.passwordMin')}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button className="btn-primary text-sm" onClick={handleSignUp} disabled={loading}>
              {loading ? t('auth.creatingAccount') : t('auth.signUp')}
            </button>
            <p className="text-xs text-gray-500">
              {t('auth.confirmationEmailSent')}
            </p>
          </>
        )}

        {mode === 'reset' && (
          <>
            <input
              className="input text-sm"
              placeholder={t('auth.email')}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button className="btn-primary text-sm" onClick={handleResetRequest} disabled={loading}>
              {loading ? t('auth.sending') : t('auth.sendResetLink')}
            </button>
            <p className="text-xs text-gray-500">
              {t('auth.resetEmailSent')}
            </p>
          </>
        )}

        {mode === 'recovery' && (
          <>
            <p className="text-sm">{t('auth.setNewPassword')}</p>
            <input
              className="input text-sm"
              type="password"
              placeholder={t('auth.newPassword')}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <input
              className="input text-sm"
              type="password"
              placeholder={t('auth.confirmPassword')}
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
            />
            <button className="btn-primary text-sm" onClick={handlePasswordUpdate} disabled={loading}>
              {loading ? t('auth.updating') : t('auth.updatePassword')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
