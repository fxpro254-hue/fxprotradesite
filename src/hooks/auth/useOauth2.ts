import { api_base } from '@/external/bot-skeleton';
import type RootStore from '@/stores/root-store';

export const useOauth2 = ({
    handleLogout,
    client,
}: {
    handleLogout?: () => Promise<void>;
    client?: RootStore['client'];
} = {}) => ({
    isOAuth2Enabled: true,
    oAuthLogout: async () => {
        client?.setIsLoggingOut(true);
        try {
            const response = await fetch('/api/deriv/logout', { method: 'POST' });
            if (!response.ok) throw new Error('Unable to sign out of Deriv. Please try again.');
            api_base.terminate();
            api_base.clearAccount();
            await handleLogout?.();
            window.location.replace('/');
        } finally {
            client?.setIsLoggingOut(false);
        }
    },
});
