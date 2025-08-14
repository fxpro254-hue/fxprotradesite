import React, { useState, useCallback, useEffect } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { DBOT_TABS } from '@/constants/bot-contents';
import { LabelPairedSearchMdRegularIcon, LabelPairedXmarkMdRegularIcon } from '@deriv/quill-icons/LabelPaired';
import { localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import { TStrategy } from 'Types';

// Comprehensive bot files available for search - includes all bots from public directory
const availableBots = [
    { file: '1 tick DIgit Over 2.xml', title: '1 Tick Digit Over 2', category: 'regular', description: 'Single tick digit over strategy with precise timing and statistical edge.' },
    { file: 'Auto differ recovery over under.xml', title: 'Auto Differ Recovery Over Under', category: 'automated', description: 'Automated difference recovery strategy for over/under markets with adaptive risk management.' },
    { file: 'BOT V3.xml', title: 'BOT V3', category: 'popular', description: 'Stable and dependable trading bot with conservative approach and long-term profitability focus.' },
    { file: 'Digit Over 3.xml', title: 'Digit Over 3', category: 'regular', description: 'Specialized digit over strategy targeting number 3 with high accuracy pattern recognition.' },
    { file: 'Envy-differ.xml', title: 'Envy Differ', category: 'popular', description: 'Reliable difference-based trading strategy perfect for beginners and steady profit seekers.' },
    { file: 'Even_Odd Killer bot.xml', title: 'Even Odd Killer Bot', category: 'popular', description: 'Highly effective even/odd prediction bot with advanced pattern recognition and statistical analysis.' },
    { file: 'H_L auto vault.xml', title: 'H_L Auto Vault', category: 'automated', description: 'High-Low automated vault system with built-in profit protection and loss prevention mechanisms.' },
    { file: 'Market wizard v1.5.xml', title: 'Market Wizard v1.5', category: 'automated', description: 'Community favorite with proven track record in various market conditions and excellent risk management.' },
    { file: 'Mavic-Air-RF Vix Bot.xml', title: 'Mavic Air RF Vix Bot', category: 'automated', description: 'Advanced volatility index bot with radio frequency pattern analysis for superior market timing.' },
    { file: 'MD MASTER BOT Pro.  (2).xml', title: 'MD Master Bot Pro', category: 'automated', description: 'Professional-grade master bot with multi-dimensional analysis and institutional-level strategy execution.' },
    { file: 'Mega Heist Robot.xml', title: 'Mega Heist Robot', category: 'automated', description: 'Aggressive profit-seeking robot designed for maximum returns with calculated risk management.' },
    { file: 'over under turbo 1.1.xml', title: 'Over Under Turbo 1.1', category: 'automated', description: 'Advanced over/under trading strategy with turbo speed execution and intelligent market prediction.' },
    { file: 'signals over bot.xml', title: 'Signals Over Bot', category: 'signals', description: 'Signal-based over trading bot with advanced market analysis and automated execution.' },
    { file: 'signals under bot.xml', title: 'Signals Under Bot', category: 'signals', description: 'Signal-based under trading bot with sophisticated market timing and risk management.' },
    { file: 'Top-notch 2.xml', title: 'Top-notch 2', category: 'automated', description: 'Top-rated strategy loved by professional traders for its consistency and impressive performance metrics.' },
    { file: 'Tradezilla.xml', title: 'Tradezilla', category: 'automated', description: 'Powerful automated trading beast that adapts to market volatility with machine learning algorithms.' },
    { file: 'Upgraded Candlemine.xml', title: 'Upgraded Candlemine', category: 'advanced', description: 'Enhanced candlestick mining strategy with upgraded pattern recognition and market analysis.' },
];

type TFreeBotSearchBar = {
    className?: string;
};

const FreeBotSearchBar = observer(({ className }: TFreeBotSearchBar) => {
    const { dashboard, load_modal } = useStore();
    const { setActiveTab } = dashboard;
    const { isDesktop } = useDevice();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(availableBots);
    const [showResults, setShowResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Filter bots based on search query
    const filterBots = useCallback((query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const lowercaseQuery = query.toLowerCase();
        const filtered = availableBots.filter(bot => 
            bot.title.toLowerCase().includes(lowercaseQuery) ||
            bot.description.toLowerCase().includes(lowercaseQuery) ||
            bot.category.toLowerCase().includes(lowercaseQuery) ||
            bot.file.toLowerCase().includes(lowercaseQuery)
        );

        setSearchResults(filtered);
        setShowResults(true);
    }, []);

    // Handle search input change with debouncing
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        setIsSearching(true);

        // Debounce search to avoid too many filter calls
        const timeoutId = setTimeout(() => {
            filterBots(value);
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [filterBots]);

    // Handle bot selection
    const handleBotSelect = useCallback(async (botFile: string, botTitle: string) => {
        console.log(`Selected bot: ${botTitle} (${botFile})`);
        
        try {
            // Navigate to Bot Builder tab first
            setActiveTab(DBOT_TABS.BOT_BUILDER);
            
            // Fetch the bot's XML content
            const response = await fetch(botFile);
            if (!response.ok) {
                console.error(`Failed to fetch bot file: ${botFile}`);
                return;
            }
            
            const xmlContent = await response.text();
            
            // Create a temporary strategy object for loading
            const tempStrategy: TStrategy = {
                id: `temp_${Date.now()}`,
                xml: xmlContent,
                name: botTitle,
                save_type: 'local',
                timestamp: Date.now()
            };
            
            // Use the load modal store's method to load the strategy into the workspace
            if (load_modal && load_modal.loadStrategyToBuilder) {
                // Use the method that expects a strategy parameter
                await load_modal.loadStrategyToBuilder(tempStrategy);
                console.log(`Bot "${botTitle}" loaded successfully into Bot Builder!`);
            } else {
                console.error('Load modal store not available');
            }
            
        } catch (error) {
            console.error('Error loading bot:', error);
        }
        
        // Clear search
        setSearchQuery('');
        setShowResults(false);
        setSearchResults([]);
    }, [setActiveTab, dashboard]);

    // Handle clear search
    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
        setShowResults(false);
        setSearchResults([]);
        setIsSearching(false);
    }, []);

    // Hide results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.free-bot-search-bar')) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={classNames('free-bot-search-bar', className)}>
            <div className='free-bot-search-bar__container'>
                <div className='free-bot-search-bar__input-wrapper'>
                    <LabelPairedSearchMdRegularIcon 
                        className='free-bot-search-bar__search-icon'
                        height='20px'
                        width='20px'
                    />
                    <input
                        type='text'
                        placeholder={localize('Search free bot files by name or description...')}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className='free-bot-search-bar__input'
                        data-testid='free-bot-search-input'
                    />
                    {(searchQuery || isSearching) && (
                        <button
                            onClick={handleClearSearch}
                            className='free-bot-search-bar__clear-btn'
                            data-testid='free-bot-search-clear'
                        >
                            <LabelPairedXmarkMdRegularIcon height='16px' width='16px' />
                        </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showResults && (
                    <div className='free-bot-search-bar__results'>
                        <div className='free-bot-search-bar__results-header'>
                            <span className='free-bot-search-bar__results-count'>
                                {localize('{{count}} bot(s) found', { count: searchResults.length })}
                            </span>
                        </div>
                        
                        {searchResults.length > 0 ? (
                            <div className='free-bot-search-bar__results-list'>
                                {searchResults.slice(0, 5).map((bot, index) => (
                                    <button
                                        key={bot.file}
                                        onClick={() => handleBotSelect(bot.file, bot.title)}
                                        className='free-bot-search-bar__result-item'
                                        data-testid={`search-result-${index}`}
                                    >
                                        <div className='free-bot-search-bar__result-content'>
                                            <div className='free-bot-search-bar__result-title'>
                                                {bot.title}
                                            </div>
                                            <div className='free-bot-search-bar__result-description'>
                                                {bot.description.length > 80 
                                                    ? `${bot.description.substring(0, 80)}...` 
                                                    : bot.description
                                                }
                                            </div>
                                            <div className='free-bot-search-bar__result-category'>
                                                {bot.category.charAt(0).toUpperCase() + bot.category.slice(1)}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                                
                                {searchResults.length > 5 && (
                                    <div className='free-bot-search-bar__show-more'>
                                        <button
                                            onClick={() => {
                                                setActiveTab(DBOT_TABS.FREE_BOTS);
                                                handleClearSearch();
                                            }}
                                            className='free-bot-search-bar__show-more-btn'
                                        >
                                            {localize('View all {{count}} results', { count: searchResults.length })}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className='free-bot-search-bar__no-results'>
                                <div className='free-bot-search-bar__no-results-text'>
                                    {localize('No bots found matching "{{query}}"', { query: searchQuery })}
                                </div>
                                <div className='free-bot-search-bar__no-results-suggestion'>
                                    {localize('Try different keywords or browse all free bots')}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

FreeBotSearchBar.displayName = 'FreeBotSearchBar';

export default FreeBotSearchBar;
