import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { api_base } from '@/external/bot-skeleton';
import { getAppId } from '@/components/shared/utils/config';
import './dtrader.scss';

/**
 * DTrader Component - Simple Iframe Integration
 * 
 * Embeds DTrader via iframe with bot's authentication passed through URL parameters.
 * The iframe handles its own loading state - no need for page loaders.
 */

const DTrader: React.FC = observer(() => {
    const [dtraderUrl, setDtraderUrl] = useState<string>('');

    useEffect(() => {
        // Build DTrader URL with authentication
        const buildDTraderUrl = () => {
            try {
                // Build base URL dynamically
                const protocol = window.location.protocol; // https: or http:
                const hostname = window.location.hostname; // localhost or bot.binaryfx.site
                
                // For production, use same domain with /dtrader path. For local dev, use port 8443 with /dtrader
                const isLocal = /localhost/i.test(hostname);
                const baseUrl = isLocal 
                    ? `${protocol}//localhost:8443/dtrader` 
                    : `${protocol}//${hostname}/dtrader`;

                // Get app ID
                const appId = getAppId();
                console.log('🔍 Environment - App ID:', appId);
                console.log('🔍 Hostname:', hostname);
                console.log('🔍 Is Local:', isLocal);
                console.log('🔍 Base URL:', baseUrl);

                // Get authentication tokens from localStorage
                const accountsList = localStorage.getItem('accountsList');
                const activeLoginId = localStorage.getItem('active_loginid');

                console.log('🔍 Accounts List:', accountsList ? 'Found' : 'Not found');
                console.log('🔍 Active Login ID:', activeLoginId);

                if (accountsList && activeLoginId) {
                    let accounts;
                    try {
                        accounts = JSON.parse(accountsList);
                        console.log('🔍 Parsed Accounts:', Array.isArray(accounts) ? `Array with ${accounts.length} items` : typeof accounts);
                    } catch (parseError) {
                        console.error('❌ Failed to parse accountsList:', parseError);
                        throw parseError;
                    }

                    // Handle both array and object formats
                    let activeAccount;
                    if (Array.isArray(accounts)) {
                        activeAccount = accounts.find((acc: any) => acc.loginid === activeLoginId);
                    } else if (typeof accounts === 'object' && accounts !== null) {
                        // If it's an object, try to get the account directly by loginid key
                        activeAccount = accounts[activeLoginId];
                    }

                    console.log('🔍 Active Account:', activeAccount ? 'Found' : 'Not found');
                    if (activeAccount) {
                        console.log('   - Login ID:', activeAccount.loginid);
                        console.log('   - Has Token:', !!activeAccount.token);
                    }

                    if (activeAccount?.token) {
                        // Build URL with authentication parameters
                        const params = new URLSearchParams();
                        params.append('app_id', appId.toString());
                        params.append('token1', activeAccount.token);
                        params.append('acct1', activeLoginId);

                        const url = `${baseUrl}/?${params.toString()}`;
                        console.log('✅ DTrader URL built with authentication');
                        console.log('🔗 URL:', url.replace(activeAccount.token, 'TOKEN_HIDDEN'));
                        setDtraderUrl(url);
                        return;
                    }
                }

                // Fallback: just pass app_id if tokens not available yet
                const url = `${baseUrl}/?app_id=${appId}`;
                console.log('⚠️ DTrader URL built WITHOUT authentication (tokens not ready)');
                console.log('🔗 URL:', url);
                setDtraderUrl(url);
            } catch (error) {
                console.error('❌ Error building DTrader URL:', error);
            }
        };

        // Build URL when authenticated
        if (api_base?.is_authorized) {
            buildDTraderUrl();
        } else {
            // Wait for authentication
            const interval = setInterval(() => {
                if (api_base?.is_authorized) {
                    buildDTraderUrl();
                    clearInterval(interval);
                }
            }, 500);

            return () => clearInterval(interval);
        }
    }, [api_base?.is_authorized]);

    return (
        <div className='dtrader-container'>
            {dtraderUrl ? (
                <iframe
                    src={dtraderUrl}
                    className='dtrader-iframe'
                    title='DTrader'
                    sandbox='allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals'
                    allow='clipboard-read; clipboard-write; payment; usb'
                />
            ) : (
                <div className='dtrader-waiting'>
                    <p>Waiting for authentication...</p>
                </div>
            )}
        </div>
    );
});

export default DTrader;
