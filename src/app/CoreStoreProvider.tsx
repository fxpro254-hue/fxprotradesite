import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { getDecimalPlaces, toMoment } from '@/components/shared';
import { FORM_ERROR_MESSAGES } from '@/components/shared/constants/form-error-messages';
import { initFormErrorMessages } from '@/components/shared/utils/validation/declarative-validation-rules';
import { api_base } from '@/external/bot-skeleton';
import { CONNECTION_STATUS } from '@/external/bot-skeleton/services/api/observables/connection-status-stream';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import { TSocketResponseData } from '@/types/api-types';
import { useTranslations } from '@deriv-com/translations';

const CoreStoreProvider: React.FC<{ children: React.ReactNode }> = observer(({ children }) => {
    const { connectionStatus, authData } = useApiBase();
    const { client, common } = useStore();
    const { currentLang } = useTranslations();

    useEffect(() => {
        initFormErrorMessages(FORM_ERROR_MESSAGES());
    }, []);

    useEffect(() => {
        if (common && currentLang) common.setCurrentLanguage(currentLang);
    }, [currentLang, common]);

    useEffect(() => {
        client.setLoginId(authData?.loginid ?? '');
        client.setAccountList(authData?.account_list ?? []);
        client.setIsLoggedIn(Boolean(authData));
        if (!authData) {
            client.setBalance('0');
            client.setAllAccountsBalance(undefined);
            return;
        }
        client.setCurrency(authData.currency);
        client.setBalance(authData.balance.toFixed(getDecimalPlaces(authData.currency)));
        client.setAllAccountsBalance({
            loginid: authData.loginid, balance: authData.balance, currency: authData.currency,
            accounts: Object.fromEntries(authData.account_list.map(account => [account.loginid, {
                balance: account.balance ?? 0, currency: account.currency,
            }])),
        });
    }, [authData, client]);

    useEffect(() => {
        const api = api_base.api;
        if (!api || connectionStatus !== CONNECTION_STATUS.OPENED) return;
        const refreshTime = () => {
            api.time().then((res: TSocketResponseData<'time'>) => {
                common.setServerTime(toMoment(res.time), false);
            }).catch(() => common.setServerTime(toMoment(Date.now()), true));
        };
        refreshTime();
        const timer = setInterval(refreshTime, 10000);
        const subscription = api.onMessage().subscribe(({ data }: { data: TSocketResponseData<'balance'> }) => {
            const balance = data?.balance;
            if (data?.msg_type !== 'balance' || data.error || !balance || balance.loginid !== api_base.account_id) return;
            client.setBalance(balance.balance.toFixed(getDecimalPlaces(balance.currency)));
            client.setCurrency(balance.currency);
            client.setAllAccountsBalance({
                ...balance,
                accounts: {
                    ...client.all_accounts_balance?.accounts,
                    [balance.loginid]: { balance: balance.balance, currency: balance.currency },
                },
            });
        });
        return () => {
            clearInterval(timer);
            subscription.unsubscribe();
        };
    }, [connectionStatus, client, common]);

    return <>{children}</>;
});

export default CoreStoreProvider;
