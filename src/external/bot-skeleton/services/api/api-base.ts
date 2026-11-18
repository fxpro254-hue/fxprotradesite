import CommonStore from '@/stores/common-store';
import { TAuthData } from '@/types/api-types';
import { observer as globalObserver } from '../../utils/observer';
import { socket_state } from '../tradeEngine/utils/helpers';
import {
    CONNECTION_STATUS,
    setAccountList,
    setAuthData,
    setConnectionStatus,
    setIsAuthorized,
    setIsAuthorizing,
} from './observables/connection-status-stream';
import { generateDerivApiInstance, getLoginId } from './appId';
import { mapActiveSymbols } from './new-options';
import chart_api from './chart-api';

type CurrentSubscription = {
    id: string;
    unsubscribe: () => void;
};

type OptionsAccount = {
    account_id: string;
    account_type: 'demo' | 'real';
    balance: number;
    currency: string;
    status: 'active' | 'inactive';
};

type Api = ReturnType<typeof generateDerivApiInstance>;

class APIBase {
    api: Api | null = null;
    token = '';
    account_id = '';
    account_info: Partial<TAuthData> = {};
    pip_sizes: Record<string, number> = {};
    is_running = false;
    subscriptions: CurrentSubscription[] = [];
    time_interval: ReturnType<typeof setInterval> | null = null;
    has_active_symbols = false;
    is_stopping = false;
    active_symbols: Array<{ symbol: string; pip: number }> = [];
    is_authorized = false;
    active_symbols_promise: Promise<void> | null = null;
    common_store: CommonStore | undefined;
    landing_company: string | null = null;
    private initializing: Promise<void> | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private reconnectAttempts = 0;
    private generation = 0;

    init(force = false, accountId = getLoginId()) {
        if (this.initializing) return this.initializing;
        if (!force && this.api && this.api.connection.readyState < WebSocket.CLOSING) return Promise.resolve();
        const generation = ++this.generation;
        this.initializing = this.connect(generation, accountId).finally(() => {
            this.initializing = null;
        });
        return this.initializing;
    }

    private async connect(generation: number, accountId: string | null) {
        this.closeSocket();
        this.toggleRunButton(true);
        setIsAuthorizing(true);
        let socketUrl: string | undefined;
        let account: OptionsAccount | undefined;
        try {
            const response = await fetch('/api/deriv/accounts', { signal: AbortSignal.timeout(12000) });
            if (response.ok) {
                const { accounts }: { accounts: OptionsAccount[] } = await response.json();
                const active = accounts.filter(item => item.status === 'active');
                account = active.find(item => item.account_id === accountId) ??
                    active.find(item => item.account_type === 'demo') ?? active[0];
                if (account) {
                    const { account_id, balance, currency, account_type } = account;
                    this.account_id = account_id;
                    this.token = account_id;
                    const account_list = active.map(item => ({
                        loginid: item.account_id, currency: item.currency, account_type: item.account_type, balance: item.balance,
                        is_virtual: Number(item.account_type === 'demo'), is_disabled: 0,
                    })) as TAuthData['account_list'];
                    this.account_info = {
                        loginid: account_id, balance, currency, account_list, is_virtual: Number(account_type === 'demo'),
                    };
                    setAccountList(account_list);
                    setAuthData(this.account_info as TAuthData);
                    const otp = await fetch('/api/deriv/socket', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ accountId: account_id }),
                        signal: AbortSignal.timeout(12000),
                    });
                    if (!otp.ok) throw new Error('The Deriv trading connection is unavailable.');
                    const body = await otp.json();
                    if (typeof body.url !== 'string') throw new Error('Deriv returned an invalid connection.');
                    socketUrl = body.url;
                } else {
                    this.clearAccount();
                }
            } else if (response.status === 401) {
                this.clearAccount();
            } else {
                throw new Error('The website could not load your Deriv session.');
            }
        } catch {
            globalObserver.emit('Error', {
                error: { code: 'TradingConnectionUnavailable', message: 'The Deriv trading connection is unavailable.' },
            });
        } finally {
            if (generation === this.generation) setIsAuthorizing(false);
        }

        if (generation !== this.generation) return;
        chart_api.init();

        const api = generateDerivApiInstance(socketUrl, () =>
            this.api === api && this.is_authorized && api.connection.readyState === WebSocket.OPEN, account?.account_id);
        this.api = api;
        this.active_symbols_promise = this.getActiveSymbols();
        void this.active_symbols_promise.catch(() => {});
        api.connection.addEventListener('open', () => {
            if (this.api !== api) return;
            if (socketUrl || !account) this.reconnectAttempts = 0;
            this.is_authorized = Boolean(socketUrl && account);
            setIsAuthorized(this.is_authorized);
            setConnectionStatus(CONNECTION_STATUS.OPENED);
            if (this.is_authorized) {
                this.toggleRunButton(!this.has_active_symbols);
                for (const stream of ['balance', 'transaction', 'proposal_open_contract']) {
                    void api.send({ [stream]: 1, subscribe: 1 }).catch(() => {});
                }
            }
            this.time_interval = setInterval(() => void api.send({ ping: 1 }).catch(() => {}), 30000);
        }, { once: true });
        api.connection.addEventListener('close', () => {
            if (this.api !== api) return;
            this.closeSocket();
            this.reconnectIfNotConnected();
        }, { once: true });
        if (!socketUrl && account) this.reconnectIfNotConnected();
    }

    clearAccount() {
        this.account_id = '';
        this.token = '';
        this.account_info = {};
        localStorage.removeItem('active_loginid');
        setAccountList([]);
        setAuthData(null);
    }

    private closeSocket() {
        const previous = this.api;
        this.api = null;
        this.is_authorized = false;
        this.toggleRunButton(true);
        setIsAuthorized(false);
        setConnectionStatus(CONNECTION_STATUS.CLOSED);
        if (this.time_interval) clearInterval(this.time_interval);
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.time_interval = null;
        this.reconnectTimer = null;
        previous?.disconnect();
    }

    getConnectionStatus() {
        return this.api ? socket_state[this.api.connection.readyState as keyof typeof socket_state] : 'Socket not initialized';
    }

    terminate() {
        this.generation++;
        this.closeSocket();
    }

    async createNewInstance(accountId: string) {
        if (accountId && this.account_id !== accountId && !this.is_running) await this.init(true, accountId);
    }

    reconnectIfNotConnected = () => {
        if (this.reconnectTimer || this.reconnectAttempts >= 5) return;
        const delay = 1000 * 2 ** this.reconnectAttempts++;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            void this.init(true);
        }, delay);
    };

    getActiveSymbols = async () => {
        const api = this.api;
        if (!api) return;
        const response = await api.send({ active_symbols: 'brief' });
        if (this.api !== api || !Array.isArray(response.active_symbols)) return;
        this.active_symbols = mapActiveSymbols(response.active_symbols);
        this.has_active_symbols = this.active_symbols.length > 0;
        this.pip_sizes = Object.fromEntries(this.active_symbols.map(({ symbol, pip }) =>
            [symbol, Math.max(0, Math.round(-Math.log10(pip)))]));
        this.toggleRunButton(!this.is_authorized || !this.has_active_symbols);
    };

    toggleRunButton = (toggle: boolean) => {
        const run_button = document.querySelector('#db-animation__run-button');
        if (!run_button) return;
        (run_button as HTMLButtonElement).disabled = toggle;
    };

    setIsRunning(toggle = false) {
        this.is_running = toggle;
    }

    pushSubscription(subscription: CurrentSubscription) {
        this.subscriptions.push(subscription);
    }

    clearSubscriptions() {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];

        // Resetting timeout resolvers
        const global_timeouts = globalObserver.getState('global_timeouts') ?? [];

        global_timeouts.forEach((_: unknown, i: number) => {
            clearTimeout(i);
        });
    }
}

export const api_base = new APIBase();
