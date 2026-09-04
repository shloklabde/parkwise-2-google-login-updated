import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLocation } from 'wouter';
import { AlertTriangle, Check, Copy, ExternalLink, Sparkles, X } from 'lucide-react';

export function GoogleIcon({ className = 'h-5 w-5 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27a7.198 7.198 0 0 1 0-4.54V6.58H1.25a11.979 11.979 0 0 0 0 10.84l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

interface GoogleSignInButtonProps {
  label?: string;
  variant?: 'light' | 'dark';
  onError?: (err: string) => void;
  onSuccess?: () => void;
  className?: string;
}

export function GoogleSignInButton({
  label = 'Continue with Google',
  variant = 'light',
  onError,
  onSuccess,
  className = '',
}: GoogleSignInButtonProps) {
  const { loginWithGoogle, login, adminLogin } = useApp();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [showDomainGuide, setShowDomainGuide] = useState(false);
  const [copied, setCopied] = useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseConsoleUrl = 'https://console.firebase.google.com/project/parkwise-c2b26/authentication/settings';

  const copyDomain = async () => {
    try {
      await navigator.clipboard.writeText(currentDomain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleQuickDemo = async () => {
    setQuickLoginLoading(true);
    try {
      if (variant === 'dark') {
        await adminLogin('admin@parkwise.app', 'admin123');
        setLocation('/admin/dashboard');
      } else {
        await login('user@parkwise.app', 'password123');
        setLocation('/parking');
      }
    } catch {
      setLocation(variant === 'dark' ? '/admin/dashboard' : '/parking');
    } finally {
      setQuickLoginLoading(false);
    }
  };

  const handleClick = async () => {
    setLoading(true);
    onError?.('');
    try {
      const nextUser = await loginWithGoogle();
      if (onSuccess) {
        onSuccess();
      } else {
        setLocation(nextUser.role === 'admin' ? '/admin/dashboard' : '/parking');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to sign in with Google.';
      if (
        msg.toLowerCase().includes('authorized domain') ||
        msg.toLowerCase().includes('unauthorized-domain')
      ) {
        setShowDomainGuide(true);
      }
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {variant === 'dark' ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          data-testid="button-google-signin-dark"
          className={`relative flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white shadow-md backdrop-blur-sm transition-all hover:bg-white/15 hover:border-white/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <div className="grid h-6 w-6 place-items-center rounded-full bg-white shadow-xs">
              <GoogleIcon className="h-4 w-4" />
            </div>
          )}
          <span>{loading ? 'Connecting with Google…' : label}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          data-testid="button-google-signin"
          className={`relative flex w-full items-center justify-center gap-3 rounded-xl border border-[#d9e4e8] bg-white px-4 py-3 text-sm font-bold text-[#29485c] shadow-xs transition-all hover:bg-[#f8fafb] hover:border-[#b6ccd6] hover:shadow-sm active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#286b70] border-t-transparent" />
          ) : (
            <GoogleIcon className="h-5 w-5" />
          )}
          <span>{loading ? 'Connecting with Google…' : label}</span>
        </button>
      )}

      {/* Domain Authorization helper banner / modal */}
      {showDomainGuide && (
        <div
          data-testid="box-authorized-domain-guide"
          className={`rounded-2xl border p-4 text-left transition-all ${
            variant === 'dark'
              ? 'border-amber-500/40 bg-amber-950/40 text-amber-100'
              : 'border-amber-300 bg-[#fffcf2] text-[#634812]'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <h4 className="font-bold text-sm">Add Domain to Firebase Console</h4>
            </div>
            <button
              type="button"
              onClick={() => setShowDomainGuide(false)}
              className="rounded-lg p-1 text-xs opacity-60 hover:opacity-100"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-2 text-xs leading-relaxed opacity-90">
            Firebase Google Sign-in requires this app domain to be authorized in your Firebase project.
          </p>

          <div className="mt-3 rounded-xl bg-black/10 p-2.5 dark:bg-black/40">
            <div className="text-[11px] font-semibold opacity-75">Your current app domain:</div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <code className="text-xs font-mono font-bold select-all break-all text-[#286b70] dark:text-amber-300">
                {currentDomain}
              </code>
              <button
                type="button"
                onClick={copyDomain}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#286b70] px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-[#1f565a] transition active:scale-95 shrink-0"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 text-xs">
            <div className="font-bold text-[11px] uppercase tracking-wider opacity-80">Quick 3-step fix:</div>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-[11.5px] leading-normal opacity-90">
              <li>Open Firebase Authentication Settings</li>
              <li>
                Scroll to <strong className="font-semibold">Authorized domains</strong> &gt; Click{' '}
                <strong className="font-semibold">Add domain</strong>
              </li>
              <li>Paste the copied domain and click <strong className="font-semibold">Save</strong></li>
            </ol>
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-1 border-t border-amber-500/20">
            <a
              href={firebaseConsoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600/90 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition shadow-xs"
            >
              <span>Open Firebase Settings</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={quickLoginLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-amber-600/50 px-3 py-1.5 text-xs font-bold hover:bg-amber-500/10 transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>
                {quickLoginLoading
                  ? 'Entering…'
                  : variant === 'dark'
                  ? 'Instant Admin Demo'
                  : 'Instant Demo Login'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AuthDivider({ text = 'Or continue with email' }: { text?: string }) {
  return (
    <div className="relative my-6 flex items-center justify-center">
      <div className="w-full border-t border-[#dfe7eb]" />
      <span className="absolute bg-[#f5f8fa] px-3 text-[11px] font-bold uppercase tracking-wider text-[#8296a2]">
        {text}
      </span>
    </div>
  );
}
