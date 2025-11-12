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
    DTRADER: 2,
    CHART: 3,
    ANALYSIS_TOOL: 4,
    PORTFOLIO: 5,
    FREE_BOTS: 6,
    COMMUNITY: 7,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-dtrader',
    'id-charts',
    'id-analysis-tool',
    'id-portfolio',
    'id-free-bots',
    'id-community',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
