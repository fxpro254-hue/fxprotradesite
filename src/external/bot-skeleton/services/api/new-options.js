export const publicOptionsUrl = 'wss://api.derivws.com/trading/v1/options/ws/public';

const mainAccountOperations = ['balance', 'transaction', 'portfolio', 'profit_table', 'statement', 'proposal_open_contract'];
const uncertainAccounts = new Set();
const tradeChanges = ['buy', 'sell', 'contract_update', 'cancel'];
const proposalFields = [
    'amount', 'barrier', 'barrier2', 'basis', 'cancellation', 'contract_type', 'currency', 'date_expiry',
    'duration', 'duration_unit', 'growth_rate', 'limit_order', 'multiplier', 'payout_per_point', 'selected_tick',
    'underlying_symbol',
];

const failure = (code, message) => ({ error: { code, message } });

const proposalParameters = parameters => {
    const result = Object.fromEntries(proposalFields.filter(key => parameters[key] !== undefined)
        .map(key => [key, parameters[key]]));
    result.underlying_symbol ??= parameters.symbol;

    if (typeof result.amount === 'string' && result.amount.trim()) result.amount = Number(result.amount);
    if (typeof result.duration === 'string' && result.duration.trim()) result.duration = Number(result.duration);
    if (['DIGITDIFF', 'DIGITMATCH', 'DIGITOVER', 'DIGITUNDER', 'DIGITEVEN', 'DIGITODD'].includes(result.contract_type)) {
        delete result.selected_tick;
    }
    if (['DIGITEVEN', 'DIGITODD'].includes(result.contract_type)) delete result.barrier;
    if (result.barrier !== undefined) result.barrier = String(result.barrier);
    if (result.barrier2 !== undefined) result.barrier2 = String(result.barrier2);
    if (result.barrier && result.contract_type === 'CALL') result.contract_type = 'HIGHER';
    if (result.barrier && result.contract_type === 'PUT') result.contract_type = 'LOWER';
    if (['ACCU', 'MULTUP', 'MULTDOWN'].includes(result.contract_type)) {
        delete result.duration;
        delete result.duration_unit;
    }
    return result;
};

export const mapActiveSymbols = symbols => symbols.map(symbol => ({
    ...symbol,
    symbol: symbol.underlying_symbol,
    display_name: symbol.underlying_symbol_name,
    pip: symbol.pip_size,
    market_display_name: symbol.market.replaceAll('_', ' '),
    submarket_display_name: symbol.submarket.replaceAll('_', ' '),
}));

export const installOptionsRequests = (api, canTrade, accountId) => {
    const send = api.send.bind(api);
    let writeInProgress = false;
    const quoteIds = new Map();

    api.send = async request => {
        if (['authorize', 'buy_contract_for_multiple_accounts', 'get_settings', 'get_account_status',
            'get_self_exclusion', 'landing_company', 'landing_company_details', 'website_status']
            .some(operation => operation in request)) {
            throw failure('UnsupportedOperation', 'This operation requires a separate New API integration.');
        }
        const mutatesTrade = tradeChanges.some(operation => operation in request);
        if ((mutatesTrade || mainAccountOperations.some(operation => operation in request)) && !canTrade()) {
            throw failure('TradingConnectionUnavailable', 'The selected Deriv trading account is disconnected.');
        }

        const { loginid, ...payload } = request;
        if (payload.active_symbols) {
            for (const field of ['landing_company', 'landing_company_short', 'product_type', 'barrier_category']) {
                delete payload[field];
            }
        }
        if (payload.contracts_for) {
            for (const field of ['currency', 'landing_company', 'product_type']) delete payload[field];
        }
        if (payload.balance) delete payload.account;
        if (payload.portfolio) delete payload.subscribe;
        if (payload.ping === '1') payload.ping = 1;

        if (payload.proposal) {
            const response = await send({
                ...proposalParameters(payload), proposal: 1, subscribe: payload.subscribe,
                passthrough: payload.passthrough, req_id: payload.req_id,
            });
            if (payload.subscribe === 1 && canTrade() && response.proposal?.id) {
                const now = Date.now();
                for (const [id, expires] of quoteIds) if (expires <= now) quoteIds.delete(id);
                quoteIds.set(response.proposal.id, now + 30000);
            }
            return response;
        }

        if (!mutatesTrade) return send(payload);
        if (writeInProgress || uncertainAccounts.has(accountId)) {
            throw failure('TradeReconciliationRequired', 'Check your Deriv positions before sending another trade request.');
        }
        writeInProgress = true;
        let submitted = false;
        let quoteStream;
        try {
            if ('buy' in payload || 'sell' in payload) {
                if (typeof payload.price === 'string' && payload.price.trim()) payload.price = Number(payload.price);
                if (!Number.isFinite(payload.price) || payload.price < 0) {
                    throw failure('InvalidTradePrice', 'Enter a valid trade price.');
                }
            }
            if ('buy' in payload) {
                if (String(payload.buy) === '1' && payload.parameters) {
                    const proposal = await send({ ...proposalParameters(payload.parameters), proposal: 1, subscribe: 1 });
                    quoteStream = proposal.subscription?.id;
                    if (proposal.error) throw proposal;
                    const { id, ask_price } = proposal.proposal ?? {};
                    if (!id || !Number.isFinite(ask_price) || ask_price <= 0 || ask_price > payload.price) {
                        throw failure('InvalidTradeQuote', 'A Deriv quote within the requested price is unavailable.');
                    }
                    payload.buy = id;
                    payload.price = ask_price;
                    delete payload.parameters;
                } else if (!(quoteIds.get(payload.buy) > Date.now())) {
                    throw failure('StaleTradeQuote', 'Request a new price for this account before buying.');
                } else {
                    quoteIds.delete(payload.buy);
                }
            }
            if (!canTrade()) throw failure('TradingConnectionUnavailable', 'The Deriv account changed before submission.');
            submitted = true;
            const response = await send(payload);
            if (response.error) throw response;
            const operation = tradeChanges.find(key => key in payload);
            if (!response[operation]) throw failure('WrongResponse', 'Deriv did not confirm this trade request.');
            return response;
        } catch (error) {
            const code = error?.error?.code;
            if (submitted && (!code || ['CallError', 'DisconnectError', 'WrongResponse', 'Timeout', 'ConnectionError'].includes(code))) {
                uncertainAccounts.add(accountId);
                throw failure('TradeReconciliationRequired', 'The trade result is unknown. Check your Deriv positions before reconnecting.');
            }
            throw error;
        } finally {
            if (quoteStream && canTrade()) void send({ forget: quoteStream }).catch(() => {});
            writeInProgress = false;
        }
    };
};
