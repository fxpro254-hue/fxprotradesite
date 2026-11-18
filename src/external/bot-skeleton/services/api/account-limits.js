export default class AccountLimits {
    constructor(contractsFor) {
        this.contractsFor = contractsFor;
    }

    async getStakePayoutLimits(symbol, tradeType) {
        const contracts = await this.contractsFor.getContractsByTradeType(symbol, tradeType);
        const minStakes = contracts.map(contract => contract.min_stake).filter(Number.isFinite);
        const maxPayouts = contracts.map(contract => contract.payout_limit).filter(Number.isFinite);
        return {
            min_stake: minStakes.length ? Math.min(...minStakes) : undefined,
            max_payout: maxPayouts.length ? Math.max(...maxPayouts) : undefined,
        };
    }
}
