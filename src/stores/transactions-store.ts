import { contractSpots } from '@/utils/contract-spots';
import { settledAmounts } from '@/utils/settled-amounts';
import { action, computed, makeObservable, observable, reaction } from 'mobx';
import { formatDate, isEnded } from '@/components/shared';
import { api_base, LogTypes } from '@/external/bot-skeleton';
import { ProposalOpenContract } from '@deriv/api-types';
import { TPortfolioPosition, TStores } from '@deriv/stores/types';
import { TContractInfo } from '../components/summary/summary-card.types';
import { transaction_elements } from '../constants/transactions';
import { getStoredItemsByKey, setStoredItemsByKey } from '../utils/session-storage';
import RootStore from './root-store';

const formatSpotTime = (value: number | string | null | undefined) =>
    typeof value === 'number' ? formatDate(value, 'YYYY-M-D HH:mm:ss [GMT]') : value ?? undefined;

const wasSettled = (data: TContractInfo) => Boolean(data.is_sold) || isEnded(data as ProposalOpenContract);

const withContractSpots = (data: TContractInfo): TContractInfo => {
    const spots = contractSpots(data);
    return {
        ...data,
        ...spots,
        entry_tick_time: formatSpotTime(spots.entry_tick_time),
        exit_tick_time: formatSpotTime(spots.exit_tick_time),
    };
};

type TTransaction = {
    type: string;
    data?: string | TContractInfo;
};

type TElement = {
    [key: string]: TTransaction[];
};

export default class TransactionsStore {
    root_store: RootStore;
    core: TStores;
    disposeReactionsFn: () => void;

    constructor(root_store: RootStore, core: TStores) {
        this.root_store = root_store;
        this.core = core;
        this.is_transaction_details_modal_open = false;
        this.disposeReactionsFn = this.registerReactions();

        makeObservable(this, {
            elements: observable,
            active_transaction_id: observable,
            recovered_completed_transactions: observable,
            recovered_transactions: observable,
            is_called_proposal_open_contract: observable,
            is_transaction_details_modal_open: observable,
            transactions: computed,
            onBotContractEvent: action.bound,
            pushTransaction: action.bound,
            clear: action.bound,
            registerReactions: action.bound,
            recoverPendingContracts: action.bound,
            updateResultsCompletedContract: action.bound,
            sortOutPositionsBeforeAction: action.bound,
            recoverPendingContractsById: action.bound,
        });
    }
    TRANSACTION_CACHE = 'transaction_cache';

    elements: TElement = getStoredItemsByKey(this.TRANSACTION_CACHE, {});
    active_transaction_id: null | number = null;
    recovered_completed_transactions: number[] = [];
    recovered_transactions: number[] = [];
    is_called_proposal_open_contract = false;
    is_transaction_details_modal_open = false;

    get transactions(): TTransaction[] {
        const rows = this.elements[this.core?.client?.loginid] ?? [];
        return rows.map(row => typeof row.data === 'object' && row.data
            ? { ...row, data: withContractSpots(row.data) } : row);
    }

    get statistics() {
        let total_runs = 0;
        // Filter out only contract transactions and remove dividers
        const trxs = this.transactions.filter(
            trx => trx.type === transaction_elements.CONTRACT && typeof trx.data === 'object'
        );
        const statistics = trxs.reduce(
            (stats, { data }) => {
                const contract = data as TContractInfo;
                if (contract.is_completed) {
                    const { profit, stake, payout } = settledAmounts(contract);
                    if (profit > 0) {
                        stats.won_contracts += 1;
                    } else {
                        stats.lost_contracts += 1;
                    }
                    stats.total_profit += profit;
                    stats.total_stake += stake;
                    stats.total_payout += payout;
                    total_runs += 1;
                }
                return stats;
            },
            {
                lost_contracts: 0,
                number_of_runs: 0,
                total_profit: 0,
                total_payout: 0,
                total_stake: 0,
                won_contracts: 0,
            }
        );
        statistics.number_of_runs = total_runs;
        return statistics;
    }

    toggleTransactionDetailsModal = (is_open: boolean) => {
        this.is_transaction_details_modal_open = is_open;
    };

    onBotContractEvent(data: TContractInfo) {
        this.pushTransaction(data);
    }

    recordManualTrade(data: TContractInfo, account: string) {
        this.pushTransaction({ ...data, is_manual_trade: true }, account);
        this.refreshContract(data.contract_id, account);
    }

    watchContracts(account: string) {
        const api = api_base.api;
        if (!api || !account || api_base.account_id !== account) return;
        const listener = api.onMessage().subscribe(({ data }: { data: { proposal_open_contract?: TContractInfo } }) => {
            if (api_base.api === api) this.updateTrackedContract(data?.proposal_open_contract, account);
        });
        // Recover recent rows whose settlement or spots arrived while disconnected.
        const recent = (this.elements[account] ?? [])
            .map(row => row.data)
            .filter((data): data is TContractInfo => typeof data === 'object' && !!data.contract_id &&
                (!data.is_completed || (withContractSpots(data).entry_tick == null || withContractSpots(data).exit_tick == null)))
            .slice(0, 20);
        let current = true;
        void (async () => {
            for (const contract of recent) {
                if (!current || api_base.api !== api) break;
                await this.refreshContract(contract.contract_id, account);
            }
        })();
        return () => {
            current = false;
            listener.unsubscribe();
        };
    }

    refreshContract(contractId: number | undefined, account: string) {
        const api = api_base.api;
        if (!contractId || !api || api_base.account_id !== account) return;
        return api.send({ proposal_open_contract: 1, contract_id: Number(contractId) })
            .then(({ proposal_open_contract }: { proposal_open_contract?: TContractInfo }) => {
                if (api_base.api === api) this.updateTrackedContract(proposal_open_contract, account);
            })
            .catch(() => {});
    }

    private updateTrackedContract(contract: TContractInfo | undefined, account: string) {
        if (!contract?.contract_id || api_base.account_id !== account) return;
        const existing = this.elements[account]?.find(row =>
            typeof row.data === 'object' && Number(row.data.contract_id) === contract.contract_id
        )?.data as TContractInfo | undefined;
        if (existing && (!existing.is_completed || wasSettled(contract))) {
            this.pushTransaction(contract, account);
        }
    }

    pushTransaction(data: TContractInfo, current_account = this.core?.client?.loginid as string) {
        const rows = this.elements[current_account] ?? [];
        const same_contract_index = rows.findIndex(row => {
            if (row.type !== transaction_elements.CONTRACT || typeof row.data !== 'object') return false;
            return (
                (data.contract_id != null && Number(row.data.contract_id) === Number(data.contract_id)) ||
                (data.transaction_ids?.buy != null && row.data.transaction_ids?.buy === data.transaction_ids.buy)
            );
        });
        const previous = rows[same_contract_index]?.data as TContractInfo | undefined;
        const normalized = withContractSpots({ ...previous, ...data });
        const is_completed = wasSettled(normalized);
        if (previous?.is_completed && !is_completed) return;
        const contract: TContractInfo = {
            ...normalized,
            is_completed,
            run_id: previous?.run_id ?? this.root_store.run_panel.run_id,
            date_start: formatSpotTime(normalized.date_start),
            profit: is_completed ? normalized.profit : 0,
            display_name: normalized.display_name || this.getContractTypeName(normalized.contract_type),
        };

        if (!this.elements[current_account]) {
            this.elements = { ...this.elements, [current_account]: [] };
        }

        if (same_contract_index === -1) {
            // Render a divider if the "run_id" for this contract is different.
            if (this.elements[current_account]?.length > 0) {
                const temp_contract = this.elements[current_account]?.[0];
                const is_contract = temp_contract.type === transaction_elements.CONTRACT;
                const is_new_run =
                    is_contract &&
                    typeof temp_contract.data === 'object' &&
                    contract.run_id !== temp_contract?.data?.run_id;

                if (is_new_run) {
                    this.elements[current_account]?.unshift({
                        type: transaction_elements.DIVIDER,
                        data: contract.run_id,
                    });
                }
            }

            this.elements[current_account]?.unshift({
                type: transaction_elements.CONTRACT,
                data: contract,
            });
        } else {
            // If data belongs to existing contract in memory, update it.
            this.elements[current_account]?.splice(same_contract_index, 1, {
                type: transaction_elements.CONTRACT,
                data: contract,
            });
        }

        this.elements = { ...this.elements }; // force update
    }

    // Helper to get readable contract type names
    getContractTypeName(contract_type: string | undefined): string {
        if (!contract_type) return 'Unknown';

        const contract_types: Record<string, string> = {
            DIGITDIFF: 'Digit Differs',
            DIGITOVER: 'Digit Over',
            DIGITUNDER: 'Digit Under',
            DIGITEVEN: 'Digit Even',
            DIGITODD: 'Digit Odd',
            DIGITMATCH: 'Digit Matches',
            DIGITMAT: 'Digit Matches',
            ACCU: 'Accumulator',
        };

        return contract_types[contract_type] || contract_type;
    }

    clear() {
        if (this.elements && this.elements[this.core?.client?.loginid as string]?.length > 0) {
            this.elements[this.core?.client?.loginid as string] = [];
        }
        this.recovered_completed_transactions = this.recovered_completed_transactions?.slice(0, 0);
        this.recovered_transactions = this.recovered_transactions?.slice(0, 0);
        this.is_transaction_details_modal_open = false;
    }

    registerReactions() {
        const { client } = this.core;

        // Write transactions to session storage on each change in transaction elements.
        const disposeTransactionElementsListener = reaction(
            () => this.elements[client?.loginid as string],
            elements => {
                const stored_transactions = getStoredItemsByKey(this.TRANSACTION_CACHE, {});
                stored_transactions[client.loginid as string] = elements?.slice(0, 5000) ?? [];
                setStoredItemsByKey(this.TRANSACTION_CACHE, stored_transactions);
            }
        );

        // User could've left the page mid-contract. On initial load, try
        // to recover any pending contracts so we can reflect accurate stats
        // and transactions.
        const disposeRecoverContracts = reaction(
            () => this.transactions.length,
            () => this.recoverPendingContracts()
        );

        return () => {
            disposeTransactionElementsListener();
            disposeRecoverContracts();
        };
    }

    recoverPendingContracts(contract = null) {
        this.transactions.forEach(({ data: trx }) => {
            if (
                typeof trx === 'string' ||
                trx?.is_completed ||
                !trx?.contract_id ||
                this.recovered_transactions.includes(trx?.contract_id)
            )
                return;
            this.recoverPendingContractsById(trx.contract_id, contract);
        });
    }

    updateResultsCompletedContract(contract: ProposalOpenContract) {
        const { journal, summary_card } = this.root_store;
        const { contract_info } = summary_card;
        const { currency, profit } = contract;

        if (contract.contract_id !== contract_info?.contract_id) {
            this.onBotContractEvent(contract);

            if (contract.contract_id && !this.recovered_transactions.includes(contract.contract_id)) {
                this.recovered_transactions.push(contract.contract_id);
            }
            if (
                contract.contract_id &&
                !this.recovered_completed_transactions.includes(contract.contract_id) &&
                isEnded(contract)
            ) {
                this.recovered_completed_transactions.push(contract.contract_id);

                journal.onLogSuccess({
                    log_type: profit && profit > 0 ? LogTypes.PROFIT : LogTypes.LOST,
                    extra: { currency, profit },
                });
            }
        }
    }

    sortOutPositionsBeforeAction(positions: TPortfolioPosition[], element_id?: number) {
        positions?.forEach(position => {
            if (!element_id || (element_id && position.id === element_id)) {
                const contract_details = position.contract_info;
                this.updateResultsCompletedContract(contract_details);
            }
        });
    }

    async recoverPendingContractsById(contract_id: number, contract: ProposalOpenContract | null = null) {
        // TODO: need to fix as the portfolio is not available now
        // const positions = this.core.portfolio.positions;
        const positions: unknown[] = [];

        if (contract) {
            this.is_called_proposal_open_contract = true;
            if (contract.contract_id === contract_id) {
                this.updateResultsCompletedContract(contract);
            }
        }

        if (!this.is_called_proposal_open_contract) {
            if (this.core?.client?.loginid) {
                const current_account = this.core?.client?.loginid;
                if (!this.elements[current_account]?.length) {
                    this.sortOutPositionsBeforeAction(positions);
                }

                const elements = this.elements[current_account];
                const [element = null] = elements;
                if (typeof element?.data === 'object' && !element?.data?.profit) {
                    const element_id = element.data.contract_id;
                    this.sortOutPositionsBeforeAction(positions, element_id);
                }
            }
        }
    }
}
