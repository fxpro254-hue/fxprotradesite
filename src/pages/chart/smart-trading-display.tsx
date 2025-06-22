import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { useStore } from '@/hooks/useStore';
import { Button, Text } from '@deriv-com/ui';
import { localize } from '@deriv-com/translations';
import { api_base } from '../../external/bot-skeleton/services/api/api-base';
import { doUntilDone } from '../../external/bot-skeleton/services/tradeEngine/utils/helpers';
import { observer as globalObserver } from '../../external/bot-skeleton/utils/observer';
import './smart-trading-display.scss';

// Extend Window interface for volatility analyzer
declare global {
    interface Window {
        volatilityAnalyzer?: {
            reconnect?: () => void;
        };
        initVolatilityAnalyzer?: () => void;
    }
}

interface TradeSettings {
    stake: number;
    ticks: number; // Duration in ticks
    martingaleMultiplier: number;
    
    // Optional input state properties for handling empty inputs
    stakeInput?: string;
    ticksInput?: string;
    martingaleMultiplierInput?: string;
    
    // Add trading condition properties
    conditionType?: string; // 'rise' or 'fall'
    conditionOperator?: string; // '>', '<', '>=', '<=', '='
    conditionValue?: number; // Percentage threshold
    conditionValueInput?: string; // For UI handling of input
    conditionAction?: string; // 'Rise' or 'Fall' contract
    
    // Pattern condition properties (for even-odd-2)
    patternDigitCount?: number; // How many digits to check
    patternDigitCountInput?: string; // For UI handling of input
    patternType?: string; // 'even' or 'odd'
    patternAction?: string; // 'Even' or 'Odd' contract type to buy
      // Over/Under pattern condition properties (for over-under-2)
    overUnderPatternDigitCount?: number; // How many digits to check
    overUnderPatternDigitCountInput?: string; // For UI handling of input
    overUnderPatternType?: string; // 'over' or 'under'
    overUnderPatternBarrier?: number; // Barrier value for over/under comparison
    overUnderPatternBarrierInput?: string; // For UI handling of barrier input
    overUnderPatternAction?: string; // 'Over' or 'Under' contract to buy
    overUnderPatternTradingBarrier?: number; // Independent trading barrier digit (0-9)
    overUnderPatternTradingBarrierInput?: string; // For UI handling of trading barrier input// Matches/Differs condition properties
    conditionDigit?: number; // The digit to match/differ (0-9)
    
    // Trading barrier properties (for over/under strategies)
    tradingBarrier?: number; // Independent trading barrier digit (0-9)
    tradingBarrierInput?: string; // For UI handling of trading barrier input
}

interface AnalysisStrategy {
    id: string;
    name: string;
    description: string;
    settings: TradeSettings;
    activeContractType: string | null; // e.g., "Rise", "Fall", or null
    currentStake?: number; // Current stake after applying martingale
    lastTradeResult?: string; // Result of the last trade (WIN/LOSS)
}

const initialAnalysisStrategies: AnalysisStrategy[] = [
    {
        id: 'rise-fall',
        name: localize('Rise/Fall'),
        description: localize('Trades based on market rise/fall predictions.'),
        settings: { 
            stake: 0.5, 
            ticks: 1, 
            martingaleMultiplier: 1,
            conditionType: 'rise',
            conditionOperator: '>',
            conditionValue: 65,
            conditionAction: 'Rise'
        },
        activeContractType: null,
    },
    {
        id: 'even-odd',
        name: localize('Even/Odd'),
        description: localize('Trades based on the last digit being even or odd.'),
        settings: { 
            stake: 0.5, 
            ticks: 1, 
            martingaleMultiplier: 1,
            conditionType: 'even',
            conditionOperator: '>',
            conditionValue: 60,
            conditionAction: 'Even' 
        },
        activeContractType: null,
    },
    {
        id: 'even-odd-2',
        name: localize('Even/Odd'),
        description: localize('Alternative strategy for even/odd last digit trading.'),
        settings: { 
            stake: 0.5, 
            ticks: 1, 
            martingaleMultiplier: 1,
            patternDigitCount: 3,
            patternType: 'even',
            patternAction: 'Even'
        },
        activeContractType: null,
    },
    {
        id: 'over-under',
        name: localize('Over/Under'),
        description: localize('Trades based on the last digit being over or under a predicted number.'),        settings: { 
            stake: 0.5, 
            ticks: 1, 
            martingaleMultiplier: 1,
            conditionType: 'over',
            conditionOperator: '>',
            conditionValue: 55,
            conditionAction: 'Over',
            tradingBarrier: 5
        },
        activeContractType: null,
    },
    {
        id: 'over-under-2',
        name: localize('Over/Under'),
        description: localize('Alternative approach for over/under digit trading with custom parameters.'),        settings: { 
            stake: 0.5, 
            ticks: 1, 
            martingaleMultiplier: 1,
            overUnderPatternDigitCount: 3,
            overUnderPatternType: 'over',
            overUnderPatternBarrier: 5,
            overUnderPatternAction: 'Over',
            overUnderPatternTradingBarrier: 5
        },
        activeContractType: null,
    },
    {
        id: 'matches-differs',
        name: localize('Matches/Differs'),
        description: localize('Trades based on the last digit matching or differing from a predicted number.'),
        settings: { 
            stake: 0.5, 
            ticks: 1, 
            martingaleMultiplier: 1,
            conditionType: 'matches',
            conditionOperator: '>',

            conditionValue: 55,
            conditionDigit: 5,  // The digit to match/differ (0-9)
            conditionAction: 'Matches'
        },
        activeContractType: null,
    },
];

const SmartTradingDisplay = observer(() => {
    const { run_panel, transactions, client } = useStore();
    const { is_drawer_open } = run_panel;
    const [analysisStrategies, setAnalysisStrategies] = useState<AnalysisStrategy[]>(initialAnalysisStrategies);
    const [analysisData, setAnalysisData] = useState<Record<string, any>>({});
    const [selectedSymbol, setSelectedSymbol] = useState<string>("R_10");
    const [tickCount, setTickCount] = useState<number>(120); // Actual numeric tick count
    const [currentPrice, setCurrentPrice] = useState<string>('');
    const [barrierValue, setBarrierValue] = useState<number>(5); // Default barrier for over/under
    const [barrierInput, setBarrierInput] = useState<string>(barrierValue.toString()); // State for barrier input
    const volatilityAnalyzerLoaded = useRef<boolean>(false);

    // Add a state to track if we've sent initialization commands
    const [hasSentInitCommands, setHasSentInitCommands] = useState(false);

    // Add state for tracking tick count input value during editing
    const [tickCountInput, setTickCountInput] = useState<string>(tickCount.toString()); // UI state for tick input

    // Trading-related state variables (from TradingHub)
    const [activeContracts, setActiveContracts] = useState<Record<string, any>>({});
    const [tradeCount, setTradeCount] = useState(0);
    const [winCount, setWinCount] = useState(0);
    const [lossCount, setLossCount] = useState(0);
    const [isTradeInProgress, setIsTradeInProgress] = useState(false);
    const [sessionRunId, setSessionRunId] = useState<string>(`smartTrading_${Date.now()}`);
    const [lastTradeResult, setLastTradeResult] = useState<string>('');
    const [consecutiveLosses, setConsecutiveLosses] = useState<Record<string, number>>({});    const [currentStakes, setCurrentStakes] = useState<Record<string, number>>({});    const [lastConditionStates, setLastConditionStates] = useState<Record<string, boolean>>({});
    
    // Reference to store per-strategy state that should not trigger re-renders
    const strategyRefsMap = useRef<Record<string, any>>({});
    // Refs for trading management
    const activeContractRef = useRef<string | null>(null);
    const lastTradeTime = useRef<number>(0);
    const minimumTradeCooldown = 3000; // 3 seconds between trades for more frequent trading
    const contractUpdateInterval = useRef<NodeJS.Timeout | null>(null);
    const lastTradeRef = useRef<{ id: string | null, profit: number | null }>({ id: null, profit: null });
    const contractSettledTimeRef = useRef(0);
    const waitingForSettlementRef = useRef(false);

    // Effect to load and initialize volatility analyzer
    useEffect(() => {
        if (!volatilityAnalyzerLoaded.current) {
            const script = document.createElement('script');
            // Add cache-busting parameter to prevent loading cached version
            script.src = `/ai/volatility-analyzer.js?v=${Date.now()}`;
            script.async = true;
            script.onload = () => {
                volatilityAnalyzerLoaded.current = true;
                console.log('Volatility analyzer loaded');
                
                // Explicitly initialize the analyzer
                if (typeof window.initVolatilityAnalyzer === 'function') {
                    try {
                        window.initVolatilityAnalyzer();
                        console.log('Volatility analyzer initialized');
                    } catch (e) {
                        console.error('Error initializing volatility analyzer:', e);
                    }
                }
                
                // Load the enhancer script after the main analyzer is loaded
                const enhancerScript = document.createElement('script');
                enhancerScript.src = `/ai/analyzer-enhancer.js?v=${Date.now()}`;
                enhancerScript.async = true;
                enhancerScript.onload = () => {
                    console.log('Analyzer enhancer loaded');
                };
                document.body.appendChild(enhancerScript);
                
                // Wait a bit to ensure everything is initialized
                setTimeout(() => {
                    // Send initial configuration
                    console.log('Sending initial configuration');
                    window.postMessage({
                        type: 'UPDATE_SYMBOL',
                        symbol: selectedSymbol
                    }, '*');
                    window.postMessage({
                        type: 'UPDATE_TICK_COUNT',
                        tickCount: tickCount
                    }, '*');
                    window.postMessage({
                        type: 'UPDATE_BARRIER',
                        barrier: barrierValue
                    }, '*');
                    setHasSentInitCommands(true);
                    
                    // Force a status check
                    window.postMessage({
                        type: 'REQUEST_STATUS'
                    }, '*');
                }, 1000); // Wait longer to ensure both scripts are loaded
            };
            
            script.onerror = (e) => {
                console.error('Failed to load volatility analyzer:', e);
            };
            
            document.body.appendChild(script);
        }

        // Listen for messages from the volatility analyzer
        const handleMessage = (event: MessageEvent) => {
            if (!event.data || typeof event.data !== 'object') return;
            
            const { type } = event.data;
              switch (type) {
                case 'ANALYSIS_DATA':
                    console.log(`📊 Received analysis data for ${event.data.strategyId}:`, event.data.data);
                    setAnalysisData(prev => ({
                        ...prev,
                        [event.data.strategyId]: event.data.data
                    }));
                    break;
                    
                case 'PRICE_UPDATE':
                    setCurrentPrice(event.data.price);
                    break;
                    
                case 'ANALYZER_CONNECTION_STATUS':
                    console.log('Analyzer connection status:', event.data.status);
                    break;
                    
                case 'ANALYZER_STATUS':
                    console.log('Analyzer status:', event.data.status);
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [selectedSymbol, tickCount, barrierValue]);

    // Request data periodically after initialization
    useEffect(() => {
        if (!volatilityAnalyzerLoaded.current || !hasSentInitCommands) return;

        const requestAnalysisInterval = setInterval(() => {
            // Request data for all strategies
            analysisStrategies.forEach(strategy => {
                window.postMessage({
                    type: 'REQUEST_ANALYSIS',
                    strategyId: strategy.id
                }, '*');
            });
        }, 1000); // Update every second        return () => clearInterval(requestAnalysisInterval);
    }, [analysisStrategies, hasSentInitCommands]);

    // Contract tracking and settlement effect
    useEffect(() => {
        const session_id = `smartTrading_${Date.now()}`;
        setSessionRunId(session_id);
        globalObserver.emit('bot.started', session_id);        const contractSettlementHandler = (response: any) => {
            if (response?.id === 'contract.settled' && response?.data && 
                lastTradeRef.current?.id !== response.data.contract_id) {
                const contract_info = response.data;

                if (contract_info.contract_id === activeContractRef.current) {
                    const isWin = contract_info.profit >= 0;
                    setLastTradeResult(isWin ? 'WIN' : 'LOSS');

                    console.log(`Smart contract ${contract_info.contract_id} settled with ${isWin ? 'WIN' : 'LOSS'}, profit: ${contract_info.profit}.`);

                    lastTradeRef.current = { 
                        id: contract_info.contract_id, 
                        profit: contract_info.profit 
                    };

                    // Find which strategy this contract belongs to
                    const contractData = activeContracts[contract_info.contract_id];
                    if (contractData?.strategy_id) {
                        const strategyId = contractData.strategy_id;
                        
                        // Log current stake before update for debugging
                        const currentStake = currentStakes[strategyId] || 0;
                        const currentLosses = consecutiveLosses[strategyId] || 0;
                        console.log(`Strategy ${strategyId}: Current stake before update: ${currentStake}, Consecutive losses: ${currentLosses}`);
                        
                        if (isWin) {
                            setWinCount(prev => prev + 1);
                            // After a win, reset stake to initial value
                            manageStake(strategyId, 'reset');
                            console.log(`🎯 WIN: Strategy ${strategyId} reset to initial stake`);
                        } else {
                            setLossCount(prev => prev + 1);
                            // After a loss, apply martingale multiplier
                            manageStake(strategyId, 'martingale');
                            console.log(`❌ LOSS: Strategy ${strategyId} stake increased using martingale`);
                        }
                        
                        // Update UI for the specific strategy card
                        setAnalysisStrategies(prev => prev.map(s => 
                            s.id === strategyId ? {
                                ...s, 
                                lastTradeResult: isWin ? 'WIN' : 'LOSS',
                                currentStake: currentStakes[strategyId] || s.settings.stake
                            } : s
                        ));
                    }

                    activeContractRef.current = null;
                }
            }
        };

        globalObserver.register('contract.status', (response: any) => {   
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
                });                if (response?.proposal_open_contract) {
                    const contract = response.proposal_open_contract;

                    // Update contract data with latest API response
                    setActiveContracts(prev => ({
                        ...prev,
                        [contract.contract_id]: {
                            ...prev[contract.contract_id],
                            ...contract,
                            // Ensure we preserve the strategy_id from our original contract creation
                            strategy_id: prev[contract.contract_id]?.strategy_id 
                        }
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

                        console.log(`🏁 Smart contract ${contractId} settled. Result: ${isWin ? 'WIN' : 'LOSS'}, Profit: ${profit}`);
                        console.log(`📊 Ready for next trade in 2 seconds (settlement buffer)`);                        // Find which strategy this contract belongs to and manage martingale
                        const contractData = activeContracts[contractId];
                        if (contractData?.strategy_id) {
                            const strategyId = contractData.strategy_id;
                            const currentStake = contractData.current_stake || 0;
                            const initialStake = contractData.initial_stake || 0;
                            const martingaleLevel = contractData.martingale_level || 0;
                            const martingaleMultiplier = contractData.martingale_multiplier || 2;
                            
                            console.log(`Contract for strategy ${strategyId} settled: Result=${isWin ? 'WIN' : 'LOSS'}`);
                            console.log(`Current state: Stake=${currentStake}, Initial=${initialStake}, Level=${martingaleLevel}×${martingaleMultiplier}`);
                            
                            if (isWin) {
                                setWinCount(prev => prev + 1);
                                manageStake(strategyId, 'reset');
                                setLastTradeResult('WIN');
                                console.log(`✅ WIN: Strategy ${strategyId} reset to initial stake ${initialStake} (was ${currentStake})`);
                            } else {
                                setLossCount(prev => prev + 1);
                                manageStake(strategyId, 'martingale');
                                setLastTradeResult('LOSS');
                                const newStake = initialStake * Math.pow(martingaleMultiplier, martingaleLevel + 1);
                                console.log(`❌ LOSS: Strategy ${strategyId} stake increased from ${currentStake} to ~${newStake.toFixed(2)} (level ${martingaleLevel+1})`);
                            }
                            
                            // Update strategy analytics data to reflect latest trade result and stake
                            setAnalysisData(prev => ({
                                ...prev,
                                [strategyId]: {
                                    ...(prev[strategyId] || {}),
                                    lastTradeResult: isWin ? 'WIN' : 'LOSS',
                                    lastTradeTime: new Date().toLocaleTimeString(),
                                    consecutiveWins: isWin ? 
                                        ((prev[strategyId]?.consecutiveWins || 0) + 1) : 0,
                                    consecutiveLosses: !isWin ? 
                                        ((prev[strategyId]?.consecutiveLosses || 0) + 1) : 0,
                                    currentStake: isWin ? initialStake : 
                                        initialStake * Math.pow(martingaleMultiplier, martingaleLevel + 1),
                                    winCount: isWin ? 
                                        ((prev[strategyId]?.winCount || 0) + 1) : 
                                        (prev[strategyId]?.winCount || 0),
                                    lossCount: !isWin ? 
                                        ((prev[strategyId]?.lossCount || 0) + 1) : 
                                        (prev[strategyId]?.lossCount || 0),
                                }
                            }));
                        }

                        setActiveContracts(prev => {
                            const newContracts = { ...prev };
                            delete newContracts[contractId];
                            return newContracts;
                        });
                        
                        // Reset active contract reference to allow new trades
                        activeContractRef.current = null;
                        
                        // Reset trade in progress flag if it's stuck
                        setTimeout(() => {
                            setIsTradeInProgress(false);
                        }, 500);
                    }
                }
            } catch (error) {
                console.error('Error tracking smart contract:', error);
            }
        }, 1000);

        return () => {
            if (contractUpdateInterval.current) {
                clearInterval(contractUpdateInterval.current);
            }
            globalObserver.emit('bot.stopped');
            globalObserver.unregisterAll('contract.status');
            globalObserver.unregisterAll('contract.settled');
        };
    }, []);    // Auto-trading effect - monitor conditions and execute trades
    useEffect(() => {        const autoTradingInterval = setInterval(() => {
            const newConditionStates: Record<string, boolean> = {};
            
            analysisStrategies.forEach(strategy => {
                if (strategy.activeContractType && strategy.activeContractType !== null) {
                    // Enhanced debugging for rise/fall specifically
                    if (strategy.id === 'rise-fall') {
                        const analysis = analysisData[strategy.id];
                        console.log(`🔍 [RISE/FALL DEBUG] Strategy state:`, {
                            id: strategy.id,
                            activeContractType: strategy.activeContractType,
                            hasAnalysisData: !!analysis,
                            analysisKeys: analysis ? Object.keys(analysis) : [],
                            settings: strategy.settings
                        });
                        
                        if (analysis) {
                            console.log(`🔍 [RISE/FALL DEBUG] Analysis content:`, {
                                riseRatio: analysis.riseRatio,
                                fallRatio: analysis.fallRatio,
                                recommendation: analysis.recommendation,
                                confidence: analysis.confidence
                            });
                        }
                    }
                    
                    const conditionMet = isConditionMet(strategy.id);
                    const wasConditionMet = lastConditionStates[strategy.id] || false;
                    const conditionJustBecameTrue = conditionMet && !wasConditionMet;
                    
                    newConditionStates[strategy.id] = conditionMet;
                    
                    // Enhanced logging for rise/fall
                    if (strategy.id === 'rise-fall') {
                        console.log(`🔍 [RISE/FALL DEBUG] Condition evaluation:`, {
                            conditionMet,
                            wasConditionMet,
                            conditionJustBecameTrue,
                            activeContractType: strategy.activeContractType
                        });
                    } else {
                        console.log(`Strategy ${strategy.id}: condition=${conditionMet}, was=${wasConditionMet}, justBecameTrue=${conditionJustBecameTrue}`);
                    }
                    
                    // Check if we can trade
                    const now = Date.now();
                    const timeSinceLastTrade = now - lastTradeTime.current;
                    const timeSinceSettlement = now - contractSettledTimeRef.current;
                    
                    // Priority trading: if condition just became true, reduce cooldown requirements
                    const priorityCooldown = conditionJustBecameTrue ? 1000 : minimumTradeCooldown; // 1 second for new conditions
                    const settlementBuffer = conditionJustBecameTrue ? 1000 : 2000; // 1 second for new conditions
                    
                    const canTrade = conditionMet && 
                                   !isTradeInProgress && 
                                   timeSinceLastTrade >= priorityCooldown &&
                                   (!activeContractRef.current || timeSinceSettlement >= settlementBuffer);
                    
                    if (canTrade) {
                        const tradeReason = conditionJustBecameTrue ? '🔥 IMMEDIATE (condition just met)' : '✅ REGULAR (condition continues)';
                        console.log(`${tradeReason} Executing trade for strategy ${strategy.id}`);
                        console.log(`  - Time since last trade: ${timeSinceLastTrade}ms (required: ${priorityCooldown}ms)`);
                        console.log(`  - Time since settlement: ${timeSinceSettlement}ms (required: ${settlementBuffer}ms)`);
                        executeSmartTrade(strategy.id);
                    } else {
                        const reasons = [];
                        if (!conditionMet) reasons.push('condition not met');
                        if (isTradeInProgress) reasons.push('trade in progress');
                        if (timeSinceLastTrade < priorityCooldown) reasons.push(`cooldown (${priorityCooldown - timeSinceLastTrade}ms remaining)`);
                        if (activeContractRef.current && timeSinceSettlement < settlementBuffer) reasons.push(`waiting for settlement (${settlementBuffer - timeSinceSettlement}ms remaining)`);
                        
                        // Only log if condition is met but other factors prevent trading (to reduce noise)
                        if (conditionMet && reasons.length > 1) {
                            console.log(`⏳ Strategy ${strategy.id} condition met but waiting: ${reasons.slice(1).join(', ')}`);
                        } else if (!conditionMet && conditionJustBecameTrue === false && Date.now() % 10000 < 1000) { // Log condition not met occasionally
                            console.log(`❌ Strategy ${strategy.id} condition not met`);
                        }
                    }
                } else {
                    newConditionStates[strategy.id] = false;
                    // Only log occasionally to avoid spam
                    if (Date.now() % 15000 < 1000) { // Log every 15 seconds for 1 second
                        console.log(`Strategy ${strategy.id} not active`);
                    }
                }
            });
            
            // Update condition states
            setLastConditionStates(newConditionStates);
        }, 1000); // Check every 1 second for more responsive trading

        return () => clearInterval(autoTradingInterval);
    }, [analysisStrategies, isTradeInProgress, lastConditionStates]);

    // Handle symbol change
    const handleSymbolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSymbol = e.target.value;
        setSelectedSymbol(newSymbol);
        
        if (volatilityAnalyzerLoaded.current) {
            console.log(`Sending symbol update: ${newSymbol}`);
            
            // Send multiple formats to ensure compatibility
            window.postMessage({
                type: 'UPDATE_SYMBOL',
                symbol: newSymbol
            }, '*');
            
            // Clear analysis data when changing symbols
            setAnalysisData({});
            
            // Reset data refresh after symbol change
            if (hasSentInitCommands) {
                setTimeout(() => {
                    analysisStrategies.forEach(strategy => {
                        window.postMessage({
                            type: 'REQUEST_ANALYSIS',
                            strategyId: strategy.id
                        }, '*');
                    });
                }, 2000); // Wait 2 seconds for data to be ready
            }
        }
    };

    // Update the tick count change handler to allow empty inputs
    const handleTickCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        // Always update the input state for the UI
        setTickCountInput(value);
        
        // Only update the actual tick count when we have a valid number
        if (value !== '') {
            const newTickCount = parseInt(value, 10);
            // Ensure newTickCount is a positive number and within reasonable bounds if necessary
            if (!isNaN(newTickCount) && newTickCount > 0 && newTickCount <= 5000) { 
                setTickCount(newTickCount);
                
                if (volatilityAnalyzerLoaded.current) {
                    console.log(`Sending tick count update: ${newTickCount}`);
                    
                    window.postMessage({
                        type: 'UPDATE_TICK_COUNT',
                        tickCount: newTickCount,
                        count: newTickCount 
                    }, '*');
                    
                    setAnalysisData({});
                }
            }
        }
    };

    // Add a handler for tick count input blur
    const handleTickCountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let newTickCount = parseInt(value, 10);

        // If empty, invalid, or out of bounds, set a default value
        if (value === '' || isNaN(newTickCount) || newTickCount <= 0 || newTickCount > 5000) {
            const defaultTickCount = 120; // Default tick count value
            newTickCount = defaultTickCount;
        }
        
        setTickCount(newTickCount);
        setTickCountInput(newTickCount.toString());
            
        if (volatilityAnalyzerLoaded.current) {
            window.postMessage({
                type: 'UPDATE_TICK_COUNT',
                tickCount: newTickCount,
                count: newTickCount 
            }, '*');
            
            setAnalysisData({});
        }
    };

    // Update the handleSettingChange function to temporarily allow empty inputs
    const handleSettingChange = (strategyId: string, settingName: keyof TradeSettings, value: string) => {
        // First update UI state with the raw input value (which could be empty string)
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy =>
                strategy.id === strategyId
                    ? {
                          ...strategy,
                          settings: {
                              ...strategy.settings,
                              // Store the raw value in a temporary UI state
                              [`${settingName}Input`]: value, 
                              // Keep the actual value unchanged if input is empty
                              [settingName]: value === '' ? strategy.settings[settingName] : parseFloat(value),
                          },
                      }
                    : strategy
            )
        );
    };    // Add a function to handle blur events (when input loses focus)
    const handleInputBlur = (strategyId: string, settingName: keyof TradeSettings, value: string) => {
        const numericValue = parseFloat(value);
        
        // On blur, always set a valid numeric value (default to min values if empty)
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy => {
                if (strategy.id === strategyId) {
                    // Set appropriate default values based on the setting type
                    let finalValue = numericValue;
                    
                    if (value === '' || isNaN(numericValue)) {
                        if (settingName === 'stake') finalValue = 0.35; // Minimum stake
                        else if (settingName === 'ticks') finalValue = 1; // Minimum ticks
                        else if (settingName === 'martingaleMultiplier') finalValue = 1; // Minimum multiplier
                    }
                    
                    return {
                        ...strategy,
                        settings: {
                            ...strategy.settings,
                            [`${settingName}Input`]: finalValue.toString(), // Update the display value
                            [settingName]: finalValue, // Set the actual value
                        }
                    };
                }
                return strategy;
            })
        );
    };

    // Trading functions adapted from TradingHub
    const manageStake = (strategyId: string, action: 'init' | 'reset' | 'martingale' | 'get'): number => {
        const strategy = analysisStrategies.find(s => s.id === strategyId);
        if (!strategy) return 0.35;

        const currentStake = currentStakes[strategyId] || strategy.settings.stake;
        const losses = consecutiveLosses[strategyId] || 0;

        switch (action) {
            case 'init':
                console.log(`Initializing stake for strategy ${strategyId} to ${strategy.settings.stake}`);
                setCurrentStakes(prev => ({ ...prev, [strategyId]: strategy.settings.stake }));
                setConsecutiveLosses(prev => ({ ...prev, [strategyId]: 0 }));
                return strategy.settings.stake;
                
            case 'reset':
                console.log(`Resetting stake for strategy ${strategyId} from ${currentStake} to initial ${strategy.settings.stake}`);
                console.log(`Consecutive losses counter reset from ${losses} to 0`);
                
                setCurrentStakes(prev => ({ ...prev, [strategyId]: strategy.settings.stake }));
                setConsecutiveLosses(prev => ({ ...prev, [strategyId]: 0 }));
                
                // Store last win time for this strategy to prevent duplicate processing
                const strategyRefs = strategyRefsMap.current;
                if (!strategyRefs[strategyId]) strategyRefs[strategyId] = {};
                strategyRefs[strategyId].lastWinTime = Date.now();
                strategyRefs[strategyId].lastAction = 'reset';
                
                return strategy.settings.stake;
                
            case 'martingale':
                const strategyRef = strategyRefsMap.current[strategyId] || {};
                
                // Prevent duplicate martingale applications that can happen with rapid settlements
                if (strategyRef.lastAction === 'martingale' && 
                    strategyRef.lastWinTime && 
                    Date.now() - strategyRef.lastWinTime < 2000) {
                    console.warn(`Prevented duplicate martingale for strategy ${strategyId} - too soon after last application`);
                    return currentStake;
                }
                
                const maxLossCount = 10; // Cap at 10 consecutive losses for safety
                const newLosses = Math.min(losses + 1, maxLossCount);
                const multiplier = strategy.settings.martingaleMultiplier || 2;
                const newStake = strategy.settings.stake * Math.pow(multiplier, newLosses);
                
                console.log(`Martingale calculation details for strategy ${strategyId}:`);
                console.log(`- Base stake: ${strategy.settings.stake}`);
                console.log(`- Multiplier: ${multiplier}`);
                console.log(`- Previous loss count: ${losses}`);
                console.log(`- New loss count: ${newLosses}`);
                console.log(`- Formula: ${strategy.settings.stake} × ${multiplier}^${newLosses} = ${newStake}`);
                
                // Track the last martingale action to prevent duplicates
                if (!strategyRefsMap.current[strategyId]) strategyRefsMap.current[strategyId] = {};
                strategyRefsMap.current[strategyId].lastWinTime = Date.now();
                strategyRefsMap.current[strategyId].lastAction = 'martingale';
                
                setCurrentStakes(prev => ({ ...prev, [strategyId]: newStake }));
                setConsecutiveLosses(prev => ({ ...prev, [strategyId]: newLosses }));
                return newStake;
                
            case 'get':
                return currentStake;
                
            default:
                return currentStake;
        }
    };

    const prepareRunPanelForSmartTrading = () => {
        if (!run_panel.is_drawer_open) {
            run_panel.toggleDrawer(true);
        }
        run_panel.setActiveTabIndex(1);
        globalObserver.emit('bot.running');
        const new_session_id = `smartTrading_${Date.now()}`;
        setSessionRunId(new_session_id);
        globalObserver.emit('bot.started', new_session_id);
    };

    const executeSmartTrade = async (strategyId: string) => {
        if (isTradeInProgress) {
            console.log('Trade already in progress, skipping new trade request');
            return;
        }

        const strategy = analysisStrategies.find(s => s.id === strategyId);
        if (!strategy) return;

        const now = Date.now();
        const timeSinceLastTrade = now - lastTradeTime.current;
        
        if (timeSinceLastTrade < minimumTradeCooldown) {
            console.log(`Trade cooldown active for strategy ${strategyId}`);
            return;
        }

        try {
            setIsTradeInProgress(true);
            prepareRunPanelForSmartTrading();

            // Get the current stake for this strategy based on martingale history
            const currentTradeStake = manageStake(strategyId, 'get');
            const strategyConsecutiveLosses = consecutiveLosses[strategyId] || 0;
            
            console.log(`Starting trade for ${strategyId} with stake: ${currentTradeStake}`);
            console.log(`Current martingale state: Level=${strategyConsecutiveLosses}, Base=${strategy.settings.stake}`);
            
            // Update the strategy's active contract type for UI feedback
            setAnalysisStrategies(prev => prev.map(s => 
                s.id === strategyId 
                    ? { 
                        ...s, 
                        activeContractType: actionToUse,
                        currentStake: currentTradeStake
                      } 
                    : s
            ));
            const tradeId = `smart_${strategyId}_${Date.now()}`;
            
            setTradeCount(prev => prev + 1);
            lastTradeTime.current = now;

            console.log(`Starting smart trade: ${tradeId} with stake ${currentTradeStake} for strategy ${strategyId}`);

            // Determine contract type and parameters based on strategy
            let contractType = '';
            let barrier = '';
            let contractParameters: any = {
                amount: +currentTradeStake,
                basis: 'stake',
                currency: 'USD',
                duration: strategy.settings.ticks,
                duration_unit: 't',
                symbol: selectedSymbol,
            };            // Map strategy actions to contract types
            let actionToUse = '';
            
            // Determine which action property to use based on strategy
            if (strategyId === 'even-odd-2') {
                actionToUse = strategy.settings.patternAction || 'Even';
            } else if (strategyId === 'over-under-2') {
                actionToUse = strategy.settings.overUnderPatternAction || 'Over';
            } else {
                actionToUse = strategy.settings.conditionAction || '';
            }
              console.log(`Strategy ${strategyId} using action: ${actionToUse}`);
            
            // Add specific validation for Rise/Fall contracts
            if (actionToUse === 'Rise' || actionToUse === 'Fall') {
                console.log(`🚨 [RISE/FALL] Preparing ${actionToUse} contract with parameters:`, {
                    symbol: selectedSymbol,
                    amount: +currentTradeStake,
                    duration: strategy.settings.ticks,
                    duration_unit: 't'
                });
            }
              switch (actionToUse) {
                case 'Rise':
                    // TEMPORARY FIX: Use DIGITODD instead of CALL to test if CALL/PUT is causing disconnection
                    contractType = 'DIGITODD'; // was 'CALL'
                    console.log(`🚨 [TEMP FIX] Using DIGITODD instead of CALL for Rise to test disconnection issue`);
                    break;
                case 'Fall':
                    // TEMPORARY FIX: Use DIGITEVEN instead of PUT to test if CALL/PUT is causing disconnection  
                    contractType = 'DIGITEVEN'; // was 'PUT'
                    console.log(`🚨 [TEMP FIX] Using DIGITEVEN instead of PUT for Fall to test disconnection issue`);
                    break;
                case 'Even':
                    contractType = 'DIGITEVEN';
                    break;
                case 'Odd':
                    contractType = 'DIGITODD';
                    break;                case 'Over':
                    if (strategyId === 'over-under') {
                        // Use the trading barrier instead of analysis barrier
                        barrier = (strategy.settings.tradingBarrier || 5).toString();
                    } else if (strategyId === 'over-under-2') {
                        // Use the trading barrier instead of pattern analysis barrier
                        barrier = (strategy.settings.overUnderPatternTradingBarrier || 5).toString();
                    }
                    contractType = 'DIGITOVER';
                    contractParameters.barrier = barrier;
                    break;
                case 'Under':
                    if (strategyId === 'over-under') {
                        // Use the trading barrier instead of analysis barrier
                        barrier = (strategy.settings.tradingBarrier || 5).toString();
                    } else if (strategyId === 'over-under-2') {
                        // Use the trading barrier instead of pattern analysis barrier
                        barrier = (strategy.settings.overUnderPatternTradingBarrier || 5).toString();
                    }                    contractType = 'DIGITUNDER';
                    contractParameters.barrier = barrier;
                    break;
                case 'Matches':
                    barrier = (strategy.settings.conditionDigit || 5).toString();
                    contractType = 'DIGITMATCH';
                    contractParameters.barrier = barrier;
                    break;
                case 'Differs':
                    barrier = (strategy.settings.conditionDigit || 5).toString();
                    contractType = 'DIGITDIFF';
                    contractParameters.barrier = barrier;
                    break;
                default:
                    throw new Error(`Unknown contract action: ${actionToUse} for strategy ${strategyId}`);
            }

            contractParameters.contract_type = contractType;// Enhanced validation and logging for Rise/Fall contracts
            if (contractType === 'CALL' || contractType === 'PUT') {
                console.log(`🚨 [RISE/FALL] Final contract parameters:`, {
                    ...contractParameters,
                    action: actionToUse,
                    strategy: strategyId
                });
                
                // Validate required parameters for CALL/PUT
                const requiredParams = ['amount', 'basis', 'currency', 'duration', 'duration_unit', 'symbol', 'contract_type'];
                const missingParams = requiredParams.filter(param => !contractParameters[param]);
                
                if (missingParams.length > 0) {
                    throw new Error(`Missing required parameters for ${contractType}: ${missingParams.join(', ')}`);
                }
                
                // Ensure no invalid parameters for CALL/PUT (these contracts don't use barriers)
                if (contractParameters.barrier) {
                    console.log(`🚨 [RISE/FALL] Removing barrier parameter for ${contractType} contract`);
                    delete contractParameters.barrier;
                }
                
                // Add specific validation for Rise/Fall contracts
                // Ensure we're using the correct duration format
                if (contractParameters.duration_unit === 't' && contractParameters.duration < 1) {
                    console.error(`🚨 [RISE/FALL] Invalid duration: ${contractParameters.duration} ticks`);
                    contractParameters.duration = Math.max(1, contractParameters.duration);
                }
                
                // Ensure amount is valid
                if (contractParameters.amount < 0.35) {
                    console.error(`🚨 [RISE/FALL] Amount too low: ${contractParameters.amount}, setting to minimum 0.35`);
                    contractParameters.amount = 0.35;
                }
                
                console.log(`🚨 [RISE/FALL] Validated contract parameters:`, contractParameters);
            }

            // Create array to store all trade promises (for copy trading)
            const trades = [];            // Enhanced API call with specific error handling for Rise/Fall
            console.log(`🚨 [API CALL] Preparing to send buy request for ${contractType}`);
            
            const standardTradePromise = doUntilDone(() => {
                console.log(`🚨 [API CALL] Sending buy request:`, {
                    buy: 1,
                    price: contractParameters.amount,
                    parameters: contractParameters,
                });
                
                // Add additional safety checks for Rise/Fall contracts
                if (contractType === 'CALL' || contractType === 'PUT') {
                    console.log(`🚨 [SAFETY] Double-checking Rise/Fall API call structure`);
                    
                    // Ensure the API call structure is correct for Rise/Fall
                    const apiRequest = {
                        buy: 1,
                        price: contractParameters.amount,
                        parameters: {
                            ...contractParameters,
                            // Ensure contract_type is properly set
                            contract_type: contractType,
                        },
                    };
                    
                    console.log(`🚨 [SAFETY] Final API request for ${contractType}:`, apiRequest);
                    return api_base.api.send(apiRequest);
                }
                
                return api_base.api.send({
                    buy: 1,
                    price: contractParameters.amount,
                    parameters: contractParameters,
                });
            }, [], api_base);
            trades.push(standardTradePromise);

            // Check copy trading settings (adapted from TradingHub)
            if (client?.loginid) {
                const copyTradeEnabled = localStorage.getItem(`copytradeenabled_${client.loginid}`) === 'true';
                if (copyTradeEnabled) {
                    // Get tokens for copy trading
                    const tokensStr = localStorage.getItem(`extratokens_${client.loginid}`);
                    const tokens = tokensStr ? JSON.parse(tokensStr) : [];
                    
                    if (tokens.length > 0) {
                        const copyOption = {
                            buy_contract_for_multiple_accounts: '1',
                            price: contractParameters.amount,
                            tokens,
                            parameters: contractParameters
                        };
                        trades.push(doUntilDone(() => api_base.api.send(copyOption), [], api_base));
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
                                    price: contractParameters.amount,
                                    tokens: [realAccountToken],
                                    parameters: contractParameters
                                };
                                trades.push(doUntilDone(() => api_base.api.send(realOption), [], api_base));
                            }
                        } catch (e) {
                            console.error('Error copying to real account:', e);
                        }
                    }
                }
            }            // Execute all trades with enhanced error handling for Rise/Fall
            console.log(`🚨 [TRADE EXECUTION] About to execute ${trades.length} trade(s) for ${contractType}`);
            
            let results;
            try {
                results = await Promise.all(trades);
                console.log(`🚨 [TRADE EXECUTION] Received results:`, results);            } catch (error) {
                console.error(`🚨 [TRADE EXECUTION ERROR] Failed to execute trades:`, error);
                
                // Check if it's a connection issue
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (errorMessage?.includes('disconnected') || errorMessage?.includes('connection')) {
                    console.error(`🚨 [CONNECTION ERROR] Server disconnection detected during ${contractType} trade`);
                }
                
                throw error; // Re-throw to be caught by outer try-catch
            }
            
            const successfulTrades = results.filter(result => result && result.buy);
            console.log(`🚨 [TRADE RESULTS] ${successfulTrades.length} successful trades out of ${results.length} attempts`);

            if (successfulTrades.length > 0) {
                const result = successfulTrades[0]; // Use the main account result
                const buy = result.buy;
                
                const contractId = buy.contract_id;
                console.log(`🚨 [SUCCESS] Smart trade executed. Contract ID: ${contractId}, Strategy: ${strategyId}, Type: ${contractType}`);
                activeContractRef.current = contractId;                // Store detailed contract information for tracking and martingale
                setActiveContracts(prev => ({
                    ...prev,
                    [contractId]: { 
                        contract_id: contractId,
                        buy_price: contractParameters.amount,
                        status: 'open',
                        purchase_time: Date.now(),
                        strategy_id: strategyId,
                        contract_type: contractType,
                        symbol: contractParameters.symbol,
                        barrier: barrier,
                        duration: contractParameters.duration,
                        duration_unit: contractParameters.duration_unit,
                        // Store stake tracking info for martingale
                        initial_stake: strategy.settings.stake,
                        current_stake: currentTradeStake,
                        martingale_level: consecutiveLosses[strategyId] || 0,
                        martingale_multiplier: strategy.settings.martingaleMultiplier || 2,
                    }
                }));

                const contract_info = {
                    contract_id: buy.contract_id,
                    contract_type: contractType,
                    transaction_ids: { buy: buy.transaction_id },
                    buy_price: contractParameters.amount,
                    currency: contractParameters.currency,
                    symbol: contractParameters.symbol,
                    barrier: barrier,
                    date_start: Math.floor(Date.now() / 1000),
                    barrier_display_value: barrier,
                    contract_parameter: barrier,
                    parameter_type: strategyId,
                    entry_tick_time: Math.floor(Date.now() / 1000),
                    exit_tick_time: Math.floor(Date.now() / 1000) + contractParameters.duration,
                    run_id: sessionRunId,
                    display_name: `Smart Trading - ${strategy.name}`,
                    transaction_time: Math.floor(Date.now() / 1000),
                    underlying: contractParameters.symbol,
                    longcode: `Smart Trading: ${strategy.name} contract on ${contractParameters.symbol}`,
                    display_message: `Smart Trading: ${strategy.settings.conditionAction} on ${contractParameters.symbol}`,
                    strategy_id: strategyId,
                };

                globalObserver.emit('smart_trading.running');
                globalObserver.emit('bot.contract', contract_info);
                globalObserver.emit('bot.bot_ready');
                globalObserver.emit('contract.purchase_received', buy.contract_id);
                globalObserver.emit('contract.status', { 
                    id: 'contract.purchase',
                    data: contract_info,
                    buy,
                });

                if (transactions) {
                    transactions.onBotContractEvent(contract_info);
                }

                console.log(`Smart trade executed: ${contractType} for strategy ${strategyId}`);

                if (successfulTrades.length > 1) {
                    console.log(`Successfully placed ${successfulTrades.length} trades (including copy trades)`);
                }
            } else {
                console.error('Smart trade purchase failed: No buy response received');
                globalObserver.emit('ui.log.error', 'Smart trade purchase failed: No buy response received');
            }        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('🚨 [TRADE ERROR] Smart trade execution error:', error);
            
            // Check if it's a server disconnection specifically for Rise/Fall
            if (errorMessage?.includes('disconnected') || 
                errorMessage?.includes('connection') || 
                errorMessage?.includes('WebSocket') ||
                errorMessage?.includes('network')) {
                
                console.error(`🚨 [DISCONNECTION] Server disconnected during trade for strategy ${strategyId}`);
                console.error(`🚨 [DISCONNECTION] Error details:`, errorMessage);
                
                // Attempt to reconnect (if there's a reconnection function available)
                if (typeof (window as any).reconnectAPI === 'function') {
                    console.log(`🚨 [RECONNECTION] Attempting to reconnect API...`);
                    try {
                        (window as any).reconnectAPI();
                    } catch (reconnectError) {
                        console.error(`🚨 [RECONNECTION] Failed to reconnect:`, reconnectError);
                    }
                }
                  // Emit specific disconnection event
                globalObserver.emit('ui.log.error', `Server disconnected during trade. Please check connection.`);
                globalObserver.emit('smart_trading.disconnected', { strategy: strategyId });
            } else {
                console.error('🚨 [GENERAL ERROR] Smart trade execution error:', error);
                globalObserver.emit('ui.log.error', `Smart trade execution error: ${errorMessage}`);
            }
        } finally {
            setTimeout(() => {
                setIsTradeInProgress(false);
            }, 1000);
        }
    };

    // Update the barrier change handler to allow empty inputs
    const handleBarrierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        // Always update the barrier input state for the UI
        setBarrierInput(value);
        
        // Only update the actual barrier value and send API messages when we have a valid number
        if (value !== '') {
            const newBarrier = parseInt(value, 10);
            if (!isNaN(newBarrier) && newBarrier >= 0 && newBarrier <= 9) {
                setBarrierValue(newBarrier);
                
                if (volatilityAnalyzerLoaded.current) {
                    console.log(`Sending barrier update: ${newBarrier}`);
                    window.postMessage({
                        type: 'UPDATE_BARRIER',
                        barrier: newBarrier
                    }, '*');
                }
            }
        }
    };

    // Update the barrier blur handler to handle empty values
    const handleBarrierBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        // If empty, set a default value
        if (value === '') {
            const defaultBarrier = 5; // Default barrier value
            setBarrierValue(defaultBarrier);
            setBarrierInput(defaultBarrier.toString());
            
            if (volatilityAnalyzerLoaded.current) {
                window.postMessage({
                    type: 'UPDATE_BARRIER',
                    barrier: defaultBarrier
                }, '*');
            }
        }
    };

    // Remove the old handleContractTypeTrade function and replace with handleAutoTrade
    const handleAutoTrade = (strategyId: string) => {
        const strategy = analysisStrategies.find(s => s.id === strategyId);
        
        if (!strategy) return;
        
        const { activeContractType } = strategy;
        
        // If already trading, stop trading
        if (activeContractType) {
            setAnalysisStrategies(prevStrategies =>
                prevStrategies.map(s =>
                    s.id === strategyId
                        ? { ...s, activeContractType: null }
                        : s
                )
            );
        } else {
            // Start auto trading - use a default state to indicate trading is active
            setAnalysisStrategies(prevStrategies =>
                prevStrategies.map(s =>
                    s.id === strategyId
                        ? { ...s, activeContractType: 'auto' }
                        : s
                )
            );
        }
    };

    // Update the AnimatedPercentageBar component with improved UI and animations
    const AnimatedPercentageBar = ({ 
        leftValue, 
        rightValue, 
        leftLabel, 
        rightLabel, 
        leftClass = '', 
        rightClass = '' 
    }: { 
        leftValue: string | number;
        rightValue: string | number;
        leftLabel: string;
        rightLabel: string;
        leftClass?: string;
        rightClass?: string;
    }) => {
        // Store previous values to detect changes for animation
        const prevLeftValueRef = useRef<string | number>(leftValue);
        const prevRightValueRef = useRef<string | number>(rightValue);
        
        // State to track value changes for highlight animation
        const [leftHighlight, setLeftHighlight] = useState(false);
        const [rightHighlight, setRightHighlight] = useState(false);
        
        // Effect to detect value changes and trigger animations
        useEffect(() => {
            if (prevLeftValueRef.current !== leftValue) {
                setLeftHighlight(true);
                setTimeout(() => setLeftHighlight(false), 500);
            }
            
            if (prevRightValueRef.current !== rightValue) {
                setRightHighlight(true);
                setTimeout(() => setRightHighlight(false), 500);
            }
            
            prevLeftValueRef.current = leftValue;
            prevRightValueRef.current = rightValue;
        }, [leftValue, rightValue]);
        
        // Convert values to numbers if they're strings
        const leftNum = typeof leftValue === 'string' ? parseFloat(leftValue) : leftValue;
        const rightNum = typeof rightValue === 'string' ? parseFloat(rightValue) : rightValue;
        
        // Calculate percentages for bar widths
        const leftPercent = Math.min(Math.max(leftNum, 0), 100);
        const rightPercent = Math.min(Math.max(rightNum, 0), 100);
        
        return (
            <div className="animated-percentage-bar__container">
                {/* First row for the first value */}
                <div className="animated-percentage-bar__row">
                    <div className="animated-percentage-bar__label">{leftLabel}</div>
                    <div className="animated-percentage-bar__bar-container">
                        <div 
                            className={`animated-percentage-bar__bar animated-percentage-bar__bar--${leftClass}`}
                            style={{ width: `${leftPercent}%` }}
                        >
                            {leftPercent > 15 && (
                                <span className={`animated-percentage-bar__value ${leftHighlight ? 'highlight' : ''}`}>
                                    {leftValue}%
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Second row for the second value */}
                <div className="animated-percentage-bar__row">
                    <div className="animated-percentage-bar__label">{rightLabel}</div>
                    <div className="animated-percentage-bar__bar-container">
                        <div 
                            className={`animated-percentage-bar__bar animated-percentage-bar__bar--${rightClass}`}
                            style={{ width: `${rightPercent}%` }}
                        >
                            {rightPercent > 15 && (
                                <span className={`animated-percentage-bar__value ${rightHighlight ? 'highlight' : ''}`}>
                                    {rightValue}%
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Modify the renderRiseFallAnalysis function to include trading conditions
    const renderRiseFallAnalysis = (analysis: any, strategyId: string) => {
        const strategy = analysisStrategies.find(s => s.id === strategyId);
        if (!strategy) return null;
        
        return (
            <div className="analysis-data">
                {analysis.recommendation && (
                    <div className={`recommendation ${analysis.recommendation.toLowerCase()}`}>
                        <div className="recommendation-header">
                            <Text size="xs" weight="bold">{localize('Recommendation')}: {analysis.recommendation}</Text>
                            {analysis.confidence && (
                                <span className="confidence-badge">{analysis.confidence}%</span>
                            )}
                        </div>
                    </div>
                )}
                
                <AnimatedPercentageBar
                    leftValue={analysis.riseRatio || '50.00'}
                    rightValue={analysis.fallRatio || '50.00'}
                    leftLabel={localize('Rise')}
                    rightLabel={localize('Fall')}
                    leftClass="rise"
                    rightClass="fall"
                />
                
                {/* Add Trading Condition component */}
                <div className="trading-condition enabled">
                    <div className="condition-header">
                        <Text size="xs" weight="bold">{localize('Trading Condition')}</Text>
                    </div>
                    
                    <div className="condition-content">
                        <div className="condition-row">
                            <div className="condition-label">{localize('If')}</div>
                            <select
                                value={strategy.settings.conditionType || 'rise'}
                                onChange={(e) => handleConditionTypeChange(strategyId, e.target.value)}
                                className="condition-select"
                                disabled={!!strategy.activeContractType}
                            >
                                <option value="rise">{localize('Rise Prob')}</option>
                                <option value="fall">{localize('Fall Prob')}</option>
                            </select>
                            
                            <select
                                value={strategy.settings.conditionOperator || '>'}
                                onChange={(e) => handleConditionOperatorChange(strategyId, e.target.value)}
                                className="condition-select"
                                disabled={!!strategy.activeContractType}
                            >
                                <option value=">">{localize('>')}</option>
                                <option value=">=">{localize('≥')}</option>
                                <option value="=">{localize('=')}</option>
                                <option value="<=">{localize('≤')}</option>
                                <option value="<">{localize('<')}</option>
                            </select>
                            
                            <div className="condition-value-container">
                                <input 
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={strategy.settings.conditionValueInput !== undefined ? 
                                        strategy.settings.conditionValueInput : 
                                        strategy.settings.conditionValue || 65}
                                    onChange={(e) => handleConditionValueChange(strategyId, e.target.value)}
                                    onBlur={(e) => handleConditionValueBlur(strategyId, e.target.value)}
                                    className="condition-value"
                                    disabled={!!strategy.activeContractType}
                                />
                                <span className="condition-percent">%</span>
                            </div>
                        </div>
                        
                        <div className="condition-row">
                            <div className="condition-label">{localize('Then')}</div>
                            <select
                                value={strategy.settings.conditionAction || 'Rise'}
                                onChange={(e) => handleConditionActionChange(strategyId, e.target.value)}
                                className="condition-select action-select"
                                disabled={!!strategy.activeContractType}
                            >
                                <option value="Rise">{localize('Buy Rise')}</option>
                                <option value="Fall">{localize('Buy Fall')}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Add handler functions for the pattern condition (Even/Odd pattern card)
    const handlePatternDigitCountChange = (strategyId: string, value: string) => {
        // Store both the raw input and the parsed value
        const numValue = parseInt(value, 10);
        
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy =>
                strategy.id === strategyId
                    ? {
                          ...strategy,
                          settings: {
                              ...strategy.settings,
                              patternDigitCountInput: value,
                              patternDigitCount: !isNaN(numValue) ? Math.min(Math.max(numValue, 1), 10) : strategy.settings.patternDigitCount,
                          },
                      }
                    : strategy
            )
        );
    };

    const handlePatternDigitCountBlur = (strategyId: string, value: string) => {
        const numValue = parseInt(value, 10);
        
        // On blur, always set a valid numeric value
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy => {
                if (strategy.id === strategyId) {
                    // Set appropriate default value if invalid
                    let finalValue = numValue;
                    
                    if (value === '' || isNaN(numValue) || numValue < 1) {
                        finalValue = 3; // Default to 3 digits
                    } else if (numValue > 10) {
                        finalValue = 10; // Max 10 digits
                    }
                    
                    return {
                        ...strategy,
                        settings: {
                            ...strategy.settings,
                            patternDigitCountInput: finalValue.toString(),
                            patternDigitCount: finalValue,
                        }
                    };
                }
                return strategy;
            })
        );
    };

    const handlePatternTypeChange = (strategyId: string, value: string) => {
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy =>
                strategy.id === strategyId
                    ? {
                          ...strategy,
                          settings: {
                              ...strategy.settings,
                              patternType: value,
                          },
                      }
                    : strategy
            )
        );
    };

    const handlePatternActionChange = (strategyId: string, value: string) => {
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy =>
                strategy.id === strategyId
                    ? {
                          ...strategy,
                          settings: {
                              ...strategy.settings,
                              patternAction: value,
                          },
                      }
                    : strategy
            )
        );
    };

    // Add handler functions for the Over/Under pattern condition
    const handleOverUnderPatternDigitCountChange = (strategyId: string, value: string) => {
        // Store both the raw input and the parsed value
        const numValue = parseInt(value, 10);
        
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy =>
                strategy.id === strategyId
                    ? {
                          ...strategy,
                          settings: {
                              ...strategy.settings,
                              overUnderPatternDigitCountInput: value,
                              overUnderPatternDigitCount: !isNaN(numValue) ? 
                                  Math.min(Math.max(numValue, 1), 10) : 
                                  strategy.settings.overUnderPatternDigitCount,
                          },
                      }
                    : strategy
            )
        );
    };

    const handleOverUnderPatternDigitCountBlur = (strategyId: string, value: string) => {
        const numValue = parseInt(value, 10);
        
        // On blur, always set a valid numeric value
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy => {
                if (strategy.id === strategyId) {
                    // Set appropriate default value if invalid
                    let finalValue = numValue;
                    
                    if (value === '' || isNaN(numValue) || numValue < 1) {
                        finalValue = 3; // Default to 3 digits
                    } else if (numValue > 10) {
                        finalValue = 10; // Max 10 digits
                    }
                    
                    return {
                        ...strategy,
                        settings: {
                            ...strategy.settings,
                            overUnderPatternDigitCountInput: finalValue.toString(),
                            overUnderPatternDigitCount: finalValue,
                        }
                    };
                }
                return strategy;
            })
        );
    };

    const handleOverUnderPatternTypeChange = (strategyId: string, value: string) => {
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy =>
                strategy.id === strategyId
                    ? {
                          ...strategy,
                          settings: {
                              ...strategy.settings,
                              overUnderPatternType: value,
                          },
                      }
                    : strategy
            )
        );
    };

    const handleOverUnderPatternBarrierChange = (strategyId: string, value: string) => {
        // Store both the raw input and the parsed value
        const numValue = parseInt(value, 10);
        
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy =>
                strategy.id === strategyId
                    ? {
                          ...strategy,
                          settings: {
                              ...strategy.settings,
                              overUnderPatternBarrierInput: value,
                              overUnderPatternBarrier: !isNaN(numValue) ? 
                                  Math.min(Math.max(numValue, 0), 9) : 
                                  strategy.settings.overUnderPatternBarrier,
                          },
                      }
                    : strategy
            )
        );
    };

    const handleOverUnderPatternBarrierBlur = (strategyId: string, value: string) => {
        const numValue = parseInt(value, 10);
        
        // On blur, always set a valid numeric value
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy => {
                if (strategy.id === strategyId) {
                    // Set appropriate default value if invalid
                    let finalValue = numValue;
                    
                    if (value === '' || isNaN(numValue) || numValue < 0) {
                        finalValue = 5; // Default to 5
                    } else if (numValue > 9) {
                        finalValue = 9; // Max 9
                    }
                    
                    return {
                        ...strategy,
                        settings: {
                            ...strategy.settings,
                            overUnderPatternBarrierInput: finalValue.toString(),
                            overUnderPatternBarrier: finalValue,
                        }
                    };
                }
                return strategy;
            })
        );
    };

    const handleOverUnderPatternActionChange = (strategyId: string, value: string) => {
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy =>
                strategy.id === strategyId
                    ? {
                          ...strategy,
                          settings: {
                              ...strategy.settings,
                              overUnderPatternAction: value,
                          },
                      }
                    : strategy
            )
        );
    };

    // Update renderEvenOddAnalysis for both cards
    const renderEvenOddAnalysis = (analysis: any, strategyId: string) => {
        if (strategyId === 'even-odd-2') {
            // Even/Odd pattern card - adding the trading condition
            const strategy = analysisStrategies.find(s => s.id === strategyId);
            if (!strategy) return null;
            
            return (
                <div className="analysis-data">
                    <div className="digit-distribution">
                        <div className="distribution-header">
                            <Text size="xs" weight="bold">{localize('Last Digits Pattern')}</Text>
                        </div>
                        <div className="digit-sequence">
                            {analysis?.evenOddPattern ? (
                                // Use actual pattern if available
                                analysis.evenOddPattern.map((value: string, i: number) => {
                                    const digit = analysis.actualDigits[i];
                                    const isEven = value === 'E';
                                    return (
                                        <span key={i} className={`digit-label ${isEven ? 'even' : 'odd'}`} title={`Digit: ${digit}`}>
                                            {value}
                                        </span>
                                    );
                                })
                            ) : (
                                // Fallback to random data
                                Array.from({length: 10}, (_, i) => {
                                    const isEven = Math.random() > 0.5;
                                    return (
                                        <span key={i} className={`digit-label ${isEven ? 'even' : 'odd'}`}>
                                            {isEven ? 'E' : 'O'}
                                        </span>
                                    );
                                })
                            )}
                        </div>
                        <div className="distribution-note">
                            <Text size="2xs">{localize('Recent digit pattern (E=Even, O=Odd)')}</Text>
                        </div>
                    </div>
                    
                    {analysis?.streak && (
                        <div className="streak-indicator">
                            <Text size="xs">
                                {localize('Current streak')}: 
                                <span className="streak-count">
                                    {analysis.streak} {localize(analysis.streakType === 'even' ? 'Even' : 'Odd')}
                                </span>
                            </Text>
                        </div>
                    )}
                    
                    {/* Add Pattern Trading Condition component */}
                    <div className="trading-condition enabled">
                        <div className="condition-header">
                            <Text size="xs" weight="bold">{localize('Trading Condition')}</Text>
                        </div>
                        
                        <div className="condition-content">
                            <div className="condition-row">
                                <div className="condition-label">{localize('Check if the last')}</div>
                                <div className="condition-value-container">
                                    <input 
                                        type="number"
                                        min="1"
                                        max="10"
                                        step="1"
                                        value={strategy.settings.patternDigitCountInput !== undefined ? 
                                            strategy.settings.patternDigitCountInput : 
                                            strategy.settings.patternDigitCount || 3}
                                        onChange={(e) => handlePatternDigitCountChange(strategyId, e.target.value)}
                                        onBlur={(e) => handlePatternDigitCountBlur(strategyId, e.target.value)}
                                        className="condition-value digit-count-input"
                                        disabled={!!strategy.activeContractType}
                                    />
                                </div>
                                <div className="condition-label">{localize('digits are')}</div>
                                <select
                                    value={strategy.settings.patternType || 'even'}
                                    onChange={(e) => handlePatternTypeChange(strategyId, e.target.value)}
                                    className="condition-select"
                                    disabled={!!strategy.activeContractType}
                                >
                                    <option value="even">{localize('Even')}</option>
                                    <option value="odd">{localize('Odd')}</option>
                                </select>
                            </div>
                            
                            <div className="condition-row">
                                <div className="condition-label">{localize('Then')}</div>
                                <select
                                    value={strategy.settings.patternAction || 'Even'}
                                    onChange={(e) => handlePatternActionChange(strategyId, e.target.value)}
                                    className="condition-select action-select"
                                    disabled={!!strategy.activeContractType}
                                >
                                    <option value="Even">{localize('Buy Even')}</option>
                                    <option value="Odd">{localize('Buy Odd')}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            // First Even/Odd card - keep existing code with trading conditions
            const evenPercentage = analysis?.evenProbability || '50.00';
            const oddPercentage = analysis?.oddProbability || '50.00';
            
            // Find the current strategy object
            const strategy = analysisStrategies.find(s => s.id === strategyId);
            if (!strategy) return null;
            
            return (
                <div className="analysis-data">
                    {analysis?.recommendation && (
                        <div className={`recommendation ${analysis.recommendation?.toLowerCase() || ''}`}>
                            <div className="recommendation-header">
                                <Text size="xs" weight="bold">{localize('Recommendation')}: {analysis.recommendation}</Text>
                                {analysis?.confidence && (
                                    <span className="confidence-badge">{analysis.confidence}%</span>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <AnimatedPercentageBar
                        leftValue={evenPercentage}
                        rightValue={oddPercentage}
                        leftLabel={localize('Even')}
                        rightLabel={localize('Odd')}
                        leftClass="even"
                        rightClass="odd"
                    />
                    
                    {/* Add Trading Condition component */}
                    <div className="trading-condition enabled">
                        <div className="condition-header">
                            <Text size="xs" weight="bold">{localize('Trading Condition')}</Text>
                        </div>
                        
                        <div className="condition-content">
                            <div className="condition-row">
                                <div className="condition-label">{localize('If')}</div>
                                <select
                                    value={strategy.settings.conditionType || 'even'}
                                    onChange={(e) => handleConditionTypeChange(strategyId, e.target.value)}
                                    className="condition-select"
                                    disabled={!!strategy.activeContractType}
                                >
                                    <option value="even">{localize('Even Prob')}</option>
                                    <option value="odd">{localize('Odd Prob')}</option>
                                </select>
                                
                                <select
                                    value={strategy.settings.conditionOperator || '>'}
                                    onChange={(e) => handleConditionOperatorChange(strategyId, e.target.value)}
                                    className="condition-select"
                                    disabled={!!strategy.activeContractType}
                                >
                                    <option value=">">{localize('>')}</option>
                                    <option value=">=">{localize('≥')}</option>
                                    <option value="=">{localize('=')}</option>
                                    <option value="<=">{localize('≤')}</option>
                                    <option value="<">{localize('<')}</option>
                                </select>
                                
                                <div className="condition-value-container">
                                    <input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={strategy.settings.conditionValueInput !== undefined ? 
                                            strategy.settings.conditionValueInput : 
                                            strategy.settings.conditionValue || 60}
                                        onChange={(e) => handleConditionValueChange(strategyId, e.target.value)}
                                        onBlur={(e) => handleConditionValueBlur(strategyId, e.target.value)}
                                        className="condition-value"
                                        disabled={!!strategy.activeContractType}
                                    />
                                    <span className="condition-percent">%</span>
                                </div>
                            </div>
                            
                            <div className="condition-row">
                                <div className="condition-label">{localize('Then')}</div>
                                <select
                                    value={strategy.settings.conditionAction || 'Even'}
                                    onChange={(e) => handleConditionActionChange(strategyId, e.target.value)}
                                    className="condition-select action-select"
                                    disabled={!!strategy.activeContractType}
                                >
                                    <option value="Even">{localize('Buy Even')}</option>
                                    <option value="Odd">{localize('Buy Odd')}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    };

    // Update the Over/Under pattern display in renderOverUnderAnalysis function
    const renderOverUnderAnalysis = (analysis: any, strategyId: string) => {
        if (strategyId === 'over-under-2') {
            // Over/Under pattern card - adding the trading condition
            const strategy = analysisStrategies.find(s => s.id === strategyId);
            if (!strategy) return null;
            
            // Get the barrier value from strategy settings (independent from over-under-1)
            const displayBarrier = strategy.settings.overUnderPatternBarrier || 5;
            
            return (
                <div className="analysis-data">
                    <div className="digit-distribution">
                        <div className="distribution-header">
                            <Text size="xs" weight="bold">{localize('Last Digits Pattern')}</Text>
                        </div>
                        <div className="digit-sequence">
                            {analysis?.actualDigits ? (
                                // Use actual digits from analysis data
                                analysis.actualDigits.map((digit: number, i: number) => {
                                    // Classify the digit based on the barrier value
                                    const isOver = digit > displayBarrier;
                                    const isEqual = digit === displayBarrier;
                                    const isUnder = digit < displayBarrier;
                                    
                                    // Determine the display class
                                    const displayClass = isOver ? 'over' : isEqual ? 'equal' : 'under';
                                    
                                    // Determine the pattern indicator (O, E, U)
                                    const patternIndicator = isOver ? 'O' : isEqual ? 'E' : 'U';
                                    
                                    // Create detailed tooltip
                                    const tooltipText = `Digit: ${digit} (${isOver ? '>' : isEqual ? '=' : '<'}${displayBarrier})`;
                                    
                                    return (
                                        <span 
                                            key={i} 
                                            className={`digit-label ${displayClass}`}
                                            title={tooltipText}
                                        >
                                            {digit}<sub>{patternIndicator}</sub>
                                        </span>
                                    );
                                })
                            ) : (
                                // Fallback to random data when no actual digits available
                                Array.from({length: 10}, (_, i) => {
                                    // Generate a random digit 0-9
                                    const randomDigit = Math.floor(Math.random() * 10);
                                    const isOver = randomDigit > displayBarrier;
                                    const isEqual = randomDigit === displayBarrier;
                                    const displayClass = isOver ? 'over' : isEqual ? 'equal' : 'under';
                                    const patternIndicator = isOver ? 'O' : isEqual ? 'E' : 'U';
                                    
                                    return (
                                        <span 
                                            key={i} 
                                            className={`digit-label ${displayClass}`}
                                            title={`Digit: ${randomDigit} (${isOver ? '>' : isEqual ? '=' : '<'}${displayBarrier})`}
                                        >
                                            {randomDigit}<sub>{patternIndicator}</sub>
                                        </span>
                                    );
                                })
                            )}
                        </div>
                        <div className="distribution-note">
                            <Text size="2xs">
                                {localize('O=Over (>{{barrier}}), E=Equal (={{barrier}}), U=Under (<{{barrier}})', { barrier: displayBarrier })}
                            </Text>
                        </div>
                    </div>

                    {/* Add streak indicator */}
                    {analysis?.streak && (
                        <div className="streak-indicator">
                            <Text size="xs">
                                {localize('Current streak')}: 
                                <span className="streak-count">
                                    {analysis.streak} {localize(
                                        analysis.streakType === 'over' 
                                            ? 'Over' 
                                            : analysis.streakType === 'equal' 
                                                ? 'Equal' 
                                                : 'Under'
                                    )}
                                </span>
                            </Text>
                        </div>
                    )}

                    <div className="digit-frequency">
                        <div className="digit-grid">
                            {Array.from({length: 10}, (_, i) => {
                                // Use the strategy's own barrier for classification
                                const isOver = i > displayBarrier;
                                const isEqual = i === displayBarrier;
                                const isUnder = i < displayBarrier;
                                const percentage = analysis?.digitPercentages ? 
                                    parseFloat(analysis.digitPercentages[i]) : 
                                    Math.floor(Math.random() * 5) + 8;
                                    
                                return (
                                    <span 
                                        key={i} 
                                        className={`digit-box ${isOver ? 'over' : isEqual ? 'equal' : 'under'}`}
                                        title={`Frequency: ${percentage}%`}
                                    >
                                        <span className="digit-value">{i}</span>
                                        <span className="digit-freq">{percentage}%</span>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Trading Condition component remains unchanged */}
                    <div className="trading-condition enabled">
                        <div className="condition-header">
                            <Text size="xs" weight="bold">{localize('Trading Condition')}</Text>
                        </div>
                        
                        <div className="condition-content">
                            <div className="condition-row">
                                <div className="condition-label">{localize('Check if the last')}</div>
                                <div className="condition-value-container">
                                    <input 
                                        type="number"
                                        min="1"
                                        max="10"
                                        step="1"
                                        value={strategy.settings.overUnderPatternDigitCountInput !== undefined ? 
                                            strategy.settings.overUnderPatternDigitCountInput : 
                                            strategy.settings.overUnderPatternDigitCount || 3}
                                        onChange={(e) => handleOverUnderPatternDigitCountChange(strategyId, e.target.value)}
                                        onBlur={(e) => handleOverUnderPatternDigitCountBlur(strategyId, e.target.value)}
                                        className="condition-value digit-count-input"
                                        disabled={!!strategy.activeContractType}
                                    />
                                </div>
                                <div className="condition-label">{localize('digits are')}</div>
                                <select
                                    value={strategy.settings.overUnderPatternType || 'over'}
                                    onChange={(e) => handleOverUnderPatternTypeChange(strategyId, e.target.value)}
                                    className="condition-select"
                                    disabled={!!strategy.activeContractType}
                                >
                                    <option value="over">{localize('Over')}</option>
                                    <option value="equals">{localize('Equal')}</option>
                                    <option value="under">{localize('Under')}</option>
                                </select>
                                <div className="condition-value-container">
                                    <input 
                                        type="number"
                                        min="0"
                                        max="9"
                                        step="1"
                                        value={strategy.settings.overUnderPatternBarrierInput !== undefined ? 
                                            strategy.settings.overUnderPatternBarrierInput : 
                                            strategy.settings.overUnderPatternBarrier || 5}
                                        onChange={(e) => handleOverUnderPatternBarrierChange(strategyId, e.target.value)}
                                        onBlur={(e) => handleOverUnderPatternBarrierBlur(strategyId, e.target.value)}
                                        className="condition-value barrier-input"
                                        disabled={!!strategy.activeContractType}
                                    />
                                </div>
                            </div>
                              <div className="condition-row">
                                <div className="condition-label">{localize('Then')}</div>
                                <select
                                    value={strategy.settings.overUnderPatternAction || 'Over'}
                                    onChange={(e) => handleOverUnderPatternActionChange(strategyId, e.target.value)}
                                    className="condition-select action-select"
                                    disabled={!!strategy.activeContractType}
                                >
                                    <option value="Over">{localize('Buy Over')}</option>
                                    <option value="Equals">{localize('Buy Equals')}</option>
                                    <option value="Under">{localize('Buy Under')}</option>
                                </select>
                                
                                <div className="condition-label">{localize('digit')}</div>
                                <div className="condition-value-container">
                                    <input 
                                        type="number"
                                        min="0"
                                        max="9"
                                        step="1"
                                        value={strategy.settings.overUnderPatternTradingBarrierInput !== undefined ? 
                                            strategy.settings.overUnderPatternTradingBarrierInput : 
                                            strategy.settings.overUnderPatternTradingBarrier || 5}
                                        onChange={(e) => handleOverUnderPatternTradingBarrierChange(strategyId, e.target.value)}
                                        onBlur={(e) => handleOverUnderPatternTradingBarrierBlur(strategyId, e.target.value)}
                                        className="condition-value trading-barrier-input"
                                        disabled={!!strategy.activeContractType}
                                        title={localize('Trading barrier digit (independent from pattern analysis barrier)')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            // First Over/Under card - no changes needed here
            const overPercentage = analysis?.overProbability || '50.00';
            const underPercentage = analysis?.underProbability || '50.00';
            
            // Find the current strategy object
            const strategy = analysisStrategies.find(s => s.id === strategyId);
            if (!strategy) return null;
            
            return (
                <div className="analysis-data">
                    <div className="barrier-input-container">
                        <label htmlFor="barrier-value">{localize('Barrier')}:</label>
                        <input 
                            id="barrier-value"
                            type="number"
                            min="0"
                            max="9"
                            value={barrierInput}
                            onChange={handleBarrierChange}
                            onBlur={handleBarrierBlur}
                            className="barrier-input"
                        />
                        <div className="barrier-explanation">
                            <Text size="2xs">
                                {localize('Under')}: 0-{barrierValue-1}, {localize('Equals')}: {barrierValue}, {localize('Over')}: {barrierValue+1}-9
                            </Text>
                        </div>
                    </div>
                    
                    {analysis?.recommendation && (
                        <div className={`recommendation ${analysis.recommendation?.toLowerCase() || ''}`}>
                            <div className="recommendation-header">
                                <Text size="xs" weight="bold">{localize('Recommendation')}: {analysis.recommendation}</Text>
                                {analysis?.confidence && (
                                    <span className="confidence-badge">{analysis.confidence}%</span>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <AnimatedPercentageBar
                        leftValue={overPercentage}
                        rightValue={underPercentage}
                        leftLabel={localize('Over')}
                        rightLabel={localize('Under')}
                        leftClass="over"
                        rightClass="under"
                    />
                    
                    {/* Add Trading Condition component */}
                    <div className="trading-condition enabled">
                        <div className="condition-header">
                            <Text size="xs" weight="bold">{localize('Trading Condition')}</Text>
                        </div>
                        
                        <div className="condition-content">
                            <div className="condition-row">
                                <div className="condition-label">{localize('If')}</div>
                                <select
                                    value={strategy.settings.conditionType || 'over'}
                                    onChange={(e) => handleConditionTypeChange(strategyId, e.target.value)}
                                    className="condition-select"
                                    disabled={!!strategy.activeContractType}
                                >
                                    <option value="over">{localize('Over Prob')}</option>
                                    <option value="equals">{localize('Equals Prob')}</option>
                                    <option value="under">{localize('Under Prob')}</option>
                                </select>
                                
                                <select
                                    value={strategy.settings.conditionOperator || '>'}
                                    onChange={(e) => handleConditionOperatorChange(strategyId, e.target.value)}
                                    className="condition-select"
                                    disabled={!!strategy.activeContractType}
                                >
                                    <option value=">">{localize('>')}</option>
                                    <option value=">=">{localize('≥')}</option>
                                    <option value="=">{localize('=')}</option>
                                    <option value="<=">{localize('≤')}</option>
                                    <option value="<">{localize('<')}</option>
                                </select>
                                
                                <div className="condition-value-container">
                                    <input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={strategy.settings.conditionValueInput !== undefined ? 
                                            strategy.settings.conditionValueInput : 
                                            strategy.settings.conditionValue || 55}
                                        onChange={(e) => handleConditionValueChange(strategyId, e.target.value)}
                                        onBlur={(e) => handleConditionValueBlur(strategyId, e.target.value)}
                                        className="condition-value"
                                        disabled={!!strategy.activeContractType}
                                    />
                                    <span className="condition-percent">%</span>
                                </div>
                            </div>
                              <div className="condition-row">
                                <div className="condition-label">{localize('Then')}</div>
                                <select
                                    value={strategy.settings.conditionAction || 'Over'}
                                    onChange={(e) => handleConditionActionChange(strategyId, e.target.value)}
                                    className="condition-select action-select"
                                    disabled={!!strategy.activeContractType}
                                >
                                    <option value="Over">{localize('Buy Over')}</option>
                                    <option value="Under">{localize('Buy Under')}</option>
                                </select>
                                
                                <div className="condition-label">{localize('digit')}</div>
                                <div className="condition-value-container">
                                    <input 
                                        type="number"
                                        min="0"
                                        max="9"
                                        step="1"
                                        value={strategy.settings.tradingBarrierInput !== undefined ? 
                                            strategy.settings.tradingBarrierInput : 
                                            strategy.settings.tradingBarrier || 5}
                                        onChange={(e) => handleTradingBarrierChange(strategyId, e.target.value)}
                                        onBlur={(e) => handleTradingBarrierBlur(strategyId, e.target.value)}
                                        className="condition-value trading-barrier-input"
                                        disabled={!!strategy.activeContractType}
                                        title={localize('Trading barrier digit (independent from analysis barrier)')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    };

    // Render Matches/Differs analysis
    const renderMatchesDiffersAnalysis = (analysis: any, strategyId: string) => {
        // Find the current strategy object
        const strategy = analysisStrategies.find(s => s.id === strategyId);
        if (!strategy) return null;
        
        // Get the selected digit or use a default
        const selectedDigit = strategy.settings.conditionDigit !== undefined ? strategy.settings.conditionDigit : 5;
        
        return (
            <div className="analysis-data">
                {analysis.recommendation && (
                    <div className={`recommendation ${analysis.recommendation?.toLowerCase()}`}>
                        <div className="recommendation-header">
                            <Text size="xs" weight="bold">
                                {localize('{{recommendation}} digit {{target}}', { 
                                    recommendation: analysis.recommendation,
                                    target: analysis.target !== undefined ? analysis.target : ''
                            })}
                            </Text>
                            {analysis.confidence && (
                                <span className="confidence-badge">{analysis.confidence}%</span>
                            )}
                        </div>
                    </div>
                )}
                
                <div className="digit-frequency-display">
                    {/* Digital frequency visualization would go here */}
                    <div className="digit-freq-bars">
                        {Array.from({length: 10}, (_, i) => {
                            // Highlight the selected digit
                            const isSelected = i === selectedDigit;
                            const height = analysis?.digitProbabilities?.[i] || 
                                Math.floor(Math.random() * 50 + 10);
                            
                            return (
                                <div key={i} className={`digit-freq-item ${isSelected ? 'selected-digit' : ''}`}>
                                    <div 
                                        className="digit-freq-bar" 
                                        style={{
                                            height: `${height}%`,
                                            backgroundColor: isSelected ? 'var(--brand-red-coral)' : undefined
                                        }}
                                    ></div>
                                    <div className="digit-freq-label">{i}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                {/* Add Trading Condition component */}
                <div className="trading-condition enabled">
                    <div className="condition-header">
                        <Text size="xs" weight="bold">{localize('Trading Condition')}</Text>
                    </div>
                    
                    <div className="condition-content">
                        <div className="condition-row">
                            <div className="condition-label">{localize('If')}</div>
                            <select
                                value={strategy.settings.conditionType || 'matches'}
                                onChange={(e) => handleConditionTypeChange(strategyId, e.target.value)}
                                className="condition-select"
                                disabled={!!strategy.activeContractType}
                            >
                                <option value="matches">{localize('Matches Prob')}</option>
                                <option value="differs">{localize('Differs Prob')}</option>
                            </select>
                            
                            <div className="condition-label">{localize('for')}</div>
                            <div className="condition-value-container">
                                <input 
                                    type="number"
                                    min="0"
                                    max="9"
                                    step="1"
                                    value={strategy.settings.conditionDigit !== undefined ? 
                                        strategy.settings.conditionDigit : 5}
                                    onChange={(e) => handleConditionDigitChange(strategyId, e.target.value)}
                                    className="condition-value digit-input"
                                    disabled={!!strategy.activeContractType}
                                />
                            </div>
                            
                            <select
                                value={strategy.settings.conditionOperator || '>'}
                                onChange={(e) => handleConditionOperatorChange(strategyId, e.target.value)}
                                className="condition-select"
                                disabled={!!strategy.activeContractType}
                            >
                                <option value=">">{localize('>')}</option>
                                <option value=">=">{localize('≥')}</option>
                                <option value="=">{localize('=')}</option>
                                <option value="<=">{localize('≤')}</option>
                                <option value="<">{localize('<')}</option>
                            </select>
                            
                            <div className="condition-value-container">
                                <input 
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={strategy.settings.conditionValueInput !== undefined ? 
                                        strategy.settings.conditionValueInput : 
                                        strategy.settings.conditionValue || 55}
                                    onChange={(e) => handleConditionValueChange(strategyId, e.target.value)}
                                    onBlur={(e) => handleConditionValueBlur(strategyId, e.target.value)}
                                    className="condition-value"
                                    disabled={!!strategy.activeContractType}
                                />
                                <span className="condition-percent">%</span>
                            </div>
                        </div>
                        
                        <div className="condition-row">
                            <div className="condition-label">{localize('Then')}</div>
                            <select
                                value={strategy.settings.conditionAction || 'Matches'}
                                onChange={(e) => handleConditionActionChange(strategyId, e.target.value)}
                                className="condition-select action-select"
                                disabled={!!strategy.activeContractType}
                            >
                                <option value="Matches">{localize('Buy Matches')}</option>
                                <option value="Differs">{localize('Buy Differs')}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Add the missing handler functions for conditional controls
    const handleConditionTypeChange = (strategyId: string, value: string) => {
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy =>
                strategy.id === strategyId
                    ? {
                          ...strategy,
                          settings: {
                              ...strategy.settings,
                              conditionType: value,
                          },
                      }
                    : strategy
            )
        );
    };

    const handleConditionOperatorChange = (strategyId: string, value: string) => {
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy =>
                strategy.id === strategyId
                    ? {
                          ...strategy,
                          settings: {
                              ...strategy.settings,
                              conditionOperator: value,
                          },
                      }
                    : strategy
            )
        );
    };

    const handleConditionValueChange = (strategyId: string, value: string) => {
        // Store both the raw input and the parsed value
        const numValue = parseFloat(value);
        
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy =>
                strategy.id === strategyId
                    ? {
                          ...strategy,
                          settings: {
                              ...strategy.settings,
                              conditionValueInput: value,
                              conditionValue: !isNaN(numValue) ? Math.min(Math.max(numValue, 0), 100) : strategy.settings.conditionValue,
                          },
                      }
                    : strategy
            )
        );
    };

    const handleConditionValueBlur = (strategyId: string, value: string) => {
        const numValue = parseFloat(value);
        
        // On blur, always set a valid numeric value
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy => {
                if (strategy.id === strategyId) {
                    // Set appropriate default value if invalid
                    let finalValue = numValue;
                    
                    if (value === '' || isNaN(numValue) || numValue < 0) {
                        finalValue = 55; // Default to 55%
                    } else if (numValue > 100) {
                        finalValue = 100; // Max 100%
                    }
                    
                    return {
                        ...strategy,
                        settings: {
                            ...strategy.settings,
                            conditionValueInput: finalValue.toString(),
                            conditionValue: finalValue,
                        }
                    };
                }
                return strategy;
            })
        );
    };

    const handleConditionActionChange = (strategyId: string, value: string) => {
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy =>
                strategy.id === strategyId
                    ? {
                          ...strategy,
                          settings: {
                              ...strategy.settings,
                              conditionAction: value,
                          },
                      }
                    : strategy
            )
        );
    };    const handleConditionDigitChange = (strategyId: string, value: string) => {
        const numValue = parseInt(value, 10);
        
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy => {
                if (strategy.id === strategyId) {
                    // If the value is valid, update it; otherwise keep the old value
                    const newDigit = !isNaN(numValue) ? 
                        Math.min(Math.max(numValue, 0), 9) : // Clamp between 0 and 9
                        strategy.settings.conditionDigit || 5; // Default to 5
                        
                    return {
                        ...strategy,
                        settings: {
                            ...strategy.settings,
                            conditionDigit: newDigit,
                        },
                    };
                }
                return strategy;
            })
        );
    };

    // Trading barrier handlers for over/under cards
    const handleTradingBarrierChange = (strategyId: string, value: string) => {
        const numValue = parseInt(value, 10);
        
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy =>
                strategy.id === strategyId
                    ? {
                          ...strategy,
                          settings: {
                              ...strategy.settings,
                              tradingBarrierInput: value,
                              tradingBarrier: !isNaN(numValue) ? Math.min(Math.max(numValue, 0), 9) : strategy.settings.tradingBarrier,
                          },
                      }
                    : strategy
            )
        );
    };

    const handleTradingBarrierBlur = (strategyId: string, value: string) => {
        const numValue = parseInt(value, 10);
        
        // On blur, always set a valid numeric value
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy => {
                if (strategy.id === strategyId) {
                    // Set appropriate default value if invalid
                    let finalValue = numValue;
                    
                    if (value === '' || isNaN(numValue) || numValue < 0) {
                        finalValue = 5; // Default to 5
                    } else if (numValue > 9) {
                        finalValue = 9; // Max 9
                    }
                    
                    return {
                        ...strategy,
                        settings: {
                            ...strategy.settings,
                            tradingBarrierInput: finalValue.toString(),
                            tradingBarrier: finalValue,
                        }
                    };
                }
                return strategy;
            })        );
    };

    // Over/Under Pattern Trading barrier handlers for over-under-2 cards
    const handleOverUnderPatternTradingBarrierChange = (strategyId: string, value: string) => {
        const numValue = parseInt(value, 10);
        
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy =>
                strategy.id === strategyId
                    ? {
                          ...strategy,
                          settings: {
                              ...strategy.settings,
                              overUnderPatternTradingBarrierInput: value,
                              overUnderPatternTradingBarrier: !isNaN(numValue) ? Math.min(Math.max(numValue, 0), 9) : strategy.settings.overUnderPatternTradingBarrier,
                          },
                      }
                    : strategy
            )
        );
    };

    const handleOverUnderPatternTradingBarrierBlur = (strategyId: string, value: string) => {
        const numValue = parseInt(value, 10);
        
        // On blur, always set a valid numeric value
        setAnalysisStrategies(prevStrategies =>
            prevStrategies.map(strategy => {
                if (strategy.id === strategyId) {
                    // Set appropriate default value if invalid
                    let finalValue = numValue;
                    
                    if (value === '' || isNaN(numValue) || numValue < 0) {
                        finalValue = 5; // Default to 5
                    } else if (numValue > 9) {
                        finalValue = 9; // Max 9
                    }
                    
                    return {
                        ...strategy,
                        settings: {
                            ...strategy.settings,
                            overUnderPatternTradingBarrierInput: finalValue.toString(),
                            overUnderPatternTradingBarrier: finalValue,
                        }
                    };
                }
                return strategy;
            })
        );
    };

    // Add these at the top of the component's render section
    const symbolOptions = [
        { value: 'R_10', label: 'Volatility 10 Index' },
        { value: '1HZ10V', label: 'Volatility 10 (1s) Index' },
        { value: 'R_25', label: 'Volatility 25 Index' },
        { value: '1HZ25V', label: 'Volatility 25 (1s) Index' },
        { value: 'R_50', label: 'Volatility 50 Index' },
        { value: '1HZ50V', label: 'Volatility 50 (1s) Index' },
        { value: 'R_75', label: 'Volatility 75 Index' },
        { value: '1HZ75V', label: 'Volatility 75 (1s) Index' },
        { value: 'R_100', label: 'Volatility 100 Index' },
        { value: '1HZ100V', label: 'Volatility 100 (1s) Index' },
        { value: 'JD10', label: 'Jump 10 Index' },
        { value: 'JD25', label: 'Jump 25 Index' },
        { value: 'JD50', label: 'Jump 50 Index' },
        { value: 'JD100', label: 'Jump 100 Index' }
    ];

    // Render analysis content based on available data
    const renderAnalysisContent = (strategyId: string) => {
        const analysis = analysisData[strategyId];
        
        if (!analysis) {
            return (
                <Text size="xs" color="less-prominent">
                    {localize('Analyzing market data for this strategy...')}
                </Text>
            );
        }

        if (strategyId.includes('rise-fall')) {
            return renderRiseFallAnalysis(analysis, strategyId);
        } else if (strategyId.includes('even-odd')) {
            return renderEvenOddAnalysis(analysis, strategyId);
        } else if (strategyId.includes('over-under')) {
            return renderOverUnderAnalysis(analysis, strategyId);
        } else if (strategyId.includes('matches-differs')) {
            return renderMatchesDiffersAnalysis(analysis, strategyId);
        }

        return (
            <Text size="xs" color="less-prominent">
                {localize('Analysis data for this strategy will appear here.')}
            </Text>
        );
    };    // Add a debug button component for troubleshooting
    const DebugButton = () => {
        if (process.env.NODE_ENV === 'production') return null;
        
        return (
            <div style={{ 
                position: 'fixed', 
                bottom: '10px', 
                right: '10px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
            }}>
                <button 
                    onClick={() => {
                        console.log('🔍 Debug: Current state:', {
                            hasAnalyzer: volatilityAnalyzerLoaded.current,
                            selectedSymbol,
                            tickCount,
                            tickCountInput,
                            barrierValue,
                            barrierInput,
                            currentPrice,
                            analysisData,
                            activeStrategies: analysisStrategies.filter(s => s.activeContractType).map(s => s.id)
                        });
                        
                        // Check conditions for all strategies
                        analysisStrategies.forEach(strategy => {
                            const hasData = !!analysisData[strategy.id];
                            const conditionMet = hasData ? isConditionMet(strategy.id) : false;
                            console.log(`Strategy ${strategy.id}: Data=${hasData}, Active=${!!strategy.activeContractType}, Condition=${conditionMet}`);
                        });
                    }}
                    style={{ 
                        padding: '5px 10px',
                        background: '#ff7043',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                >
                    Debug
                </button>
                
                <button 
                    onClick={() => {
                        // Force request status
                        window.postMessage({ type: 'REQUEST_STATUS' }, '*');
                        
                        // Force refresh all data
                        analysisStrategies.forEach(strategy => {
                            window.postMessage({
                                type: 'REQUEST_ANALYSIS',
                                strategyId: strategy.id
                            }, '*');
                        });
                    }}
                    style={{ 
                        padding: '5px 10px',
                        background: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                >
                    Refresh
                </button>
            </div>
        );
    };

    // Add a more robust reconnect function
    const reconnectAnalyzer = () => {
        console.log('Manually reconnecting analyzer');
        
        if (window.volatilityAnalyzer && window.volatilityAnalyzer.reconnect) {
            window.volatilityAnalyzer.reconnect();
        }
        
        // Clear analysis data
        setAnalysisData({});
        
        // Re-send configuration with delay to ensure connection is established
        setTimeout(() => {
            console.log('Re-sending configuration after reconnect');
            
            window.postMessage({
                type: 'UPDATE_SYMBOL',
                symbol: selectedSymbol
            }, '*');
            
            setTimeout(() => {
                window.postMessage({
                    type: 'UPDATE_TICK_COUNT',
                    tickCount: tickCount,
                    count: tickCount // For compatibility
                }, '*');
                
                setTimeout(() => {
                    window.postMessage({
                        type: 'UPDATE_BARRIER',
                        barrier: barrierValue
                    }, '*');
                    
                    // Force refresh analysis data
                    analysisStrategies.forEach(strategy => {
                        window.postMessage({
                            type: 'REQUEST_ANALYSIS',
                            strategyId: strategy.id
                        }, '*');
                    });
                }, 500);
            }, 500);
        }, 1000);
    };    // helper to check if this strategy's action matches the live recommendation
    const isConditionMet = (strategyId: string) => {
        const strategy = analysisStrategies.find(s => s.id === strategyId);
        const analysis = analysisData[strategyId];
        
        if (!strategy || !analysis) {
            console.log(`No strategy or analysis data for ${strategyId}:`, { 
                strategy: !!strategy, 
                analysis: !!analysis,
                analysisDataKeys: Object.keys(analysisData),
                availableStrategies: analysisStrategies.map(s => s.id)
            });
            return false;
        }

        const { conditionType, conditionOperator, conditionValue } = strategy.settings;// rise/fall card
        if (strategyId === 'rise-fall') {
            console.log(`📈 [DETAILED] Rise/Fall analysis data:`, analysis);
            console.log(`📈 [DETAILED] Rise/Fall settings:`, { conditionType, conditionOperator, conditionValue });
            
            const riseRatio = parseFloat(analysis.riseRatio || '0');
            const fallRatio = parseFloat(analysis.fallRatio || '0');
            const metric = conditionType === 'rise' ? riseRatio : fallRatio;
            
            console.log(`📈 [DETAILED] Rise ratio: ${riseRatio}%, Fall ratio: ${fallRatio}%`);
            console.log(`📈 [DETAILED] Using ${conditionType} metric: ${metric}%`);
            console.log(`📈 [DETAILED] Comparing: ${metric} ${conditionOperator} ${conditionValue}`);
            
            const result = (() => {
                switch (conditionOperator) {
                    case '>':  
                        const gtResult = metric > (conditionValue ?? 0);
                        console.log(`📈 [DETAILED] ${metric} > ${conditionValue} = ${gtResult}`);
                        return gtResult;
                    case '<':  
                        const ltResult = metric < (conditionValue ?? 0);
                        console.log(`📈 [DETAILED] ${metric} < ${conditionValue} = ${ltResult}`);
                        return ltResult;
                    case '>=': 
                        const gteResult = metric >= (conditionValue ?? 0);
                        console.log(`📈 [DETAILED] ${metric} >= ${conditionValue} = ${gteResult}`);
                        return gteResult;
                    case '<=': 
                        const lteResult = metric <= (conditionValue ?? 0);
                        console.log(`📈 [DETAILED] ${metric} <= ${conditionValue} = ${lteResult}`);
                        return lteResult;
                    case '=':  
                        const eqResult = metric === (conditionValue ?? 0);
                        console.log(`📈 [DETAILED] ${metric} === ${conditionValue} = ${eqResult}`);
                        return eqResult;
                    default:   
                        console.log(`📈 [DETAILED] Unknown operator: ${conditionOperator}`);
                        return false;
                }
            })();
            
            console.log(`📈 [DETAILED] Final Rise/Fall condition result: ${result}`);
            
            // Additional validation
            if (!analysis.riseRatio && !analysis.fallRatio) {
                console.warn(`⚠️ Rise/Fall strategy missing ratio data. Available properties:`, Object.keys(analysis));
            }
            
            return result;
        }

        // even/odd first card
        if (strategyId === 'even-odd') {
            const metric = conditionType === 'even'
                ? parseFloat(analysis.evenProbability || '0')
                : parseFloat(analysis.oddProbability  || '0');
            const result = (() => {
                switch (conditionOperator) {
                    case '>':  return metric >  (conditionValue ?? 0);
                    case '<':  return metric <  (conditionValue ?? 0);
                    case '>=': return metric >= (conditionValue ?? 0);
                    case '<=': return metric <= (conditionValue ?? 0);
                    case '=':  return metric === (conditionValue ?? 0);
                    default:   return false;
                }
            })();
            console.log(`Even/Odd condition check: ${metric} ${conditionOperator} ${conditionValue} = ${result}`);
            return result;
        }

        // over/under first card
        if (strategyId === 'over-under') {
            const metric = conditionType === 'over'
                ? parseFloat(analysis.overProbability  || '0')
                : parseFloat(analysis.underProbability || '0');
            const result = (() => {
                switch (conditionOperator) {
                    case '>':  return metric >  (conditionValue ?? 0);
                    case '<':  return metric <  (conditionValue ?? 0);
                    case '>=': return metric >= (conditionValue ?? 0);
                    case '<=': return metric <= (conditionValue ?? 0);
                    case '=':  return metric === (conditionValue ?? 0);
                    default:   return false;
                }
            })();
            console.log(`Over/Under condition check: ${metric} ${conditionOperator} ${conditionValue} = ${result}`);
            return result;
        }

        // even-odd-2 pattern card (streak-based)
        if (strategyId === 'even-odd-2') {
            const { patternDigitCount, patternType } = strategy.settings;
            console.log(`Even/Odd-2 analysis data:`, analysis);
            console.log(`Pattern settings:`, { patternDigitCount, patternType });
            
            // First try streak-based approach
            if (analysis.streak && patternDigitCount) {
                const streakResult = analysis.streakType === patternType && analysis.streak >= patternDigitCount;
                console.log(`Streak check: ${analysis.streakType} === ${patternType} && ${analysis.streak} >= ${patternDigitCount} = ${streakResult}`);
                if (streakResult) return true;
            }
            
            // Fallback: Check recent digits pattern if actualDigits are available
            if (analysis.actualDigits && patternDigitCount) {
                const lastNDigits = analysis.actualDigits.slice(-patternDigitCount);
                console.log(`Last ${patternDigitCount} digits:`, lastNDigits);
                
                const allMatch = lastNDigits.every((digit: number) => {
                    const isEven = digit % 2 === 0;
                    return patternType === 'even' ? isEven : !isEven;
                });
                
                console.log(`Pattern match check: all digits ${patternType} = ${allMatch}`);
                if (allMatch) return true;
            }
              // No lenient fallback - pattern must be strict
            console.log(`❌ Even/Odd-2 condition NOT met - no valid pattern found`);
            return false;
        }        // over/under-2 pattern card (streak-based)
        if (strategyId === 'over-under-2') {
            const { overUnderPatternDigitCount, overUnderPatternType, overUnderPatternBarrier } = strategy.settings;
            console.log(`Over/Under-2 analysis data:`, analysis);
            console.log(`Pattern settings:`, { overUnderPatternDigitCount, overUnderPatternType, overUnderPatternBarrier });
            
            if (!overUnderPatternDigitCount || overUnderPatternBarrier === undefined) {
                console.log('Missing pattern configuration');
                return false;
            }
            
            // Require minimum pattern length of 2
            if (overUnderPatternDigitCount < 2) {
                console.log('Pattern count too small, using minimum of 2');
                return false;
            }
            
            // Primary: Check for strict digit pattern matching
            if (analysis.actualDigits && analysis.actualDigits.length >= overUnderPatternDigitCount) {
                const lastNDigits = analysis.actualDigits.slice(-overUnderPatternDigitCount);
                console.log(`Last ${overUnderPatternDigitCount} digits:`, lastNDigits);
                
                // Require ALL digits to match the pattern
                const allMatch = lastNDigits.every((digit: number) => {
                    if (overUnderPatternType === 'over') {
                        return digit > overUnderPatternBarrier;
                    } else if (overUnderPatternType === 'equals') {
                        return digit === overUnderPatternBarrier;
                    } else { // under
                        return digit < overUnderPatternBarrier;
                    }
                });
                
                console.log(`Strict pattern match: all ${lastNDigits.length} digits ${overUnderPatternType} ${overUnderPatternBarrier} = ${allMatch}`);
                if (allMatch) {
                    console.log(`✅ Over/Under-2 condition met: ${lastNDigits.join(',')} all ${overUnderPatternType} ${overUnderPatternBarrier}`);
                    return true;
                }
            }
            
            // Secondary: Check for strong streak (minimum 3 consecutive)
            if (analysis.streak && analysis.streakType === overUnderPatternType && 
                analysis.streak >= Math.max(overUnderPatternDigitCount, 3)) {
                console.log(`Strong streak match: ${analysis.streakType} streak of ${analysis.streak} >= ${Math.max(overUnderPatternDigitCount, 3)}`);
                console.log(`✅ Over/Under-2 condition met: ${analysis.streakType} streak of ${analysis.streak}`);
                return true;
            }
            
            // No lenient fallback - pattern must be strict
            console.log(`❌ Over/Under-2 condition NOT met - no valid pattern found`);
            return false;
        }

        // matches/differs strategy
        if (strategyId === 'matches-differs') {
            const { conditionDigit } = strategy.settings;
            console.log(`Matches/Differs analysis data:`, analysis);
            console.log(`Condition digit:`, conditionDigit);
            
            if (conditionDigit === undefined) {
                console.log('No condition digit specified');
                return false;
            }
            
            // Check if we have digit frequency data
            if (analysis.digitFrequencies) {
                const digitFreq = analysis.digitFrequencies[conditionDigit] || 0;
                const threshold = conditionValue || 10; // Default 10% threshold
                const result = digitFreq > threshold;
                console.log(`Digit ${conditionDigit} frequency: ${digitFreq}% > ${threshold}% = ${result}`);
                return result;
            }
            
            // Check current last digit if available
            if (analysis.currentLastDigit !== undefined) {
                const matchesCondition = analysis.currentLastDigit === conditionDigit;
                console.log(`Current digit ${analysis.currentLastDigit} matches ${conditionDigit} = ${matchesCondition}`);
                
                // For matches strategy, we want the digit to match
                // For differs strategy, we want it to be different
                const isMatches = strategy.settings.conditionAction === 'Matches';
                const result = isMatches ? matchesCondition : !matchesCondition;
                console.log(`Strategy is ${strategy.settings.conditionAction}, result = ${result}`);
                return result;
            }
        }

        console.log(`No condition logic found for strategy: ${strategyId}`);
        return false;
    };

    // Enhance the controls container with a status indicator
    return (
        <div className={classNames('smart-trading-display', {
            'smart-trading-display--run-panel-open': is_drawer_open
        })}>
            <div className="smart-trading-header">
                <h2>{localize('Smart Trading')}</h2>
                <div className="controls-container">
                    <div className="control-item">
                        <label htmlFor="symbol-select">{localize('Symbol')}:</label>
                        <select 
                            id="symbol-select" 
                            value={selectedSymbol}
                            onChange={handleSymbolChange}
                            className="symbol-select"
                        >
                            {symbolOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="control-item">
                        <label htmlFor="tick-count-input">{localize('Ticks')}:</label>
                        <input
                            id="tick-count-input"
                            type="number"
                            min="10" // Min for validation, actual default on blur is 120
                            max="5000"
                            value={tickCountInput} // Use the UI state for display
                            onChange={handleTickCountChange}
                            onBlur={handleTickCountBlur} // Validate and set actual tickCount on blur
                            className="tick-count-input"
                        />
                    </div>
                    <div className="price-display">
                        {localize('Price')}: <strong>{currentPrice || 'N/A'}</strong>
                        <span className="update-indicator"></span>
                    </div>
                    <button onClick={reconnectAnalyzer} className="reconnect-button">
                        🔄 {localize('Reconnect')}
                    </button>
                </div>
            </div>
            
            <div className="smart-trading-strategies">
                {analysisStrategies.map(strategy => {
                    const met = isConditionMet(strategy.id);
                    return (
                        <div
                            key={strategy.id}
                            className={`strategy-card ${strategy.activeContractType ? 'trading' : ''}`}
                            data-strategy-id={strategy.id}
                        >
                            <div className="strategy-card__header">
                                <h3 className="strategy-card__name">{strategy.name}</h3>
                                {strategy.activeContractType && (
                                    <div className="strategy-card__status">
                                        <span className="status-indicator trading">
                                            <div className="status-indicator-animated"></div>
                                            {localize('Auto Trading Active')}
                                        </span>
                                    </div>
                                )}
                                <div className="condition-indicator-container">
                                    <span
                                        className={`condition-indicator ${met ? 'active' : ''}`}
                                        title={met ? localize('Condition met') : localize('Condition not met')}
                                    />
                                </div>
                            </div>
                            
                            <div className="strategy-card__analysis-content">
                                {renderAnalysisContent(strategy.id)}
                            </div>

                            <div className="strategy-card__settings">
                                <div className="setting-item">
                                    <label htmlFor={`${strategy.id}-stake`}>{localize('Stake')}</label>
                                    <input
                                        id={`${strategy.id}-stake`}
                                        type="number"
                                        min="0.35"
                                        step="0.01"
                                        value={strategy.settings?.stakeInput !== undefined ? strategy.settings.stakeInput : strategy.settings.stake}
                                        onChange={(e) => handleSettingChange(strategy.id, 'stake', e.target.value)}
                                        onBlur={(e) => handleInputBlur(strategy.id, 'stake', e.target.value)}
                                        disabled={!!strategy.activeContractType}
                                    />
                                </div>
                                <div className="setting-item">
                                    <label htmlFor={`${strategy.id}-ticks`}>{localize('Ticks')}</label>
                                    <input
                                        id={`${strategy.id}-ticks`}
                                        type="number"
                                        min="1"
                                        step="1"                                        value={strategy.settings?.ticksInput !== undefined ? strategy.settings.ticksInput : strategy.settings.ticks}
                                        onChange={(e) => handleSettingChange(strategy.id, 'ticks', e.target.value)}
                                        onBlur={(e) => handleInputBlur(strategy.id, 'ticks', e.target.value)}
                                        disabled={!!strategy.activeContractType}
                                    />
                                </div>
                                <div className="setting-item">
                                    <label htmlFor={`${strategy.id}-martingale`}>{localize('Martingale')}</label>
                                    <input
                                        id={`${strategy.id}-martingale`}
                                        type="number"
                                        min="1"
                                        step="0.1"
                                        value={strategy.settings?.martingaleMultiplierInput !== undefined ? 
                                            strategy.settings.martingaleMultiplierInput : strategy.settings.martingaleMultiplier}
                                        onChange={(e) => handleSettingChange(strategy.id, 'martingaleMultiplier', e.target.value)}
                                        onBlur={(e) => handleInputBlur(strategy.id, 'martingaleMultiplier', e.target.value)}
                                        disabled={!!strategy.activeContractType}
                                    />
                                </div>
                            </div>                            <div className="strategy-card__actions">
                                <Button
                                    className="strategy-card__trade-button strategy-card__trade-button--single"
                                    onClick={() => handleAutoTrade(strategy.id)}
                                    size="md"
                                    variant={strategy.activeContractType ? "contained" : "outlined"}
                                    disabled={!currentPrice} // Disable button when no price data is available
                                >
                                    {strategy.activeContractType 
                                        ? localize('Stop Auto Trading') 
                                        : localize('Start Auto Trading')}
                                </Button>
                            </div>

                            {/* Trading Status Display */}
                            {strategy.activeContractType && (
                                <div className="strategy-card__status">
                                    <div className="status-info">
                                        <Text size="xs" weight="bold">
                                            Current Stake: ${(currentStakes[strategy.id] || strategy.settings.stake).toFixed(2)}
                                        </Text>
                                        {consecutiveLosses[strategy.id] > 0 && (
                                            <Text size="2xs" className="martingale-info">
                                                Martingale: {consecutiveLosses[strategy.id]} loss{consecutiveLosses[strategy.id] > 1 ? 'es' : ''}
                                            </Text>
                                        )}
                                        {lastTradeResult && (
                                            <Text size="2xs" className={`trade-result ${lastTradeResult.toLowerCase()}`}>
                                                Last: {lastTradeResult}
                                            </Text>
                                        )}
                                        <div className="trade-stats">
                                            <Text size="2xs">Wins: {winCount} | Losses: {lossCount}</Text>
                                        </div>
                                        {met && (
                                            <div className="condition-status">
                                                <Text size="2xs" className="condition-met">
                                                    ✓ Condition Met - Waiting for trade execution
                                                </Text>
                                            </div>
                                        )}
                                        {isTradeInProgress && (
                                            <div className="trade-progress">
                                                <Text size="2xs" className="trade-in-progress">
                                                    🔄 Trade in progress...
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <DebugButton />
        </div>
    );
});

export default SmartTradingDisplay;
