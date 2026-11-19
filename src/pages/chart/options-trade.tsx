import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { api_base } from '@/external/bot-skeleton';
import { redirectToLogin } from '@/components/shared/utils/login/login';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import { needsDigit, tickBounds, tradeProposal, tradeTypes } from './trade-proposal';
import './options-trade.scss';

type Family = keyof typeof tradeTypes;
type Market = { underlying_symbol: string; underlying_symbol_name: string; pip_size: number; exchange_is_open: number };
type Contract = { contract_type: string; growth_rate_range?: number[]; last_digit_range?: number[]; min_contract_duration?: string; max_contract_duration?: string };
type Quote = { id: string; price: number; payout: number; stream: string; key: string; api: typeof api_base.api };

const names = { riseFall: 'Rise/Fall', accumulators: 'Accumulators', digits: 'Digits' };
const errorMessage = (error: unknown) => (error as { error?: { message?: string } })?.error?.message ?? 'Deriv could not complete this request.';

const OptionsTrade = observer(({ family }: { family: Family }) => {
    const { activeLoginid, authData, isAuthorized, connectionStatus } = useApiBase();
    const { transactions } = useStore();
    const api = api_base.api;
    const currency = authData?.currency ?? '';
    const [markets, setMarkets] = useState<Market[]>([]);
    const [symbol, setSymbol] = useState('');
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [direction, setDirection] = useState('');
    const [amount, setAmount] = useState('1');
    const [duration, setDuration] = useState('');
    const [digit, setDigit] = useState('');
    const [growth, setGrowth] = useState('');
    const [prices, setPrices] = useState<number[]>([]);
    const [quote, setQuote] = useState<Quote | null>(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const positions = transactions.transactions.flatMap(({ data }) =>
        typeof data === 'object' && data.is_manual_trade && data.currency === currency &&
        Object.prototype.hasOwnProperty.call(tradeTypes[family], data.contract_type ?? '') ? [data] : []
    );
    const position = positions.find(data => !data.is_completed) ?? positions[0];
    const attempt = useRef(false);
    const contract = contracts.find(entry => entry.contract_type === direction);
    const bounds = tickBounds(contract);
    const proposal = tradeProposal({ contract, symbol, currency, amount, duration, digit, growth });
    const quoteKey = JSON.stringify([activeLoginid, proposal]);
    const latestQuoteKey = useRef(quoteKey);
    latestQuoteKey.current = quoteKey;
    useEffect(() => () => { latestQuoteKey.current = ''; }, []);
    const confirmedQuote = quote?.key === quoteKey && quote.api === api ? quote : null;

    useEffect(() => {
        if (!api || connectionStatus !== 'opened') return;
        let current = true;
        api.send({ active_symbols: 'brief' }).then(({ active_symbols }: { active_symbols: Market[] }) => {
            if (!current || !Array.isArray(active_symbols)) return;
            const open = active_symbols.filter(market => market.exchange_is_open);
            setMarkets(open);
            setSymbol(previous => open.some(market => market.underlying_symbol === previous) ? previous
                : (open.find(market => market.underlying_symbol === 'R_100') ?? open[0])?.underlying_symbol ?? '');
        }).catch(() => { if (current) setMessage('Market data is unavailable.'); });
        return () => { current = false; };
    }, [api, connectionStatus]);

    useEffect(() => {
        setContracts([]);
        if (!api || !symbol || connectionStatus !== 'opened') return;
        let current = true;
        api.send({ contracts_for: symbol }).then((response: { contracts_for?: { available: Contract[] } }) => {
            if (!current) return;
            const rows = (response.contracts_for?.available ?? []).filter(row =>
                Object.prototype.hasOwnProperty.call(tradeTypes[family], row.contract_type) &&
                (family === 'accumulators' ? !!row.growth_rate_range?.length : !!tickBounds(row)));
            setContracts(rows);
            setDirection(rows[0]?.contract_type ?? '');
        }).catch(() => { if (current) setMessage('Contract availability is unavailable.'); });
        return () => { current = false; };
    }, [api, symbol, family, connectionStatus]);

    useEffect(() => {
        setDuration(bounds ? String(bounds.min) : '');
        setDigit(contract?.last_digit_range?.[0]?.toString() ?? '');
        setGrowth(contract?.growth_rate_range?.[0]?.toString() ?? '');
    }, [contract]);

    useEffect(() => {
        setPrices([]);
        if (!api || !symbol || connectionStatus !== 'opened') return;
        let current = true;
        let stream = '';
        const listener = api.onMessage().subscribe(({ data }: { data: { tick?: { symbol: string; quote: number } } }) => {
            if (current && data?.tick?.symbol === symbol && Number.isFinite(data.tick.quote)) {
                setPrices(previous => [...previous.slice(-79), data.tick!.quote]);
            }
        });
        api.send({ ticks_history: symbol, style: 'ticks', count: 80, end: 'latest', subscribe: 1 }).then((response: {
            history?: { prices: Array<string | number> }; subscription?: { id: string };
        }) => {
            stream = response.subscription?.id ?? '';
            if (current) setPrices(response.history?.prices.map(Number).filter(Number.isFinite) ?? []);
            else if (stream && api_base.api === api) void api.send({ forget: stream }).catch(() => {});
        }).catch(() => {});
        return () => {
            current = false;
            listener.unsubscribe();
            if (stream && api_base.api === api) void api.send({ forget: stream }).catch(() => {});
        };
    }, [api, symbol, connectionStatus]);

    useEffect(() => {
        if (!quote) return;
        const timeout = setTimeout(() => setQuote(null), 25000);
        return () => {
            clearTimeout(timeout);
            if (quote.api && api_base.api === quote.api) void quote.api.send({ forget: quote.stream }).catch(() => {});
        };
    }, [quote]);

    useEffect(() => { setQuote(null); }, [quoteKey, api]);

    async function requestQuote() {
        if (attempt.current || !api || !proposal || !isAuthorized || api_base.account_id !== activeLoginid) return;
        attempt.current = true;
        setBusy(true);
        setQuote(null);
        setMessage('');
        try {
            const response = await api.send(proposal);
            if (response.error) throw response;
            const { id, ask_price, payout } = response.proposal ?? {};
            const stream = response.subscription?.id ?? id;
            if (api_base.api !== api) return;
            if (latestQuoteKey.current !== quoteKey) {
                if (stream) void api.send({ forget: stream }).catch(() => {});
                return;
            }
            if (!id || !Number.isFinite(Number(ask_price)) || Number(ask_price) <= 0 || payout == null || !Number.isFinite(Number(payout))) {
                if (stream) void api.send({ forget: stream }).catch(() => {});
                throw new Error('Invalid quote');
            }
            setQuote({ id, price: Number(ask_price), payout: Number(payout), stream, key: quoteKey, api });
        } catch (error) {
            setMessage(errorMessage(error));
        } finally {
            attempt.current = false;
            setBusy(false);
        }
    }

    async function purchase() {
        if (attempt.current || !api || !confirmedQuote || !isAuthorized || api_base.api !== api ||
            api_base.account_id !== activeLoginid) return;
        attempt.current = true;
        setBusy(true);
        setMessage('');
        try {
            const response = await api.send({ buy: confirmedQuote.id, price: confirmedQuote.price });
            if (response.error) throw response;
            const { contract_id, buy_price, start_time } = response.buy;
            transactions.recordManualTrade({
                contract_id, buy_price, date_start: start_time, contract_type: contract?.contract_type, currency,
            }, activeLoginid);
        } catch (error) {
            setMessage(errorMessage(error));
        } finally {
            setQuote(null);
            attempt.current = false;
            setBusy(false);
        }
    }

    async function sellPosition() {
        const id = position?.contract_id;
        if (attempt.current || !api || !id || !position?.is_valid_to_sell || position.is_completed ||
            !isAuthorized || api_base.api !== api || api_base.account_id !== activeLoginid ||
            !window.confirm('Sell this contract at market?')) return;

        attempt.current = true;
        setBusy(true);
        setMessage('');
        try {
            const response = await api.send({ sell: id, price: 0 });
            if (response.error) throw response;
            transactions.refreshContract(id, activeLoginid);
        } catch (error) {
            setMessage(errorMessage(error));
        } finally {
            attempt.current = false;
            setBusy(false);
        }
    }

    const precision = Math.min(12, Math.max(0, Math.round(-Math.log10(
        markets.find(market => market.underlying_symbol === symbol)?.pip_size || 1
    ))));
    const last = prices[prices.length - 1]?.toFixed(precision);
    const low = Math.min(...prices);
    const range = Math.max(...prices) - low;
    const points = prices.map((price, index) =>
        `${index * 640 / Math.max(1, prices.length - 1)},${range ? 150 - (price - low) * 130 / range : 80}`).join(' ');

    return (
        <section className='options-trade' aria-label={names[family]}>
            <div className='options-trade__chart'>
                <h2>{names[family]}</h2>
                <p>{last ?? 'Waiting for ticks'}{family === 'digits' && last ? ` · Last digit ${last.slice(-1)}` : ''}</p>
                <svg viewBox='0 0 640 160' role='img' aria-label='Recent market ticks' preserveAspectRatio='none'>
                    <polyline points={points} fill='none' stroke='currentColor' strokeWidth='2' vectorEffect='non-scaling-stroke' />
                </svg>
            </div>
            <div className='options-trade__controls'>
                <fieldset disabled={busy}>
                    <label>Market<select value={symbol} onChange={event => { setContracts([]); setSymbol(event.target.value); }}>
                        {markets.map(market => <option key={market.underlying_symbol} value={market.underlying_symbol}>{market.underlying_symbol_name}</option>)}
                    </select></label>
                    <label>Contract<select value={direction} onChange={event => setDirection(event.target.value)}>
                        {[...new Set(contracts.map(row => row.contract_type))].map(type =>
                            <option key={type} value={type}>{(tradeTypes[family] as Record<string, string>)[type]}</option>)}
                    </select></label>
                    {!contracts.length && <p>No supported contracts loaded for this market.</p>}
                    <label>Stake {currency}<input type='number' min='0' step='any' value={amount} onChange={event => setAmount(event.target.value)} /></label>
                    {bounds && <label>Duration (ticks)<input type='number' min={bounds.min} max={bounds.max} value={duration} onChange={event => setDuration(event.target.value)} /></label>}
                    {needsDigit(direction) && <label>Digit<select value={digit} onChange={event => setDigit(event.target.value)}>
                        {contract?.last_digit_range?.map(value => <option key={value}>{value}</option>)}
                    </select></label>}
                    {family === 'accumulators' && <label>Growth rate<select value={growth} onChange={event => setGrowth(event.target.value)}>
                        {contract?.growth_rate_range?.map(value => <option key={value} value={value}>{Math.round(value * 100)}%</option>)}
                    </select></label>}
                </fieldset>
                {!activeLoginid ? <button type='button' onClick={redirectToLogin}>Log in with Deriv</button>
                    : <button type='button' disabled={!proposal || !isAuthorized || busy} onClick={requestQuote}>Get quote</button>}
                {confirmedQuote && <div className='options-trade__quote'>
                    <p>Price {confirmedQuote.price} {currency} · Potential payout {confirmedQuote.payout} {currency}</p>
                    <button type='button' disabled={!isAuthorized || busy} onClick={purchase}>Confirm purchase</button>
                </div>}
                {position?.is_valid_to_sell && !position.is_completed ? (
                    <button type='button' disabled={!isAuthorized || busy} onClick={sellPosition}>Sell at market</button>
                ) : null}
                <p role='status'>{message || (position && `Contract ${position.contract_id} · ${position.status ?? 'Purchased'}${position.profit != null ? ` · P/L ${position.profit} ${currency}` : ''}`)}</p>
            </div>
        </section>
    );
});

export default OptionsTrade;
