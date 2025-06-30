import React, { useState, useRef, useEffect } from 'react';
import './trading-hub-display.scss';
import { api_base } from '../../external/bot-skeleton/services/api/api-base';
import { doUntilDone } from '../../external/bot-skeleton/services/tradeEngine/utils/helpers';
import { observer as globalObserver } from '../../external/bot-skeleton/utils/observer';
import { useStore } from '@/hooks/useStore';
import useThemeSwitcher from '@/hooks/useThemeSwitcher';
import marketAnalyzer, { TradeRecommendation } from '../../services/market-analyzer';

const TradingHubDisplay: React.FC = () => {
    const MINIMUM_STAKE = '0.35';
    const { is_dark_mode_on } = useThemeSwitcher();

    const [isAutoDifferActive, setIsAutoDifferActive] = useState(false);
    const [isAutoOverUnderActive, setIsAutoOverUnderActive] = useState(false);
    const [recommendation, setRecommendation] = useState<TradeRecommendation | null>(null);
    const [marketStats, setMarketStats] = useState<Record<string, any>>({});
    const [stake, setStake] = useState(MINIMUM_STAKE);
    const [martingale, setMartingale] = useState('2');
    const [isTrading, setIsTrading] = useState(false);
    const [isContinuousTrading, setIsContinuousTrading] = useState(false);
    const [currentBarrier, setCurrentBarrier] = useState<number | null>(null);
    const [currentSymbol, setCurrentSymbol] = useState<string>('R_100');
    const [currentStrategy, setCurrentStrategy] = useState<string>('over');
    const tradingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [sessionRunId, setSessionRunId] = useState<string>(`tradingHub_${Date.now()}`);
    const [isAnalysisReady, setIsAnalysisReady] = useState(false);
    const analysisReadinessInterval = useRef<NodeJS.Timeout | null>(null);
    const [analysisCount, setAnalysisCount] = useState(0);
    const [lastAnalysisTime, setLastAnalysisTime] = useState<string>('');
    const analysisInfoInterval = useRef<NodeJS.Timeout | null>(null);
    const [isTradeInProgress, setIsTradeInProgress] = useState(false);
    const [lastTradeId, setLastTradeId] = useState<string>('');
    const [tradeCount, setTradeCount] = useState(0);
    const lastTradeTime = useRef<number>(0);
    const minimumTradeCooldown = 3000; // 3 seconds minimum between trades

    const [initialStake, setInitialStake] = useState(MINIMUM_STAKE);
    const [appliedStake, setAppliedStake] = useState(MINIMUM_STAKE);
    const [lastTradeWin, setLastTradeWin] = useState<boolean | null>(null);
    const [activeContractId, setActiveContractId] = useState<string | null>(null);
    const [consecutiveLosses, setConsecutiveLosses] = useState(0);

    const activeContractRef = useRef<string | null>(null);
    const [lastTradeResult, setLastTradeResult] = useState<string>('');

    const availableSymbols = ['R_10', 'R_25', 'R_50', 'R_75', 'R_100'];

    const lastMartingaleActionRef = useRef<string>('initial');
    const lastWinTimeRef = useRef<number>(0);

    const { run_panel, transactions, client } = useStore();

    const [activeContracts, setActiveContracts] = useState<Record<string, any>>({});
    const contractUpdateInterval = useRef<NodeJS.Timeout | null>(null);
    const lastTradeRef = useRef<{ id: string | null, profit: number | null }>({ id: null, profit: null });
    const [winCount, setWinCount] = useState(0);
    const [lossCount, setLossCount] = useState(0);

    const currentStakeRef = useRef(MINIMUM_STAKE);
    const currentConsecutiveLossesRef = useRef(0);
    const contractSettledTimeRef = useRef(0);
    const waitingForSettlementRef = useRef(false);

    const manageMartingale = (action: 'init' | 'update' | 'get', params?: { 
        newValue?: string 
    }): string => {
        switch (action) {
            case 'init':
                if (params?.newValue) {
                    const validValue = Math.max(parseFloat(params.newValue), 1).toFixed(1);
                    console.log(`Martingale initialization from ${martingale} to ${validValue}`);
                    setMartingale(validValue);
                    
                    try {
                        localStorage.setItem('tradingHub_martingale', validValue);
                    } catch (e) {
                        console.warn('Could not save martingale to localStorage', e);
                    }
                }
                break;
                
            case 'update':
                if (params?.newValue !== undefined) {
                    setMartingale(params.newValue);
                }
                break;
                
            case 'get':
                const storedValue = localStorage.getItem('tradingHub_martingale');
                if (storedValue) {
                    const parsedValue = parseFloat(storedValue);
                    if (!isNaN(parsedValue) && parsedValue >= 1) {
                        return storedValue;
                    }
                }
                return martingale;
                
            default:
                console.error('Unknown martingale management action:', action);
        }
        
        return martingale;
    };

    const manageStake = (action: 'init' | 'reset' | 'martingale' | 'update' | 'get', params?: { 
        newValue?: string,
        lossCount?: number  
    }): string => {
        switch (action) {
            case 'init':
                if (params?.newValue) {
                    const validValue = Math.max(parseFloat(params.newValue), parseFloat(MINIMUM_STAKE)).toFixed(2);
                    console.log(`Stake initialization from ${initialStake} to ${validValue}`);
                    setInitialStake(validValue);
                    setAppliedStake(validValue);
                    currentStakeRef.current = validValue;
                    
                    try {
                        localStorage.setItem('tradingHub_initialStake', validValue);
                    } catch (e) {
                        console.warn('Could not save stake to localStorage', e);
                    }
                }
                break;
                
            case 'update':
                if (params?.newValue !== undefined) {
                    const inputValue = params.newValue;
                    setStake(inputValue);
                }
                break;
                
            case 'reset':
                const storedInitialStake = localStorage.getItem('tradingHub_initialStake') || initialStake;
                lastMartingaleActionRef.current = 'reset';
                lastWinTimeRef.current = Date.now();
                
                console.log(`Resetting stake from ${currentStakeRef.current} to stored initial: ${storedInitialStake} (state value: ${initialStake})`);
                console.log(`Consecutive losses counter reset from ${currentConsecutiveLossesRef.current} to 0`);
                
                setAppliedStake(storedInitialStake);
                currentStakeRef.current = storedInitialStake;
                setConsecutiveLosses(0);
                currentConsecutiveLossesRef.current = 0;
                break;
                
            case 'martingale':
                if (lastMartingaleActionRef.current === 'martingale' && 
                    Date.now() - lastWinTimeRef.current < 2000) {
                    console.warn('Prevented duplicate martingale application - too soon after last martingale');
                    return currentStakeRef.current;
                }
                
                const prevLossCount = currentConsecutiveLossesRef.current;
                const newLossCount = params?.lossCount !== undefined ? 
                    params.lossCount : prevLossCount + 1;
                       
                const maxLossCount = 10;
                const safeLossCount = Math.min(newLossCount, maxLossCount);
                
                currentConsecutiveLossesRef.current = safeLossCount;
                
                const baseStake = localStorage.getItem('tradingHub_initialStake') || initialStake;
                
                const currentMartingale = manageMartingale('get');
                const multiplier = parseFloat(currentMartingale);
                const validMultiplier = !isNaN(multiplier) && multiplier >= 1 ? multiplier : 1;
                
                const newStake = (parseFloat(baseStake) * Math.pow(validMultiplier, safeLossCount)).toFixed(2);
                
                console.log(`Martingale calculation details:`);
                console.log(`- Base stake: ${baseStake}`);
                console.log(`- Multiplier: ${validMultiplier}`);
                console.log(`- Previous loss count: ${prevLossCount}`);
                console.log(`- New loss count: ${safeLossCount}`);
                console.log(`- Formula: ${baseStake} × ${validMultiplier}^${safeLossCount} = ${newStake}`);
                
                lastMartingaleActionRef.current = 'martingale';
                currentStakeRef.current = newStake;
                setAppliedStake(newStake);
                setConsecutiveLosses(safeLossCount);
                break;
                
            case 'get':
                return currentStakeRef.current || initialStake;
                
            default:
                console.error('Unknown stake management action:', action);
        }
        
        return currentStakeRef.current;
    };

    useEffect(() => {
        try {
            const savedStake = localStorage.getItem('tradingHub_initialStake');
            if (savedStake) {
                console.log(`Loaded saved stake from storage: ${savedStake}`);
                setInitialStake(savedStake);
                setStake(savedStake);
                currentStakeRef.current = savedStake;
            }
            
            const savedMartingale = localStorage.getItem('tradingHub_martingale');
            if (savedMartingale) {
                console.log(`Loaded saved martingale from storage: ${savedMartingale}`);
                setMartingale(savedMartingale);
            }
        } catch (e) {
            console.warn('Could not load settings from localStorage', e);
        }
    }, [client?.loginid]);

    useEffect(() => {
        const session_id = `tradingHub_${Date.now()}`;
        setSessionRunId(session_id);
        globalObserver.emit('bot.started', session_id);

        marketAnalyzer.start();

        analysisReadinessInterval.current = setInterval(() => {
            if (marketAnalyzer.isReadyForTrading()) {
                setIsAnalysisReady(true);
                if (analysisReadinessInterval.current) {
                    clearInterval(analysisReadinessInterval.current);
                }
            }
        }, 500);

        analysisInfoInterval.current = setInterval(() => {
            const info = marketAnalyzer.getAnalyticsInfo();
            setAnalysisCount(info.analysisCount);
            setLastAnalysisTime(info.lastAnalysisTime ? 
                new Date(info.lastAnalysisTime).toLocaleTimeString() : '');
        }, 1000);

        const unsubscribe = marketAnalyzer.onAnalysis((newRecommendation, allStats) => {
            setRecommendation(newRecommendation);
            setMarketStats(allStats);

            if (isContinuousTrading && isAutoOverUnderActive && newRecommendation) {
                setCurrentStrategy(newRecommendation.strategy);
                setCurrentSymbol(newRecommendation.symbol);
            }
        });

        const contractSettlementHandler = (response) => {
            if (response?.id === 'contract.settled' && response?.data && 
                lastTradeRef.current?.id !== response.data.contract_id) {
                const contract_info = response.data;

                if (contract_info.contract_id === activeContractRef.current) {
                    const isWin = contract_info.profit >= 0;
                    setLastTradeWin(isWin);
                    setLastTradeResult(isWin ? 'WIN' : 'LOSS');

                    console.log(`Contract ${contract_info.contract_id} settled with ${isWin ? 'WIN' : 'LOSS'}.`);
                    console.log(`Current stake: ${currentStakeRef.current}, Initial: ${initialStake}, Consecutive losses: ${currentConsecutiveLossesRef.current}`);

                    lastTradeRef.current = { 
                        id: contract_info.contract_id, 
                        profit: contract_info.profit 
                    };

                    if (isWin) {
                        manageStake('reset');
                    } else {
                        manageStake('martingale');
                    }

                    activeContractRef.current = null;
                }
            }
        };

        globalObserver.register('contract.status', (response) => {   
            if (response?.data?.is_sold) {     
                contractSettlementHandler({
                    id: 'contract.settled',
                    data: response.data
                });
            }
        });

        globalObserver.register('contract.settled', contractSettlementHandler);

        contractUpdateInterval.current = setInterval(async () => {
            if (!activeContractRef.current) return;
            try {
                const response = await api_base.api.send({
                    proposal_open_contract: 1,    
                    contract_id: activeContractRef.current
                });
                if (response?.proposal_open_contract) {
                    const contract = response.proposal_open_contract;

                    setActiveContracts(prev => ({
                        ...prev,
                        [contract.contract_id]: contract
                    }));

                    if (contract.is_sold === 1) {    
                        const contractId = contract.contract_id;
                                                
                        if (lastTradeRef.current?.id === contractId) {
                            console.log(`Contract ${contractId} already processed, skipping duplicate settlement`);
                            return;
                        }
                                                
                        const isWin = contract.profit >= 0;
                        const profit = contract.profit;

                        lastTradeRef.current = { id: contractId, profit };
                        contractSettledTimeRef.current = Date.now();

                        console.log(`Contract ${contractId} sold. Result: ${isWin ? 'WIN' : 'LOSS'}, Profit: ${profit}`);
                        console.log(`Current stake before update: ${currentStakeRef.current}, Consecutive losses: ${currentConsecutiveLossesRef.current}`);

                        if (isWin) {
                            setWinCount(prev => prev + 1);
                            manageStake('reset');
                            setLastTradeResult('WIN');
                        } else {
                            setLossCount(prev => prev + 1);
                            manageStake('martingale');
                            setLastTradeResult('LOSS');
                        }

                        setActiveContracts(prev => {
                            const newContracts = { ...prev };
                            delete newContracts[contractId];
                            return newContracts;
                        });
                        activeContractRef.current = null;
                    }
                }
            } catch (error) {
                console.error('Error tracking contract:', error);
            }
        }, 1000);

        return () => {
            if (tradingIntervalRef.current) {
                clearInterval(tradingIntervalRef.current);
            }
            if (analysisReadinessInterval.current) {
                clearInterval(analysisReadinessInterval.current);
            }
            if (analysisInfoInterval.current) {
                clearInterval(analysisInfoInterval.current);
            }
            if (contractUpdateInterval.current) {
                clearInterval(contractUpdateInterval.current);
            }
            globalObserver.emit('bot.stopped');
            marketAnalyzer.stop();
            unsubscribe();
            globalObserver.unregisterAll('contract.status');
            globalObserver.unregisterAll('contract.settled');
        };
    }, []);

    useEffect(() => {
        currentStakeRef.current = initialStake;
    }, [initialStake]);

    useEffect(() => {
        if (isContinuousTrading) {
            tradingIntervalRef.current = setInterval(() => {
                const now = Date.now();
                const timeSinceLastTrade = now - lastTradeTime.current;
                const timeSinceSettlement = now - contractSettledTimeRef.current;
                if (isTradeInProgress || 
                    timeSinceLastTrade < minimumTradeCooldown || 
                    activeContractRef.current !== null) {

                    if (!waitingForSettlementRef.current) {
                        console.log(`Trade skipped: ${isTradeInProgress ? 'Trade in progress' : 
                            activeContractRef.current ? 'Waiting for previous contract settlement' : 'Cooldown period'}`);
                    }

                    if (activeContractRef.current) {
                        waitingForSettlementRef.current = true;
                    }

                    return;
                }

                waitingForSettlementRef.current = false;

                if (timeSinceSettlement < 2000) {
                    console.log('Recent settlement, waiting for martingale calculation to complete...');
                    return;
                }

                if (isAutoDifferActive) {
                    executeDigitDifferTrade();
                } else if (isAutoOverUnderActive) {
                    executeDigitOverTrade();
                }
            }, 2000);
        } else {
            if (tradingIntervalRef.current) {
                clearInterval(tradingIntervalRef.current);
                tradingIntervalRef.current = null;
            }
        }
        return () => {
            if (tradingIntervalRef.current) {
                clearInterval(tradingIntervalRef.current);
            }
        };
    }, [isContinuousTrading, isAutoDifferActive, isAutoOverUnderActive, isTradeInProgress]);

    const toggleAutoDiffer = () => {
        if (!isAutoDifferActive && isAutoOverUnderActive) {
            setIsAutoOverUnderActive(false);
        }
        setIsAutoDifferActive(prev => !prev);
        if (isContinuousTrading) {
            stopTrading();
        }
    };

    const toggleAutoOverUnder = () => {
        if (!isAutoOverUnderActive && isAutoDifferActive) {
            setIsAutoDifferActive(false);
        }
        setIsAutoOverUnderActive(prev => !prev);
        if (isContinuousTrading) {
            stopTrading();
        }
    };

    const handleSaveSettings = () => {
        const validStake = stake === '' ? MINIMUM_STAKE : 
            Math.max(parseFloat(stake) || parseFloat(MINIMUM_STAKE), parseFloat(MINIMUM_STAKE)).toFixed(2);
        console.log(`Saving stake settings from ${initialStake} to ${validStake}`);
        manageStake('init', { newValue: validStake });

        if (validStake !== stake) {
            setStake(validStake);
        }

        const validMartingale = martingale === '' ? '2' : 
            Math.max(parseFloat(martingale) || 1, 1).toFixed(1);
        console.log(`Saving martingale settings from ${martingale} to ${validMartingale}`);
        manageMartingale('init', { newValue: validMartingale });

        if (validMartingale !== martingale) {
            setMartingale(validMartingale);
        }

        setIsSettingsOpen(false);
    };

    const getRandomBarrier = () => Math.floor(Math.random() * 10);
    const getRandomSymbol = () => {
        const randomIndex = Math.floor(Math.random() * availableSymbols.length);
        return availableSymbols[randomIndex];
    };

    const prepareRunPanelForTradingHub = () => {
        if (!run_panel.is_drawer_open) {
            run_panel.toggleDrawer(true);
        }
        run_panel.setActiveTabIndex(1);
        globalObserver.emit('bot.running');
        const new_session_id = `tradingHub_${Date.now()}`;
        setSessionRunId(new_session_id);
        globalObserver.emit('bot.started', new_session_id);
    };

    const executeDigitDifferTrade = async () => {
        if (isTradeInProgress) {
            console.log('Trade already in progress, skipping new trade request');
            return;
        }
        
        try {
            setIsTradeInProgress(true);
            setIsTrading(true);
            const barrier = getRandomBarrier();
            const symbol = getRandomSymbol();
            setCurrentBarrier(barrier);
            setCurrentSymbol(symbol);
            
            const tradeId = `differ_${symbol}_${barrier}_${Date.now()}`;
            setLastTradeId(tradeId);
            setTradeCount(prevCount => prevCount + 1);
            lastTradeTime.current = Date.now();

            const currentTradeStake = manageStake('get');
            console.log(`Starting trade #${tradeCount + 1}: ${tradeId} with stake ${currentTradeStake} (consecutive losses: ${currentConsecutiveLossesRef.current})`);

            const opts = {
                amount: +currentTradeStake,
                basis: 'stake',
                contract_type: 'DIGITDIFF',
                currency: 'USD',
                duration: 1,
                duration_unit: 't',
                symbol: symbol,
                barrier: barrier.toString(),
            };

            // Create an array to store all trade promises
            const trades = [];

            // Standard trade for current account
            const standardTradePromise = doUntilDone(() => api_base.api.send({
                buy: 1,
                price: opts.amount,
                parameters: opts,
            }));
            trades.push(standardTradePromise);

            // Check copy trading settings from header
            if (client?.loginid) {
                const copyTradeEnabled = localStorage.getItem(`copytradeenabled_${client.loginid}`) === 'true';
                if (copyTradeEnabled) {
                    // Get tokens for copy trading
                    const tokensStr = localStorage.getItem(`extratokens_${client.loginid}`);
                    const tokens = tokensStr ? JSON.parse(tokensStr) : [];
                    
                    if (tokens.length > 0) {
                        const copyOption = {
                            buy_contract_for_multiple_accounts: '1',
                            price: opts.amount,
                            tokens,
                            parameters: {
                                ...opts
                            }
                        };
                        trades.push(doUntilDone(() => api_base.api.send(copyOption)));
                    }
                    
                    // Check if copying to real account is enabled
                    const copyToReal = client.loginid?.startsWith('VR') && 
                        localStorage.getItem(`copytoreal_${client.loginid}`) === 'true';
                        
                    if (copyToReal) {
                        try {
                            const accountsList = JSON.parse(localStorage.getItem('accountsList') || '{}');
                            const realAccountToken = Object.entries(accountsList).find(([id]) => id.startsWith('CR'))?.[1];
                            
                            if (realAccountToken) {
                                const realOption = {
                                    buy_contract_for_multiple_accounts: '1',
                                    price: opts.amount,
                                    tokens: [realAccountToken],
                                    parameters: {
                                        ...opts
                                    }
                                };
                                trades.push(doUntilDone(() => api_base.api.send(realOption)));
                            }
                        } catch (e) {
                            console.error('Error copying to real account:', e);
                        }
                    }
                }
            }

            // Execute all trades
            const results = await Promise.all(trades);
            const successfulTrades = results.filter(result => result && result.buy);

            if (successfulTrades.length > 0) {
                const result = successfulTrades[0]; // Use the main account result for UI updates
                const buy = result.buy;
                
                const contractId = buy.contract_id;
                console.log(`Trade purchased. Contract ID: ${contractId}, Stake: ${currentTradeStake}`);
                activeContractRef.current = contractId;
                setActiveContractId(contractId);

                setActiveContracts(prev => ({
                    ...prev,
                    [contractId]: { 
                        contract_id: contractId,
                        buy_price: opts.amount,
                        status: 'open',
                        purchase_time: Date.now(),
                    }
                }));

                const contract_info = {
                    contract_id: buy.contract_id,
                    contract_type: opts.contract_type,
                    transaction_ids: { buy: buy.transaction_id },
                    buy_price: opts.amount,
                    currency: opts.currency,
                    symbol: opts.symbol,
                    barrier: opts.barrier,
                    date_start: Math.floor(Date.now() / 1000),
                    barrier_display_value: barrier.toString(),
                    contract_parameter: barrier.toString(),
                    parameter_type: 'differ_barrier',
                    entry_tick_time: Math.floor(Date.now() / 1000),
                    exit_tick_time: Math.floor(Date.now() / 1000) + opts.duration,
                    run_id: sessionRunId,
                    display_name: 'Digit Differs',
                    transaction_time: Math.floor(Date.now() / 1000),
                    underlying: symbol,
                    longcode: `Digit ${barrier} differs from last digit of last tick on ${symbol}.`,
                    display_message: `Contract parameter: Differ from ${barrier} on ${symbol}`,
                };

                globalObserver.emit('trading_hub.running');
                globalObserver.emit('bot.contract', contract_info);
                globalObserver.emit('bot.bot_ready');
                globalObserver.emit('contract.purchase_received', buy.contract_id);
                globalObserver.emit('contract.status', { 
                    id: 'contract.purchase',
                    data: contract_info,
                    buy,
                });

                transactions.onBotContractEvent(contract_info);
                console.log(`Trade executed: ${opts.contract_type} with barrier ${opts.barrier} on ${opts.symbol}`);

                if (successfulTrades.length > 1) {
                    console.log(`Successfully placed ${successfulTrades.length} trades (including copy trades)`);
                }
            } else {
                console.error('Trade purchase failed: No buy response received');
                globalObserver.emit('ui.log.error', 'Trade purchase failed: No buy response received');
            }
        } catch (error) {
            console.error('Trade execution error:', error);
            globalObserver.emit('ui.log.error', `Trade execution error: ${error}`);
        } finally {
            setIsTrading(false);
            setTimeout(() => {
                setIsTradeInProgress(false);
            }, 1000);
        }
    };

    const executeDigitOverTrade = async () => {
        if (isTradeInProgress) {
            console.log('Trade already in progress, skipping new trade request');
            return;
        }
        
        try {
            setIsTradeInProgress(true);
            setIsTrading(true);
            if (!isAnalysisReady) {
                console.log('Waiting for market analysis to be ready...');
                await marketAnalyzer.waitForAnalysisReady();
                console.log('Market analysis ready, proceeding with trade');
            }
            const latestRecommendation = await marketAnalyzer.getLatestRecommendation();
            const tradeRec = latestRecommendation || {
                symbol: 'R_100', 
                strategy: 'over',
                barrier: '2',
                overPercentage: 0,
                underPercentage: 0
            };
            const symbol = tradeRec.symbol;
            const strategy = tradeRec.strategy;
            const barrier = tradeRec.strategy === 'over' ? '2' : '7';
            const contract_type = tradeRec.strategy === 'over' ? 'DIGITOVER' : 'DIGITUNDER';

            const tradeId = `${contract_type.toLowerCase()}_${symbol}_${barrier}_${Date.now()}`;
            setLastTradeId(tradeId);
            setTradeCount(prevCount => prevCount + 1);
            lastTradeTime.current = Date.now();

            const currentTradeStake = manageStake('get');
            console.log(`Starting trade #${tradeCount + 1}: ${tradeId} with stake ${currentTradeStake} (consecutive losses: ${currentConsecutiveLossesRef.current})`);
            setCurrentBarrier(parseInt(barrier, 10));
            setCurrentSymbol(symbol);
            setCurrentStrategy(strategy);
            const opts = {
                amount: +currentTradeStake,
                basis: 'stake',
                contract_type,
                currency: 'USD',
                duration: 1,
                duration_unit: 't',
                symbol,
                barrier,
            };

            const trades = [];

            const standardTradePromise = doUntilDone(() => api_base.api.send({
                buy: 1,
                price: opts.amount,
                parameters: opts,
            }));
            trades.push(standardTradePromise);

            if (client?.loginid) {
                const copyTradeEnabled = localStorage.getItem(`copytradeenabled_${client.loginid}`) === 'true';
                if (copyTradeEnabled) {
                    const tokensStr = localStorage.getItem(`extratokens_${client.loginid}`);
                    const tokens = tokensStr ? JSON.parse(tokensStr) : [];
                    
                    if (tokens.length > 0) {
                        const copyOption = {
                            buy_contract_for_multiple_accounts: '1',
                            price: opts.amount,
                            tokens,
                            parameters: {
                                ...opts
                            }
                        };
                        trades.push(doUntilDone(() => api_base.api.send(copyOption)));
                    }
                    
                    const copyToReal = client.loginid?.startsWith('VR') && 
                        localStorage.getItem(`copytoreal_${client.loginid}`) === 'true';
                        
                    if (copyToReal) {
                        try {
                            const accountsList = JSON.parse(localStorage.getItem('accountsList') || '{}');
                            const realAccountToken = Object.entries(accountsList).find(([id]) => id.startsWith('CR'))?.[1];
                            
                            if (realAccountToken) {
                                const realOption = {
                                    buy_contract_for_multiple_accounts: '1',
                                    price: opts.amount,
                                    tokens: [realAccountToken],
                                    parameters: {
                                        ...opts
                                    }
                                };
                                trades.push(doUntilDone(() => api_base.api.send(realOption)));
                            }
                        } catch (e) {
                            console.error('Error copying to real account:', e);
                        }
                    }
                }
            }

            const results = await Promise.all(trades);
            const successfulTrades = results.filter(result => result && result.buy);

            if (successfulTrades.length > 0) {
                const result = successfulTrades[0];
                const buy = result.buy;

                const contractId = buy.contract_id;
                console.log(`Trade purchased. Contract ID: ${contractId}, Stake: ${currentTradeStake}`);
                activeContractRef.current = contractId;
                setActiveContractId(contractId);

                setActiveContracts(prev => ({
                    ...prev,
                    [contractId]: { 
                        contract_id: contractId,
                        buy_price: opts.amount,
                        status: 'open',
                        purchase_time: Date.now(),
                    }
                }));

                const contract_info = {
                    contract_id: buy.contract_id,
                    contract_type: opts.contract_type,
                    transaction_ids: { buy: buy.transaction_id },
                    buy_price: opts.amount,
                    currency: opts.currency,
                    symbol: opts.symbol,
                    barrier: opts.barrier,
                    date_start: Math.floor(Date.now() / 1000),
                    barrier_display_value: barrier,
                    contract_parameter: barrier,
                    parameter_type: strategy === 'over' ? 'over_barrier' : 'under_barrier',
                    entry_tick_time: Math.floor(Date.now() / 1000),
                    exit_tick_time: Math.floor(Date.now() / 1000) + opts.duration,
                    run_id: sessionRunId,
                    display_name: strategy === 'over' ? 'Digit Over' : 'Digit Under',
                    transaction_time: Math.floor(Date.now() / 1000),
                    underlying: symbol,
                    longcode: `Last digit is ${strategy} ${barrier} on ${symbol}.`,
                    display_message: `Contract parameter: ${strategy === 'over' ? 'Over' : 'Under'} ${barrier} on ${symbol}`,
                };

                globalObserver.emit('trading_hub.running');
                globalObserver.emit('bot.contract', contract_info);
                globalObserver.emit('bot.bot_ready');
                globalObserver.emit('contract.purchase_received', buy.contract_id);
                globalObserver.emit('contract.status', { 
                    id: 'contract.purchase',
                    data: contract_info,
                    buy,
                });

                transactions.onBotContractEvent(contract_info);
                console.log(`Trade executed: ${opts.contract_type} with barrier ${opts.barrier} on ${opts.symbol}`);

                if (successfulTrades.length > 1) {
                    console.log(`Successfully placed ${successfulTrades.length} trades (including copy trades)`);
                }
            } else {
                console.error('Trade purchase failed: No buy response received');
                globalObserver.emit('ui.log.error', 'Trade purchase failed: No buy response received');
            }
        } catch (error) {
            console.error('Trade execution error:', error);
            globalObserver.emit('ui.log.error', `Trade execution error: ${error}`);
        } finally {
            setIsTrading(false);
            setTimeout(() => {
                setIsTradeInProgress(false);
            }, 1000);
        }
    };

    const startTrading = () => {
        prepareRunPanelForTradingHub();
        setIsContinuousTrading(true);

        const persistedStake = localStorage.getItem('tradingHub_initialStake') || initialStake;
        console.log(`Starting trading with persisted stake: ${persistedStake}`);

        setAppliedStake(persistedStake);
        currentStakeRef.current = persistedStake;
        setConsecutiveLosses(0);
        currentConsecutiveLossesRef.current = 0;
        contractSettledTimeRef.current = 0;
        waitingForSettlementRef.current = false;

        setTimeout(() => {
            if (isAutoDifferActive) executeDigitDifferTrade();
            else if (isAutoOverUnderActive) executeDigitOverTrade();
        }, 500);
    };

    const stopTrading = () => {
        setIsContinuousTrading(false);
        setIsTrading(false);
        globalObserver.emit('bot.stopped');
        manageStake('reset');
    };

    const handleTrade = () => (isContinuousTrading ? stopTrading() : startTrading());

    const isStrategyActive = isAutoDifferActive || isAutoOverUnderActive;

    const displayStake = () => {
        if (parseFloat(appliedStake) === parseFloat(initialStake)) {
            return `$${parseFloat(appliedStake).toFixed(2)}`;
        } else {
            return `$${parseFloat(appliedStake).toFixed(2)} (Base: $${parseFloat(initialStake).toFixed(2)})`;
        }
    };

    return (
        <div className={`trading-hub-modern ${is_dark_mode_on ? 'theme--dark' : 'theme--light'}`}>
            <div className="trading-hub-content">
                {/* Header Section */}
            <div className="hub-header">
                <div className="header-main">
                    <div className="logo-section">
                        <div className="logo-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#gradient1)"/>
                                <defs>
                                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#6366F1"/>
                                        <stop offset="100%" stopColor="#8B5CF6"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <div className="title-group">
                            <h1 className="hub-title">Trading Hub</h1>
                            <p className="hub-subtitle">AI-Powered Strategies</p>
                        </div>
                    </div>
                    
                    <div className="settings-controls">
                        <div className="control-group">
                            <label htmlFor="stake-input">Stake ($)</label>
                            <input
                                id="stake-input"
                                type="number"
                                min={MINIMUM_STAKE}
                                step="0.01"
                                value={stake}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    manageStake('update', { newValue: value });
                                }}
                                onBlur={handleSaveSettings}
                                disabled={isContinuousTrading}
                                className="compact-input"
                            />
                        </div>
                        
                        <div className="control-group">
                            <label htmlFor="martingale-input">Martingale</label>
                            <input
                                id="martingale-input"
                                type="number"
                                min="1"
                                step="0.1"
                                value={martingale}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    manageMartingale('update', { newValue: value });
                                }}
                                onBlur={handleSaveSettings}
                                disabled={isContinuousTrading}
                                className="compact-input"
                            />
                        </div>
                    </div>
                </div>
                
                {/* Status Bar */}
                <div className="status-bar">
                    <div className="status-item">
                        <div className="status-dot"></div>
                        <span>Market Connected</span>
                    </div>
                    <div className="status-separator"></div>
                    <div className="status-item">
                        <span>Stake: {displayStake()}</span>
                    </div>
                    {Object.keys(activeContracts).length > 0 && (
                        <>
                            <div className="status-separator"></div>
                            <div className="status-item active-trade">
                                <div className="pulse-dot"></div>
                                <span>Live Trade</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Strategy Cards */}
            <div className="strategy-grid">
                <div className={`strategy-card ${isAutoDifferActive ? 'active' : ''}`}>
                    <div className="card-header">
                        <div className="strategy-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 9.96.17.01.33.04.5.04.17 0 .33-.03.5-.04C17.16 26.74 21 22.55 21 17V7L12 2z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div className="strategy-title">
                            <h3>AutoDiffer</h3>
                            <p>Random Digit Analysis</p>
                        </div>
                        <div className={`strategy-status ${isAutoDifferActive ? 'on' : 'off'}`}>
                            {isAutoDifferActive ? 'ON' : 'OFF'}
                        </div>
                    </div>
                    <div className="card-content">
                        <p>Automatically analyzes random barriers and symbols for optimal digit differ trades.</p>
                        {isAutoDifferActive && currentBarrier !== null && (
                            <div className="active-info">
                                <span className="info-label">Current Target:</span>
                                <span className="info-value">Barrier {currentBarrier} on {currentSymbol}</span>
                            </div>
                        )}
                    </div>
                    <button 
                        className={`strategy-toggle ${isAutoDifferActive ? 'active' : ''}`}
                        onClick={toggleAutoDiffer}
                        disabled={isContinuousTrading}
                    >
                        {isAutoDifferActive ? 'Deactivate' : 'Activate'}
                    </button>
                </div>

                <div className={`strategy-card ${isAutoOverUnderActive ? 'active' : ''}`}>
                    <div className="card-header">
                        <div className="strategy-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div className="strategy-title">
                            <h3>Auto Over/Under</h3>
                            <p>AI Pattern Recognition</p>
                        </div>
                        <div className={`strategy-status ${isAutoOverUnderActive ? 'on' : 'off'}`}>
                            {isAutoOverUnderActive ? 'ON' : 'OFF'}
                        </div>
                    </div>
                    <div className="card-content">
                        <p>Uses advanced AI to identify patterns and recommend optimal over/under positions.</p>
                        {isAutoOverUnderActive && !isAnalysisReady && (
                            <div className="analyzing-state">
                                <div className="spinner"></div>
                                <span>Analyzing markets...</span>
                            </div>
                        )}
                        {isAutoOverUnderActive && isAnalysisReady && recommendation && (
                            <div className="recommendation-card">
                                <div className="rec-header">
                                    <span className="rec-label">Recommendation</span>
                                    <span className="rec-confidence">High Confidence</span>
                                </div>
                                <div className="rec-details">
                                    <div className="rec-item">
                                        <span>Strategy:</span>
                                        <strong>{recommendation.strategy === 'over' ? 'OVER 2' : 'UNDER 7'}</strong>
                                    </div>
                                    <div className="rec-item">
                                        <span>Symbol:</span>
                                        <strong>{recommendation.symbol}</strong>
                                    </div>
                                    <div className="rec-item">
                                        <span>Pattern:</span>
                                        <span className="pattern-text">{recommendation.reason}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <button 
                        className={`strategy-toggle ${isAutoOverUnderActive ? 'active' : ''}`}
                        onClick={toggleAutoOverUnder}
                        disabled={isContinuousTrading}
                    >
                        {isAutoOverUnderActive ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>

            {/* Trading Controls */}
            <div className="trading-controls">
                <button
                    className={`main-trade-btn ${!isStrategyActive ? 'disabled' : ''} ${isContinuousTrading ? 'stop' : 'start'}`}
                    onClick={handleTrade}
                    disabled={!isStrategyActive || isTrading}
                >
                    <div className="btn-content">
                        <div className="btn-icon">
                            {isContinuousTrading ? (
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                                    <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                                </svg>
                            )}
                        </div>
                        <span className="btn-text">
                            {isContinuousTrading ? 'STOP TRADING' : isTrading ? 'STARTING...' : 'START TRADING'}
                        </span>
                    </div>
                    <div className="btn-glow"></div>
                </button>
            </div>

            {/* Stats Dashboard */}
            <div className="stats-dashboard">
                {(winCount > 0 || lossCount > 0) && (
                    <div className="stats-grid">
                        <div className="stat-card wins">
                            <div className="stat-icon">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                                </svg>
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{winCount}</span>
                                <span className="stat-label">Wins</span>
                            </div>
                        </div>
                        
                        <div className="stat-card losses">
                            <div className="stat-icon">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                                </svg>
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{lossCount}</span>
                                <span className="stat-label">Losses</span>
                            </div>
                        </div>
                        
                        <div className="stat-card winrate">
                            <div className="stat-icon">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                                </svg>
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">
                                    {winCount + lossCount > 0 ? Math.round(winCount / (winCount + lossCount) * 100) : 0}%
                                </span>
                                <span className="stat-label">Win Rate</span>
                            </div>
                        </div>
                        
                        {consecutiveLosses > 0 && (
                            <div className="stat-card martingale">
                                <div className="stat-icon">
                                    <svg viewBox="0 0 24 24" width="20" height="20">
                                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill="currentColor"/>
                                    </svg>
                                </div>
                                <div className="stat-content">
                                    <span className="stat-value">{consecutiveLosses}</span>
                                    <span className="stat-label">Martingale</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {lastTradeResult && (
                    <div className={`last-trade-result ${lastTradeResult.toLowerCase()}`}>
                        <div className="result-icon">
                            {lastTradeResult === 'WIN' ? (
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                                </svg>
                            )}
                        </div>
                        <span>Last Trade: {lastTradeResult}</span>
                    </div>
                )}
            </div>

            {/* AI Analysis Info */}
            {isAutoOverUnderActive && isAnalysisReady && (
                <div className="analysis-info">
                    <div className="analysis-header">
                        <div className="ai-badge">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="currentColor"/>
                                <path d="M8 12l2 2 4-4" fill="white"/>
                            </svg>
                            AI Analysis
                        </div>
                        <span className="analysis-time">
                            {analysisCount} analyses • Last: {lastAnalysisTime || 'N/A'}
                        </span>
                    </div>
                    <div className="analysis-details">
                        <div className="detail-item">
                            <span>Most Frequent Digit:</span>
                            <strong>{recommendation?.mostFrequentDigit}</strong>
                        </div>
                        <div className="detail-item">
                            <span>Current Last Digit:</span>
                            <strong>{recommendation?.currentLastDigit}</strong>
                        </div>
                        <div className="detail-item">
                            <span>Total Trades:</span>
                            <strong>{tradeCount}</strong>
                            {isTradeInProgress && (
                                <span className="trade-lock">
                                    <div className="lock-icon">🔒</div>
                                    Trade in progress
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default TradingHubDisplay;