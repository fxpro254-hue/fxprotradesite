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
    const [urlKey, setUrlKey] = useState<number>(0);
    const [currentAccount, setCurrentAccount] = useState<string>('');
    const [previousUrl, setPreviousUrl] = useState<string>('')

    useEffect(() => {
        // Build DTrader URL with fresh authentication parameters on each load
        const buildDTraderUrl = () => {
            try {
                // Use custom Vercel deployment for all environments
                const baseUrl = 'https://deriv-dtrader.vercel.app/dtrader';

                // Use App ID 98586 as specified
                const appId = 68848;
                console.log('🔍 Environment - App ID:', appId);
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
                    let accountToken;
                    
                    if (Array.isArray(accounts)) {
                        activeAccount = accounts.find((acc: any) => acc.loginid === activeLoginId);
                        accountToken = activeAccount?.token;
                    } else if (typeof accounts === 'object' && accounts !== null) {
                        // If it's an object, the structure might be { loginid: { token: 'xxx', ... } }
                        activeAccount = accounts[activeLoginId];
                        
                        // Try different token locations in the object
                        if (activeAccount) {
                            accountToken = activeAccount.token || activeAccount.Token || activeAccount.TOKEN;
                        }
                        
                        // If still no token, the object might BE the token string directly
                        if (!accountToken && typeof activeAccount === 'string') {
                            accountToken = activeAccount;
                        }
                    }

                    console.log('🔍 Active Account:', activeAccount ? 'Found' : 'Not found');
                    console.log('🔍 Account Structure:', activeAccount);
                    if (activeAccount) {
                        console.log('   - Login ID:', activeAccount.loginid || activeLoginId);
                        console.log('   - Token Found:', !!accountToken);
                    }

                    if (accountToken) {
                        // Build URL with authentication parameters
                        const params = new URLSearchParams();
                        params.append('app_id', appId.toString());
                        params.append('token1', accountToken);
                        params.append('acct1', activeLoginId);

                        const url = `${baseUrl}/?${params.toString()}`;
                        
                        // Only update if URL changed
                        if (url !== previousUrl) {
                            console.log('✅ DTrader URL built with authentication');
                            console.log('🔗 URL:', url.replace(accountToken, 'TOKEN_HIDDEN'));
                            setPreviousUrl(url);
                            setDtraderUrl(url);
                            setUrlKey(prev => prev + 1);
                            
                            // Update current account after URL is set
                            if (activeLoginId !== currentAccount) {
                                console.log('🔄 Account tracked:', activeLoginId);
                                setCurrentAccount(activeLoginId);
                            }
                        }
                        return;
                    }
                }

                // Fallback: just pass app_id if tokens not available yet
                const url = `${baseUrl}/?app_id=${appId}`;
                
                // Only update if URL changed
                if (url !== previousUrl) {
                    console.log('⚠️ DTrader URL built WITHOUT authentication (tokens not ready)');
                    console.log('🔗 URL:', url);
                    setPreviousUrl(url);
                    setDtraderUrl(url);
                    setUrlKey(prev => prev + 1);
                }
            } catch (error) {
                console.error('❌ Error building DTrader URL:', error);
            }
        };

        // Build URL immediately on component mount (handles tab activation AND page refresh)
        console.log('🔄 DTrader component mounted - building URL');
        buildDTraderUrl();

        // Set up interval to check for account changes during runtime
        const accountCheckInterval = setInterval(() => {
            const activeLoginId = localStorage.getItem('active_loginid');
            // Only rebuild if account actually changed
            if (activeLoginId && activeLoginId !== currentAccount) {
                console.log('🔄 Account change detected in interval:', currentAccount, '->', activeLoginId);
                buildDTraderUrl();
            }
        }, 2000); // Check every 2 seconds (less frequent)

        // Also rebuild when authentication state changes
        if (!api_base?.is_authorized) {
            // Wait for authentication
            const authInterval = setInterval(() => {
                if (api_base?.is_authorized) {
                    buildDTraderUrl();
                    clearInterval(authInterval);
                }
            }, 500);

            return () => {
                clearInterval(authInterval);
                clearInterval(accountCheckInterval);
            };
        }

        return () => clearInterval(accountCheckInterval);
    }, []); // Empty dependency array - runs on every mount

    return (
        <div className='dtrader-container'>
            {dtraderUrl ? (
                <iframe
                    key={urlKey}
                    src={dtraderUrl}
                    className='dtrader-iframe'
                    title='DTrader'
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
