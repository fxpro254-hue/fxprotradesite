import { TAB_IDS } from '@/constants/bot-contents';

export const getActiveTabUrl = () => {
    const activeTab = Number(localStorage.getItem('active_tab'));
    const url = new URL(window.location.href);
    url.searchParams.set('tab', TAB_IDS[activeTab] ?? TAB_IDS[0]);
    return url.href;
};
