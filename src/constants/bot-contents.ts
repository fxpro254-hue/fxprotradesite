type TTabsTitle = {
    [key: string]: string | number;
};

type TDashboardTabIndex = {
    [key: string]: number;
};

export const tabs_title: TTabsTitle = Object.freeze({
    WORKSPACE: 'Workspace',
    CHART: 'Chart',
});

export const DBOT_TABS: TDashboardTabIndex = Object.freeze({
    DASHBOARD: 0,
    BOT_BUILDER: 1,
    CHART: 2,
    ANALYSIS_TOOL: 3,
    FREE_BOTS: 4,
    PORTFOLIO: 5,
    FOREX: 6,
    TRADING_HUB: 7,
    SMART_TRADING: 8,
    SPEED_BOT: 9,
    ACCUMULATORS: 10,
    DIGITS: 11,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-charts',
    'id-analysis-tool',
    'id-free-bots',
    'id-portfolio',
    'id-forex',
    'id-trading-hub',
    'id-smart-trading',
    'id-speed-bot',
    'id-accumulators',
    'id-digits',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
