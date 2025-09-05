import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { localize } from '@deriv-com/translations';
import { StatementRequest, StatementResponse } from '@deriv/api-types';
import { api_base } from '@/external/bot-skeleton/services/api/api-base';
import './portfolio-display.scss';

// Define transaction type based on the API response
interface StatementTransaction {
    action_type?: string;
    amount?: number;
    app_id?: number | null;
    balance_after?: number;
    contract_id?: number | null;
    currency?: string;
    date?: string;
    description?: string;
    longcode?: string;
    payout?: number;
    purchase_time?: number;
    reference_id?: number;
    shortcode?: string;
    transaction_id?: number;
    transaction_time?: number;
    withdrawal_details?: string;
}

interface FilterState {
    action_type: string;
    time_period: string;
}

const PortfolioDisplay: React.FC = observer(() => {
    const { client } = useStore();
    const [statements, setStatements] = useState<StatementTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [currentOffset, setCurrentOffset] = useState(0);
    const [filters, setFilters] = useState<FilterState>({
        action_type: '',
        time_period: '7d'
    });

    // Get API base from the external bot skeleton

    const actionTypeOptions = [
        { value: '', label: localize('All Transactions') },
        { value: 'buy', label: localize('Buy') },
        { value: 'sell', label: localize('Sell') },
        { value: 'deposit', label: localize('Deposit') },
        { value: 'withdrawal', label: localize('Withdrawal') },
        { value: 'escrow', label: localize('Escrow') },
        { value: 'adjustment', label: localize('Adjustment') },
        { value: 'virtual_credit', label: localize('Virtual Credit') },
        { value: 'transfer', label: localize('Transfer') }
    ];

    const timePeriodOptions = [
        { value: '1d', label: localize('Last 24 hours') },
        { value: '7d', label: localize('Last 7 days') },
        { value: '30d', label: localize('Last 30 days') },
        { value: '90d', label: localize('Last 3 months') },
        { value: '180d', label: localize('Last 6 months') },
        { value: '365d', label: localize('Last year') },
        { value: 'all', label: localize('All time') }
    ];

    const getDateFromTimePeriod = (period: string) => {
        const now = new Date();
        
        if (period === 'all') return null;
        
        const daysMap: { [key: string]: number } = {
            '1d': 1,
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '180d': 180,
            '365d': 365
        };
        
        const days = daysMap[period];
        if (!days) return null;
        
        const pastDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
        return Math.floor(pastDate.getTime() / 1000);
    };

    const fetchStatements = async (isLoadMore = false) => {
        if (!api_base?.api) {
            setError(localize('API connection not available'));
            return;
        }

        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setCurrentOffset(0);
            setHasMoreData(true);
        }
        setError(null);

        try {
            const dateFrom = getDateFromTimePeriod(filters.time_period);
            const offset = isLoadMore ? currentOffset : 0;
            const limit = 100; // Load 100 transactions at a time
            
            const request: any = {
                statement: 1,
                description: 1,
                limit: limit,
                offset: offset,
                ...(filters.action_type && { action_type: filters.action_type }),
                ...(dateFrom && { date_from: dateFrom })
            };

            const response: any = await api_base.api.send(request);

            if (response.error) {
                throw new Error('Failed to fetch account statements');
            }

            if (response.statement?.transactions) {
                const newTransactions = response.statement.transactions;
                
                if (isLoadMore) {
                    // Append new transactions to existing ones
                    setStatements(prev => [...prev, ...newTransactions]);
                } else {
                    // Replace all transactions (fresh load)
                    setStatements(newTransactions);
                }
                
                // Update pagination state
                setCurrentOffset(offset + newTransactions.length);
                setHasMoreData(newTransactions.length === limit); // If we got fewer than limit, no more data
            } else {
                setHasMoreData(false);
            }
        } catch (err: any) {
            setError(err.message || localize('Failed to fetch account statements'));
            console.error('Portfolio fetch error:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMoreTransactions = () => {
        if (!loadingMore && hasMoreData) {
            fetchStatements(true);
        }
    };

    useEffect(() => {
        fetchStatements();
    }, []);

    const handleFilterChange = (field: keyof FilterState, value: string | number) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const applyFilters = () => {
        fetchStatements();
    };

    const resetFilters = () => {
        setFilters({
            action_type: '',
            time_period: '7d'
        });
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return 'N/A';
        
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const transactionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        // Check if it's today
        if (transactionDate.getTime() === today.getTime()) {
            return `Today ${date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            })}`;
        }
        
        // Check if it's yesterday
        if (transactionDate.getTime() === yesterday.getTime()) {
            return `Yesterday ${date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            })}`;
        }
        
        // For older dates, show full date with time
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getActionTypeColor = (actionType?: string) => {
        if (!actionType) return 'portfolio-action--default';
        switch (actionType) {
            case 'buy':
                return 'portfolio-action--buy';
            case 'sell':
                return 'portfolio-action--sell';
            case 'deposit':
                return 'portfolio-action--deposit';
            case 'withdrawal':
                return 'portfolio-action--withdrawal';
            case 'transfer':
                return 'portfolio-action--transfer';
            default:
                return 'portfolio-action--default';
        }
    };

    const getReferenceId = (transaction: StatementTransaction) => {
        // For buy/sell transactions, prefer contract_id over reference_id
        if (transaction.action_type === 'buy' || transaction.action_type === 'sell') {
            if (transaction.contract_id) {
                return String(transaction.contract_id);
            }
            if (transaction.reference_id) {
                return String(transaction.reference_id);
            }
            return 'N/A';
        }
        
        // For withdrawal transactions, prefer transaction_id over reference_id
        if (transaction.action_type === 'withdrawal') {
            if (transaction.transaction_id) {
                return String(transaction.transaction_id);
            }
            if (transaction.reference_id) {
                return String(transaction.reference_id);
            }
            return 'N/A';
        }
        
        // For deposit transactions, prefer transaction_id over reference_id
        if (transaction.action_type === 'deposit') {
            if (transaction.transaction_id) {
                return String(transaction.transaction_id);
            }
            if (transaction.reference_id) {
                return String(transaction.reference_id);
            }
            return 'N/A';
        }
        
        // For transfer transactions, prefer transaction_id over reference_id
        if (transaction.action_type === 'transfer') {
            if (transaction.transaction_id) {
                return String(transaction.transaction_id);
            }
            if (transaction.reference_id) {
                return String(transaction.reference_id);
            }
            return 'N/A';
        }
        
        // For all other transactions, use reference_id or transaction_id as fallback
        if (transaction.reference_id) {
            return String(transaction.reference_id);
        }
        if (transaction.transaction_id) {
            return String(transaction.transaction_id);
        }
        return 'N/A';
    };

    const getTotalBalance = () => {
        if (statements.length === 0) return 0;
        return statements[0]?.balance_after || 0;
    };

    const getTotalProfit = () => {
        return statements
            .filter(t => t.action_type === 'sell' && t.payout)
            .reduce((total, t) => total + (t.payout || 0) - (t.amount || 0), 0);
    };

    const getTotalTrades = () => {
        return statements.filter(t => t.action_type === 'buy').length;
    };

    return (
        <div className="portfolio-display">
            <div className="portfolio-header">
                <h1 className="portfolio-title">{localize('Portfolio & Account Statement')}</h1>
                
                {/* Portfolio Summary */}
                <div className="portfolio-summary">
                    <div className="summary-card">
                        <div className="summary-label">{localize('Current Balance')}</div>
                        <div className="summary-value">
                            {formatCurrency(getTotalBalance(), client?.currency || 'USD')}
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-label">{localize('Total Profit/Loss')}</div>
                        <div className={`summary-value ${getTotalProfit() >= 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(getTotalProfit(), client?.currency || 'USD')}
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-label">{localize('Total Trades')}</div>
                        <div className="summary-value">{getTotalTrades()}</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="portfolio-filters">
                <h3>{localize('Filter Transactions')}</h3>
                <div className="filter-grid">
                    <div className="filter-group">
                        <label>{localize('Transaction Type')}</label>
                        <select
                            value={filters.action_type}
                            onChange={(e) => handleFilterChange('action_type', e.target.value)}
                        >
                            {actionTypeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label>{localize('Time Period')}</label>
                        <select
                            value={filters.time_period}
                            onChange={(e) => handleFilterChange('time_period', e.target.value)}
                        >
                            {timePeriodOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-actions">
                        <button onClick={applyFilters} className="btn-primary" disabled={loading}>
                            {loading ? localize('Loading...') : localize('Apply Filters')}
                        </button>
                        <button onClick={resetFilters} className="btn-secondary">
                            {localize('Reset')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="portfolio-error">
                    <p>{error}</p>
                    <button onClick={() => fetchStatements(false)} className="btn-retry">
                        {localize('Retry')}
                    </button>
                </div>
            )}

            {/* Statements Table */}
            <div className="portfolio-statements">
                <h3>{localize('Transaction History')}</h3>
                
                {loading ? (
                    <div className="portfolio-loading">
                        <div className="loading-spinner"></div>
                        <p>{localize('Loading transactions...')}</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="statements-table-wrapper">
                            <table className="statements-table">
                                <thead>
                                    <tr>
                                        <th>{localize('Date & Time')}</th>
                                        <th>{localize('Reference ID')}</th>
                                        <th>{localize('Action')}</th>
                                        <th>{localize('Amount')}</th>
                                        <th>{localize('Balance')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statements.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="no-data">
                                                {localize('No transactions found')}
                                            </td>
                                        </tr>
                                    ) : (
                                        statements.map((transaction) => (
                                            <tr key={transaction.transaction_id || Math.random()}>
                                                <td>{formatDate(transaction.transaction_time)}</td>
                                                <td>{getReferenceId(transaction)}</td>
                                                <td>
                                                    <span className={`portfolio-action ${getActionTypeColor(transaction.action_type)}`}>
                                                        {transaction.action_type ? 
                                                            transaction.action_type.charAt(0).toUpperCase() + transaction.action_type.slice(1) : 
                                                            'Unknown'
                                                        }
                                                    </span>
                                                </td>
                                                <td className={(transaction.amount || 0) >= 0 ? 'amount-positive' : 'amount-negative'}>
                                                    {formatCurrency(Math.abs(transaction.amount || 0), transaction.currency || 'USD')}
                                                </td>
                                                <td>{formatCurrency(transaction.balance_after || 0, transaction.currency || 'USD')}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Mobile Card View */}
                        <div className="statements-cards">
                            {statements.length === 0 ? (
                                <div className="no-data">
                                    {localize('No transactions found')}
                                </div>
                            ) : (
                                statements.map((transaction) => (
                                    <div key={transaction.transaction_id || Math.random()} className="statement-card">
                                        <div className="card-header">
                                            <span className={`portfolio-action card-action ${getActionTypeColor(transaction.action_type)}`}>
                                                {transaction.action_type ? 
                                                    transaction.action_type.charAt(0).toUpperCase() + transaction.action_type.slice(1) : 
                                                    'Unknown'
                                                }
                                            </span>
                                            <div className={`card-amount ${(transaction.amount || 0) >= 0 ? 'card-amount--positive' : 'card-amount--negative'}`}>
                                                {(transaction.amount || 0) >= 0 ? '+' : ''}
                                                {formatCurrency(Math.abs(transaction.amount || 0), transaction.currency || 'USD')}
                                            </div>
                                        </div>
                                        <div className="card-details">
                                            <div className="card-detail-row">
                                                <span className="card-detail-label">{localize('Date & Time')}</span>
                                                <span className="card-detail-value">{formatDate(transaction.transaction_time)}</span>
                                            </div>
                                            <div className="card-detail-row">
                                                <span className="card-detail-label">{localize('Reference ID')}</span>
                                                <span className="card-detail-value">{getReferenceId(transaction)}</span>
                                            </div>
                                            <div className="card-detail-row">
                                                <span className="card-detail-label">{localize('Balance After')}</span>
                                                <span className="card-detail-value">{formatCurrency(transaction.balance_after || 0, transaction.currency || 'USD')}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
                
                {/* Load More Button */}
                {!loading && hasMoreData && statements.length > 0 && (
                    <div className="load-more-container">
                        <button 
                            onClick={loadMoreTransactions} 
                            className="btn-load-more" 
                            disabled={loadingMore}
                        >
                            {loadingMore ? localize('Loading...') : localize('Load More Transactions')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

export default PortfolioDisplay;
