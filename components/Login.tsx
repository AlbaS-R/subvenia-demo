
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase-client';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
// Fix: Import IconButton to use for toggling the language switcher
import { IconButton } from './common/IconButton';

const RECENT_EMAILS_KEY = 'grantswin_recent_emails';

const Login: React.FC = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<'login' | 'recover' | 'success' | 'demo'>('demo');
  const [email, setEmail] = useState('demo@subvenia.es');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [recentEmails, setRecentEmails] = useState<string[]>([]);
  const { theme } = useTheme();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_EMAILS_KEY);
    if (saved) {
      try {
        setRecentEmails(JSON.parse(saved));
      } catch (e) {
        setRecentEmails([]);
      }
    }
  }, []);

  const saveRecentEmail = (newEmail: string) => {
    const filtered = recentEmails.filter(e => e !== newEmail);
    const updated = [newEmail, ...filtered].slice(0, 3);
    setRecentEmails(updated);
    localStorage.setItem(RECENT_EMAILS_KEY, JSON.stringify(updated));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (data.user) {
        saveRecentEmail(email);
      }
    } catch (err: any) {
      setError(t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setView('success');
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  const logoUrl = theme === 'dark' 
    ? "https://grantswin.fra1.digitaloceanspaces.com/PUBLIC/logos-suite/SVG/GrantsWin/Horizontal/GrantsWin-horizontal-dark.svg"
    : "https://grantswin.fra1.digitaloceanspaces.com/PUBLIC/logos-suite/SVG/GrantsWin/Horizontal/GrantsWin-horizontal.svg";

  return (
    <div className="min-h-screen w-full text-foreground relative isolate overflow-hidden bg-background">
      <div aria-hidden className="site-mesh-bg" />
      <div aria-hidden className="site-aurora-layer" />
      <div aria-hidden className="site-flow-gradient" />
      <div aria-hidden className="site-grid-overlay opacity-40" />

      <div className="fixed top-6 right-6 z-50 flex items-center gap-1 p-1.5 rounded-2xl bg-card/80 backdrop-blur-xl border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
        <div className="relative">
          <IconButton
            ref={langMenuTriggerRef}
            icon="language"
            onClick={() => setIsLangMenuOpen((o) => !o)}
            tooltip="Idioma"
            tooltipPosition="bottom"
          />
          {isLangMenuOpen && (
            <div className="absolute top-full right-0 mt-2 z-50">
              <LanguageSwitcher
                isOpen={isLangMenuOpen}
                onClose={() => setIsLangMenuOpen(false)}
                anchorRef={langMenuTriggerRef}
              />
            </div>
          )}
        </div>
        <ThemeSwitcher />
      </div>

      <main className="min-h-screen flex items-center justify-center px-[5vw] py-12 relative z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="hidden lg:flex flex-col space-y-6 pr-12">
            <div className="inline-flex w-fit rounded-full border border-primary/35 bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-primary font-poppins">
              Motor de euros para vuestra red
            </div>
            <h1 className="text-5xl leading-tight text-neutral-100 font-poppins">
              Más dinero para vuestros socios. <br />
              <span className="method-gradient-headline">Cero postureo tecnológico.</span>
            </h1>
            <p className="text-lg text-neutral-300 max-w-md font-roboto">
              Convertimos vuestra base de socios en oportunidades reales de financiación: automáticas, escalables y medibles.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-card/75 backdrop-blur-2xl p-10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-white/15">
              {view === 'demo' && (
                <div className="text-center">
                  <div className="mb-10">
                    <h2 className="text-5xl font-black text-neutral-100 font-poppins mb-4">Demo Subvenia</h2>
                    <p className="text-neutral-300 text-lg font-roboto leading-relaxed">
                      Explora la plataforma con acceso completo a todas las funcionalidades estratégicas.
                    </p>
                  </div>

                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full py-6 rounded-[2rem] text-primary-foreground text-2xl font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(68,237,204,0.3)] hover:shadow-[0_25px_60px_rgba(68,237,204,0.4)] transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4 mb-8"
                    style={{ background: '#44edcc' }}
                  >
                    <span>{loading ? 'Iniciando...' : 'Entrar a la Demo'}</span>
                    <span className="material-symbols-outlined text-3xl">rocket_launch</span>
                  </button>

                  <button 
                    onClick={() => setView('login')}
                    className="text-neutral-400 hover:text-secondary text-sm font-medium transition-colors uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                  >
                    <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                    Acceso Avanzado
                  </button>
                </div>
              )}

              {view === 'login' && (
                <>
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-3xl text-neutral-100 font-poppins">{t('login.title')}</h2>
                      <button onClick={() => setView('demo')} className="text-secondary text-xs uppercase font-bold hover:underline">Volver a Demo</button>
                    </div>
                    <p className="text-neutral-300 mt-1 font-roboto">{t('login.subtitle')}</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative group">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder=" "
                        required
                        className="peer w-full bg-transparent border-b-2 border-white/25 focus:border-secondary py-3 transition-all outline-none text-neutral-100 font-roboto"
                      />
                      <label htmlFor="email" className="absolute left-0 top-3 text-neutral-400 transition-all pointer-events-none origin-left peer-focus:-translate-y-6 peer-focus:scale-90 peer-focus:text-secondary peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-90">
                        {t('login.emailLabel')}
                      </label>
                      <div className="absolute bottom-0 left-0 h-0.5 bg-secondary w-0 group-focus-within:w-full transition-all duration-500" />
                    </div>

                    {recentEmails.length > 0 && (
                      <div className="-mt-2 flex flex-wrap gap-2">
                        {recentEmails.map((re) => (
                          <button
                            key={re}
                            type="button"
                            onClick={() => setEmail(re)}
                            className="px-3 py-1 rounded-full border border-white/20 text-xs text-secondary hover:bg-secondary/10 transition-colors"
                          >
                            {re}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="relative group">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder=" "
                        required
                        className="peer w-full bg-transparent border-b-2 border-white/25 focus:border-secondary py-3 pr-10 transition-all outline-none text-neutral-100 font-roboto"
                      />
                      <label htmlFor="password" className="absolute left-0 top-3 text-neutral-400 transition-all pointer-events-none origin-left peer-focus:-translate-y-6 peer-focus:scale-90 peer-focus:text-secondary peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-90">
                        {t('login.passwordLabel')}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-100 transition-colors"
                        aria-label="Mostrar u ocultar contraseña"
                      >
                        <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                      <div className="absolute bottom-0 left-0 h-0.5 bg-secondary w-0 group-focus-within:w-full transition-all duration-500" />
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input className="w-4 h-4 rounded-full border-2 border-secondary text-secondary focus:ring-0 bg-transparent" type="checkbox" />
                      <span className="text-sm text-neutral-300 font-roboto">Mantener sesión iniciada</span>
                      </label>
                      <button type="button" onClick={() => setView('recover')} className="text-sm text-secondary hover:opacity-80 transition-opacity">
                        ¿Has olvidado la contraseña?
                      </button>
                    </div>

                    {error && <p className="text-sm text-red-300 text-center">{error}</p>}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-2xl text-primary-foreground text-lg shadow-[0_0_32px_rgba(68,237,204,0.28)] flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-70 font-poppins"
                      style={{
                        background: '#44edcc'
                      }}
                    >
                      <span>{loading ? 'Accediendo...' : t('login.button')}</span>
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                  </form>
                </>
              )}

              {view === 'recover' && (
                <div className="text-center">
                  <h2 className="text-4xl text-neutral-100 font-poppins">Recuperar acceso</h2>
                  <p className="text-neutral-300 mt-1 mb-8 font-roboto">
                    Introduce tu correo para recibir un enlace de recuperación.
                  </p>
                  <form onSubmit={handlePasswordRecovery} className="space-y-6">
                    <div className="relative group text-left">
                      <input
                        id="recover-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder=" "
                        required
                        className="peer w-full bg-transparent border-b-2 border-white/25 focus:border-secondary py-3 transition-all outline-none text-neutral-100 font-roboto"
                      />
                      <label htmlFor="recover-email" className="absolute left-0 top-3 text-neutral-400 transition-all pointer-events-none origin-left peer-focus:-translate-y-6 peer-focus:scale-90 peer-focus:text-secondary peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-90">
                        {t('login.emailLabel')}
                      </label>
                      <div className="absolute bottom-0 left-0 h-0.5 bg-secondary w-0 group-focus-within:w-full transition-all duration-500" />
                    </div>
                    {error && <p className="text-sm text-red-300">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-2xl text-primary-foreground text-lg shadow-[0_0_32px_rgba(68,237,204,0.28)] transition-all hover:-translate-y-0.5 disabled:opacity-70 font-poppins"
                      style={{
                        background: '#44edcc'
                      }}
                    >
                      {loading ? 'Enviando...' : 'Enviar enlace'}
                    </button>
                  </form>
                  <button type="button" onClick={() => setView('login')} className="mt-6 text-secondary hover:underline">
                    Volver al login
                  </button>
                </div>
              )}

              {view === 'success' && (
                <div className="text-center rounded-2xl p-8 bg-secondary/10 border border-secondary/25 backdrop-blur-md">
                  <span className="material-symbols-outlined text-secondary text-5xl mb-4">mark_email_read</span>
                  <h3 className="text-xl font-semibold text-neutral-100 font-roboto">Correo enviado</h3>
                  <p className="text-neutral-300 mt-2 font-roboto">
                    Si el correo existe, te llegará un enlace para recuperar tu contraseña.
                  </p>
                  <button type="button" onClick={() => setView('login')} className="mt-6 text-secondary hover:underline">
                    Volver al login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-white/10 bg-card/40 backdrop-blur-md flex flex-col md:flex-row justify-between items-center px-8 md:px-12 py-8 gap-4 relative z-10">
        <div className="font-poppins font-bold text-secondary">Subvenia</div>
        <div className="text-sm tracking-wide text-neutral-400">© {new Date().getFullYear()} Subvenia. Dinero para vuestros socios, en piloto automático.</div>
        <div className="flex gap-6 text-sm">
          <a className="text-neutral-400 hover:text-secondary transition-colors" href="#">Privacidad</a>
          <a className="text-neutral-400 hover:text-secondary transition-colors" href="#">Seguridad</a>
          <a className="text-neutral-400 hover:text-secondary transition-colors" href="#">Términos</a>
          <a className="text-neutral-400 hover:text-secondary transition-colors" href="#">Contacto</a>
        </div>
      </footer>
    </div>
  );
};

export default Login;
