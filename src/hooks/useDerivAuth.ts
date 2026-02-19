import { useEffect, useState } from 'react';

interface DerivUser {
    loginId: string;
    fullName: string;
    email?: string;
}

// Determine app ID based on environment
const isLocalhost = typeof window !== 'undefined' && /localhost/i.test(window.location.hostname);
const DERIV_APP_ID = process.env.DERIV_APP_ID || (isLocalhost ? '36300' : '111827');
const DERIV_WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${DERIV_APP_ID}`;

export const useDerivAuth = () => {
    const [user, setUser] = useState<DerivUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Get auth token from local storage
                const authToken = localStorage.getItem('authToken');
                
                if (!authToken) {
                    console.error('No authentication token found in localStorage');
                    setLoading(false);
                    return;
                }

                // Create WebSocket connection
                const ws = new WebSocket(DERIV_WS_URL);

                ws.onopen = () => {
                    console.log('WebSocket connected');
                    // Authorize with token
                    ws.send(JSON.stringify({
                        authorize: authToken
                    }));
                };

                ws.onmessage = (event) => {
                    const response = JSON.parse(event.data);
                    
                    console.log('WebSocket response:', response);
                    
                    if (response.error) {
                        console.error('WebSocket authorization error:', response.error.message || response.error);
                        
                        // Try to get user info from localStorage as fallback
                        const active_loginid = localStorage.getItem('active_loginid');
                        const client_accounts = JSON.parse(localStorage.getItem('accountsList') || '{}');
                        
                        if (active_loginid && client_accounts[active_loginid]) {
                            const account = client_accounts[active_loginid];
                            const userData: DerivUser = {
                                loginId: active_loginid,
                                fullName: account.name || active_loginid,
                                email: account.email,
                            };
                            setUser(userData);
                        }
                        
                        setLoading(false);
                        ws.close();
                        return;
                    }

                    // Handle authorize response
                    if (response.msg_type === 'authorize') {
                        const accountInfo = response.authorize;
                        
                        if (accountInfo) {
                            const userData: DerivUser = {
                                loginId: accountInfo.loginid || '',
                                fullName: accountInfo.fullname || accountInfo.loginid || 'User',
                                email: accountInfo.email,
                            };
                            
                            // Store email in localStorage for the session
                            if (accountInfo.email) {
                                localStorage.setItem('userEmail', accountInfo.email);
                            }
                            
                            setUser(userData);
                            setLoading(false);
                            ws.close();
                        }
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setLoading(false);
                };

                ws.onclose = () => {
                    console.log('WebSocket connection closed');
                };

                // Cleanup on unmount
                return () => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close();
                    }
                };
            } catch (error) {
                console.error('Failed to fetch Deriv user data:', error);
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return { user, loading };
};

export const getDerivUserInfo = async (): Promise<DerivUser | null> => {
    return new Promise((resolve, reject) => {
        try {
            // Get auth token from local storage
            const authToken = localStorage.getItem('authToken');
            
            if (!authToken) {
                console.error('No authentication token found in localStorage');
                resolve(null);
                return;
            }

            // Create WebSocket connection
            const ws = new WebSocket(DERIV_WS_URL);

            ws.onopen = () => {
                console.log('WebSocket connected');
                // Authorize with token
                ws.send(JSON.stringify({
                    authorize: authToken
                }));
            };

            ws.onmessage = (event) => {
                const response = JSON.parse(event.data);
                
                console.log('WebSocket response:', response);
                
                if (response.error) {
                    console.error('WebSocket authorization error:', response.error.message || response.error);
                    ws.close();
                    resolve(null);
                    return;
                }

                // Handle authorize response
                if (response.msg_type === 'authorize') {
                    const accountInfo = response.authorize;
                    
                    if (accountInfo) {
                        const userData: DerivUser = {
                            loginId: accountInfo.loginid || '',
                            fullName: accountInfo.fullname || accountInfo.loginid || 'User',
                            email: accountInfo.email,
                        };
                        
                        // Store email in localStorage for the session
                        if (accountInfo.email) {
                            localStorage.setItem('userEmail', accountInfo.email);
                        }
                        
                        ws.close();
                        resolve(userData);
                    } else {
                        ws.close();
                        resolve(null);
                    }
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                ws.close();
                reject(error);
            };
        } catch (error) {
            console.error('Failed to get Deriv user info:', error);
            reject(error);
        }
    });
};
