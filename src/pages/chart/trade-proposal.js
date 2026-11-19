export const tradeTypes = {
    riseFall: { CALL: 'Rise', PUT: 'Fall' },
    accumulators: { ACCU: 'Accumulator' },
    digits: {
        DIGITMATCH: 'Matches', DIGITDIFF: 'Differs', DIGITOVER: 'Over',
        DIGITUNDER: 'Under', DIGITEVEN: 'Even', DIGITODD: 'Odd',
    },
};

export const needsDigit = type => ['DIGITMATCH', 'DIGITDIFF', 'DIGITOVER', 'DIGITUNDER'].includes(type);

export const tickBounds = contract => {
    const min = /^(\d+)t$/.exec(contract?.min_contract_duration ?? '');
    const max = /^(\d+)t$/.exec(contract?.max_contract_duration ?? '');
    return min && max ? { min: Number(min[1]), max: Number(max[1]) } : null;
};

export function tradeProposal({ contract, symbol, currency, amount, duration, digit, growth }) {
    const type = contract?.contract_type;
    const stake = amount === '' ? NaN : Number(amount);
    if (!type || !symbol || !currency || !Number.isFinite(stake) || stake <= 0) return null;
    if (contract.min_stake != null && stake < Number(contract.min_stake)) return null;
    if (contract.max_stake != null && stake > Number(contract.max_stake)) return null;
    const base = { proposal: 1, subscribe: 1, underlying_symbol: symbol, currency, amount: stake, basis: 'stake', contract_type: type };
    if (type === 'ACCU') {
        return growth !== '' && contract.growth_rate_range?.includes(Number(growth))
            ? { ...base, growth_rate: Number(growth) } : null;
    }
    const bounds = tickBounds(contract);
    const ticks = Number(duration);
    if (!bounds || !Number.isInteger(ticks) || ticks < bounds.min || ticks > bounds.max) return null;
    const result = { ...base, duration: ticks, duration_unit: 't' };
    if (!needsDigit(type)) return result;
    return digit !== '' && contract.last_digit_range?.includes(Number(digit)) ? { ...result, barrier: String(digit) } : null;
}
