import React, { useEffect, useRef } from 'react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

interface Props {
	// Called after a successful sign-in
	onSuccess?: () => void;
	// Disable One Tap when true
	disabled?: boolean;
}

const GoogleOneTap: React.FC<Props> = ({ onSuccess, disabled }) => {
	const initializedRef = useRef(false);
  const { refresh } = useAuth();

	useEffect(() => {
		if (disabled) return;
		let cancelled = false;
		(async () => {
			try {
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

				if (cancelled || initializedRef.current) return;
				initializedRef.current = true;

				// @ts-expect-error google available at runtime
				const client = window.google?.accounts?.id;
				if (!client) return;

				client.initialize({
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
						} catch (e) {
							// swallow; user can still use button flow
						}
					},
					auto_select: true,
					cancel_on_tap_outside: true,
				});

				client.prompt();
			} catch {}
		})();
		return () => {
			cancelled = true;
		};
	}, [disabled, onSuccess]);

	return null;
};

export default GoogleOneTap;








