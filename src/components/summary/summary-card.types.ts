import { ProposalOpenContract } from '@deriv/api-types';

type TDateType = string | number | undefined;

export type TContractInfo = Omit<
    ProposalOpenContract,
    'date_start' | 'entry_tick' | 'entry_tick_time' | 'exit_tick' | 'exit_tick_time'
> & {
    accountID?: number | string;
    is_completed?: boolean;
    is_manual_trade?: boolean;
    run_id?: string;
    date_start?: TDateType;
    entry_spot?: string | null;
    entry_spot_time?: number | null;
    exit_spot?: string | null;
    exit_spot_time?: number | null;
    entry_tick?: TDateType;
    entry_tick_time?: TDateType;
    exit_tick?: TDateType;
    exit_tick_time?: TDateType;
};

export interface TSummaryCardProps {
    contract_info?: ProposalOpenContract | null;
    is_contract_loading: boolean;
    is_bot_running?: boolean;
}
