const finiteAmount = value => {
    if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return undefined;
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : undefined;
};

export function settledAmounts(contract) {
    const stake = finiteAmount(contract.buy_price) ?? 0;
    const reportedProfit = finiteAmount(contract.profit);
    const payout = finiteAmount(contract.sell_price)
        ?? (reportedProfit !== undefined ? Math.max(0, stake + reportedProfit) : undefined)
        ?? (contract.status === 'won' ? finiteAmount(contract.payout) : undefined)
        ?? 0;
    return { stake, payout, profit: reportedProfit ?? payout - stake };
}
