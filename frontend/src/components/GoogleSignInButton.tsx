import React, { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

interface Props {
	onSuccess?: () => void;
	disabled?: boolean;
}

const GoogleSignInButton: React.FC<Props> = ({ onSuccess, disabled }) => {
	const buttonRef = useRef<HTMLDivElement | null>(null);
  const [showFallback, setShowFallback] = useState(true);
  const { refresh } = useAuth();

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				if (disabled) return;
				const resp = await apiFetch<{ clientId: string }>(`/api/auth/google-client-id`);
				const clientId = resp.data.clientId;
				if (!clientId) return;

				await new Promise<void>((resolve, reject) => {
					if (document.getElementById('google-identity')) return resolve();
					const script = document.createElement('script');
					script.src = 'https://accounts.google.com/gsi/client';
					script.async = true;
					script.defer = true;
					script.id = 'google-identity';
					script.onload = () => resolve();
					script.onerror = () => reject(new Error('Failed to load Google script'));
					document.head.appendChild(script);
				});

				if (cancelled) return;
				// @ts-expect-error google injected at runtime
				const google = window.google;
				if (!google?.accounts?.id) return;

				google.accounts.id.initialize({
					client_id: clientId,
					use_fedcm_for_prompt: true,
					callback: async (resp: any) => {
						try {
							if (resp?.credential) {
								const result = await apiFetch<{ token: string; user: any }>(`/api/auth/google`, { method: 'POST', body: { idToken: resp.credential } });
								localStorage.setItem('sads_token', result.data.token);
								localStorage.setItem('sads_user', JSON.stringify(result.data.user));
								refresh();
								onSuccess?.();
							}
						} catch {}
					}
				});

				if (buttonRef.current) {
					google.accounts.id.renderButton(buttonRef.current, {
						theme: 'outline',
						size: 'large',
						shape: 'rectangular',
						text: 'continue_with',
						logo_alignment: 'left',
					});
          setShowFallback(false);
				}
			} catch {
        // keep fallback visible
      }
		})();
		return () => { cancelled = true; };
	}, [disabled, onSuccess]);

	return (
    <div className="w-full flex justify-center">
      <div ref={buttonRef} />
      {showFallback && (
        <button
          type="button"
          disabled={true}
          className="ml-2 inline-flex items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 opacity-70 cursor-not-allowed"
          title="Google Sign-In unavailable. Check GOOGLE_CLIENT_ID and network."
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      )}
    </div>
  );
};

export default GoogleSignInButton;


