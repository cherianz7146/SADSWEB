import React, { useEffect, useRef } from 'react';
import { apiFetch } from '../utils/api';
import { User } from '../contexts/AuthContext';

interface Props {
  onSuccess?: (user: User) => void;
  disabled?: boolean;
}

const GoogleSignInButton: React.FC<Props> = ({ onSuccess, disabled }) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (disabled || initializedRef.current) return;

    const initButton = async () => {
      try {
        const resp = await apiFetch<{ clientId: string }>('/api/auth/google-client-id');
        const clientId = resp?.data?.clientId;
        if (!clientId) {
          console.log('Google OAuth not configured, skipping button initialization');
          return;
        }

        const googleAccounts = (window as any).google?.accounts?.id;
        if (!googleAccounts || !buttonRef.current) return;

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
              console.warn('Google button login failed:', err);
            }
          },
        });

        googleAccounts.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
        });

        initializedRef.current = true;
      } catch (err) {
        console.log('Google OAuth not available:', err instanceof Error ? err.message : err);
        // Silently fail if Google OAuth is not configured
      }
    };

    initButton();
  }, [disabled, onSuccess]);

  return <div ref={buttonRef} />;
};

export default GoogleSignInButton;
