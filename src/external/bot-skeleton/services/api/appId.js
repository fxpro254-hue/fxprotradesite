import DerivAPIBasic from '@deriv/deriv-api/dist/DerivAPIBasic';
import APIMiddleware from './api-middleware';
import { installOptionsRequests, publicOptionsUrl } from './new-options';

export const generateDerivApiInstance = (socketUrl = publicOptionsUrl, canTrade = () => false, accountId = '') => {
    const api = new DerivAPIBasic({ connection: new WebSocket(socketUrl), middleware: new APIMiddleware({}) });
    installOptionsRequests(api, canTrade, accountId);
    return api;
};

export const getLoginId = () => localStorage.getItem('active_loginid');
export const getToken = () => ({ account_id: getLoginId() });
