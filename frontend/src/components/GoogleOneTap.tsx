import React, { useEffect, useRef } from 'react';
import { apiFetch } from '../utils/api';
import { User } from '../contexts/AuthContext';

interface Props {
  onSuccess?: (user: User) => void;
  disabled?: boolean;
}

const SilentGoogleOneTap: React.FC<Props> = ({ onSuccess, disabled }) => {
  const initializedRef = useRef(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (disabled || initializedRef.current) return;
    cancelledRef.current = false;

    const loadScript = () =>
      new Promise<void>((resolve, reject) => {
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

    const initGoogleOneTap = async () => {
      try {
        const resp = await apiFetch<{ clientId: string }>('/api/auth/google-client-id');
        const clientId = resp?.data?.clientId;
        if (!clientId) return;

        await loadScript();
        if (cancelledRef.current) return;
        initializedRef.current = true;

        const googleAccounts = (window as any).google?.accounts?.id;
        if (!googleAccounts) return;

        googleAccounts.initialize({
          client_id: clientId,
          callback: async (credentialResponse: any) => {
            if (!credentialResponse?.credential) return;
            try {
              const result = await apiFetch<{ token: string; user: User }>('/api/auth/google', {
                method: 'POST',
                body: { idToken: credentialResponse.credential },
              });
              const { token, user } = result.data;
              if (!user) return;
              localStorage.setItem('sads_token', token);
              localStorage.setItem('sads_user', JSON.stringify(user));
              onSuccess?.(user);
            } catch (err) {
              console.warn('Failed to handle Google credential:', err);
            }
          },
          auto_select: true,
          cancel_on_tap_outside: true,
        });

        try {
          googleAccounts.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              console.info('Google One Tap not displayed/skipped');
            }
          });
        } catch (err: any) {
          if (err.name === 'AbortError') {
            console.info('Google One Tap prompt aborted (ignored)');
          } else {
            console.warn('Google One Tap prompt error (ignored):', err);
          }
        }
      } catch (err) {
        console.warn('Silent Google One Tap failed to initialize:', err);
      }
    };

    initGoogleOneTap();

    return () => {
      cancelledRef.current = true;
    };
  }, [disabled, onSuccess]);

  return null;
};

export default SilentGoogleOneTap;
