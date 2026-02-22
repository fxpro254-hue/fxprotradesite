import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { standalone_routes } from '@/components/shared';
import Button from '@/components/shared_ui/button';
import useActiveAccount from '@/hooks/api/account/useActiveAccount';
import { useOauth2 } from '@/hooks/auth/useOauth2';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import { StandaloneCircleUserRegularIcon } from '@deriv/quill-icons/Standalone';
import { requestOidcAuthentication } from '@deriv-com/auth-client';
import { Localize, useTranslations } from '@deriv-com/translations';
import { Header, useDevice, Wrapper } from '@deriv-com/ui';
import { Tooltip } from '@deriv-com/ui';
import { AppLogo } from '../app-logo';
import AccountsInfoLoader from './account-info-loader';
import AccountSwitcher from './account-switcher';
import MenuItems from './menu-items';
import MobileMenu from './mobile-menu';
import PlatformSwitcher from './platform-switcher';
import { getAppId } from '@/components/shared';
import { botNotification } from '@/components/bot-notification/bot-notification';
import { DisclaimerPopup } from '@/components/disclaimer';
import './header.scss';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Modal from '@/components/shared_ui/modal'; // Import the modal component

const SettingsPopup = ({ isOpen, onClose, onOpenSettings, onOpenCopyTrading, hasTokens, onOpenAdmin }) => {
    if (!isOpen) return null;

    return (
        <div className='settings-popup-overlay' onClick={onClose}>
            <div className='settings-popup' onClick={(e) => e.stopPropagation()}>
                <div className='settings-popup__header'>
                    <h3>Quick Settings</h3>
                    <button className='settings-popup__close' onClick={onClose}>
                        <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
                            <path
                                d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
                                fill='currentColor'
                            />
                        </svg>
                    </button>
                </div>
                <div className='settings-popup__content'>
                    <button className='settings-popup__item' onClick={() => {
                        onOpenSettings();
                        onClose();
                    }}>
                        <div className='settings-popup__item-icon'>
                            <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                                <path
                                    d='M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z'
                                    fill='currentColor'
                                />
                            </svg>
                        </div>
                        <div className='settings-popup__item-content'>
                            <h4>Token Management</h4>
                            <p>Manage your token details and preferences</p>
                        </div>
                        <div className='settings-popup__item-arrow'>
                            <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
                                <path d='M9 18l6-6-6-6' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
                            </svg>
                        </div>
                    </button>
                    
                    <button className='settings-popup__item' onClick={() => {
                        onOpenCopyTrading();
                        onClose();
                    }}>
                        <div className='settings-popup__item-icon'>
                            <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                                <path
                                    d='M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z'
                                    fill='currentColor'
                                />
                            </svg>
                        </div>
                        <div className='settings-popup__item-content'>
                            <h4>Copy Trading</h4>
                            <p>Manage copy trading tokens and settings</p>
                        </div>
                        <div className='settings-popup__item-arrow'>
                            <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
                                <path d='M9 18l6-6-6-6' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
                            </svg>
                        </div>
                    </button>
                    
                    {hasTokens && (
                        <button className='settings-popup__item' onClick={() => {
                            console.log('Admin panel opened');
                            onOpenAdmin();
                            onClose();
                        }}>
                            <div className='settings-popup__item-icon'>
                                <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                                    <path
                                        d='M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z'
                                        fill='currentColor'
                                    />
                                </svg>
                            </div>
                            <div className='settings-popup__item-content'>
                                <h4>Admin Panel</h4>
                                <p>Access admin controls and settings</p>
                            </div>
                            <div className='settings-popup__item-arrow'>
                                <svg width='20' height='20' viewBox='0 0 24 24' fill='none'>
                                    <path d='M9 18l6-6-6-6' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
                                </svg>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoIcon = () => {
    const [showModal, setShowModal] = useState(false);

    const socialLinks = [
        {
            name: 'Telegram',
            url: 'https://t.me/fxprotradesite',
            icon: (
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                    <path
                        d='M12 0C5.37 0 0 5.37 0 12C0 18.63 5.37 24 12 24C18.63 24 24 18.63 24 12C24 5.37 18.63 0 12 0ZM17.94 8.19L15.98 17.03C15.82 17.67 15.42 17.83 14.88 17.52L11.88 15.33L10.44 16.71C10.27 16.88 10.12 17.03 9.79 17.03L10.02 13.97L15.61 8.9C15.87 8.67 15.56 8.54 15.22 8.77L8.21 13.31L5.24 12.38C4.62 12.19 4.61 11.74 5.38 11.43L17.08 7.08C17.6 6.9 18.06 7.23 17.94 8.19Z'
                        fill='#22d9cd'
                    />
                </svg>
            ),
        },
        {
            name: 'Email',
            url: 'mailto:fxpro254@gmail.com',
            icon: (
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                    <path
                        d='M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM19.6 8.25L12.53 12.67C12.21 12.87 11.79 12.87 11.47 12.67L4.4 8.25C4.15 8.09 4 7.82 4 7.53C4 6.86 4.73 6.46 5.3 6.81L12 11L18.7 6.81C19.27 6.46 20 6.86 20 7.53C20 7.82 19.85 8.09 19.6 8.25Z'
                        fill='#e0ce57'
                    />
                </svg>
            ),
        },
        {
            name: 'Website',
            url: 'https://fxprotrades.site',
            icon: (
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                    <path
                        d='M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 6.48 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 14.45L16.95 8.5L15.53 7.08L11 11.61L8.71 9.32L7.29 10.74L11 14.45Z'
                        fill='#f6e934'
                    />
                    <path
                        d='M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z'
                        fill='#34A853'
                        fillOpacity='0.2'
                    />
                </svg>
            ),
        },
        {
            name: 'TikTok',
            url: 'https://tiktok.com/@fxprotrades',
            icon: (
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                    <path
                        d='M16.6 5.82C15.9165 5.03962 15.5397 4.03743 15.54 3H12.45V15.4C12.4261 16.071 12.1428 16.7066 11.6597 17.1729C11.1766 17.6393 10.5316 17.8999 9.86 17.91C8.44 17.91 7.26 16.77 7.26 15.36C7.26 13.73 8.76 12.44 10.39 12.76V9.64C7.05 9.34 4.2 11.88 4.2 15.36C4.2 18.71 7 21.02 9.85 21.02C12.89 21.02 15.54 18.37 15.54 15.33V9.01C16.793 9.90985 18.2974 10.3926 19.84 10.39V7.3C19.84 7.3 17.96 7.39 16.6 5.82Z'
                        fill='black'
                    />
                </svg>
            ),
        },
        {
            name: 'WhatsApp',
            url: 'https://wa.me/254735525483',
            icon: (
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                    <path
                        d='M12 2C6.48 2 2 6.48 2 12C2 13.85 2.49 15.55 3.36 17.02L2.05 21.95L7.08 20.66C8.51 21.48 10.19 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.53 15.5C16.37 15.93 15.71 16.33 15.19 16.43C14.5 16.57 13.96 16.48 12.06 15.75C9.54 14.78 7.9 12.23 7.77 12.07C7.64 11.91 6.76 10.73 6.76 9.5C6.76 8.27 7.4 7.66 7.65 7.39C7.9 7.12 8.18 7.05 8.36 7.05C8.54 7.05 8.72 7.05 8.88 7.06C9.04 7.07 9.27 7 9.49 7.47C9.71 7.94 10.18 9.17 10.25 9.31C10.32 9.45 10.36 9.62 10.27 9.82C9.75 10.93 9.17 10.86 9.54 11.47C10.41 12.87 11.38 13.47 12.62 14.09C12.89 14.23 13.06 14.21 13.21 14.04C13.36 13.87 13.81 13.35 13.98 13.11C14.15 12.87 14.32 12.91 14.54 12.99C14.76 13.07 15.98 13.67 16.23 13.8C16.48 13.93 16.64 13.99 16.71 14.09C16.78 14.19 16.78 14.57 16.53 15.5Z'
                        fill='#25D366'
                    />
                </svg>
            ),
        },
      
    ];

    return (
        <>
            <button className='info-icon' onClick={() => setShowModal(true)}>
                <svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    {/* Base circle */}
                    <circle cx='16' cy='16' r='16' fill='url(#chatGradient)' />

                    {/* Message bubble */}
                    <path
                        d='M24 12C24 8.7 20.87 6 17 6H15C11.13 6 8 8.7 8 12C8 15.3 11.13 18 15 18H16V21L20 18C22.33 17.1 24 14.7 24 12Z'
                        fill='white'
                    />

                    {/* Gradient definition */}
                    <defs>
                        <linearGradient id='chatGradient' x1='0' y1='0' x2='32' y2='32'>
                            <stop offset='0%' stopColor='#e0ce57' />
                            <stop offset='100%' stopColor='#ceb159' />
                        </linearGradient>
                    </defs>
                </svg>
            </button>

            {showModal && (
                <div className='auth-modal-overlay'>
                    <div className='auth-modal'>
                        <div className='auth-modal__header'>
                            <h3>Connect With Us</h3>
                            <button className='auth-modal__close-btn' onClick={() => setShowModal(false)}>
                                <svg
                                    width='16'
                                    height='16'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    xmlns='http://www.w3.org/2000/svg'
                                >
                                    <path
                                        d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
                                        fill='currentColor'
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className='auth-modal__content'>
                            <div className='social-links-modal'>
                                {socialLinks.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='social-link'
                                    >
                                        <span className='social-link__icon'>{link.icon}</span>
                                        <span className='social-link__name'>{link.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const AppHeader = observer(() => {
    const { isDesktop } = useDevice();
    const { isAuthorizing, activeLoginid } = useApiBase();
    const { client } = useStore() ?? {};

    const { data: activeAccount, error: activeAccountError } = useActiveAccount({
        allBalanceData: client?.all_accounts_balance,
        shouldFetch: !!client,
    });

    const { accounts = {}, all_accounts_balance = {}, balance = 0, currency = 'USD' } = client ?? {};

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Active Account:', activeAccount);
            console.log('All Accounts:', accounts);
            console.log('All Balances:', all_accounts_balance);
        }
    }, [activeAccount, accounts, all_accounts_balance]);

    const getAccountBalance = (account_id: string) => {
        try {
            // Check if SVG mode is enabled
            const isSvgModeEnabled = localStorage.getItem('svging') === 'yes';
            
            if (activeAccount && activeAccount.loginid === account_id) {
                let balanceToUse = activeAccount.balance;
                
                // If SVG mode is enabled and this is a USD real account, try to use demo balance
                if (isSvgModeEnabled && !activeAccount.loginid?.startsWith('VR') && activeAccount.currency?.toLowerCase() === 'usd') {
                    const demoLoginId = Object.keys(accounts).find(id => id.startsWith('VR'));
                    if (demoLoginId && all_accounts_balance[demoLoginId]) {
                        balanceToUse = all_accounts_balance[demoLoginId];
                    }
                }
                
                return {
                    balance: balanceToUse,
                    currency: activeAccount.currency,
                };
            }

            if (client?.balance !== undefined && client?.loginid === account_id) {
                let balanceToUse = client.balance;
                
                // If SVG mode is enabled and this is a USD real account, try to use demo balance
                if (isSvgModeEnabled && !client.loginid?.startsWith('VR') && client.currency?.toLowerCase() === 'usd') {
                    const demoLoginId = Object.keys(accounts).find(id => id.startsWith('VR'));
                    if (demoLoginId && all_accounts_balance[demoLoginId]) {
                        balanceToUse = all_accounts_balance[demoLoginId];
                    }
                }
                
                return {
                    balance: balanceToUse,
                    currency: client.currency,
                };
            }

            return {
                balance: 0,
                currency: 'USD',
            };
        } catch (error) {
            console.error(`Error getting balance for account ${account_id}:`, error);
            return { balance: 0, currency: 'USD' };
        }
    };

    const formatBalance = (account_id: string) => {
        const { balance, currency } = getAccountBalance(account_id);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(Number(balance));
    };

    const has_wallet = Object.values(accounts).some(
        account => account?.account_category === 'wallet' && account?.is_active
    );

    const { localize } = useTranslations();

    const { isOAuth2Enabled } = useOauth2();

    const [isToggled, setIsToggled] = useState(false);
    const [isSettingsPopupOpen, setIsSettingsPopupOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false); // State for the new copy modal
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false); // State for admin modal
    const [adminTokensData, setAdminTokensData] = useState<Array<{token: string; balance: string; name: string}>>([]);
    const [isLoadingAdminData, setIsLoadingAdminData] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 }); // Progress tracker
    const [stake, setStake] = useState('');
    const [martingale, setMartingale] = useState('');
    const [tokens, setTokens] = useState(() => {
        if (!client?.loginid) return [];
        const savedTokens = localStorage.getItem(`extratokens_${client.loginid}`);
        return savedTokens ? JSON.parse(savedTokens) : [];
    });

    // Update tokens when account changes
    useEffect(() => {
        if (client?.loginid) {
            const savedTokens = localStorage.getItem(`extratokens_${client.loginid}`);
            setTokens(savedTokens ? JSON.parse(savedTokens) : []);
        } else {
            setTokens([]);
        }
    }, [client?.loginid]);

    // Initialize copy trading settings to false on page load for safety
    useEffect(() => {
        if (client?.loginid) {
            // Always set to false on page load to prevent accidental trading
            localStorage.setItem(`copytradeenabled_${client.loginid}`, 'false');
            localStorage.setItem(`copytoreal_${client.loginid}`, 'false');
            setCopyTradeEnabled(false);
            setCopyToReal(false);
            
            console.log(`Copy trading settings reset to false for account: ${client.loginid}`);
        }
    }, [client?.loginid]);

    // Load copy trading settings when account changes
    // Note: These settings intentionally start as false and are only loaded when user explicitly enables them
    useEffect(() => {
        if (client?.loginid) {
            // Only load settings if they were previously enabled by the user
            const savedCopyTradeEnabled = localStorage.getItem(`copytradeenabled_${client.loginid}`);
            const savedCopyToReal = localStorage.getItem(`copytoreal_${client.loginid}`);
            
            // These will remain false unless explicitly enabled by user
            if (savedCopyTradeEnabled === 'true') {
                setCopyTradeEnabled(true);
            }
            if (savedCopyToReal === 'true') {
                setCopyToReal(true);
            }
        } else {
            // Reset to false when no account is logged in
            setCopyTradeEnabled(false);
            setCopyToReal(false);
        }
    }, [client?.loginid]);

    // Adding notifications state as an empty array for compatibility with existing code
    const [notifications, setNotifications] = useState<
        Array<{ message: string; type: 'success' | 'error' | 'info'; id: number }>
    >([]);

    // Auto-copy state - track which accounts have been processed
    const [autocopiedAccounts, setAutocopiedAccounts] = useState<Set<string>>(new Set());
    
    // Improved showNotification function that uses botNotification for consistent UX
    const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Convert type to react-toastify type
        const toastType = type === 'success' ? 'success' : type === 'error' ? 'error' : 'info';
        
        // Use botNotification for consistent notification appearance across the app
        botNotification(message, undefined, { 
            type: toastType, 
            autoClose: type === 'error' ? 8000 : type === 'success' ? 5000 : 3000 
        });
    };

    // Function to clean and parse balance string
    const cleanAndParseBalance = (balanceStr: string | number | undefined): number => {
        if (balanceStr === undefined || balanceStr === null) return 0;

        // If it's already a number, return it
        if (typeof balanceStr === 'number') return balanceStr;

        // Remove commas and other non-numeric characters except decimal point
        const cleanStr = String(balanceStr).replace(/[^0-9.-]/g, '');
        const parsedValue = Number(cleanStr);

        return isNaN(parsedValue) ? 0 : parsedValue;
    };

    // Function to check if user exists and fetch profile data
    const fetchUserProfile = useCallback(async () => {
        if (!client?.loginid) return { exists: false };

        try {
            setIsCheckingProfile(true);
            console.log(`Checking if user with ID ${client.loginid} exists in copy trading system...`);

            // Create properly encoded URL with the key that correctly matches the API field
            const baseUrl = 'https://database.binaryfx.site/api/1.1/obj/copy trading';
            const constraints = JSON.stringify([
                {
                    key: 'account id',
                    constraint_type: 'equals',
                    value: client.loginid,
                },
            ]);

            const url = `${baseUrl}?constraints=${encodeURIComponent(constraints)}`;
            console.log(`Making request to: ${url}`);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('User profile check response:', data);

            if (!data || !data.response || !Array.isArray(data.response.results)) {
                console.error('Invalid response format:', data);
                throw new Error('Invalid response format from API');
            }

            if (data.response.results.length > 0) {
                // User exists, store their profile data
                const profileData = data.response.results[0];
                setUserProfileData(profileData);

                return { exists: true, data: profileData };
            }

            return { exists: false };
        } catch (error) {
            console.error('Error checking user profile:', error);
            return { exists: false, error };
        } finally {
            setIsCheckingProfile(false);
        }
    }, [client?.loginid]);

    // Add effect to fetch and update provider tokens on page load
    useEffect(() => {
        // Only run if client exists and is logged in
        if (client?.loginid) {
            const checkAndUpdateProviderTokens = async () => {
                try {
                    console.log(`Checking if user ${client.loginid} is a strategy provider...`);
                    const { exists, data } = await fetchUserProfile();

                    if (exists && data) {
                        const status =
                            data.status || data.Status || data['account_status'] || data['accountStatus'] || '';

                        if (status === 'Approved') {
                            console.log('User is an approved strategy provider - fetching tokens');

                            // Fetch the provider's tokens using the correct key "account id"
                            const constraints = JSON.stringify([
                                {
                                    key: 'account id',
                                    constraint_type: 'equals',
                                    value: client.loginid,
                                },
                            ]);
                            const tokensUrl = `https://database.binaryfx.site/api/1.1/obj/copy trading?constraints=${encodeURIComponent(constraints)}`;

                            console.log(`Fetching tokens from URL: ${tokensUrl}`);

                            const tokensResponse = await fetch(tokensUrl);

                            if (!tokensResponse.ok) {
                                if (tokensResponse.status === 404) {
                                    console.warn('Tokens API returned 404 - No tokens found for this provider.');
                                    return;
                                }
                                throw new Error(`API error: ${tokensResponse.status} ${tokensResponse.statusText}`);
                            }

                            const tokensData = await tokensResponse.json();
                            console.log('Tokens API response:', tokensData);

                            if (tokensData?.response?.results && Array.isArray(tokensData.response.results)) {
                                // Extract tokens from the response, checking for 'list of tokens' field first
                                let providerTokens: string[] = [];

                                tokensData.response.results.forEach((result: any) => {
                                    // Check if the result has a 'list of tokens' property that is an array
                                    if (result['list of tokens'] && Array.isArray(result['list of tokens'])) {
                                        console.log('Found list of tokens:', result['list of tokens']);
                                        // Add all tokens from the list to our array
                                        providerTokens = [
                                            ...providerTokens,
                                            ...result['list of tokens'].filter(Boolean),
                                        ];
                                    } else if (result.token) {
                                        // Fallback to check for individual token property
                                        providerTokens.push(result.token);
                                    }
                                });

                                if (providerTokens.length > 0) {
                                    localStorage.setItem(
                                        `extratokens_${client.loginid}`,
                                        JSON.stringify(providerTokens)
                                    );
                                    setTokens(providerTokens);
                                    console.log(
                                        `Updated extratokens_${client.loginid} in localStorage with ${providerTokens.length} tokens`
                                    );
                                } else {
                                    console.log('No tokens found for this provider.');
                                }
                            } else {
                                console.warn('Unexpected response format from tokens API:', tokensData);
                            }
                        } else {
                            console.log(`User exists but is not an approved strategy provider (status: ${status})`);
                        }
                    } else {
                        console.log('User is not a strategy provider');
                    }
                } catch (error) {
                    console.error('Error checking strategy provider status:', error);
                }
            };

            checkAndUpdateProviderTokens();
        }
    }, [client?.loginid, fetchUserProfile]);

    const [tokenInput, setTokenInput] = useState('');

    const handleToggle = () => {
        if (!isToggled) {
            setIsModalOpen(true); // Open modal when toggled on
        } else {
            setIsToggled(false); // Turn off toggle
        }
    };

    const handleProceed = () => {
        if (stake.trim() && martingale.trim()) {
            setIsToggled(true); // Enable toggle only if inputs are valid
            setIsModalOpen(false); // Close modal
        } else {
            alert('Please enter valid Stake and Martingale values.');
        }
    };

    const submitToken = (e: React.FormEvent) => {
        e.preventDefault();

        if (!client?.loginid || !tokenInput.trim()) return;

        if (tokenInput.length < 8) {
            alert('Token must be at least 8 characters long');
            return;
        }

        if (tokens.includes(tokenInput)) {
            alert('This token is already connected');
            return;
        }

        const newTokens = [...tokens, tokenInput];
        setTokens(newTokens);
        localStorage.setItem(`extratokens_${client.loginid}`, JSON.stringify(newTokens));
        setTokenInput('');
    };

    // Handle token removal
    const removeToken = (tokenToRemove: string) => {
        if (!client?.loginid) return;

        const newTokens = tokens.filter(token => token !== tokenToRemove);
        setTokens(newTokens);
        localStorage.setItem(`extratokens_${client.loginid}`, JSON.stringify(newTokens));
    };

    const [copyToReal, setCopyToReal] = useState(false);

    const [copyTradeEnabled, setCopyTradeEnabled] = useState(false);

    // Add state for user stats analysis
    const [isAnalyzingStats, setIsAnalyzingStats] = useState(false);
    const [userStats, setUserStats] = useState(null);
    const [activeView, setActiveView] = useState('main'); // 'main', 'trader', 'copier'

    // Function to open admin modal and fetch token data
    const openAdminPanel = async () => {
        if (!client?.loginid) {
            showNotification('Please log in to access admin panel', 'error');
            return;
        }

        setIsAdminModalOpen(true);
        setIsLoadingAdminData(true);

        try {
            // Get tokens from localStorage
            const savedTokens = localStorage.getItem(`extratokens_${client.loginid}`);
            const tokensList = savedTokens ? JSON.parse(savedTokens) : [];

            if (tokensList.length === 0) {
                setAdminTokensData([]);
                setIsLoadingAdminData(false);
                setLoadingProgress({ current: 0, total: 0 });
                return;
            }

            console.log(`📊 Loading data for ${tokensList.length} tokens...`);
            setLoadingProgress({ current: 0, total: tokensList.length });

            // Fetch balance and account info for each token with retry logic
            const fetchTokenData = async (token: string, retryCount = 0): Promise<any> => {
                const maxRetries = 2;
                
                try {
                    return await new Promise((resolve, reject) => {
                        const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${getAppId()}`);
                        let tokenData = {
                            token: token,
                            balance: '0',
                            name: 'Unknown',
                            currency: 'USD',
                            loginid: 'N/A'
                        };

                        let hasAuthorized = false;
                        let hasReceivedBalance = false;
                        let isClosed = false;

                        const timeout = setTimeout(() => {
                            if (!isClosed) {
                                console.warn(`Timeout for token: ${token.substring(0, 8)}... (Attempt ${retryCount + 1}/${maxRetries + 1})`);
                                isClosed = true;
                                ws.close();
                                
                                // If we have authorized but no balance, use what we have
                                if (hasAuthorized) {
                                    resolve(tokenData);
                                } else {
                                    reject(new Error('Timeout'));
                                }
                            }
                        }, 20000); // 20 seconds timeout

                        ws.onopen = () => {
                            console.log(`WebSocket opened for token: ${token.substring(0, 8)}...`);
                            try {
                                ws.send(JSON.stringify({ authorize: token }));
                            } catch (sendError) {
                                console.error('Error sending authorize:', sendError);
                                clearTimeout(timeout);
                                isClosed = true;
                                ws.close();
                                reject(sendError);
                            }
                        };

                        ws.onerror = (error) => {
                            console.error(`WebSocket error for token ${token.substring(0, 8)}:`, error);
                            if (!isClosed) {
                                clearTimeout(timeout);
                                isClosed = true;
                                ws.close();
                                reject(new Error('Connection error'));
                            }
                        };

                        ws.onmessage = (event) => {
                            try {
                                const response = JSON.parse(event.data);
                                
                                // Handle errors
                                if (response.error) {
                                    console.error(`API error for token ${token.substring(0, 8)}:`, response.error);
                                    if (!isClosed) {
                                        clearTimeout(timeout);
                                        isClosed = true;
                                        tokenData.name = 'Invalid Token';
                                        tokenData.balance = 'Invalid';
                                        tokenData.loginid = 'Invalid';
                                        resolve(tokenData);
                                        ws.close();
                                    }
                                    return;
                                }

                                // Handle authorization response
                                if (response.authorize && !hasAuthorized) {
                                    hasAuthorized = true;
                                    console.log(`✓ Authorized: ${response.authorize.fullname} (${token.substring(0, 8)}...)`);
                                    
                                    tokenData.name = response.authorize.fullname || 'Unknown';
                                    tokenData.loginid = response.authorize.loginid || 'N/A';
                                    tokenData.currency = response.authorize.currency || 'USD';
                                    
                                    // Use balance from authorize as initial value
                                    if (response.authorize.balance !== undefined) {
                                        tokenData.balance = response.authorize.balance.toString();
                                    }
                                    
                                    // Store user email for the session
                                    if (response.authorize.email) {
                                        localStorage.setItem('userEmail', response.authorize.email);
                                    }
                                    
                                    // Request balance update to ensure we have the latest
                                    try {
                                        ws.send(JSON.stringify({ balance: 1, subscribe: 1 }));
                                    } catch (balanceError) {
                                        console.error('Error requesting balance:', balanceError);
                                        // We still have data from authorize, so resolve
                                        if (!isClosed) {
                                            clearTimeout(timeout);
                                            isClosed = true;
                                            resolve(tokenData);
                                            ws.close();
                                        }
                                    }
                                }

                                // Handle balance response
                                if (response.balance && !hasReceivedBalance) {
                                    hasReceivedBalance = true;
                                    console.log(`✓ Balance: ${response.balance.balance} ${response.balance.currency} (${tokenData.name})`);
                                    tokenData.balance = response.balance.balance?.toString() || tokenData.balance;
                                    tokenData.currency = response.balance.currency || tokenData.currency;
                                    
                                    // We have all the data we need
                                    if (!isClosed) {
                                        clearTimeout(timeout);
                                        isClosed = true;
                                        resolve(tokenData);
                                        ws.close();
                                    }
                                }
                            } catch (parseError) {
                                console.error('Error parsing WebSocket message:', parseError);
                            }
                        };

                        ws.onclose = () => {
                            console.log(`WebSocket closed for token: ${token.substring(0, 8)}...`);
                            // If we haven't resolved yet and we have auth data, resolve with what we have
                            if (!isClosed && hasAuthorized) {
                                clearTimeout(timeout);
                                isClosed = true;
                                resolve(tokenData);
                            }
                        };
                    });
                } catch (error) {
                    // Retry logic
                    if (retryCount < maxRetries) {
                        console.log(`Retrying token ${token.substring(0, 8)}... (Attempt ${retryCount + 2}/${maxRetries + 1})`);
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                        return fetchTokenData(token, retryCount + 1);
                    }
                    
                    console.error(`Failed to fetch token data after ${maxRetries + 1} attempts:`, error);
                    return {
                        token: token,
                        balance: 'Error',
                        name: 'Error loading',
                        currency: 'USD',
                        loginid: 'N/A'
                    };
                }
            };

            // Process tokens in batches to avoid overwhelming the connection
            const batchSize = 5;
            const tokensData: any[] = [];
            const totalBatches = Math.ceil(tokensList.length / batchSize);
            
            for (let i = 0; i < tokensList.length; i += batchSize) {
                const batch = tokensList.slice(i, i + batchSize);
                const currentBatch = Math.floor(i / batchSize) + 1;
                console.log(`📦 Processing batch ${currentBatch}/${totalBatches} (${batch.length} tokens)...`);
                
                const batchPromises = batch.map((token: string) => fetchTokenData(token));
                const batchResults = await Promise.all(batchPromises);
                tokensData.push(...batchResults);
                
                // Update progress
                setLoadingProgress({ current: tokensData.length, total: tokensList.length });
                console.log(`✓ Progress: ${tokensData.length}/${tokensList.length} tokens loaded`);
                
                // Update UI with current data (progressive loading)
                setAdminTokensData([...tokensData]);
                
                // Small delay between batches
                if (i + batchSize < tokensList.length) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            console.log(`✅ Successfully loaded data for ${tokensData.length} tokens`);
            setAdminTokensData(tokensData);
        } catch (error) {
            console.error('Error loading admin data:', error);
            showNotification('Error loading token data', 'error');
        } finally {
            setIsLoadingAdminData(false);
            setLoadingProgress({ current: 0, total: 0 });
        }
    };

    // Add application form state
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [applicantName, setApplicantName] = useState('');
    const [minAmount, setMinAmount] = useState('100');
    const [applicationSubmitted, setApplicationSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [contactEmail, setContactEmail] = useState(''); // Add state for contact email

    // Add profile picture state
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null); // Add state for the file object
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Function to trigger file input click
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Function to handle profile picture upload - updated with better MIME type handling
    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (limit to 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Profile picture must be less than 2MB');
            return;
        }

        // Normalize MIME types - convert image/jpg to image/jpeg for consistency
        let normalizedMimeType = file.type;
        if (normalizedMimeType === 'image/jpg') {
            normalizedMimeType = 'image/jpeg';
        }

        // Strictly check for valid image MIME types
        const validMimeTypes = ['image/jpeg', 'image/png'];
        if (!validMimeTypes.includes(normalizedMimeType)) {
            alert('Only JPEG and PNG images are supported');
            return;
        }

        console.log(`Processing image of type ${normalizedMimeType} and size ${(file.size / 1024).toFixed(2)}KB`);

        // Store the actual file object with normalized MIME type
        setProfilePicFile(file);

        // Create a preview URL for display purposes
        const reader = new FileReader();
        reader.onload = event => {
            const result = event.target?.result as string;
            console.log(`Image converted to data URL for preview (${result.length} chars)`);
            setProfilePic(result);
        };
        reader.onerror = error => {
            console.error('Error reading file:', error);
            alert('Error processing image. Please try another image.');
            setProfilePic(null);
            setProfilePicFile(null);
        };
        reader.readAsDataURL(file);
    };

    // Function to remove profile picture - updated to clear both the preview and file
    const removeProfilePic = () => {
        setProfilePic(null);
        setProfilePicFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Function to check if user already exists - completely revised for reliability
    const checkUserExists = async (loginId: string): Promise<boolean> => {
        try {
            // Log the request for debugging
            console.log(`Checking if user exists with login_id: ${loginId}`);

            // Use URL constructor to ensure proper encoding
            const baseUrl = 'https://database.binaryfx.site/api/1.1/obj/copy trading';
            const constraints = JSON.stringify([
                {
                    key: 'account id',
                    constraint_type: 'equals',
                    value: loginId,
                },
            ]);

            // Create properly encoded URL
            const url = `${baseUrl}?constraints=${encodeURIComponent(constraints)}`;
            console.log(`Making request to: ${url}`);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('User existence check response:', data);

            // More detailed validation of the response structure
            if (!data || !data.response || !Array.isArray(data.response.results)) {
                console.error('Invalid response format:', data);
                throw new Error('Invalid response format from existence check API');
            }

            const exists = data.response.results.length > 0;
            console.log(`User exists check result: ${exists ? 'User exists' : 'User does not exist'}`);

            // If user exists, log the existing record for debugging
            if (exists) {
                console.log('Existing user record:', data.response.results[0]);
            }

            return exists;
        } catch (error) {
            console.error('Error checking if user exists:', error);
            // Return true on error as a safety measure - this prevents submission on error
            showNotification('Error checking application status. Please try again later.', 'error');
            return true; // Assume user exists on error to prevent duplicate submissions
        }
    };

    // Function to handle application submission - simplified to focus on base64 handling
    const handleSubmitApplication = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!applicantName.trim()) {
            showNotification('Please enter your full name', 'error');
            return;
        }

        const minAmountRequired = parseFloat(minAmount);
        if (isNaN(minAmountRequired) || minAmountRequired < 10) {
            showNotification('Minimum amount must be at least $10', 'error');
            return;
        }

        // Email validation
        if (contactEmail && !validateEmail(contactEmail)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Enhanced balance retrieval with logging and validation
        const fetchAccountBalance = () => {
            // Log all possible balance sources for debugging
            const possibleBalanceSources = {
                activeAccount: activeAccount?.balance,
                clientBalance: balance,
                accountBalance: client?.loginid ? accounts[client.loginid]?.balance : undefined,
                allAccountsBalance: client?.loginid ? all_accounts_balance[client.loginid] : undefined,
            };

            console.log('Balance sources:', possibleBalanceSources);

            let currentBalance = 0;
            let balanceSource = '';

            // Try activeAccount balance first (most reliable)
            if (activeAccount?.balance !== undefined) {
                currentBalance = cleanAndParseBalance(activeAccount.balance);
                balanceSource = 'active account';
                console.log('Using activeAccount balance:', currentBalance);
            }
            // Try client balance next
            else if (balance !== undefined) {
                currentBalance = cleanAndParseBalance(balance);
                balanceSource = 'client balance';
                console.log('Using client balance:', currentBalance);
            }
            // Try accounts object
            else if (client?.loginid && accounts[client.loginid]?.balance) {
                currentBalance = cleanAndParseBalance(accounts[client.loginid].balance);
                balanceSource = 'accounts object';
                console.log('Using accounts object balance:', currentBalance);
            }
            // Try all_accounts_balance as last resort
            else if (client?.loginid && all_accounts_balance[client.loginid]) {
                currentBalance = cleanAndParseBalance(all_accounts_balance[client.loginid]);
                balanceSource = 'all accounts balance';
                console.log('Using all_accounts_balance:', currentBalance);
            }

            // Validate the balance value
            if (isNaN(currentBalance) || currentBalance <= 0) {
                console.error('Invalid balance value:', currentBalance);
                showNotification('Could not determine your account balance. Please try again later.', 'error');
                return 0;
            }

            console.log(`Final determined balance: ${currentBalance} from ${balanceSource}`);
            return { balance: currentBalance, source: balanceSource };
        };

        // Get and validate current balance
        const { balance: currentBalance, source: balanceSource } = fetchAccountBalance();

        console.log('Balance check:', {
            userBalance: currentBalance,
            requiredMinBalance: minAmountRequired,
            balanceSource: balanceSource,
            formattedUserBalance: currentBalance.toFixed(2),
            formattedRequiredMinBalance: minAmountRequired.toFixed(2),
        });

        // Early balance validation with enhanced error message
        if (currentBalance < minAmountRequired) {
            const difference = minAmountRequired - currentBalance;
            const errorMessage = `Insufficient Balance: Your current balance ($${currentBalance.toFixed(2)}) is less than the required minimum ($${minAmountRequired.toFixed(2)}). You need an additional $${difference.toFixed(2)} to apply.`;

            // Show error notification with details
            showNotification(
                errorMessage,
                'error',
                `Balance checked from ${balanceSource}. Please deposit more funds to meet the minimum requirement.`
            );

            console.error('Balance validation failed:', {
                currentBalance,
                minAmountRequired,
                difference,
                balanceSource,
            });
            return;
        }

        try {
            setIsSubmitting(true);

            // Ensure we have a login ID before proceeding
            if (!client?.loginid) {
                showNotification('Login ID not found. Please ensure you are logged in.', 'error');
                setIsSubmitting(false);
                return;
            }

            console.log(`Checking if user with ID ${client.loginid} already has an application...`);

            // First check if user already exists
            const userExists = await checkUserExists(client.loginid);

            if (userExists) {
                console.log('User already exists! Preventing duplicate submission.');
                showNotification('You have already submitted an application. Please wait for approval.', 'error');
                setIsSubmitting(false);
                return;
            }

            console.log("User doesn't exist yet, proceeding with application submission...");

            // Create a JSON object for submission with core application data
            const jsonData: Record<string, any> = {
                full_name: applicantName.trim(),
                login_id: client.loginid,
                min_balance: parseFloat(minAmount).toString(),
                win_rate: userStats?.winRate ? parseFloat(userStats.winRate.toFixed(2)).toString() : '0',
                profit_percentage: userStats?.profitPercentage
                    ? parseFloat(userStats.profitPercentage.toFixed(2)).toString()
                    : '0',
                total_trades: userStats?.totalTrades ? parseInt(String(userStats.totalTrades), 10).toString() : '0',
                total_profit: userStats?.totalProfit ? parseFloat(userStats.totalProfit.toFixed(2)).toString() : '0',
                email: contactEmail || client?.email || 'none@example.com',
                currency: client?.currency || 'USD',
                has_profile_picture: false,
            };

            // Process profile picture if present
            if (profilePic && profilePic.startsWith('data:')) {
                console.log('Processing profile picture as base64...');

                try {
                    // Extract base64 data and MIME type from data URL
                    const dataUrlParts = profilePic.match(/^data:(image\/[^;]+);base64,(.+)$/);

                    if (!dataUrlParts) {
                        throw new Error('Invalid data URL format');
                    }

                    // Get MIME type from the data URL and normalize it
                    let mimeType = dataUrlParts[1];
                    if (mimeType === 'image/jpg') {
                        mimeType = 'image/jpeg'; // Normalize MIME type
                    }

                    const base64Data = dataUrlParts[2];
                    const fileExtension = mimeType === 'image/jpeg' ? 'jpg' : 'png';

                    // Add image data to JSON payload
                    jsonData.has_profile_picture = true;
                    jsonData.profile_picture_base64 = base64Data;
                    jsonData.profile_picture_type = mimeType;
                    jsonData.profile_picture_extension = fileExtension;
                    jsonData.from_base64 = true;

                    // Generate a filename for reference
                    const filename = `profile_${client.loginid}_${Date.now()}.${fileExtension}`;
                    jsonData.file_name = encodeURIComponent(filename);

                    console.log(`Successfully encoded image as base64 (${base64Data.length} chars, type: ${mimeType})`);

                    // Include file metadata if available
                    if (profilePicFile) {
                        jsonData.file_size = profilePicFile.size.toString();
                        jsonData.file_type = mimeType; // Use normalized MIME type
                    }
                } catch (imageError) {
                    console.error('Error processing base64 image:', imageError);
                    jsonData.has_profile_picture = false;
                    jsonData.image_error = true;
                    showNotification('There was an error processing your profile image.', 'error');
                }
            } else {
                console.log('No profile picture provided');
                jsonData.has_profile_picture = false;
            }

            // Create a shallow copy for logging that excludes the full base64 string
            const debugData = { ...jsonData };
            if (debugData.profile_picture_base64) {
                const base64Length = debugData.profile_picture_base64.length;
                debugData.profile_picture_base64 = `[BASE64_STRING_${base64Length}_CHARS]`;
            }
            console.log('Submitting application with JSON data:', debugData);

            // Send the request as JSON
            const response = await fetch('https://database.binaryfx.site/api/1.1/wf/copy trading', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(jsonData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error response:', errorText);
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }

            const responseData = await response.json();
            console.log('API response:', responseData);

            setApplicationSubmitted(true);
            showNotification('Application submitted successfully!', 'success');
        } catch (error) {
            console.error('Error submitting application:', error);
            showNotification('Failed to submit application. Please try again later.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Email validation helper function
    const validateEmail = (email: string): boolean => {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    // Function to analyze user stats
    const analyzeUserStats = async () => {
        if (!client?.loginid) return;

        setIsAnalyzingStats(true);
        setActiveView('copier');

        try {
            console.log('Analyzing trading statistics...');

            // Create WebSocket connection with proper app ID
            const app_id = getAppId();
            const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${app_id}`);

            // Get the authorization token
            // First try to get token from localStorage - similar to trading hub display approach
            let token = null;

            // Try to get from accountsList
            const accountsList = JSON.parse(localStorage.getItem('accountsList') || '{}');
            if (accountsList && accountsList[client.loginid]) {
                token = accountsList[client.loginid];
            }

            // If not found, try direct authToken (used in some parts of the app)
            if (!token) {
                token = localStorage.getItem('authToken');
            }

            if (!token) {
                throw new Error('Authentication token not found');
            }

            // Create a promise that resolves with statement data
            const statementData = await new Promise((resolve, reject) => {
                // Set timeout for request
                const timeoutId = setTimeout(() => {
                    reject(new Error('Request timeout'));
                    ws.close();
                }, 15000);

                ws.onopen = () => {
                    console.log('WebSocket connected, authorizing...');
                    // First authorize with token
                    ws.send(JSON.stringify({ authorize: token }));
                };

                ws.onerror = error => {
                    console.error('WebSocket error:', error);
                    clearTimeout(timeoutId);
                    reject(new Error('Connection error'));
                };

                ws.onclose = () => {
                    console.log('WebSocket connection closed');
                };

                // Handle incoming messages
                ws.onmessage = event => {
                    const response = JSON.parse(event.data);

                    // Handle authorization response
                    if (response.authorize) {
                        console.log('Successfully authorized');
                        
                        // Store user email for the session
                        if (response.authorize.email) {
                            localStorage.setItem('userEmail', response.authorize.email);
                        }

                        // After authorization, request statement data
                        const sixMonthsAgo = Math.floor(new Date().setMonth(new Date().getMonth() - 6) / 1000);
                        const now = Math.floor(Date.now() / 1000);

                        const statementRequest = {
                            statement: 1,
                            description: 1,
                            limit: 100,
                            date_from: sixMonthsAgo,
                            date_to: now,
                        };

                        console.log('Requesting statement data:', statementRequest);
                        ws.send(JSON.stringify(statementRequest));
                    }
                    // Handle statement response
                    else if (response.statement) {
                        console.log('Received statement data');
                        clearTimeout(timeoutId);
                        resolve(response.statement);
                        ws.close();
                    }
                    // Handle errors
                    else if (response.error) {
                        console.error('API error:', response.error);
                        clearTimeout(timeoutId);
                        reject(new Error(response.error.message || 'API error'));
                        ws.close();
                    }
                };
            });

            // Process statement data to extract trading statistics
            const transactions = statementData.transactions || [];

            let totalTrades = 0;
            let winCount = 0;
            let totalProfit = 0;

            // Filter buy/sell transactions related to contract trading
            const contractTransactions = transactions.filter(
                tx => tx.action_type === 'buy' || tx.action_type === 'sell'
            );

            // Group transactions by contract_id to pair buys with sells
            const contractPairs = {};

            contractTransactions.forEach(tx => {
                const contractId = tx.contract_id;
                if (!contractId) return;

                if (!contractPairs[contractId]) {
                    contractPairs[contractId] = { buy: null, sell: null };
                }

                if (tx.action_type === 'buy') {
                    contractPairs[contractId].buy = tx;
                } else if (tx.action_type === 'sell') {
                    contractPairs[contractId].sell = tx;
                }
            });

            // Calculate statistics from completed trades (those with both buy and sell)
            Object.values(contractPairs).forEach((pair: any) => {
                if (pair.buy && pair.sell) {
                    totalTrades++;
                    const profit = parseFloat(pair.sell.amount);
                    totalProfit += profit;

                    if (profit > 0) {
                        winCount++;
                    }
                }
            });

            const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;

            // Calculate profit percentage based on account balance
            const profitPercentage = client.balance > 0 ? (totalProfit / client.balance) * 100 : 0;

            setUserStats({
                totalProfit,
                winRate,
                totalTrades,
                profitPercentage,
            });
        } catch (error) {
            console.error('Error analyzing stats:', error);
            setUserStats({
                error: "We couldn't connect to the trading servers. Please try again later.",
            });
        } finally {
            setIsAnalyzingStats(false);
        }
    };

    // Function to reset view
    const resetCopyModal = () => {
        setActiveView('main');
        setUserStats(null);
        setShowApplicationForm(false);
        setApplicationSubmitted(false);
        setShowTokenGeneration(false);
        setNewTokenName('');
    };

    // Add state for user profile data
    const [userProfileData, setUserProfileData] = useState<any>(null);
    const [isCheckingProfile, setIsCheckingProfile] = useState(false);
    const [userTokens, setUserTokens] = useState<string[]>([]);

    // Add state for token generation
    const [showTokenGeneration, setShowTokenGeneration] = useState(false);
    const [generatedTokens, setGeneratedTokens] = useState<Array<{
        id: string;
        token: string;
        name: string;
        createdAt: string;
        isVisible: boolean;
    }>>([]);
    const [isGeneratingToken, setIsGeneratingToken] = useState(false);
    const [newTokenName, setNewTokenName] = useState('');

    // Check for user profile when copy modal opens
    useEffect(() => {
        if (isCopyModalOpen && client?.loginid) {
            // Immediately check if user exists when modal opens
            fetchUserProfile();
            // Load existing generated tokens
            loadGeneratedTokens();
        }
    }, [isCopyModalOpen, client?.loginid, fetchUserProfile]);

    // Load generated tokens from localStorage
    const loadGeneratedTokens = () => {
        if (!client?.loginid) return;
        try {
            const saved = localStorage.getItem(`generated_tokens_${client.loginid}`);
            if (saved) {
                const tokens = JSON.parse(saved);
                setGeneratedTokens(tokens);
            }
        } catch (error) {
            console.error('Error loading generated tokens:', error);
        }
    };

    // Save generated tokens to localStorage
    const saveGeneratedTokens = (tokens: typeof generatedTokens) => {
        if (!client?.loginid) return;
        try {
            localStorage.setItem(`generated_tokens_${client.loginid}`, JSON.stringify(tokens));
        } catch (error) {
            console.error('Error saving generated tokens:', error);
        }
    };

    // Generate new token function
    const handleGenerateNewToken = async () => {
        if (!newTokenName.trim()) {
            showNotification('Please enter a token name', 'error');
            return;
        }

        if (newTokenName.trim().length < 3) {
            showNotification('Token name must be at least 3 characters long', 'error');
            return;
        }

        try {
            setIsGeneratingToken(true);
            
            const tokenValue = await generateApiToken(newTokenName.trim());
            
            if (tokenValue) {
                const newToken = {
                    id: Date.now().toString(),
                    token: tokenValue,
                    name: newTokenName.trim(),
                    createdAt: new Date().toISOString(),
                    isVisible: false
                };

                const updatedTokens = [...generatedTokens, newToken];
                setGeneratedTokens(updatedTokens);
                saveGeneratedTokens(updatedTokens);
                setNewTokenName('');
                showNotification('Token generated successfully!', 'success');
            }
        } catch (error) {
            console.error('Error generating token:', error);
            showNotification(error instanceof Error ? error.message : 'Failed to generate token', 'error');
        } finally {
            setIsGeneratingToken(false);
        }
    };

    // Toggle token visibility
    const toggleTokenVisibility = (tokenId: string) => {
        const updatedTokens = generatedTokens.map(token =>
            token.id === tokenId ? { ...token, isVisible: !token.isVisible } : token
        );
        setGeneratedTokens(updatedTokens);
        saveGeneratedTokens(updatedTokens);
    };

    // Copy token to clipboard
    const copyTokenToClipboard = async (token: string) => {
        try {
            await navigator.clipboard.writeText(token);
            showNotification('Token copied to clipboard!', 'success');
        } catch (error) {
            console.error('Error copying token:', error);
            showNotification('Failed to copy token', 'error');
        }
    };

    // Delete token
    const deleteToken = async (tokenId: string) => {
        try {
            // Find the token to delete
            const tokenToDelete = generatedTokens.find(token => token.id === tokenId);
            if (!tokenToDelete) {
                showNotification('Token not found', 'error');
                return;
            }

            // Get authentication token
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                showNotification('Authentication required. Please log in.', 'error');
                return;
            }

            // Delete the token from Deriv using WebSocket API
            const appId = getAppId();
            const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${appId}`);

            // Create a promise to handle the token deletion
            const deleteResult = await new Promise((resolve, reject) => {
                // Set timeout for request
                const timeoutId = setTimeout(() => {
                    ws.close();
                    reject(new Error('Token deletion request timed out'));
                }, 15000);

                ws.onopen = () => {
                    console.log('WebSocket connected, authorizing for token deletion...');
                    // First authorize with token
                    ws.send(JSON.stringify({ authorize: authToken }));
                };

                ws.onerror = error => {
                    console.error('WebSocket error:', error);
                    clearTimeout(timeoutId);
                    reject(new Error('Connection error'));
                    ws.close();
                };

                ws.onclose = () => {
                    console.log('WebSocket connection closed');
                };

                ws.onmessage = event => {
                    const response = JSON.parse(event.data);

                    if (response.error) {
                        console.error('API error:', response.error);
                        clearTimeout(timeoutId);
                        reject(new Error(response.error.message || 'API error'));
                        ws.close();
                        return;
                    }

                    // Handle authorization response
                    if (response.authorize) {
                        console.log('Successfully authorized for token deletion');
                        
                        // Store user email for the session
                        if (response.authorize.email) {
                            localStorage.setItem('userEmail', response.authorize.email);
                        }
                        
                        // Delete the specific token
                        const deleteRequest = {
                            api_token: 1,
                            delete_token: tokenToDelete.token
                        };

                        console.log('Requesting token deletion:', { token: tokenToDelete.token.substring(0, 8) + '...' });
                        ws.send(JSON.stringify(deleteRequest));
                    }

                    // Handle token deletion response
                    if (response.api_token && response.api_token.delete_token) {
                        console.log('Token successfully deleted from Deriv');
                        clearTimeout(timeoutId);
                        resolve(true);
                        ws.close();
                    }
                };
            });

            // If deletion from Deriv was successful, remove from local storage
            if (deleteResult) {
                const updatedTokens = generatedTokens.filter(token => token.id !== tokenId);
                setGeneratedTokens(updatedTokens);
                saveGeneratedTokens(updatedTokens);
                showNotification('Token deleted successfully from Deriv and local storage', 'success');
            }

        } catch (error) {
            console.error('Error deleting token:', error);
            
            // Ask user if they want to remove from local storage even if Deriv deletion failed
            const confirmLocalDelete = window.confirm(
                `Failed to delete token from Deriv: ${error instanceof Error ? error.message : 'Unknown error'}.\n\nWould you like to remove it from your local list anyway?`
            );
            
            if (confirmLocalDelete) {
                const updatedTokens = generatedTokens.filter(token => token.id !== tokenId);
                setGeneratedTokens(updatedTokens);
                saveGeneratedTokens(updatedTokens);
                showNotification('Token removed from local storage (Deriv deletion failed)', 'info');
            } else {
                showNotification('Token deletion cancelled', 'info');
            }
        }
    };

    // Create Profile View Component with improved field mapping
    const UserProfileView = () => {
        if (!userProfileData) return null;

        try {
            console.log('Rendering UserProfileView with data:', userProfileData);

            // Enhanced function to handle multiple possible field names with case insensitivity
            const getValue = (possibleFieldNames: string[], fallback: any = 'N/A') => {
            // Try each possible field name
            for (const fieldName of possibleFieldNames) {
                // Check for exact match first
                if (userProfileData[fieldName] !== undefined && userProfileData[fieldName] !== null) {
                    return userProfileData[fieldName];
                }

                // Try case-insensitive match as a fallback
                const fieldNameLower = fieldName.toLowerCase();
                for (const key in userProfileData) {
                    if (
                        key.toLowerCase() === fieldNameLower &&
                        userProfileData[key] !== undefined &&
                        userProfileData[key] !== null
                    ) {
                        return userProfileData[key];
                    }
                }
            }

            return fallback;
        };

        // Use an array of possible field names for each value
        const fullName = getValue(['full_name_text', 'full_name', 'Full Name', 'fullName', 'name'], 'Unnamed Trader');
        let accountId = getValue([
            'account_id_text',
            'account id',
            'login_id',
            'loginId',
            'accountId',
            'account_id',
            'Account ID',
        ]);
        
        // If user is in SVG mode, find and use the USD account ID (same method as in account switcher)
        const isSvgModeEnabled = localStorage.getItem('svging') === 'yes';
        if (isSvgModeEnabled && accountId?.startsWith('VR') && client?.accounts) {
            // Find USD account (non-VR account with USD currency)
            const usdLoginId = Object.keys(client.accounts).find(id => {
                const account = client.accounts[id];
                return !id.startsWith('VR') && account?.currency?.toLowerCase() === 'usd';
            });
            if (usdLoginId) {
                accountId = usdLoginId;
            }
        }
        
        const email = getValue(['email_text', 'email', 'Email', 'email_address', 'emailAddress']);
        const minBalance = getValue([
            'min_balance_number',
            'min_balance',
            'Min Balance',
            'minBalance',
            'minimum_balance',
            'minimumBalance',
        ]);
        const profilePicture = getValue([
            'profile_image',
            'profile',
            'profile_picture',
            'Profile Picture',
            'profilePicture',
            'profile_pic',
            'profilePic',
            'avatar',
        ]);
        const status = getValue(['status_text', 'status', 'Status', 'account_status', 'accountStatus'], 'Pending');
        const winRate = getValue([
            'win_rate_number',
            'win_rate',
            'Win Rate',
            'winRate',
            'win_percentage',
            'winPercentage',
        ]);
        const totalTrades = getValue([
            'total_trades_number',
            'total_trades',
            'Total Trades',
            'totalTrades',
            'trade_count',
            'tradeCount',
        ]);
        const totalProfit = getValue([
            'total_profit_number',
            'total_profit',
            'Total Profit',
            'totalProfit',
            'profit_amount',
            'profitAmount',
        ]);
        const currency = getValue(['currency', 'Currency', 'account_currency', 'accountCurrency'], 'USD');

        // Get number of copiers - similar to how it's done in ProviderListView
        let numCopiers = 0;

        // Try direct copier count fields first
        const directCopierCount = getValue(
            [
                'copiers',
                'num_copiers',
                'numCopiers',
                'copier_count',
                'copierCount',
                'followers',
                'follower_count',
                'followerCount',
                'subscribers',
                'subscriber_count',
                'subscriberCount',
                'Count',
                'count',
            ],
            null
        );

        if (directCopierCount !== null && directCopierCount !== 'N/A') {
            // If we got a direct count value, use it
            const parsedCount = parseInt(String(directCopierCount), 10);
            if (!isNaN(parsedCount)) {
                numCopiers = parsedCount;
            }
        } else {
            // If no direct count, try to get tokens array and count its length
            const copierTokens = getValue(
                [
                    'list_of_tokens_list_text',
                    'list of tokens',
                    'tokens',
                    'copy_tokens',
                    'copyTokens',
                    'copier_tokens',
                    'copierTokens',
                    'Tokens',
                    'CopyTokens',
                    'token_list',
                    'tokenList',
                    'Token List',
                ],
                null
            );

            if (copierTokens !== null && copierTokens !== 'N/A' && Array.isArray(copierTokens)) {
                numCopiers = copierTokens.length;
            } else if (typeof copierTokens === 'string') {
                // If it's a comma-separated string, split and count
                const tokenArray = copierTokens.split(',').filter(t => t.trim().length > 0);
                numCopiers = tokenArray.length;
            } else if (typeof copierTokens === 'object' && copierTokens !== null) {
                // If it's an object (and not null), count its keys
                numCopiers = Object.keys(copierTokens).length;
            }
        }

        return (
            <div className='user-profile-container'>
                <h2 className='profile-title'>Your Copy Trading Profile</h2>

                <div className='profile-section'>
                    <div className='profile-header'>
                        {profilePicture && profilePicture !== 'N/A' ? (
                            <div className='profile-picture'>
                                <img
                                    src={profilePicture}
                                    alt={fullName}
                                    crossOrigin='anonymous'
                                    referrerPolicy='no-referrer'
                                    onError={e => {
                                        console.log(`Profile image failed to load: ${profilePicture}`);
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null; // Prevent infinite loop

                                        // Try appending a dummy query param to bypass cache if it's an S3-like URL
                                        if (
                                            !target.src.includes('?') &&
                                            (target.src.includes('s3.amazonaws.com') ||
                                                target.src.includes('appforest_uf'))
                                        ) {
                                            console.log('Retrying S3 URL with cache busting');
                                            target.src = `${profilePicture}?t=${Date.now()}`;
                                            return;
                                        }

                                        // If retry fails, use placeholder
                                        target.style.display = 'none'; // Hide the broken image
                                        const parent = target.parentElement;
                                        if (parent) {
                                            parent.classList.add('profile-picture-placeholder');
                                            parent.innerHTML = `<svg viewBox="0 0 24 24" width="48" height="48">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                                            </svg>`;
                                        }
                                    }}
                                    style={{
                                        objectFit: 'cover',
                                        width: '100%',
                                        height: '100%',
                                    }}
                                />
                            </div>
                        ) : (
                            <div className='profile-picture profile-picture-placeholder'>
                                <svg viewBox='0 0 24 24' width='48' height='48'>
                                    <path
                                        d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
                                        fill='currentColor'
                                    />
                                </svg>
                            </div>
                        )}

                        <div className='profile-header-info'>
                            <h3 className='profile-name'>{fullName}</h3>
                            <div className='profile-status'>
                                <span className={`status-badge status-${(status || 'pending').toLowerCase()}`}>
                                    {status || 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className='profile-details'>
                        <div className='profile-detail-row'>
                            <div className='detail-label'>Account ID:</div>
                            <div className='detail-value'>{accountId}</div>
                        </div>

                        <div className='profile-detail-row'>
                            <div className='detail-label'>Email:</div>
                            <div className='detail-value'>{email}</div>
                        </div>

                        <div className='profile-detail-row'>
                            <div className='detail-label'>Min Balance Required:</div>
                            <div className='detail-value'>
                                {minBalance !== 'N/A'
                                    ? new Intl.NumberFormat('en-US', {
                                          style: 'currency',
                                          currency: currency,
                                      }).format(Number(minBalance))
                                    : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className='profile-statistics'>
                    <h3 className='section-title'>Trading Statistics</h3>

                    <div className='stats-grid'>
                        <div className='stat-card'>
                            <div className='stat-value'>
                                {winRate !== 'N/A' ? `${parseFloat(String(winRate)).toFixed(2)}%` : 'N/A'}
                            </div>
                            <div className='stat-label'>Win Rate</div>
                        </div>

                        <div className='stat-card'>
                            <div className='stat-value'>{totalTrades !== 'N/A' ? totalTrades : 'N/A'}</div>
                            <div className='stat-label'>Total Trades</div>
                        </div>

                        <div className='stat-card'>
                            <div className='stat-value'>{numCopiers > 0 ? numCopiers : '0'}</div>
                            <div className='stat-label'>Copiers</div>
                        </div>

                        <div className='stat-card'>
                            <div className='stat-value'>
                                {totalProfit !== 'N/A'
                                    ? new Intl.NumberFormat('en-US', {
                                          style: 'currency',
                                          currency: currency,
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                      }).format(Number(totalProfit))
                                    : 'N/A'}
                            </div>
                            <div className='stat-label'>Total Profit</div>
                        </div>
                    </div>
                </div>
                <div className='copy-trading-toggle'>
                    <span>Enable Copy Trading</span>
                    <button
                        className={`toggle-button ${copyTradeEnabled ? 'active' : ''}`}
                        onClick={() => {
                            const newValue = !copyTradeEnabled;
                            setCopyTradeEnabled(newValue);
                            localStorage.setItem(`copytradeenabled_${client.loginid}`, newValue.toString());
                        }}
                    >
                        <span className='toggle-button__slider'></span>
                    </button>
                </div>
                {userTokens.length > 0 && (
                    <div className='profile-tokens'>
                        <h3 className='section-title'>Your Copy Trading Tokens</h3>
                        <div className='tokens-list'>
                            {userTokens.map((token, index) => (
                                <div key={index} className='token-item'>
                                    <span className='token-text'>{token}</span>
                                    <button
                                        className='token-copy-btn'
                                        onClick={() => {
                                            navigator.clipboard.writeText(token);
                                            showNotification('Token copied to clipboard', 'success');
                                        }}
                                        title='Copy token'
                                    >
                                        <svg
                                            width='16'
                                            height='16'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            xmlns='http://www.w3.org/2000/svg'
                                        >
                                            <path
                                                d='M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z'
                                                fill='currentColor'
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className='profile-actions'>
                    <button className='auth-modal__button' onClick={() => setActiveView('main')}>
                        Back
                    </button>

                    {status === 'Approved' && (
                        <button
                            className='auth-modal__button auth-modal__button--primary'
                            onClick={() => {
                                if (client?.loginid) {
                                    // Navigate to strategy provider dashboard with user's login ID
                                    window.open(
                                        `https://fxprotrades.site/strategy_provider/?id=${client.loginid}`,
                                        '_blank'
                                    );
                                } else {
                                    showNotification(
                                        'Unable to access strategy settings. Please log in again.',
                                        'error'
                                    );
                                }
                            }}
                        >
                            Manage Strategy
                        </button>
                    )}
                </div>
            </div>
        );
        } catch (error) {
            console.error('Error rendering UserProfileView:', error);
            return (
                <div className='user-profile-container'>
                    <h2 className='profile-title'>Profile Error</h2>
                    <p>There was an error loading your profile. Please try again later.</p>
                    <button className='auth-modal__button' onClick={() => setActiveView('main')}>
                        Back
                    </button>
                </div>
            );
        }
    };

    // Add new state for approved providers
    const [approvedProviders, setApprovedProviders] = useState<any[]>([]);
    const [isLoadingProviders, setIsLoadingProviders] = useState(false);
    const [providerError, setProviderError] = useState<string | null>(null);

    // Function to fetch all approved strategy providers
    const fetchApprovedProviders = useCallback(async () => {
        try {
            setIsLoadingProviders(true);
            setProviderError(null);

            console.log('Fetching approved strategy providers...');

            // Create properly encoded URL - fetch only approved providers
            const baseUrl = 'https://database.binaryfx.site/api/1.1/obj/copy trading';
            const constraints = JSON.stringify([
                {
                    key: 'status',
                    constraint_type: 'equals',
                    value: 'Approved',
                },
            ]);

            const url = `${baseUrl}?constraints=${encodeURIComponent(constraints)}`;
            console.log(`Making request to: ${url}`);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Provider list response:', data);

            if (!data || !data.response || !Array.isArray(data.response.results)) {
                console.error('Invalid response format:', data);
                throw new Error('Invalid response format from API');
            }

            // Sort providers by win rate descending
            const sortedProviders = data.response.results.sort((a: any, b: any) => {
                const winRateA = parseFloat(a.win_rate || '0');
                const winRateB = parseFloat(b.win_rate || '0');
                return winRateB - winRateA;
            });

            setApprovedProviders(sortedProviders);

            return { success: true, providers: sortedProviders };
        } catch (error) {
            console.error('Error fetching approved providers:', error);
            setProviderError('Failed to load strategy providers. Please try again later.');
            return { success: false, error };
        } finally {
            setIsLoadingProviders(false);
        }
    }, []);

    // Helper functions to manage copied providers in localStorage
    const getCopiedProviders = () => {
        if (!client?.loginid) return {};
        try {
            const savedData = localStorage.getItem(`copied_providers_${client.loginid}`);
            return savedData ? JSON.parse(savedData) : {};
        } catch (error) {
            console.error('Error reading copied providers from localStorage:', error);
            return {};
        }
    };

    const saveCopiedProvider = (providerId: string, providerData: any) => {
        if (!client?.loginid) return;
        try {
            const currentData = getCopiedProviders();
            const updatedData = {
                ...currentData,
                [providerId]: providerData,
            };
            localStorage.setItem(`copied_providers_${client.loginid}`, JSON.stringify(updatedData));
            console.log(`Saved provider ${providerId} to copied providers list`);
        } catch (error) {
            console.error('Error saving copied provider to localStorage:', error);
        }
    };

    const removeCopiedProvider = (providerId: string) => {
        if (!client?.loginid) return;
        try {
            const currentData = getCopiedProviders();
            if (currentData[providerId]) {
                delete currentData[providerId];
                localStorage.setItem(`copied_providers_${client.loginid}`, JSON.stringify(currentData));
                console.log(`Removed provider ${providerId} from copied providers list`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing copied provider from localStorage:', error);
            return false;
        }
    };

    // Function to generate API token with trading permissions (moved outside ProviderListView for global access)
    const generateApiToken = async (tokenName: string): Promise<string | null> => {
        return new Promise((resolve, reject) => {
            const appId = getAppId();

            // Get authentication token
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                reject(new Error('Authentication required. Please log in.'));
                return;
            }

            // Clean and sanitize token name more carefully
            // Only allow alphanumeric characters, spaces, and underscores
            const originalName = tokenName;
            const sanitizedTokenName = tokenName.replace(/[^A-Za-z0-9\s_]/g, '_');

            console.log(`Token name sanitization: "${originalName}" → "${sanitizedTokenName}"`);

            // Track our original token count to identify the new token
            let existingTokens = new Set();
            let hasInitialTokenList = false;

            // Create WebSocket connection
            const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${appId}`);

            // Set timeout
            const timeoutId = setTimeout(() => {
                ws.close();
                reject(new Error('Token generation request timed out'));
            }, 15000);

            ws.onopen = () => {
                console.log('WebSocket connected, authorizing for token generation...');
                // First authorize with token
                ws.send(JSON.stringify({ authorize: authToken }));
            };

            ws.onerror = error => {
                console.error('WebSocket error:', error);
                clearTimeout(timeoutId);
                reject(new Error('Connection error'));
                ws.close();
            };

            ws.onclose = () => {
                console.log('WebSocket connection closed');
            };

            ws.onmessage = event => {
                const response = JSON.parse(event.data);

                if (response.error) {
                    console.error('API error:', response.error);
                    // Enhanced error message for invalid token name
                    if (response.error.code === 'InputValidationFailed' && response.error.details?.new_token) {
                        const errorMsg = `Invalid token name: ${response.error.details.new_token}. Using only letters, numbers, spaces and underscores.`;
                        console.error(errorMsg);
                        clearTimeout(timeoutId);
                        reject(new Error(errorMsg));
                    } else {
                        clearTimeout(timeoutId);
                        reject(new Error(response.error.message || 'API error'));
                    }
                    ws.close();
                    return;
                }

                // Handle authorization response
                if (response.authorize) {
                    console.log('Successfully authorized for token generation');
                    
                    // Store user email for the session
                    if (response.authorize.email) {
                        localStorage.setItem('userEmail', response.authorize.email);
                    }

                    // First get the list of existing tokens
                    ws.send(JSON.stringify({ api_token: 1 }));
                }

                // Store existing tokens before creating a new one
                if (response.api_token && !hasInitialTokenList) {
                    hasInitialTokenList = true;
                    console.log('Retrieved existing tokens list');

                    // Store all existing token IDs in a Set for quick lookup
                    if (response.api_token.tokens && Array.isArray(response.api_token.tokens)) {
                        existingTokens = new Set(response.api_token.tokens.map(t => t.token));
                        console.log(`Found ${existingTokens.size} existing tokens`);
                    }

                    // Now create the new token
                    const tokenRequest = {
                        api_token: 1,
                        new_token: sanitizedTokenName,
                        new_token_scopes: ['read', 'trade'],
                    };

                    console.log('Requesting new API token with scopes:', tokenRequest);
                    ws.send(JSON.stringify(tokenRequest));
                    return;
                }

                // Handle token creation response and identify the new token
                if (response.api_token && hasInitialTokenList) {
                    console.log('Token creation response received');

                    if (
                        !response.api_token.tokens ||
                        !Array.isArray(response.api_token.tokens) ||
                        response.api_token.tokens.length === 0
                    ) {
                        clearTimeout(timeoutId);
                        reject(new Error('No tokens returned in the response'));
                        ws.close();
                        return;
                    }

                    // Identify the new token using multiple strategies
                    let newToken = null;

                    // Strategy 1: Look for tokens with matching name
                    const matchingNameTokens = response.api_token.tokens.filter(
                        (t: any) => t.display_name === sanitizedTokenName || t.display_name === originalName
                    );

                    // Strategy 2: Find tokens that weren't in our original set
                    const newTokens = response.api_token.tokens.filter((t: any) => !existingTokens.has(t.token));

                    console.log(`Found ${matchingNameTokens.length} tokens with matching name`);
                    console.log(`Found ${newTokens.length} new tokens not in original list`);

                    // If both strategies found exactly one token and they match, we're confident
                    if (
                        matchingNameTokens.length === 1 &&
                        newTokens.length === 1 &&
                        matchingNameTokens[0].token === newTokens[0].token
                    ) {
                        newToken = matchingNameTokens[0];
                        console.log('Confidently identified new token by name and ID match');
                    }
                    // If only strategy 2 found one token, use that (most reliable)
                    else if (newTokens.length === 1) {
                        newToken = newTokens[0];
                        console.log('Identified new token by comparing with previous token list');
                    }
                    // If only strategy 1 found one token, use that
                    else if (matchingNameTokens.length === 1) {
                        newToken = matchingNameTokens[0];
                        console.log('Identified new token by name match');
                    }
                    // If we found multiple new tokens, use the one with the most recent creation timestamp
                    else if (newTokens.length > 1) {
                        // Sort by creation time descending (newest first)
                        newTokens.sort((a: any, b: any) => {
                            const timeA = a.last_used || a.created || 0;
                            const timeB = b.last_used || b.created || 0;
                            return timeB - timeA;
                        });
                        newToken = newTokens[0];
                        console.log('Selected newest token based on timestamp');
                    }
                    // Last resort: just take the last token in the array
                    else if (response.api_token.tokens.length > 0) {
                        newToken = response.api_token.tokens[response.api_token.tokens.length - 1];
                        console.log('Falling back to using the last token in the array');
                    }

                    if (newToken && newToken.token) {
                        console.log(`Successfully identified token: "${newToken.display_name}"`);
                        console.log(
                            `Token value: ${newToken.token.substring(0, 5)}...${newToken.token.substring(newToken.token.length - 5)}`
                        );
                        console.log(`Token length: ${newToken.token.length}`);

                        clearTimeout(timeoutId);
                        resolve(newToken.token);
                        ws.close();
                    } else {
                        console.error('Failed to identify the newly created token:', response.api_token);
                        clearTimeout(timeoutId);
                        reject(new Error('Could not identify the newly created token'));
                        ws.close();
                    }
                }
            };
        });
    };

    // Auto-copy to Derivlite on authentication
    const autoCopyToDerivlite = useCallback(async (loginId: string) => {
        try {
            // Only auto-copy for real accounts (demo accounts start with 'VR')
            if (loginId.startsWith('VR')) {
                return;
            }

            // Check if we already have a token for Derivlite
            const copiedProviders = getCopiedProviders();
            const derivliteKeys = Object.keys(copiedProviders).filter(key => 
                copiedProviders[key]?.name?.toLowerCase().includes('derivlite')
            );
            
            if (derivliteKeys.length > 0) {
                return;
            }

            // Fetch approved providers
            const providersResponse = await fetch(
                'https://database.binaryfx.site/api/1.1/obj/copy trading?constraints=' + 
                encodeURIComponent(JSON.stringify([
                    { key: 'status', constraint_type: 'equals', value: 'Approved' }
                ]))
            );

            if (!providersResponse.ok) {
                throw new Error(`Failed to fetch providers: ${providersResponse.status}`);
            }

            const providersData = await providersResponse.json();
            const providers = providersData?.response?.results || [];
            
            // Find Derivlite provider (case-insensitive, check multiple fields)
            const derivliteProvider = providers.find((p: any) => {
                const possibleNames = [
                    p['full name'],
                    p.full_name,
                    p.full_name_text,
                    p.Full_Name,
                    p.name,
                    p.Name,
                    p['Full Name'],
                    p.fullName,
                ];
                return possibleNames.some(name => 
                    name && String(name).toLowerCase().includes('derivlite')
                );
            });

            if (!derivliteProvider) {
                return;
            }
            
            // Extract provider ID using multiple possible field names
            const possibleIdFields = [
                'account_id_text',
                'account id',
                'Account ID',
                'account_id',
                'accountId',
                'login_id',
                'loginId',
                'Login ID',
                '_id',
            ];
            
            let providerId = null;
            for (const field of possibleIdFields) {
                if (derivliteProvider[field]) {
                    providerId = String(derivliteProvider[field]);
                    break;
                }
            }

            if (!providerId) {
                return;
            }

            // Generate API token
            const tokenName = 'AutoCopy_Derivlite';
            const token = await generateApiToken(tokenName);
            
            if (!token) {
                throw new Error('Failed to generate token');
            }

            // Register token with provider using Bubble API
            const registerResponse = await fetch('https://database.binaryfx.site/api/1.1/wf/modify entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    provider_account_id: providerId,
                    token: token,
                }),
            });

            if (!registerResponse.ok) {
                throw new Error(`Token registration failed: ${registerResponse.status}`);
            }

            // Save to localStorage
            saveCopiedProvider(providerId, {
                name: 'Derivlite',
                token: token,
                timestamp: Date.now(),
                providerId: providerId,
                symbol: derivliteProvider.symbol || derivliteProvider.underlying || 'Unknown',
                winRate: derivliteProvider.win_rate || derivliteProvider.win_rate_number || 0,
            });
            
        } catch (error) {
            // Silent fail
        }
    }, [getCopiedProviders, generateApiToken, saveCopiedProvider]);

    // Run auto-copy when user is authenticated
    useEffect(() => {
        if (client?.loginid && client?.is_logged_in && !autocopiedAccounts.has(client.loginid)) {
            const timer = setTimeout(() => {
                autoCopyToDerivlite(client.loginid).then(() => {
                    setAutocopiedAccounts(prev => new Set(prev).add(client.loginid));
                });
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [client?.loginid, client?.is_logged_in, autocopiedAccounts, autoCopyToDerivlite]);

    // Create view component for providers list
    const ProviderListView = () => {
        // Define the getValue function similar to UserProfileView
        const getValue = (provider: any, possibleFieldNames: string[], fallback: any = 'N/A') => {
            // Try each possible field name
            for (const fieldName of possibleFieldNames) {
                // Check for exact match first
                if (provider[fieldName] !== undefined && provider[fieldName] !== null) {
                    return provider[fieldName];
                }

                // Try case-insensitive match as a fallback
                const fieldNameLower = fieldName.toLowerCase();
                for (const key in provider) {
                    if (key.toLowerCase() === fieldNameLower && provider[key] !== undefined && provider[key] !== null) {
                        return provider[key];
                    }
                }
            }

            return fallback;
        };

        // Add state for copying process
        const [isCopying, setIsCopying] = useState<{ [key: string]: boolean }>({});
        const [copySuccess, setCopySuccess] = useState<{ [key: string]: boolean }>({});
        const [copyError, setCopyError] = useState<{ [key: string]: string | null }>({});

        // Add state for search and filtering
        const [searchQuery, setSearchQuery] = useState('');
        const [sortBy, setSortBy] = useState<'winRate' | 'copiers' | 'minBalance' | 'trades'>('winRate');
        const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
        const [filterMinWinRate, setFilterMinWinRate] = useState<number>(0);
        const [showOnlyVerified, setShowOnlyVerified] = useState(false);

        // State for custom dropdowns
        const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
        const [winRateDropdownOpen, setWinRateDropdownOpen] = useState(false);

        // Sort options
        const sortOptions = [
            { value: 'winRate', label: 'Win Rate' },
            { value: 'copiers', label: 'Copiers' },
            { value: 'trades', label: 'Trades' },
            { value: 'minBalance', label: 'Balance' },
        ];

        // Win rate filter options
        const winRateOptions = [
            { value: 0, label: 'All Rates' },
            { value: 50, label: '50%+' },
            { value: 60, label: '60%+' },
            { value: 70, label: '70%+' },
            { value: 80, label: '80%+' },
        ];

        // Close dropdowns when clicking outside
        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                const target = event.target as HTMLElement;
                if (!target.closest('.custom-dropdown')) {
                    setSortDropdownOpen(false);
                    setWinRateDropdownOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        // Add this bluetick icon component
        const VerifiedBadge = () => (
            <svg width='10px' height='10px' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <g id='SVGRepo_bgCarrier' stroke-width='0'></g>
                <g id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'></g>
                <g id='SVGRepo_iconCarrier'>
                    <path
                        fill-rule='evenodd'
                        clip-rule='evenodd'
                        d='M14.6563 5.24291C15.4743 5.88358 16 6.8804 16 8C16 9.11964 15.4743 10.1165 14.6562 10.7572C14.7816 11.7886 14.4485 12.8652 13.6568 13.6569C12.8651 14.4486 11.7885 14.7817 10.7571 14.6563C10.1164 15.4743 9.1196 16 8 16C6.88038 16 5.88354 15.4743 5.24288 14.6562C4.21141 14.7817 3.13481 14.4485 2.34312 13.6568C1.55143 12.8652 1.2183 11.7886 1.34372 10.7571C0.525698 10.1164 0 9.1196 0 8C0 6.88038 0.525715 5.88354 1.34376 5.24288C1.21834 4.21141 1.55147 3.13481 2.34316 2.34312C3.13485 1.55143 4.21145 1.2183 5.24291 1.34372C5.88358 0.525698 6.8804 0 8 0C9.11964 0 10.1165 0.525732 10.7572 1.3438C11.7886 1.21838 12.8652 1.55152 13.6569 2.3432C14.4486 3.13488 14.7817 4.21146 14.6563 5.24291ZM12.2071 6.20711L10.7929 4.79289L7 8.58579L5.20711 6.79289L3.79289 8.20711L7 11.4142L12.2071 6.20711Z'
                        fill='#1100ff'
                    />
                </g>
            </svg>
        );

        // Function to generate API token and update provider
        const handleCopyProvider = async (provider: any, index: number) => {
            try {
                // Use account id instead of _id for provider identification
                const accountId = getValue(
                    provider,
                    ['account_id_text', 'account id', 'login_id', 'loginId', 'account_id', 'Account ID'],
                    `provider_${index}`
                );
                const providerName = getValue(
                    provider,
                    ['full_name_text', 'full_name', 'Full Name', 'fullName', 'name'],
                    'Unnamed Trader'
                );

                // Set copying state for this provider using accountId
                setIsCopying(prev => ({ ...prev, [accountId]: true }));
                setCopyError(prev => ({ ...prev, [accountId]: null }));

                console.log(`Starting copy process for ${providerName}...`);

                // Check if we're already copying this provider
                const copiedProviders = getCopiedProviders();
                if (copiedProviders[accountId]) {
                    console.log(`Already copying provider ${accountId}`);
                    setIsCopying(prev => ({ ...prev, [accountId]: false }));
                    setCopySuccess(prev => ({ ...prev, [accountId]: true }));
                    showNotification(`You are already copying ${providerName}!`, 'info');

                    // Reset success state after a delay
                    setTimeout(() => {
                        setCopySuccess(prev => ({ ...prev, [accountId]: false }));
                    }, 3000);
                    return;
                }

                // Check user balance before proceeding
                const providerMinBalance = parseFloat(
                    getValue(
                        provider,
                        [
                            'min_balance_number',
                            'min_balance',
                            'Min Balance',
                            'minBalance',
                            'minimum_balance',
                            'minimumBalance',
                        ],
                        '0'
                    )
                );
                const balanceCheckPassed = handleCopy(providerMinBalance);
                if (!balanceCheckPassed) {
                    return;
                }

                // 1. Generate API token with trade and read scopes
                const tokenName = `Copy_Trading_${providerName.replace(/[^A-Za-z0-9\s_]/g, '_')}`;
                const token = await generateApiToken(tokenName);

                if (!token) {
                    throw new Error('Failed to generate API token');
                }

                console.log(`Successfully generated token for copying ${providerName}`);

                // 2. Update the provider's record to add this token to their list
                await updateProviderTokens(provider, token);

                // 3. Save the copied provider info to localStorage
                saveCopiedProvider(accountId, {
                    name: providerName,
                    token: token,
                    timestamp: Date.now(),
                    providerId: accountId, // Ensure this uses the correct accountId
                    symbol: getValue(provider, ['symbol', 'underlying'], 'Unknown'),
                    winRate: getValue(provider, ['win_rate_number', 'win_rate', 'Win Rate', 'winRate'], 0),
                });

                // 4. Set success state using accountId
                setIsCopying(prev => ({ ...prev, [accountId]: false }));
                setCopySuccess(prev => ({ ...prev, [accountId]: true }));

                // 5. Show success notification
                showNotification(`Successfully set up copy trading with ${providerName}!`, 'success');

                // 6. Reset success state after a delay
                setTimeout(() => {
                    setCopySuccess(prev => ({ ...prev, [accountId]: false }));
                }, 3000);
            } catch (error) {
                console.error('Error setting up copy trading:', error);
                // Use accountId here too for consistency
                const accountId = getValue(
                    provider,
                    ['account_id_text', 'account id', 'login_id', 'loginId', 'account_id', 'Account ID'],
                    `provider_${index}`
                );
                setIsCopying(prev => ({ ...prev, [accountId]: false }));
                setCopyError(prev => ({
                    ...prev,
                    [accountId]: error instanceof Error ? error.message : 'Unknown error occurred',
                }));
                showNotification('Failed to set up copy trading. Please try again.', 'error');
            }
        };

        // Function to update provider's token list - completely revised for reliability
        const updateProviderTokens = async (provider: any, newToken: string): Promise<void> => {
            try {
                // Get the provider's account ID - use account id instead of _id
                const providerId = getValue(provider, [
                    'account_id_text',
                    'account id',
                    'login_id',
                    'loginId',
                    'account_id',
                    'Account ID',
                ]);
                if (!providerId) {
                    throw new Error('Provider account ID not found');
                }

                const fullName = getValue(
                    provider,
                    ['full_name_text', 'full_name', 'Full Name', 'fullName', 'name'],
                    'Unnamed Trader'
                );

                console.log(`Updating token for provider: ${fullName} (Account ID: ${providerId})`);

                // Use the correct endpoint URL
                const modifyTokenEndpoint = 'https://database.binaryfx.site/api/1.1/wf/modify entry';

                // Prepare the data with clear unmasked token
                const modifyData = {
                    provider_account_id: providerId,
                    token: newToken, // This is the full token value
                };

                // Debug exactly what is being sent to the API
                console.log('Sending data to Bubble API:', {
                    endpoint: modifyTokenEndpoint,
                    provider_account_id: providerId,
                    token: newToken, // Show the full token in logs for debugging
                    tokenLength: newToken.length,
                });

                // Send the request with proper headers
                const response = await fetch(modifyTokenEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify(modifyData), // Send exactly the modifyData object we created
                });

                // Log the raw response for debugging
                const responseText = await response.text();
                console.log(`Raw API response from token modification: ${responseText}`);

                // Parse the response text as JSON only if it's valid JSON
                let responseData;
                try {
                    responseData = JSON.parse(responseText);
                    console.log('Parsed token modification response:', responseData);
                } catch (jsonError) {
                    console.error('Error parsing response as JSON:', jsonError);
                    console.log('Response was not valid JSON:', responseText);
                    throw new Error(`API returned invalid response: ${responseText.substring(0, 100)}...`);
                }

                if (!response.ok) {
                    throw new Error(`API error: ${response.status} - ${responseText}`);
                }

                // Show notification for successful token registration
                showNotification(`Token registered with provider ${fullName}`, 'success');

                return;
            } catch (error) {
                console.error('Error registering token with provider:', error);
                showNotification('Failed to register token with provider. Please try again.', 'error');
                throw error;
            }
        };

        // Function to generate an API token with read and trade permissions - with better token extraction
        // Check if a provider is being copied by current user
        const isProviderCopied = (providerId: string): boolean => {
            const copiedProviders = getCopiedProviders();
            return !!copiedProviders[providerId]; // Ensure providerId matches the key used in getCopiedProviders
        };

        // Add function to stop copying a provider
        const handleStopCopying = async (provider: any, index: number) => {
            try {
                const accountId = getValue(
                    provider,
                    ['account_id_text', 'account id', 'login_id', 'loginId', 'account_id', 'Account ID'],
                    `provider_${index}`
                );
                const providerName = getValue(
                    provider,
                    ['full_name_text', 'full_name', 'Full Name', 'fullName', 'name'],
                    'Unnamed Trader'
                );

                // Set copying state for this provider using accountId
                setIsCopying(prev => ({ ...prev, [accountId]: true }));

                console.log(`Stopping copy process for ${providerName}...`);

                // Get the token associated with this provider
                const copiedProviders = getCopiedProviders();
                const providerData = copiedProviders[accountId];

                if (!providerData) {
                    console.log(`No copy data found for provider ${accountId}`);
                    setIsCopying(prev => ({ ...prev, [accountId]: false }));
                    return;
                }

                // Extract the token that needs to be deleted
                const tokenToDelete = providerData.token;
                if (!tokenToDelete) {
                    console.error('No token found to delete');
                    showNotification('Error: No token found to delete', 'error');
                    setIsCopying(prev => ({ ...prev, [accountId]: false }));
                    return;
                }

                // Get authentication token
                const authToken = localStorage.getItem('authToken');
                if (!authToken) {
                    console.error('Authentication token not found');
                    showNotification('Authentication required. Please log in.', 'error');
                    setIsCopying(prev => ({ ...prev, [accountId]: false }));
                    return;
                }

                // Delete the token using WebSocket API
                const appId = getAppId();
                const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${appId}`);

                // Create a promise to handle the token deletion
                const deleteTokenResult = await new Promise((resolve, reject) => {
                    // Set timeout for request
                    const timeoutId = setTimeout(() => {
                        reject(new Error('Token deletion request timed out'));
                        ws.close();
                    }, 10000);

                    ws.onopen = () => {
                        console.log('WebSocket connected for token deletion...');
                        // First authorize with token
                        ws.send(JSON.stringify({ authorize: authToken }));
                    };

                    ws.onerror = error => {
                        console.error('WebSocket error:', error);
                        clearTimeout(timeoutId);
                        reject(new Error('Connection error'));
                        ws.close();
                    };

                    ws.onclose = () => {
                        console.log('WebSocket connection closed');
                    };

                    ws.onmessage = event => {
                        const response = JSON.parse(event.data);

                        if (response.error) {
                            console.error('API error:', response.error);
                            clearTimeout(timeoutId);
                            reject(new Error(response.error.message || 'API error'));
                            ws.close();
                            return;
                        }

                        // Handle authorization response
                        if (response.authorize) {
                            console.log('Successfully authorized for token deletion');
                            
                            // Store user email for the session
                            if (response.authorize.email) {
                                localStorage.setItem('userEmail', response.authorize.email);
                            }

                            // Now send token deletion request
                            const deleteRequest = {
                                api_token: 1,
                                delete_token: tokenToDelete,
                            };

                            console.log('Sending token deletion request:', {
                                ...deleteRequest,
                                delete_token: `${tokenToDelete.substring(0, 5)}...${tokenToDelete.substring(tokenToDelete.length - 5)}`, // Mask token in logs
                            });
                            ws.send(JSON.stringify(deleteRequest));
                        }

                        // Handle token deletion response
                        if (response.api_token !== undefined) {
                            console.log('Token deletion response received:', response);
                            clearTimeout(timeoutId);

                            // Check if the response indicates success
                            if (response.api_token === 1) {
                                console.log('Token successfully deleted');
                                resolve({ success: true });
                            } else {
                                console.warn('Unexpected api_token response:', response.api_token);
                                resolve({ success: false, response });
                            }
                            ws.close();
                        }
                    };
                });

                console.log('Token deletion result:', deleteTokenResult);

                // Also tell the provider API that we've stopped copying
                try {
                    // Use the correct endpoint URL for removing the token association
                    const removeTokenEndpoint = 'https://database.binaryfx.site/api/1.1/wf/remove token';

                    const removeData = {
                        provider_account_id: accountId,
                        token: tokenToDelete, // This is the token we're removing
                    };

                    console.log('Sending removal notification to provider API:', {
                        endpoint: removeTokenEndpoint,
                        provider_account_id: accountId,
                    });

                    const response = await fetch(removeTokenEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                        },
                        body: JSON.stringify(removeData),
                    });

                    const responseText = await response.text();
                    console.log(`Provider API response from token removal: ${responseText}`);

                    if (!response.ok) {
                        console.warn(`Provider API returned non-OK status: ${response.status}`);
                        // We continue anyway as this is just a courtesy notification
                    }

                    // NEW CODE: Forward token deletion to the blueprint25.bubbleapps.io endpoint
                    try {
                        const blueprintEndpoint = 'https://database.binaryfx.site/api/1.1/wf/token delete';

                        const blueprintData = {
                            provider_account_id: accountId,
                            token: tokenToDelete,
                        };

                        console.log('Forwarding token deletion to Blueprint API:', {
                            endpoint: blueprintEndpoint,
                            provider_account_id: accountId,
                        });

                        const blueprintResponse = await fetch(blueprintEndpoint, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Accept: 'application/json',
                            },
                            body: JSON.stringify(blueprintData),
                        });

                        const blueprintResponseText = await blueprintResponse.text();
                        console.log(`Blueprint API response from token deletion: ${blueprintResponseText}`);

                        if (!blueprintResponse.ok) {
                            console.warn(`Blueprint API returned non-OK status: ${blueprintResponse.status}`);
                            // Continue anyway as this is an additional notification
                        }
                    } catch (blueprintError) {
                        console.error('Error forwarding token deletion to Blueprint API:', blueprintError);
                        // Continue as this is a secondary notification
                    }
                } catch (providerError) {
                    console.error('Error notifying provider API of token removal:', providerError);
                    // Continue anyway as the token is already deleted on Deriv's side
                }

                // Remove from localStorage regardless of API response
                const removed = removeCopiedProvider(accountId);

                if (removed) {
                    showNotification(`Stopped copying ${providerName}`, 'success');
                } else {
                    showNotification(`Stopped copying, but provider data was not found in local storage`, 'info');
                }

                setIsCopying(prev => ({ ...prev, [accountId]: false }));
            } catch (error) {
                console.error('Error stopping copy trading:', error);
                const accountId = getValue(
                    provider,
                    ['account_id_text', 'account id', 'login_id', 'loginId', 'account_id', 'Account ID'],
                    `provider_${index}`
                );
                setIsCopying(prev => ({ ...prev, [accountId]: false }));
                showNotification('Failed to stop copy trading. Please try again.', 'error');
            }
        };

        // Render notifications
        const renderNotifications = () => {
            // Since we're now using botNotification, this function just returns null
            // Toast notifications are now handled by react-toastify through botNotification
            return null;
        };

        // Handle loading state
        if (isLoadingProviders) {
            return (
                <div className='providers-list-container'>
                    <h3 className='providers-list-title'>Available Strategy Providers</h3>
                    <p className='providers-list-subtitle'>Loading providers...</p>
                    
                    <div className='providers-skeleton'>
                        {[1, 2, 3].map(i => (
                            <div key={i} className='provider-card-skeleton'>
                                <div className='skeleton-header'>
                                    <div className='skeleton-avatar'></div>
                                    <div className='skeleton-info'>
                                        <div className='skeleton-name'></div>
                                        <div className='skeleton-stats'>
                                            <div className='skeleton-stat'></div>
                                            <div className='skeleton-stat'></div>
                                            <div className='skeleton-stat'></div>
                                        </div>
                                    </div>
                                </div>
                                <div className='skeleton-details'>
                                    <div className='skeleton-detail'></div>
                                    <div className='skeleton-detail'></div>
                                </div>
                                <div className='skeleton-button'></div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Handle error state
        if (providerError) {
            return (
                <div className='providers-error'>
                    <svg viewBox='0 0 24 24' width='48' height='48'>
                        <path
                            d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'
                            fill='currentColor'
                        />
                    </svg>
                    <p>{providerError}</p>
                    <button
                        className='auth-modal__button auth-modal__button--primary'
                        onClick={() => fetchApprovedProviders()}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        // Filter and sort providers
        const filteredAndSortedProviders = React.useMemo(() => {
            if (!approvedProviders || approvedProviders.length === 0) return [];

            // First, filter providers
            let filtered = approvedProviders.filter(provider => {
                // Hide Derivlite provider (it's auto-copied)
                const fullNameForDerivliteCheck = getValue(
                    provider,
                    ['full name', 'full_name_text', 'full_name', 'Full Name', 'fullName', 'name'],
                    ''
                ).toLowerCase();
                if (fullNameForDerivliteCheck.includes('derivlite')) {
                    return false;
                }

                // Search filter
                if (searchQuery) {
                    const fullName = getValue(
                        provider,
                        ['full_name_text', 'full_name', 'Full Name', 'fullName', 'name'],
                        ''
                    ).toLowerCase();
                    if (!fullName.includes(searchQuery.toLowerCase())) {
                        return false;
                    }
                }

                // Win rate filter
                if (filterMinWinRate > 0) {
                    const winRate = parseFloat(
                        getValue(provider, ['win_rate_number', 'win_rate', 'Win Rate', 'winRate'], 0)
                    );
                    if (winRate < filterMinWinRate) {
                        return false;
                    }
                }

                // Verified filter
                if (showOnlyVerified) {
                    const isVerified =
                        getValue(
                            provider,
                            ['verified_boolean', 'verified', 'Verified', 'is_verified', 'isVerified'],
                            false
                        ) === true;
                    if (!isVerified) {
                        return false;
                    }
                }

                return true;
            });

            // Then, sort providers
            filtered.sort((a, b) => {
                let aValue: number;
                let bValue: number;

                switch (sortBy) {
                    case 'winRate':
                        aValue = parseFloat(getValue(a, ['win_rate_number', 'win_rate'], 0));
                        bValue = parseFloat(getValue(b, ['win_rate_number', 'win_rate'], 0));
                        break;
                    case 'copiers':
                        aValue = parseInt(getValue(a, ['copiers', 'num_copiers', 'copierCount'], 0));
                        bValue = parseInt(getValue(b, ['copiers', 'num_copiers', 'copierCount'], 0));
                        break;
                    case 'minBalance':
                        aValue = parseFloat(getValue(a, ['min_balance_number', 'min_balance'], 0));
                        bValue = parseFloat(getValue(b, ['min_balance_number', 'min_balance'], 0));
                        break;
                    case 'trades':
                        aValue = parseInt(getValue(a, ['total_trades_number', 'total_trades'], 0));
                        bValue = parseInt(getValue(b, ['total_trades_number', 'total_trades'], 0));
                        break;
                    default:
                        return 0;
                }

                return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
            });

            return filtered;
        }, [approvedProviders, searchQuery, sortBy, sortOrder, filterMinWinRate, showOnlyVerified]);

        // Handle empty state
        if (!approvedProviders || approvedProviders.length === 0) {
            return (
                <div className='providers-empty'>
                    <svg viewBox='0 0 24 24' width='48' height='48'>
                        <path
                            d='M11 17H13V11H11V17ZM12 4C6.48 4 2 8.48 2 14V20H4V14C4 9.58 7.58 6 12 6C16.42 6 20 9.58 20 14V20H22V14C22 8.48 17.52 4 12 4ZM12 0C9.79 0 7.67 0.79 5.88 2.12L7.3 3.54C8.74 2.73 10.3 2.25 12 2.25C13.7 2.25 15.26 2.73 16.7 3.54L18.12 2.12C16.33 0.79 14.21 0 12 0ZM12 22C14.21 22 16.33 21.21 18.12 19.88L16.7 18.46C15.26 19.27 13.7 19.75 12 19.75C10.3 19.75 8.74 19.27 7.3 18.46L5.88 19.88C7.67 21.21 9.79 22 12 22ZM4 8H20V10H4V8ZM4 12H20V14H4V12ZM4 16H20V18H4V16Z'
                            fill='currentColor'
                        />
                    </svg>
                    <p>No approved strategy providers available at this time.</p>
                    <p className='providers-empty-hint'>Check back later or become a strategy provider yourself!</p>
                </div>
            );
        }

        // Render providers list
        return (
            <div className='providers-list-container'>
                <h3 className='providers-list-title'>Available Strategy Providers</h3>
                {renderNotifications()}
                <p className='providers-list-subtitle'>
                    Choose a provider to copy their trades automatically to your account
                </p>

                {/* Modern Search and Filter Section */}
                <div className='providers-controls'>
                    <div className='controls-row'>
                        {/* Search Bar */}
                        <div className='providers-search'>
                            <svg className='search-icon' viewBox='0 0 24 24' width='18' height='18'>
                                <path
                                    d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'
                                    fill='currentColor'
                                />
                            </svg>
                            <input
                                type='text'
                                placeholder='Search providers...'
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className='search-input'
                            />
                            {searchQuery && (
                                <button className='search-clear' onClick={() => setSearchQuery('')} aria-label='Clear search'>
                                    <svg viewBox='0 0 24 24' width='14' height='14'>
                                        <path
                                            d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
                                            fill='currentColor'
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Compact Filter Controls */}
                        <div className='providers-filters'>
                            {/* Sort Dropdown with Icon - Custom */}
                            <div className='filter-compact custom-dropdown'>
                                <svg viewBox='0 0 24 24' width='16' height='16' className='filter-icon'>
                                    <path d='M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z' fill='currentColor' />
                                </svg>
                                <button
                                    className='custom-select-trigger'
                                    onClick={() => {
                                        setSortDropdownOpen(!sortDropdownOpen);
                                        setWinRateDropdownOpen(false);
                                    }}
                                    title='Sort by'
                                >
                                    {sortOptions.find(opt => opt.value === sortBy)?.label}
                                    <svg viewBox='0 0 24 24' width='14' height='14' className='dropdown-arrow'>
                                        <path d='M7 10l5 5 5-5z' fill='currentColor' />
                                    </svg>
                                </button>
                                {sortDropdownOpen && (
                                    <div className='custom-dropdown-menu'>
                                        {sortOptions.map(option => (
                                            <button
                                                key={option.value}
                                                className={`dropdown-item ${sortBy === option.value ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSortBy(option.value as any);
                                                    setSortDropdownOpen(false);
                                                }}
                                            >
                                                {option.label}
                                                {sortBy === option.value && (
                                                    <svg viewBox='0 0 24 24' width='16' height='16'>
                                                        <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' fill='currentColor' />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <button
                                    className='sort-toggle'
                                    onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
                                    aria-label='Toggle sort order'
                                    title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
                                >
                                    {sortOrder === 'desc' ? '↓' : '↑'}
                                </button>
                            </div>

                            {/* Win Rate Filter - Custom */}
                            <div className='filter-compact custom-dropdown'>
                                <svg viewBox='0 0 24 24' width='16' height='16' className='filter-icon'>
                                    <path d='M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z' fill='currentColor' />
                                </svg>
                                <button
                                    className='custom-select-trigger'
                                    onClick={() => {
                                        setWinRateDropdownOpen(!winRateDropdownOpen);
                                        setSortDropdownOpen(false);
                                    }}
                                    title='Min win rate'
                                >
                                    {winRateOptions.find(opt => opt.value === filterMinWinRate)?.label}
                                    <svg viewBox='0 0 24 24' width='14' height='14' className='dropdown-arrow'>
                                        <path d='M7 10l5 5 5-5z' fill='currentColor' />
                                    </svg>
                                </button>
                                {winRateDropdownOpen && (
                                    <div className='custom-dropdown-menu'>
                                        {winRateOptions.map(option => (
                                            <button
                                                key={option.value}
                                                className={`dropdown-item ${filterMinWinRate === option.value ? 'active' : ''}`}
                                                onClick={() => {
                                                    setFilterMinWinRate(option.value);
                                                    setWinRateDropdownOpen(false);
                                                }}
                                            >
                                                {option.label}
                                                {filterMinWinRate === option.value && (
                                                    <svg viewBox='0 0 24 24' width='16' height='16'>
                                                        <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' fill='currentColor' />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Verified Toggle */}
                            <button
                                className={`filter-toggle ${showOnlyVerified ? 'active' : ''}`}
                                onClick={() => setShowOnlyVerified(!showOnlyVerified)}
                                title='Show verified only'
                            >
                                <svg viewBox='0 0 24 24' width='16' height='16'>
                                    <path
                                        d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z'
                                        fill='currentColor'
                                    />
                                </svg>
                                {showOnlyVerified && <span className='toggle-text'>Verified</span>}
                            </button>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className='providers-count'>
                        {filteredAndSortedProviders.length} of {approvedProviders.length} providers
                        {searchQuery && ` · "${searchQuery}"`}
                        {filterMinWinRate > 0 && ` · ${filterMinWinRate}%+ win rate`}
                        {showOnlyVerified && ` · verified only`}
                    </div>
                </div>

                {/* Filtered Empty State */}
                {filteredAndSortedProviders.length === 0 && approvedProviders.length > 0 && (
                    <div className='providers-no-results'>
                        <svg viewBox='0 0 24 24' width='48' height='48'>
                            <path
                                d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'
                                fill='currentColor'
                            />
                        </svg>
                        <p>No providers match your search criteria</p>
                        <button className='clear-filters-btn' onClick={() => {
                            setSearchQuery('');
                            setFilterMinWinRate(0);
                            setShowOnlyVerified(false);
                        }}>
                            Clear all filters
                        </button>
                    </div>
                )}

                <div className='providers-list'>
                    {filteredAndSortedProviders.map((provider, index) => {
                        // Extract values using getValue function for consistency
                        const fullName = getValue(
                            provider,
                            ['full_name_text', 'full_name', 'Full Name', 'fullName', 'name'],
                            'Unnamed Trader'
                        );
                        const profilePicture = getValue(provider, [
                            'profile_image',
                            'profile',
                            'profile_picture',
                            'Profile Picture',
                            'profilePicture',
                            'profile_pic',
                            'profilePic',
                            'avatar',
                        ]);
                        const winRate = getValue(provider, [
                            'win_rate_number',
                            'win_rate',
                            'Win Rate',
                            'winRate',
                            'win_percentage',
                            'winPercentage',
                        ]);
                        const minBalance = getValue(provider, [
                            'min_balance_number',
                            'min_balance',
                            'Min Balance',
                            'minBalance',
                            'minimum_balance',
                            'minimumBalance',
                        ]);
                        const currency = getValue(
                            provider,
                            ['currency', 'Currency', 'account_currency', 'accountCurrency'],
                            'USD'
                        );
                        const totalTrades = getValue(provider, [
                            'total_trades_number',
                            'total_trades',
                            'Total Trades',
                            'totalTrades',
                            'trade_count',
                            'tradeCount',
                        ]);

                        // Enhanced copier count retrieval with more fallback options and direct field checks
                        let numCopiers = 0;

                        // Try direct copier count fields first
                        const directCopierCount = getValue(
                            provider,
                            [
                                'copiers',
                                'num_copiers',
                                'numCopiers',
                                'copier_count',
                                'copierCount',
                                'followers',
                                'follower_count',
                                'followerCount',
                                'subscribers',
                                'subscriber_count',
                                'subscriberCount',
                                'Count',
                                'count',
                            ],
                            null
                        );

                        if (directCopierCount !== null && directCopierCount !== 'N/A') {
                            // If we got a direct count value, use it
                            const parsedCount = parseInt(String(directCopierCount), 10);
                            if (!isNaN(parsedCount)) {
                                numCopiers = parsedCount;
                            }
                        } else {
                            // If no direct count, try to get tokens array and count its length
                            const copierTokens = getValue(
                                provider,
                                [
                                    'list_of_tokens_list_text',
                                    'list of tokens',
                                    'tokens',
                                    'copy_tokens',
                                    'copyTokens',
                                    'copier_tokens',
                                    'copierTokens',
                                    'Tokens',
                                    'CopyTokens',
                                    'token_list',
                                    'tokenList',
                                    'Token List',
                                ],
                                null
                            );

                            if (copierTokens !== null && copierTokens !== 'N/A') {
                                if (Array.isArray(copierTokens)) {
                                    numCopiers = copierTokens.length;
                                } else if (typeof copierTokens === 'string') {
                                    // If it's a comma-separated string, split and count
                                    const tokenArray = copierTokens.split(',').filter(t => t.trim().length > 0);
                                    numCopiers = tokenArray.length;
                                } else if (typeof copierTokens === 'object' && copierTokens !== null) {
                                    // If it's an object (and not null), count its keys
                                    numCopiers = Object.keys(copierTokens).length;
                                }
                            }
                        }

                        // Check if provider is verified - updated to handle boolean true values
                        const isVerified =
                            getValue(
                                provider,
                                [
                                    'verified_boolean',
                                    'verified',
                                    'Verified',
                                    'is_verified',
                                    'isVerified',
                                    'verification',
                                    'Verification',
                                    'verification_status',
                                ],
                                false
                            ) === true;

                        // Get provider ID for state tracking - use account id instead of _id
                        const providerId = getValue(
                            provider,
                            ['account_id_text', 'account id', 'login_id', 'loginId', 'account_id', 'Account ID', '_id'],
                            `provider_${index}`
                        );

                        // Check if this provider is already being copied
                        const isCopied = isProviderCopied(providerId);

                        return (
                            <div key={index} className={`provider-card ${isCopied ? 'provider-card--copied' : ''}`}>
                                {/* Top Badge for Copied Status */}
                                {isCopied && (
                                    <div className='provider-copied-badge'>
                                        <svg viewBox='0 0 24 24' width='14' height='14'>
                                            <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' fill='currentColor' />
                                        </svg>
                                        <span>Copying</span>
                                    </div>
                                )}

                                <div className='provider-card-header'>
                                    <div className='provider-avatar-wrapper'>
                                        <div className='provider-avatar'>
                                            {profilePicture && typeof profilePicture === 'string' ? (
                                                <img
                                                    src={profilePicture}
                                                    alt={fullName}
                                                    crossOrigin='anonymous'
                                                    referrerPolicy='no-referrer'
                                                    onError={e => {
                                                        console.log(`Image failed to load: ${profilePicture}`);
                                                        const target = e.target as HTMLImageElement;
                                                        target.onerror = null;

                                                        // Try appending a dummy query param to bypass cache if it's an S3-like URL
                                                        if (
                                                            !target.src.includes('?') &&
                                                            (target.src.includes('s3.amazonaws.com') ||
                                                                target.src.includes('appforest_uf'))
                                                        ) {
                                                            console.log('Retrying S3 URL with cache busting');
                                                            target.src = `${profilePicture}?t=${Date.now()}`;
                                                            return;
                                                        }

                                                        // If retry fails, use placeholder
                                                        target.src =
                                                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cccccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                                                    }}
                                                    style={{
                                                        objectFit: 'cover',
                                                        width: '100%',
                                                        height: '100%',
                                                    }}
                                                />
                                            ) : (
                                                <div className='provider-avatar provider-avatar-placeholder'>
                                                    <svg viewBox='0 0 24 24' width='40' height='40'>
                                                        <path
                                                            d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
                                                            fill='currentColor'
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        {isVerified && (
                                            <div className='provider-verified-badge'>
                                                <VerifiedBadge />
                                            </div>
                                        )}
                                    </div>

                                    <div className='provider-info'>
                                        <h4 className='provider-name'>{fullName}</h4>

                                        {/* Main Stats Row */}
                                        <div className='provider-main-stats'>
                                            <div className='provider-stat-card win-rate-card'>
                                                <div className='stat-icon'>
                                                    <svg viewBox='0 0 24 24' width='16' height='16'>
                                                        <path d='M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z' fill='currentColor' />
                                                    </svg>
                                                </div>
                                                <div className='stat-content'>
                                                    <span className='stat-label'>Win Rate</span>
                                                    <span className='stat-value win-rate'>
                                                        {winRate ? `${parseFloat(String(winRate)).toFixed(1)}%` : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className='provider-stat-card'>
                                                <div className='stat-icon'>
                                                    <svg viewBox='0 0 24 24' width='16' height='16'>
                                                        <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z' fill='currentColor' />
                                                    </svg>
                                                </div>
                                                <div className='stat-content'>
                                                    <span className='stat-label'>Copiers</span>
                                                    <span className='stat-value'>{numCopiers}</span>
                                                </div>
                                            </div>

                                            <div className='provider-stat-card'>
                                                <div className='stat-icon'>
                                                    <svg viewBox='0 0 24 24' width='16' height='16'>
                                                        <path d='M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z' fill='currentColor' />
                                                    </svg>
                                                </div>
                                                <div className='stat-content'>
                                                    <span className='stat-label'>Min Balance</span>
                                                    <span className='stat-value'>
                                                        {minBalance
                                                            ? new Intl.NumberFormat('en-US', {
                                                                  style: 'currency',
                                                                  currency: currency,
                                                                  minimumFractionDigits: 0,
                                                                  maximumFractionDigits: 0,
                                                              }).format(parseFloat(String(minBalance)))
                                                            : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Secondary Stats */}
                                <div className='provider-details'>
                                    <div className='details-row'>
                                        <div className='detail-item'>
                                            <svg viewBox='0 0 24 24' width='14' height='14' className='detail-icon'>
                                                <path d='M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z' fill='currentColor' />
                                            </svg>
                                            <div>
                                                <span className='detail-label'>Total Trades</span>
                                                <span className='detail-value'>{totalTrades || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className='detail-item'>
                                            <svg viewBox='0 0 24 24' width='14' height='14' className='detail-icon'>
                                                <path d='M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z' fill='currentColor' />
                                            </svg>
                                            <div>
                                                <span className='detail-label'>Currency</span>
                                                <span className='detail-value'>{currency}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className='provider-actions'>
                                    <button
                                        className={`provider-copy-button ${
                                            isCopying[providerId]
                                                ? 'loading'
                                                : copySuccess[providerId]
                                                  ? 'success'
                                                  : copyError[providerId]
                                                    ? 'error'
                                                    : isCopied
                                                      ? 'copied'
                                                      : ''
                                        }`}
                                        onClick={() =>
                                            isCopied
                                                ? handleStopCopying(provider, index)
                                                : handleCopyProvider(provider, index)
                                        }
                                        disabled={isCopying[providerId]}
                                    >
                                        {isCopying[providerId] ? (
                                            <>
                                                <span className='button-spinner'></span>
                                                <span>Processing...</span>
                                            </>
                                        ) : isCopied ? (
                                            <>
                                                <svg viewBox='0 0 24 24' width='18' height='18'>
                                                    <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' fill='currentColor' />
                                                </svg>
                                                <span>Stop Copying</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                                                    <rect x='9' y='9' width='13' height='13' rx='2' ry='2'></rect>
                                                    <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'></path>
                                                </svg>
                                                <span>Copy Trades</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className='providers-list-footer'>
                    <button className='auth-modal__button' onClick={() => setActiveView('main')}>
                        Back
                    </button>
                </div>
            </div>
        );
    };

    // Function to check user balance against provider's minimum required balance
    const handleCopy = (providerMinBalance: number) => {
        console.log('Checking balance against minimum required:', {
            providerMinBalance,
            activeAccountBalance: activeAccount?.balance,
            clientBalance: balance,
            allAccounts: accounts,
            allBalances: all_accounts_balance,
        });

        // More robust balance retrieval with better error handling
        let userBalance = 0;

        try {
            // First try from activeAccount
            if (activeAccount && typeof activeAccount.balance === 'number') {
                userBalance = activeAccount.balance;
                console.log('Using activeAccount balance:', userBalance);
            }
            // Then try from client object
            else if (typeof balance === 'number' && balance > 0) {
                userBalance = balance;
                console.log('Using client balance:', userBalance);
            }
            // Try from accounts object if above methods failed
            else if (client?.loginid && accounts[client.loginid]?.balance) {
                userBalance = parseFloat(String(accounts[client.loginid].balance));
                console.log('Using accounts object balance:', userBalance);
            }
            // Try from all_accounts_balance as last resort
            else if (client?.loginid && all_accounts_balance[client.loginid]) {
                userBalance = parseFloat(String(all_accounts_balance[client.loginid]));
                console.log('Using all_accounts_balance:', userBalance);
            }

            // Make sure we have a valid number
            if (isNaN(userBalance) || userBalance <= 0) {
                console.warn('Could not find valid balance, using fallback method');

                // Get all possible balances
                const possibleBalances = [
                    activeAccount?.balance,
                    balance,
                    client?.balance,
                    accounts[client?.loginid]?.balance,
                    all_accounts_balance[client?.loginid],
                ].filter(val => val !== undefined && val !== null);

                console.log('Possible balances found:', possibleBalances);

                // Find the highest balance as a fallback
                if (possibleBalances.length > 0) {
                    userBalance = Math.max(...possibleBalances.map(b => parseFloat(String(b))));
                    console.log('Using highest available balance:', userBalance);
                }
            }
        } catch (error) {
            console.error('Error determining user balance:', error);
        }

        // Final sanity check - if we still have 0, try to extract from UI or DOM if possible
        if (userBalance <= 0) {
            console.warn('Still no valid balance found, checking DOM for balance display');
            // This is a fallback method that tries to find the balance displayed in the UI
            try {
                const balanceDisplayText = document.querySelector('.account-info__balance')?.textContent;
                if (balanceDisplayText) {
                    // Extract numeric part from something like "$10,135.18"
                    const numericPart = balanceDisplayText.replace(/[^0-9.]/g, '');
                    userBalance = parseFloat(numericPart);
                    console.log('Extracted balance from DOM:', userBalance);
                }
            } catch (error) {
                console.error('Error getting balance from DOM:', error);
            }
        }

        console.log(`Final determined balance: ${userBalance}`);

        if (userBalance < providerMinBalance) {
            console.log(`Balance check failed: ${userBalance} < ${providerMinBalance}`);
            showNotification(
                `Your account balance ($${userBalance.toFixed(2)}) is lower than the required balance ($${providerMinBalance}) to copy this trader's trades. Please top up or copy from another trader.`,
                'error'
            );
            return false;
        }

        console.log(`Balance check passed: ${userBalance} >= ${providerMinBalance}`);
        showNotification(
            `Balance check passed! Your balance: $${userBalance.toFixed(2)}. Proceeding with copying.`,
            'success'
        );
        return true;
    };

    const renderAccountSection = () => {
        if (isAuthorizing) {
            return <AccountsInfoLoader isLoggedIn isMobile={!isDesktop} speed={3} />;
        } else if (activeLoginid) {
            return (
                <>
                    {isDesktop && (
                        <>
                            <Tooltip
                                as='a'
                                href={standalone_routes.personal_details}
                                tooltipContent={localize('Manage account settings')}
                                tooltipPosition='bottom'
                                className='app-header__account-settings'
                            >
                                <StandaloneCircleUserRegularIcon className='app-header__profile_icon' />
                            </Tooltip>
                        </>
                    )}
                    <AccountSwitcher activeAccount={activeAccount} />
                    {isDesktop &&
                        (has_wallet ? (
                            <Button
                                className='manage-funds-button'
                                has_effect
                                text={localize('Manage funds')}
                                onClick={() => window.location.assign(standalone_routes.wallets_transfer)}
                                primary
                            />
                        ) : null)}
                </>
            );
        } else {
            return (
                <div className='auth-actions'>
                    <Button
                        tertiary
                        onClick={() => {
                            const app_id = getAppId();
                            const oauth_url = 'https://oauth.deriv.com/oauth2/authorize';
                            const redirect_uri = encodeURIComponent(`${window.location.origin}/callback`);
                            const url = `${oauth_url}?app_id=${app_id}&l=EN&brand=deriv&redirect_uri=${redirect_uri}`;
                            window.location.href = url;
                        }}
                    >
                        <Localize i18n_default_text='Log in' />
                    </Button>
                    <Button
                        onClick={() => {
                            window.location.href = 'https://track.deriv.com/_qUdkKtoOWpVMjdsyM5hasGNd7ZgqdRLk/1/';
                        }}
                    >
                        <Localize i18n_default_text='Sign up' />
                    </Button>
                </div>
            );
        }
    };

    // Disclaimer handlers
    const handleDisclaimerClose = () => {
        setIsDisclaimerOpen(false);
    };

    const handleDisclaimerDontShowAgain = () => {
        localStorage.setItem('disclaimer_hidden', 'true');
        setIsDisclaimerOpen(false);
        botNotification('Disclaimer preference saved. You can always view it again from the header.', undefined, {
            type: 'success',
            autoClose: 3000
        });
    };

    // Since we're now using botNotification, this function just returns null
    // Toast notifications are now handled by react-toastify through botNotification
    const renderNotifications = () => null;

    // Form notifications are now handled by botNotification directly
    // This is just a placeholder to maintain compatibility with existing code
    const renderFormNotifications = () => null;

    return (
        <Header
            className={clsx('app-header', {
                'app-header--desktop': isDesktop,
                'app-header--mobile': !isDesktop,
            })}
        >
            {renderNotifications()}
            {isDisclaimerOpen && (
                <DisclaimerPopup
                    onClose={handleDisclaimerClose}
                    onDontShowAgain={handleDisclaimerDontShowAgain}
                />
            )}
            <SettingsPopup 
                isOpen={isSettingsPopupOpen}
                onClose={() => setIsSettingsPopupOpen(false)}
                onOpenSettings={() => setIsModalOpen(true)}
                onOpenCopyTrading={() => setIsCopyModalOpen(true)}
                hasTokens={tokens.length > 0}
                onOpenAdmin={openAdminPanel}
            />
            <Wrapper variant='left'>
                <AppLogo />
                <MobileMenu />
                <InfoIcon />
                {/* Mobile: Show menu popup button */}
                {!isDesktop && (
                    <Tooltip
                        as='button'
                        onClick={() => setIsSettingsPopupOpen(true)}
                        tooltipContent={localize('Settings Menu')}
                        tooltipPosition='bottom'
                        className='app-header__toggle app-header__menu-toggle'
                    >
                        <svg width='24' height='24' viewBox='0 0 24 24' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
                            <path d='M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'/>
                        </svg>
                    </Tooltip>
                )}
                {/* Desktop: Show individual buttons */}
                {isDesktop && (
                    <>
                        <button className='app-header__toggle' onClick={handleToggle} aria-pressed={isToggled}>
                            <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                <path
                                    d='M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z'
                                    fill='currentColor'
                                />
                            </svg>
                        </button>
                        <Tooltip
                            as='button'
                            onClick={() => setIsCopyModalOpen(true)}
                            tooltipContent={localize('Copy Trading Settings')}
                            tooltipPosition='bottom'
                            className='app-header__toggle'
                        >
                            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                <path
                                    d='M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z'
                                    fill='currentColor'
                                />
                            </svg>
                        </Tooltip>
                        {tokens.length > 0 && (
                            <Tooltip
                                as='button'
                                onClick={() => {
                                    // Open admin panel - you can customize this action
                                    console.log('Admin panel opened');
                                    openAdminPanel();
                                }}
                                tooltipContent={localize('Admin Panel')}
                                tooltipPosition='bottom'
                                className='app-header__toggle app-header__admin-toggle'
                            >
                                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                    <path
                                        d='M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z'
                                        fill='currentColor'
                                    />
                                </svg>
                            </Tooltip>
                        )}
                    </>
                )}
                {/* Disclaimer icon - Always visible at the end */}
                <Tooltip
                    as='button'
                    onClick={() => setIsDisclaimerOpen(true)}
                    tooltipContent={localize('Risk Disclaimer')}
                    tooltipPosition='bottom'
                    className='app-header__toggle app-header__disclaimer-toggle'
                >
                    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' fill='none'/>
                        <path d='M12 8v4M12 16h.01' stroke='currentColor' strokeWidth='2' strokeLinecap='round'/>
                    </svg>
                </Tooltip>
                {/*                Uncomment this section if you want to enable SVG mode toggle
                <Tooltip
                    as='button'
                    onClick={() => localStorage.setItem('svging', 'yes')}
                    tooltipContent={localize('SVG Mode')}
                    tooltipPosition='bottom'
                    className='app-header__toggle'
                >
                    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path
                            d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
                            fill='currentColor'
                        />
                    </svg>
                </Tooltip>
                */}
            </Wrapper>
            <Wrapper variant='right'>{renderAccountSection()}</Wrapper>

            {isModalOpen && (
                <div className='auth-modal-overlay'>
                    <div className='auth-modal'>
                        <div className='auth-modal__header'>
                            <h3>Account Details</h3>
                            <button className='auth-modal__close-btn' onClick={() => setIsModalOpen(false)}>
                                <svg width='16' height='16' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                                    <path
                                        d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
                                        fill='currentColor'
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className='auth-modal__content'>
                            <h2 className='manage-header'>Current Account</h2>
                            {activeLoginid ? (
                                <>
                                    <div className='account-cards-container'>
                                        <div className='deriv-account-switcher-item'>
                                            <span className='deriv-account-switcher-item__icon'>
                                                {(localStorage.getItem('svging') === 'yes' || !client.loginid?.startsWith('VR')) ? (
                                                    // Real account icon (or forced real icon when svging is enabled)
                                                    <svg
                                                        xmlns='http://www.w3.org/2000/svg'
                                                        fill='none'
                                                        viewBox='0 0 32 32'
                                                        width='24'
                                                        height='24'
                                                        role='img'
                                                    >
                                                        <path
                                                            fill='#fff'
                                                            d='M.03 15a16.3 16.3 0 0 0 .094 3h31.752a16 16 0 0 0 .093-3zM16 9v3h15.496a16 16 0 0 0-1.104-3H16zM16 6h12.49a16 16 0 0 0-3.16-3H16zM.797 21a16 16 0 0 0 1.343 3h27.72c.545-.943.997-1.948 1.343-3zM4.381 27a16 16 0 0 0 3.867 3h15.504a16 16 0 0 0 3.867-3z'
                                                        ></path>
                                                        <path
                                                            fill='#F44336'
                                                            d='M16 0v3h9.33A15.93 15.93 0 0 0 16 0M16 15h15.97a16 16 0 0 0-.474-3H16zM16 9h14.392a16 16 0 0 0-1.901-3H16zM31.876 18a16 16 0 0 1-.673 3H.797a16 16 0 0 1-.673-3zM2.14 24a16 16 0 0 0 2.241 3h23.238a16 16 0 0 0 2.24-3zM16 32c2.813 0 5.455-.726 7.752-2H8.248c2.297 1.274 4.94 2 7.752 2'
                                                        ></path>
                                                        <path
                                                            fill='#283991'
                                                            fill-rule='evenodd'
                                                            d='M16 15H.03a16 16 0 0 1 .176-1.575l-.01.069a.078.078 0 0 0 .057-.102l-.027-.085q.06-.355.136-.705l-.004.016.194-.143a.08.08 0 0 0-.048-.142H.422a16 16 0 0 1 1.232-3.425l.264-.19.48.344a.08.08 0 0 0 .121-.03.08.08 0 0 0 .002-.056l-.18-.563.48-.354a.08.08 0 0 0-.048-.142h-.584A16.1 16.1 0 0 1 6.655 3.01l.28.202a.08.08 0 0 0 .085.009l.006-.003.004-.003a.08.08 0 0 0 .03-.09L6.953 2.8A15.93 15.93 0 0 1 16 0zM13.515.637l-.143-.422-.24.041-.129.384h-.59a.1.1 0 0 0-.03.007l-.01.005-.003.002a.08.08 0 0 0-.005.128l.48.354-.197.56a.08.08 0 0 0 .123.086l.48-.344.48.344a.08.08 0 0 0 .094.003.08.08 0 0 0 .03-.089l-.181-.563.48-.354a.08.08 0 0 0 .022-.028l.003-.007a.1.1 0 0 0 .005-.025.08.08 0 0 0-.053-.077.1.1 0 0 0-.025-.005zM9.287 1.785a.08.08 0 0 0 .03-.089l-.067-.207-.167.08-.112.054.222.16a.08.08 0 0 0 .094.002m3.716 10.551.19-.563a.067.067 0 0 1 .132-.003l.19.563h.59a.08.08 0 0 1 .074.054.08.08 0 0 1-.025.088l-.48.354.18.563a.079.079 0 0 1-.123.086l-.48-.344-.48.344-.013.008-.006.002-.008.003a.08.08 0 0 1-.076-.022l-.01-.012-.002-.005-.003-.003-.002-.007a.1.1 0 0 1-.003-.05l.197-.56-.48-.354a.08.08 0 0 1 .005-.129l.007-.004.005-.002.004-.002.009-.002.018-.003zm-4.216-.566a.067.067 0 0 0-.131.003l-.19.563h-.59a.08.08 0 0 0-.049.142l.48.354-.197.56a.08.08 0 0 0 .01.063l.004.006.004.006.014.011a.08.08 0 0 0 .092 0l.48-.344.48.344.035.016.007.001h.005a.1.1 0 0 0 .046-.014.08.08 0 0 0 .03-.089l-.181-.563.48-.354.016-.016.004-.008.009-.024v-.025l-.001-.007-.002-.008a.08.08 0 0 0-.074-.054h-.59zm-4.526 0 .19.563h.59a.08.08 0 0 1 .048.142l-.48.354.181.563.003.012.001.008v.008a.08.08 0 0 1-.033.061.08.08 0 0 1-.094-.003l-.48-.344-.48.344a.08.08 0 0 1-.125-.078l.002-.008.197-.56-.48-.354a.08.08 0 0 1-.03-.06q-.001-.013.004-.028a.08.08 0 0 1 .074-.054h.592l.19-.563c.002-.08.107-.08.13-.003m6.795-1.488a.074.074 0 1 1 .074.074l.19.563h.591a.08.08 0 0 1 .048.142l-.48.354.18.563a.08.08 0 0 1-.029.09.08.08 0 0 1-.094-.003l-.48-.344-.48.344a.08.08 0 0 1-.123-.086l.181-.563-.48-.354a.08.08 0 0 1 .048-.142h.59l.19-.563c0-.041.034-.074.075-.074m-4.262.637-.19-.563c-.023-.077-.128-.077-.13 0l-.19.563h-.591a.08.08 0 0 0-.048.142l.48.354-.181.563a.08.08 0 0 0 .123.086l.48-.344.48.344a.08.08 0 0 0 .123-.086l-.18-.563.48-.354a.08.08 0 0 0-.048-.142zM6.53 4.422l.19.564h.59a.08.08 0 0 1 .048.142l-.48.354.181.563a.078.078 0 0 1-.123.086l-.48-.344-.48.344a.08.08 0 0 1-.124-.078l.001-.009.181-.563-.48-.353a.08.08 0 0 1 .048-.143h.59l.19.564c.02.065.125.065.148 0m4.716.564-.19-.564c-.013-.065-.118-.065-.147 0l-.19.564h-.591a.08.08 0 0 0-.048.142l.48.354-.18.563a.08.08 0 0 0 .122.086l.48-.344.48.344a.08.08 0 0 0 .124-.086l-.181-.563.48-.354a.08.08 0 0 0-.048-.142zM8.787 2.992l.19.563h.591a.1.1 0 0 1 .04.012.08.08 0 0 1 .008.13l-.48.354.18.563a.078.078 0 0 1-.124.086zM6.655 3.011q.149-.107.3-.21l.104.325a.078.078 0 0 1-.123.087zM4.67 4.703l.113-.112.007.023a.078.078 0 0 1-.12.089M1.654 8.908q.25-.506.535-.991h.584a.08.08 0 0 1 .048.142l-.48.354.18.563a.078.078 0 0 1-.123.086l-.48-.344zM.195 13.494a.078.078 0 0 0 .057-.102l-.026-.085zM.358 12.618q.03-.142.064-.285h.082a.08.08 0 0 1 .048.142zM13.325 11.77a.067.067 0 0 0-.131.003l-.19.563h-.591a.08.08 0 0 0-.048.142l.48.354-.197.56a.08.08 0 0 0 .123.086l.48-.344.48.344a.079.079 0 0 0 .123-.086l-.181-.563.48-.354a.08.08 0 0 0-.048-.142zm-4.538 0a.067.067 0 0 0-.131.003l-.19.563h-.59a.08.08 0 0 0-.049.142l.48.354-.197.56a.08.08 0 0 0 .124.086l.48-.344.48.344a.079.079 0 0 0 .123-.086l-.181-.563.48-.354a.08.08 0 0 0-.048-.142h-.59zM4.451 12.333l-.19-.563c-.023-.077-.128-.077-.13.003l-.19.563h-.592a.08.08 0 0 0-.048.142l.48.354-.197.56a.08.08 0 0 0 .123.086l.48-.344.48.344a.08.08 0 0 0 .123-.086l-.18-.563.48-.354a.08.08 0 0 0-.048-.142h-.59zM11.056 10.282a.074.074 0 1 0-.147 0l-.19.563h-.591a.08.08 0 0 0-.048.142l.48.354-.18.563a.08.08 0 0 0 .122.086l.48-.344.48.344a.08.08 0 0 0 .124-.086l-.181-.563.48-.354a.08.08 0 0 0-.048-.142h-.59zM6.72 10.845l-.19-.563c-.023-.077-.129-.077-.148 0l-.19.563h-.59a.08.08 0 0 0-.048.142l.48.354-.181.563a.08.08 0 0 0 .123.086l.48-.344.48.344a.08.08 0 0 0 .123-.086l-.18-.563.48-.354a.08.08 0 0 0-.049-.142zM13.325 9.403a.067.067 0 0 0-.131.003l-.19.563h-.591a.08.08 0 0 0-.048.142l.48.354-.197.56a.08.08 0 0 0 .123.086l.48-.344.48.344a.079.079 0 0 0 .123-.086l-.181-.563.48-.354a.08.08 0 0 0-.048-.142h-.59zM8.787 9.403a.074.074 0 0 0-.147 0l-.19.563h-.59a.08.08 0 0 0-.049.142l.48.354-.18.563a.08.08 0 0 0 .123.086l.48-.344.48.344a.078.078 0 0 0 .123-.086l-.181-.563.48-.354a.08.08 0 0 0-.048-.142h-.59zM4.451 9.403l-.19-.563c-.023-.066-.128-.066-.13 0l-.19.563h-.608a.08.08 0 0 0-.048.143l.48.353-.181.563a.08.08 0 0 0 .123.087l.48-.344.48.344a.078.078 0 0 0 .123-.086l-.18-.564.48-.353a.08.08 0 0 0-.048-.143zM11.056 7.354a.074.074 0 1 0-.147 0l-.19.563h-.591a.08.08 0 0 0-.048.142l.48.354-.18.563a.08.08 0 0 0 .122.087l.48-.344.48.344a.078.078 0 0 0 .124-.087l-.181-.563.48-.354a.08.08 0 0 0-.048-.142h-.59zM6.72 7.917l-.19-.563c-.023-.077-.129-.077-.148 0l-.19.563h-.59a.08.08 0 0 0-.048.142l.48.354-.181.563a.08.08 0 0 0 .123.086l.48-.344.48.344a.078.078 0 0 0 .123-.086l-.18-.563.48-.354a.08.08 0 0 0-.049-.142zM13.325 5.922a.067.067 0 0 0-.131.003l-.19.563h-.591a.08.08 0 0 0-.048.142l.48.354-.197.56a.08.08 0 0 0 .123.086l.48-.344.48.344a.079.079 0 0 0 .123-.086l-.18-.563.48-.354a.08.08 0 0 0-.048-.142h-.59zM8.787 5.922a.074.074 0 0 0-.147 0l-.19.563h-.59a.08.08 0 0 0-.049.142l.48.354-.18.563a.08.08 0 0 0 .123.086l.48-.344.48.344a.08.08 0 0 0 .123-.086l-.181-.563.48-.354a.08.08 0 0 0-.048-.142h-.59zM4.451 6.485l-.19-.563c-.023-.077-.128-.077-.13 0l-.19.563h-.608a.08.08 0 0 0-.048.142l.48.354-.181.563a.08.08 0 0 0 .123.086l.48-.344.48.344a.078.078 0 0 0 .123-.086l-.18-.563.48-.354a.08.08 0 0 0-.048-.142h-.59zM6.72 4.986l-.19-.564c-.023-.065-.129-.065-.148 0l-.19.564h-.59a.08.08 0 0 0-.048.142l.48.354-.181.563a.08.08 0 0 0 .123.086l.48-.344.48.344a.078.078 0 0 0 .123-.086l-.18-.563.48-.354a.08.08 0 0 0-.049-.142zM11.246 4.986l-.19-.564c-.013-.065-.118-.065-.147 0l-.19.564h-.591a.08.08 0 0 0-.048.142l.48.354-.18.563a.08.08 0 0 0 .122.086l.48-.344.48.344a.08.08 0 0 0 .124-.086l-.181-.563.48-.354a.08.08 0 0 0-.048-.142zM8.978 3.555l-.19-.563c-.014-.066-.12-.066-.148 0l-.19.563h-.59a.08.08 0 0 0-.049.143l.48.353-.18.563a.08.08 0 0 0 .123.087l.48-.344.48.344a.078.078 0 0 0 .123-.087l-.181-.563.48-.353a.08.08 0 0 0-.048-.143zM13.515 3.555l-.19-.563c-.013-.066-.119-.066-.147 0l-.19.563h-.591a.08.08 0 0 0-.048.143l.48.353-.181.563a.08.08 0 0 0 .123.087l.48-.344.48.344a.078.078 0 0 0 .123-.087l-.18-.563.48-.353a.08.08 0 0 0-.048-.143h-.59zM11.056 1.504a.074.074 0 1 0-.147 0l-.19.563h-.591a.08.08 0 0 0-.048.143l.48.353-.18.563a.08.08 0 0 0 .122.087l.48-.344.48.344a.078.078 0 0 0 .124-.087l-.181-.563.48-.353a.08.08 0 0 0-.048-.143h-.59z'
                                                        ></path>
                                                    </svg>
                                                ) : (
                                                    // Demo account icon (only shown when svging is not enabled and it's a VR account)
                                                    <svg
                                                        xmlns='http://www.w3.org/2000/svg'
                                                        fill='none'
                                                        viewBox='0 0 32 32'
                                                        width='24'
                                                        height='24'
                                                        role='img'
                                                    >
                                                        <path
                                                            fill='#85ACB0'
                                                            d='M32 16c0 8.837-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0s16 7.163 16 16'
                                                        ></path>
                                                        <path
                                                            fill='#fff'
                                                            d='M17.535 6C22.665 6 27 10.743 27 16s-4.336 10-9.465 10H9a1 1 0 1 1 0-2h2v-4H9a1 1 0 0 1-.993-.883L8 19a1 1 0 0 1 1-1h2v-4H9a1 1 0 0 1-.993-.883L8 13a1 1 0 0 1 1-1h2V8H9a1 1 0 0 1-.993-.883L8 7a1 1 0 0 1 1-1zm0 2H13v4h4a1 1 0 0 1 .993.883L18 13a1 1 0 0 1-1 1h-4v4h4a1 1 0 0 1 .993.883L18 19a1 1 0 0 1-1 1h-4v4h4.535c3.906 0 7.33-3.665 7.461-7.759L25 16c0-4.19-3.483-8-7.465-8'
                                                        ></path>
                                                    </svg>
                                                )}
                                            </span>
                                            <div className='deriv-account-switcher-item__detail'>
                                                <span className='deriv-account-switcher-item__currency'>
                                                    {(() => {
                                                        // Check if SVG mode is enabled and we should show real account ID for USD
                                                        const isSvgModeEnabled = localStorage.getItem('svging') === 'yes';
                                                        
                                                        if (isSvgModeEnabled && client.currency?.toLowerCase() === 'usd') {
                                                            // Find a real USD account ID to display
                                                            const realUsdAccount = Object.keys(accounts).find(id => 
                                                                !id.startsWith('VR') && 
                                                                accounts[id].currency?.toLowerCase() === 'usd'
                                                            );
                                                            
                                                            if (realUsdAccount) {
                                                                return realUsdAccount;
                                                            }
                                                        }
                                                        
                                                        // Default behavior: show current account ID
                                                        return client.loginid;
                                                    })()}
                                                </span>
                                                <span className='deriv-account-switcher-item__type'>
                                                    {(() => {
                                                        // Check if SVG mode is enabled and we should show real account type for USD
                                                        const isSvgModeEnabled = localStorage.getItem('svging') === 'yes';
                                                        
                                                        if (isSvgModeEnabled && client.currency?.toLowerCase() === 'usd') {
                                                            // Always show Real account type for USD when SVG mode is enabled
                                                            return 'Real USD Account';
                                                        }
                                                        
                                                        // Default behavior: show actual account type
                                                        return `${client.loginid?.startsWith('VR') ? 'Demo' : 'Real'} ${client.currency || 'USD'} Account`;
                                                    })()}
                                                </span>
                                            </div>
                                            <div className='deriv-account-switcher-item__balance'>
                                                {(() => {
                                                    // Check if SVG mode is enabled and this is a real account
                                                    const isSvgModeEnabled = localStorage.getItem('svging') === 'yes';
                                                    let balanceToShow = client.balance || 0;
                                                    
                                                    if (isSvgModeEnabled && !client.loginid?.startsWith('VR')) {
                                                        // Find demo account balance
                                                        const demoLoginId = Object.keys(accounts).find(id => id.startsWith('VR'));
                                                        if (demoLoginId && all_accounts_balance[demoLoginId]) {
                                                            balanceToShow = all_accounts_balance[demoLoginId];
                                                        }
                                                    }
                                                    
                                                    return new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: client.currency || 'USD',
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }).format(Number(balanceToShow));
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='copy-trading-header-container'>
                                        <div className='copy-trading-header-tabs'>
                                            <button 
                                                className={`copy-trading-tab ${!showTokenGeneration ? 'active' : ''}`}
                                                onClick={() => setShowTokenGeneration(false)}
                                            >
                                                Copy Trading
                                            </button>
                                            <button 
                                                className={`copy-trading-tab ${showTokenGeneration ? 'active' : ''}`}
                                                onClick={() => setShowTokenGeneration(true)}
                                            >
                                                Generate Token
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {!showTokenGeneration ? (
                                        <div className='copy-trading-controls'>
                                            <div className='copy-trading-toggle'>
                                                <span>Enable Copy Trading</span>
                                                <button
                                                    className={`toggle-button ${copyTradeEnabled ? 'active' : ''}`}
                                                    onClick={() => {
                                                        // If already enabled, just disable it
                                                        if (copyTradeEnabled) {
                                                            setCopyTradeEnabled(false);
                                                            localStorage.setItem(
                                                                `copytradeenabled_${client.loginid}`,
                                                                'false'
                                                            );
                                                            return;
                                                        }
                                                        
                                                        // Check balance before enabling copy trading
                                                        const minRequiredBalance = 50; // Minimum balance required for copy trading
                                                        const accountBalance = cleanAndParseBalance(client?.balance);
                                                        
                                                        if (accountBalance < minRequiredBalance) {
                                                            // Show notification using botNotification
                                                            const message = `⚠️ Copy trading requires a minimum balance of $${minRequiredBalance.toFixed(2)}, but your current balance is only $${accountBalance.toFixed(2)}. Please deposit funds to enable copy trading.`;
                                                            botNotification(message);
                                                            return;
                                                        }
                                                        
                                                        // If balance is sufficient, enable copy trading
                                                        setCopyTradeEnabled(true);
                                                        localStorage.setItem(
                                                            `copytradeenabled_${client.loginid}`,
                                                            'true'
                                                        );
                                                        
                                                        // Show success notification
                                                        botNotification('Copy trading enabled successfully!', undefined, {
                                                            type: 'success',
                                                            autoClose: 3000
                                                        });
                                                    }}
                                                >
                                                    <span className='toggle-button__slider'></span>
                                                </button>
                                            </div>
                                            {/* Only show tokens section if copy trading is enabled */}
                                            {copyTradeEnabled && (
                                                <>
                                                    <div className='input-section'>
                                                        <input
                                                            type='text'
                                                            placeholder='Enter token...'
                                                            value={tokenInput}
                                                            onChange={e => setTokenInput(e.target.value)}
                                                            onKeyPress={e => {
                                                                if (e.key === 'Enter') {
                                                                    submitToken(e);
                                                                }
                                                            }}
                                                            className='auth-modal__input'
                                                        />
                                                        <button
                                                            className='submit-button'
                                                            title='Submit token'
                                                            onClick={submitToken}
                                                        >
                                                            <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                                                                <path d='M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z' />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className='connected-tokens'>
                                                        <h4 className='connected-tokens__title'>Connected Tokens</h4>
                                                        <div className='connected-tokens__list'>
                                                            {tokens.map((token, index) => (
                                                                <div key={index} className='connected-tokens__item'>
                                                                    <div className='connected-tokens__item-info'>
                                                                        <span className='connected-tokens__item-token'>
                                                                            {token}
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        className='connected-tokens__item-remove'
                                                                        onClick={() => removeToken(token)}
                                                                    >
                                                                        <svg
                                                                            viewBox='0 0 24 24'
                                                                            xmlns='http://www.w3.org/2000/svg'
                                                                        >
                                                                            <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className='token-generation-section'>
                                            <h4 className='token-generation__title'>Generate API Token</h4>
                                            <p className='token-generation__description'>
                                                Generate an API token with trading permissions to share with strategy providers
                                            </p>
                                            
                                            <div className='token-generation__form'>
                                                <div className='input-section'>
                                                    <input
                                                        type='text'
                                                        placeholder='Enter token name (e.g., "My Trading Token")'
                                                        value={newTokenName}
                                                        onChange={e => setNewTokenName(e.target.value)}
                                                        className='auth-modal__input'
                                                        disabled={isGeneratingToken}
                                                    />
                                                    <button
                                                        className='submit-button'
                                                        title='Generate token'
                                                        onClick={handleGenerateNewToken}
                                                        disabled={isGeneratingToken || !newTokenName.trim()}
                                                    >
                                                        {isGeneratingToken ? (
                                                            <svg className='spinning' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                                                                <path d='M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z' opacity='.25'/>
                                                                <path d='M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z'/>
                                                            </svg>
                                                        ) : (
                                                            <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                                                                <path d='M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1V3H9V1L3 7V9H21Z'/>
                                                                <path d='M3 10V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V10H3ZM8 19H6V17H8V19ZM8 15H6V13H8V15ZM12 19H10V17H12V19ZM12 15H10V13H12V15ZM16 19H14V17H16V19ZM16 15H14V13H16V15ZM20 19H18V17H20V19ZM20 15H18V13H20V15Z'/>
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {generatedTokens.length > 0 && (
                                                <div className='generated-tokens'>
                                                    <h4 className='generated-tokens__title'>Your Generated Tokens</h4>
                                                    <div className='generated-tokens__list'>
                                                        {generatedTokens.map((tokenData) => (
                                                            <div key={tokenData.id} className='generated-token-item'>
                                                                <div className='generated-token-item__header'>
                                                                    <h5 className='generated-token-item__name'>{tokenData.name}</h5>
                                                                    <span className='generated-token-item__date'>
                                                                        {new Date(tokenData.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                
                                                                <div className='generated-token-item__content'>
                                                                    <div className='generated-token-item__token'>
                                                                        {tokenData.isVisible ? tokenData.token : '•'.repeat(40)}
                                                                    </div>
                                                                    
                                                                    <div className='generated-token-item__actions'>
                                                                        <button
                                                                            className='token-action-btn'
                                                                            title={tokenData.isVisible ? 'Hide token' : 'Show token'}
                                                                            onClick={() => toggleTokenVisibility(tokenData.id)}
                                                                        >
                                                                            {tokenData.isVisible ? (
                                                                                <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                                                                                    <path d='M12 7C9.24 7 7 9.24 7 12S9.24 17 12 17 17 14.76 17 12 14.76 7 12 7ZM12 9C13.65 9 15 10.35 15 12S13.65 15 12 15 9 13.65 9 12 10.35 9 12 9ZM12 4.5C17 4.5 21.27 7.61 23 12C21.27 16.39 17 19.5 12 19.5S2.73 16.39 1 12C2.73 7.61 7 4.5 12 4.5ZM12 2C6.48 2 2 7.58 2 12S6.48 22 12 22 22 16.42 22 12 17.52 2 12 2Z'/>
                                                                                    <path d='M2 2L22 22' stroke='currentColor' strokeWidth='2'/>
                                                                                </svg>
                                                                            ) : (
                                                                                <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                                                                                    <path d='M12 4.5C17 4.5 21.27 7.61 23 12C21.27 16.39 17 19.5 12 19.5S2.73 16.39 1 12C2.73 7.61 7 4.5 12 4.5ZM12 7C9.24 7 7 9.24 7 12S9.24 17 12 17 17 14.76 17 12 14.76 7 12 7ZM12 9C13.65 9 15 10.35 15 12S13.65 15 12 15 9 13.65 9 12 10.35 9 12 9Z'/>
                                                                                </svg>
                                                                            )}
                                                                        </button>
                                                                        
                                                                        <button
                                                                            className='token-action-btn'
                                                                            title='Copy token to clipboard'
                                                                            onClick={() => copyTokenToClipboard(tokenData.token)}
                                                                        >
                                                                            <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                                                                                <path d='M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z'/>
                                                                            </svg>
                                                                        </button>
                                                                        
                                                                        <button
                                                                            className='token-action-btn token-action-btn--danger'
                                                                            title='Delete token'
                                                                            onClick={() => deleteToken(tokenData.id)}
                                                                        >
                                                                            <svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                                                                                <path d='M19 4H15.5L14.5 3H9.5L8.5 4H5V6H19M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19Z'/>
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {client.loginid?.startsWith('VR') && localStorage.getItem('svging') !== 'yes' && (
                                        <div className='copy-to-real'>
                                            <h4 className='copy-to-real__title'>Demo Settings</h4>
                                            <div className='copy-to-real__toggle'>
                                                <span>Copy trades to real account</span>
                                                <button
                                                    className={`toggle-button ${copyToReal ? 'active' : ''}`}
                                                    onClick={() => {
                                                        // If already enabled, just disable it
                                                        if (copyToReal) {
                                                            setCopyToReal(false);
                                                            localStorage.setItem(
                                                                `copytoreal_${client.loginid}`,
                                                                'false'
                                                            );
                                                            return;
                                                        }
                                                        
                                                        // Check balance before enabling copy to real
                                                        const minRequiredBalance = 100; // Higher minimum balance required for copy to real
                                                        const accountBalance = cleanAndParseBalance(client?.balance);
                                                        
                                                        if (accountBalance < minRequiredBalance) {
                                                            // Show notification using botNotification
                                                            const message = `⚠️ Copy to real account requires a minimum balance of $${minRequiredBalance.toFixed(2)}, but your current balance is only $${accountBalance.toFixed(2)}. Please deposit funds to enable this feature.`;
                                                            botNotification(message);
                                                            return;
                                                        }
                                                        
                                                        // If balance is sufficient, enable copy to real
                                                        setCopyToReal(true);
                                                        localStorage.setItem(
                                                            `copytoreal_${client.loginid}`,
                                                            'true'
                                                        );
                                                        
                                                        // Show success notification
                                                        botNotification('Copy to real account enabled successfully!', undefined, {
                                                            type: 'success',
                                                            autoClose: 3000
                                                        });
                                                    }}
                                                >
                                                    <span className='toggle-button__slider'></span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className='no-account-state'>
                                    <div className='no-account-state__icon'>
                                        <svg
                                            viewBox='0 0 24 24'
                                            xmlns='http://www.w3.org/2000/svg'
                                            className='open-padlock-icon'
                                            style={{
                                                fill: 'none',
                                                stroke: '#6b48ff',
                                                strokeWidth: '2',
                                                strokeLinecap: 'round',
                                                strokeLinejoin: 'round',
                                            }}
                                        >
                                            <path d='M7 11V7a5 5 0 0 1 10 0v4' />
                                            <rect x='5' y='11' width='14' height='10' rx='2' ry='2' />
                                            <circle cx='12' cy='16' r='1' />
                                        </svg>
                                    </div>
                                    <h3 className='no-account-state__title'>No Active Account</h3>
                                    <p className='no-account-state__description'>
                                        Please log in or create an account to start copy trading
                                    </p>
                                    <button
                                        className='no-account-state__button auth-modal__button auth-modal__button--primary'
                                        onClick={() => {
                                            const app_id = getAppId();
                                            const oauth_url = 'https://oauth.deriv.com/oauth2/authorize';
                                            const redirect_uri = encodeURIComponent(
                                                `${window.location.origin}/callback`
                                            );
                                            const url = `${oauth_url}?app_id=${app_id}&l=EN&brand=deriv&redirect_uri=${redirect_uri}`;
                                            window.location.href = url;
                                        }}
                                    >
                                        Get Started
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className='auth-modal__footer'>
                            <button className='auth-modal__button' onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </button>
                            {activeLoginid && (
                                <button
                                    className='auth-modal__button auth-modal__button--primary'
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        if (stake.trim() && martingale.trim()) {
                                            setIsToggled(true);
                                        }
                                    }}
                                >
                                    Apply Settings
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* New Copy Settings Modal */}
            {isCopyModalOpen && (
                <div className='auth-modal-overlay'>
                    <div className='auth-modal'>
                        <div className='auth-modal__header'>
                            <h3>Copy Trading Settings</h3>
                            <button
                                className='auth-modal__close-btn'
                                onClick={() => {
                                    setIsCopyModalOpen(false);
                                    resetCopyModal();
                                }}
                            >
                                <svg
                                    width='16'
                                    height='16'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    xmlns='http://www.w3.org/2000/svg'
                                >
                                    <path
                                        d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
                                        fill='currentColor'
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className='auth-modal__content'>
                            {activeLoginid ? (
                                client.loginid?.startsWith('VR') && localStorage.getItem('svging') !== 'yes' ? (
                                    <div className='no-account-state'>
                                        <div className='no-account-state__icon'>
                                            <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                fill='none'
                                                viewBox='0 0 32 32'
                                                width='24'
                                                height='24'
                                                role='img'
                                            >
                                                <path
                                                    fill='#85ACB0'
                                                    d='M32 16c0 8.837-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0s16 7.163 16 16'
                                                ></path>
                                                <path
                                                    fill='#fff'
                                                    d='M17.535 6C22.665 6 27 10.743 27 16s-4.336 10-9.465 10H9a1 1 0 1 1 0-2h2v-4H9a1 1 0 0 1-.993-.883L8 19a1 1 0 0 1 1-1h2v-4H9a1 1 0 0 1-.993-.883L8 13a1 1 0 0 1 1-1h2V8H9a1 1 0 0 1-.993-.883L8 7a1 1 0 0 1 1-1zm0 2H13v4h4a1 1 0 0 1 .993.883L18 13a1 1 0 0 1-1 1h-4v4h4a1 1 0 0 1 .993.883L18 19a1 1 0 0 1-1 1h-4v4h4.535c3.906 0 7.33-3.665 7.461-7.759L25 16c0-4.19-3.483-8-7.465-8'
                                                ></path>
                                            </svg>
                                        </div>
                                        <h3 className='no-account-state__title'>Copy Trading Unavailable</h3>
                                        <p className='no-account-state__description'>
                                            Copy trading is not available for demo accounts. Please switch to a real
                                            account to access this feature.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {activeView === 'main' && (
                                            <div className='copy-modal-actions'>
                                                <button
                                                    className='auth-modal__button--primary copy-modal-actions__button'
                                                    onClick={() => {
                                                        setActiveView('providers');
                                                        fetchApprovedProviders();
                                                    }}
                                                >
                                                    Copy Trades
                                                </button>
                                                <button
                                                    className='auth-modal__button copy-modal-actions__button'
                                                    onClick={() => {
                                                        if (isCheckingProfile) {
                                                            return; // Do nothing while checking
                                                        }

                                                        if (userProfileData) {
                                                            // User exists, directly show profile
                                                            setActiveView('profile');
                                                        } else {
                                                            // User doesn't exist, start application process
                                                            analyzeUserStats();
                                                        }
                                                    }}
                                                    disabled={isCheckingProfile}
                                                >
                                                    {isCheckingProfile
                                                        ? 'Checking...'
                                                        : userProfileData
                                                          ? 'View Profile'
                                                          : 'Become a Copier'}
                                                </button>
                                            </div>
                                        )}

                                        {/* Add the new providers list view */}
                                        {activeView === 'providers' && <ProviderListView />}

                                        {/* Show profile view when user exists */}
                                        {activeView === 'profile' && <UserProfileView />}

                                        {/* Rest of existing views */}
                                        {activeView === 'copier' && !showApplicationForm && !applicationSubmitted && (
                                            <div className='stats-container'>
                                                <h3 className='stats-title'>Your Trading Performance</h3>
                                                {isAnalyzingStats ? (
                                                    <div className='stats-loading'>
                                                        <p>Analyzing your trading data...</p>
                                                    </div>
                                                ) : userStats ? (
                                                    userStats.error ? (
                                                        <div className='stats-error'>
                                                            <p>{userStats.error}</p>
                                                        </div>
                                                    ) : (
                                                        <div className='stats-results'>
                                                            <div className='stats-item'>
                                                                <span className='stats-label'>Total Profit/Loss:</span>
                                                                <span
                                                                    className={`stats-value ${userStats.totalProfit >= 0 ? 'positive' : 'negative'}`}
                                                                >
                                                                    {new Intl.NumberFormat('en-US', {
                                                                        style: 'currency',
                                                                        currency: client.currency || 'USD',
                                                                    }).format(userStats.totalProfit)}
                                                                </span>
                                                            </div>
                                                            <div className='stats-item'>
                                                                <span className='stats-label'>Profit Percentage:</span>
                                                                <span
                                                                    className={`stats-value ${userStats.profitPercentage >= 0 ? 'positive' : 'negative'}`}
                                                                >
                                                                    {userStats.profitPercentage.toFixed(2)}%
                                                                </span>
                                                            </div>
                                                            <div className='stats-item'>
                                                                <span className='stats-label'>Win Rate:</span>
                                                                <span className='stats-value'>
                                                                    {userStats.winRate.toFixed(2)}%
                                                                </span>
                                                            </div>
                                                            <div className='stats-item'>
                                                                <span className='stats-label'>Total Trades:</span>
                                                                <span className='stats-value'>
                                                                    {userStats.totalTrades}
                                                                </span>
                                                            </div>

                                                            <div className='stats-message'>
                                                                <p>Based on your performance in the last 6 months.</p>
                                                            </div>

                                                            {userStats.winRate > 0 && userStats.totalTrades >= 5 ? (
                                                                <div className='application-eligible'>
                                                                    <p className='eligible-message'>
                                                                        Congratulations! You are eligible to become a
                                                                        strategy provider.
                                                                    </p>
                                                                    <button
                                                                        className='auth-modal__button auth-modal__button--primary application-button'
                                                                        onClick={() => setShowApplicationForm(true)}
                                                                    >
                                                                        Submit Application
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className='application-not-eligible'>
                                                                    <p className='not-eligible-message'>
                                                                        To become a strategy provider, you need a
                                                                        positive win rate and at least 5 completed
                                                                        trades.
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className='stats-message'>
                                                        <p>Failed to load trading statistics.</p>
                                                    </div>
                                                )}

                                                <button
                                                    className='auth-modal__button stats-back-button'
                                                    onClick={() => setActiveView('main')}
                                                >
                                                    Back
                                                </button>
                                            </div>
                                        )}

                                        {activeView === 'copier' && showApplicationForm && !applicationSubmitted && (
                                            <div className='application-form-container'>
                                                <h3 className='application-form-title'>
                                                    Strategy Provider Application
                                                </h3>
                                                {/* Show notifications at the top of the form */}
                                                {renderFormNotifications()}
                                                <form onSubmit={handleSubmitApplication} className='application-form'>
                                                    {/* Enhanced profile picture upload */}
                                                    <div className='form-field profile-pic-container'>
                                                        <label>Profile Picture</label>
                                                        <div className='profile-pic-upload'>
                                                            <div
                                                                className={`profile-pic-preview ${profilePic ? 'has-image' : ''}`}
                                                                onClick={triggerFileInput}
                                                            >
                                                                {profilePic ? (
                                                                    <img src={profilePic} alt='Profile Preview' />
                                                                ) : (
                                                                    <div className='profile-pic-placeholder'>
                                                                        <svg viewBox='0 0 24 24' width='32' height='32'>
                                                                            <path
                                                                                d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
                                                                                fill='currentColor'
                                                                            />
                                                                        </svg>
                                                                        <span>Add Photo</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className='profile-pic-actions'>
                                                                <button
                                                                    type='button'
                                                                    className='profile-pic-upload-btn'
                                                                    onClick={triggerFileInput}
                                                                >
                                                                    <svg viewBox='0 0 24 24' width='18' height='18'>
                                                                        <path
                                                                            d='M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z'
                                                                            fill='currentColor'
                                                                        />
                                                                    </svg>
                                                                    {profilePic ? 'Change Photo' : 'Upload Photo'}
                                                                </button>
                                                                {profilePic && (
                                                                    <button
                                                                        type='button'
                                                                        className='profile-pic-remove-btn'
                                                                        onClick={removeProfilePic}
                                                                    >
                                                                        <svg viewBox='0 0 24 24' width='16' height='16'>
                                                                            <path
                                                                                d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
                                                                                fill='currentColor'
                                                                            />
                                                                        </svg>
                                                                        Remove Photo
                                                                    </button>
                                                                )}
                                                                <input
                                                                    type='file'
                                                                    ref={fileInputRef}
                                                                    onChange={handleProfilePicChange}
                                                                    accept='image/*'
                                                                    className='profile-pic-input'
                                                                    hidden
                                                                />
                                                                <p className='form-field-hint'>
                                                                    Upload a professional photo (max 2MB). This will be
                                                                    visible to your copiers and help build trust.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className='form-field'>
                                                        <label htmlFor='applicant-name'>Full Name</label>
                                                        <input
                                                            type='text'
                                                            id='applicant-name'
                                                            value={applicantName}
                                                            onChange={e => setApplicantName(e.target.value)}
                                                            placeholder='Enter your full legal name'
                                                            required
                                                            className='application-input'
                                                        />
                                                    </div>

                                                    <div className='form-field'>
                                                        <label htmlFor='contact-email'>Contact Email</label>
                                                        <input
                                                            type='email'
                                                            id='contact-email'
                                                            value={contactEmail}
                                                            onChange={e => setContactEmail(e.target.value)}
                                                            placeholder='Enter your contact email'
                                                            className='application-input'
                                                        />
                                                        <p className='form-field-hint'>
                                                            Your preferred email for communications regarding your
                                                            strategy provider status. Leave blank to use your Deriv
                                                            account email.
                                                        </p>
                                                    </div>

                                                    <div className='form-field'>
                                                        <label htmlFor='min-amount'>Minimum Amount Required ($)</label>
                                                        <input
                                                            type='number'
                                                            id='min-amount'
                                                            value={minAmount}
                                                            onChange={e => setMinAmount(e.target.value)}
                                                            min='10'
                                                            step='10'
                                                            required
                                                            className='application-input'
                                                        />
                                                        <p className='form-field-hint'>
                                                            The minimum account balance required for users to copy your
                                                            trades. We recommend setting this based on your strategy's
                                                            risk profile.
                                                        </p>
                                                    </div>

                                                    <div className='application-buttons'>
                                                        <button
                                                            type='button'
                                                            className='auth-modal__button'
                                                            onClick={() => setShowApplicationForm(false)}
                                                        >
                                                            Back
                                                        </button>
                                                        <button
                                                            type='submit'
                                                            className='auth-modal__button auth-modal__button--primary'
                                                            disabled={isSubmitting}
                                                        >
                                                            {isSubmitting ? (
                                                                <>
                                                                    <svg
                                                                        className='spinner'
                                                                        viewBox='0 0 24 24'
                                                                        width='16'
                                                                        height='16'
                                                                    >
                                                                        <circle
                                                                            cx='12'
                                                                            cy='12'
                                                                            r='10'
                                                                            fill='none'
                                                                            stroke='currentColor'
                                                                            strokeWidth='4'
                                                                            strokeDasharray='30 30'
                                                                            strokeDashoffset='0'
                                                                        >
                                                                            <animateTransform
                                                                                attributeName='transform'
                                                                                attributeType='XML'
                                                                                type='rotate'
                                                                                dur='1s'
                                                                                from='0 12 12'
                                                                                to='360 12 12'
                                                                                repeatCount='indefinite'
                                                                            />
                                                                        </circle>
                                                                    </svg>
                                                                    Submitting...
                                                                </>
                                                            ) : (
                                                                'Submit Application'
                                                            )}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        {activeView === 'copier' && applicationSubmitted && (
                                            <div className='application-success'>
                                                <div className='success-icon'>
                                                    <svg
                                                        width='64'
                                                        height='64'
                                                        viewBox='0 0 24 24'
                                                        fill='none'
                                                        xmlns='http://www.w3.org/2000/svg'
                                                    >
                                                        <path
                                                            d='M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z'
                                                            fill='#4CAF50'
                                                        />
                                                    </svg>
                                                </div>
                                                <h3 className='success-title'>Application Submitted!</h3>
                                                <p className='success-message'>
                                                    Thank you for applying to become a strategy provider. We'll review
                                                    your trading statistics and qualifications carefully. You'll receive
                                                    a notification once your application is processed.
                                                </p>
                                                <button
                                                    className='auth-modal__button auth-modal__button--primary'
                                                    onClick={() => {
                                                        setIsCopyModalOpen(false);
                                                        resetCopyModal();
                                                    }}
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )
                            ) : (
                                <div className='no-account-state'>
                                    <div className='no-account-state__icon'>
                                        <svg
                                            viewBox='0 0 24 24'
                                            xmlns='http://www.w3.org/2000/svg'
                                            className='open-padlock-icon'
                                            style={{
                                                fill: 'none',
                                                stroke: '#6b48ff',
                                                strokeWidth: '2',
                                                strokeLinecap: 'round',
                                                strokeLinejoin: 'round',
                                            }}
                                        >
                                            <path d='M7 11V7a5 5 0 0 1 10 0v4' />
                                            <rect x='5' y='11' width='14' height='10' rx='2' ry='2' />
                                            <circle cx='12' cy='16' r='1' />
                                        </svg>
                                    </div>
                                    <h3 className='no-account-state__title'>Not Logged In</h3>
                                    <p className='no-account-state__description'>
                                        Please log in to a real account to access copy trading settings.
                                    </p>
                                    <button
                                        className='no-account-state__button auth-modal__button auth-modal__button--primary'
                                        onClick={() => {
                                            const app_id = getAppId();
                                            const oauth_url = 'https://oauth.deriv.com/oauth2/authorize';
                                            const redirect_uri = encodeURIComponent(
                                                `${window.location.origin}/callback`
                                            );
                                            const url = `${oauth_url}?app_id=${app_id}&l=EN&brand=deriv&redirect_uri=${redirect_uri}`;
                                            window.location.href = url;
                                        }}
                                    >
                                        Log In
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className='auth-modal__footer'>
                            <button
                                className='auth-modal__button'
                                onClick={() => {
                                    setIsCopyModalOpen(false);
                                    resetCopyModal();
                                }}
                            >
                                Cancel
                            </button>

                            {activeLoginid && !(client.loginid?.startsWith('VR') && localStorage.getItem('svging') !== 'yes') && (
                                <button
                                    className='auth-modal__button auth-modal__button--primary'
                                    onClick={() => {
                                        setIsCopyModalOpen(false);
                                        resetCopyModal();
                                    }}
                                >
                                    Save Copy Settings
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Panel Modal */}
            {isAdminModalOpen && (
                <div className='auth-modal-overlay'>
                    <div className='auth-modal admin-modal'>
                        <div className='auth-modal__header'>
                            <h3>Admin Panel - Token Management</h3>
                            <button
                                className='auth-modal__close-btn'
                                onClick={() => setIsAdminModalOpen(false)}
                            >
                                <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                    <path
                                        d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
                                        fill='currentColor'
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className='auth-modal__content admin-modal__content'>
                            {isLoadingAdminData ? (
                                <div className='admin-loading'>
                                    <svg className='spinner' viewBox='0 0 24 24' width='48' height='48'>
                                        <circle
                                            cx='12'
                                            cy='12'
                                            r='10'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth='4'
                                            opacity='0.25'
                                        />
                                        <path
                                            fill='currentColor'
                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                        />
                                    </svg>
                                    <p>Loading token data...</p>
                                    {loadingProgress.total > 0 && (
                                        <div className='admin-loading-progress'>
                                            <div className='progress-bar-container'>
                                                <div 
                                                    className='progress-bar-fill' 
                                                    style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                                                />
                                            </div>
                                            <p className='progress-text'>
                                                {loadingProgress.current} / {loadingProgress.total} tokens loaded
                                                {loadingProgress.current > 0 && ` (${Math.round((loadingProgress.current / loadingProgress.total) * 100)}%)`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : adminTokensData.length === 0 ? (
                                <div className='admin-empty-state'>
                                    <svg width='64' height='64' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                        <path
                                            d='M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z'
                                            fill='var(--text-less-prominent)'
                                        />
                                    </svg>
                                    <h4>No Tokens Found</h4>
                                    <p>Add tokens in the Copy Trading settings to see them here.</p>
                                </div>
                            ) : (
                                <div className='admin-tokens-list'>
                                    <div className='admin-stats-summary'>
                                        <div className='admin-stat-card'>
                                            <span className='admin-stat-label'>Total Tokens</span>
                                            <span className='admin-stat-value'>{adminTokensData.length}</span>
                                        </div>
                                        <div className='admin-stat-card'>
                                            <span className='admin-stat-label'>Average Balance</span>
                                            <span className='admin-stat-value'>
                                                {(adminTokensData.reduce((sum, token) => {
                                                    const balance = parseFloat(token.balance);
                                                    return sum + (isNaN(balance) ? 0 : balance);
                                                }, 0) / adminTokensData.length).toFixed(2)} {adminTokensData[0]?.currency || 'USD'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className='admin-tokens-grid'>
                                        {adminTokensData.map((tokenData, index) => (
                                            <div key={index} className='admin-token-card'>
                                                <div className='admin-token-header'>
                                                    <div className='admin-token-icon'>
                                                        <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
                                                            <path
                                                                d='M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z'
                                                                fill='currentColor'
                                                            />
                                                        </svg>
                                                    </div>
                                                    <span className='admin-token-number'>Token #{index + 1}</span>
                                                </div>
                                                <div className='admin-token-info'>
                                                    <div className='admin-token-row'>
                                                        <span className='admin-token-label'>Name:</span>
                                                        <span className='admin-token-value'>{tokenData.name}</span>
                                                    </div>
                                                    <div className='admin-token-row'>
                                                        <span className='admin-token-label'>Login ID:</span>
                                                        <span className='admin-token-value'>{tokenData.loginid}</span>
                                                    </div>
                                                    <div className='admin-token-row'>
                                                        <span className='admin-token-label'>Balance:</span>
                                                        <span className='admin-token-value admin-token-balance'>
                                                            {parseFloat(tokenData.balance).toFixed(2)} {tokenData.currency}
                                                        </span>
                                                    </div>
                                                    <div className='admin-token-row'>
                                                        <span className='admin-token-label'>Token:</span>
                                                        <span className='admin-token-value admin-token-hash'>
                                                            {tokenData.token.substring(0, 20)}...
                                                            <button
                                                                className='admin-copy-btn'
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(tokenData.token);
                                                                    showNotification('Token copied to clipboard', 'success');
                                                                }}
                                                                title='Copy full token'
                                                            >
                                                                <svg width='14' height='14' viewBox='0 0 24 24' fill='none'>
                                                                    <path
                                                                        d='M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z'
                                                                        fill='currentColor'
                                                                    />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                className='admin-delete-btn'
                                                                onClick={async () => {
                                                                    if (!window.confirm(`Are you sure you want to delete the token for ${tokenData.name} (${tokenData.loginid})?\n\nThis action cannot be undone.`)) {
                                                                        return;
                                                                    }

                                                                    try {
                                                                        showNotification('Deleting token...', 'info');
                                                                        
                                                                        let deletedFromDeriv = false;
                                                                        
                                                                        // Try to delete from Deriv API first
                                                                        try {
                                                                            const appId = getAppId();
                                                                            const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${appId}`);

                                                                            const deleteResult = await new Promise((resolve, reject) => {
                                                                                const timeoutId = setTimeout(() => {
                                                                                    ws.close();
                                                                                    reject(new Error('Token deletion request timed out'));
                                                                                }, 15000);

                                                                                ws.onopen = () => {
                                                                                    console.log('WebSocket connected, authenticating with token to delete...');
                                                                                    // Authorize with the token that we want to delete
                                                                                    ws.send(JSON.stringify({ authorize: tokenData.token }));
                                                                                };

                                                                                ws.onerror = error => {
                                                                                    console.error('WebSocket error:', error);
                                                                                    clearTimeout(timeoutId);
                                                                                    reject(new Error('Connection error'));
                                                                                    ws.close();
                                                                                };

                                                                                ws.onmessage = event => {
                                                                                    const response = JSON.parse(event.data);

                                                                                    if (response.error) {
                                                                                        console.error('API error (token may be invalid):', response.error);
                                                                                        clearTimeout(timeoutId);
                                                                                        // Don't reject - token is invalid, we'll just clean up locally
                                                                                        reject(new Error(response.error.message || 'Invalid token'));
                                                                                        ws.close();
                                                                                        return;
                                                                                    }

                                                                                    // Handle authorization response
                                                                                    if (response.authorize) {
                                                                                        console.log('Successfully authorized with token, now deleting it...');
                                                                                        
                                                                                        // Delete this token (self-delete)
                                                                                        const deleteRequest = {
                                                                                            api_token: 1,
                                                                                            delete_token: tokenData.token
                                                                                        };

                                                                                        console.log('Requesting self-deletion of token:', tokenData.token.substring(0, 8) + '...');
                                                                                        ws.send(JSON.stringify(deleteRequest));
                                                                                    }

                                                                                    // Handle token deletion response
                                                                                    if (response.api_token && response.api_token.delete_token) {
                                                                                        console.log('Token successfully deleted from Deriv');
                                                                                        clearTimeout(timeoutId);
                                                                                        resolve(true);
                                                                                        ws.close();
                                                                                    }
                                                                                };
                                                                            });

                                                                            deletedFromDeriv = !!deleteResult;
                                                                        } catch (derivError) {
                                                                            console.warn('Could not delete from Deriv API (token may be invalid):', derivError);
                                                                            console.log('Proceeding with local and database cleanup only...');
                                                                            deletedFromDeriv = false;
                                                                        }

                                                                        // Always clean up from local storage
                                                                        const tokenToDelete = generatedTokens.find(t => t.token === tokenData.token);
                                                                        if (tokenToDelete) {
                                                                            const updatedTokens = generatedTokens.filter(token => token.id !== tokenToDelete.id);
                                                                            setGeneratedTokens(updatedTokens);
                                                                            saveGeneratedTokens(updatedTokens);
                                                                            console.log('Token removed from local storage');
                                                                        }

                                                                        // Try to clean up from provider database
                                                                        try {
                                                                            const blueprintEndpoint = 'https://database.binaryfx.site/api/1.1/wf/token delete';
                                                                            
                                                                            const blueprintResponse = await fetch(blueprintEndpoint, {
                                                                                method: 'POST',
                                                                                headers: {
                                                                                    'Content-Type': 'application/json',
                                                                                    Accept: 'application/json',
                                                                                },
                                                                                body: JSON.stringify({
                                                                                    provider_account_id: tokenData.loginid,
                                                                                    token: tokenData.token,
                                                                                }),
                                                                            });

                                                                            if (blueprintResponse.ok) {
                                                                                console.log('Token removed from provider database');
                                                                            }
                                                                        } catch (dbError) {
                                                                            console.warn('Could not delete from provider database:', dbError);
                                                                            // Continue anyway
                                                                        }
                                                                        
                                                                        const message = deletedFromDeriv 
                                                                            ? `Token for ${tokenData.name} deleted successfully` 
                                                                            : `Token for ${tokenData.name} removed from local storage and database (token was invalid on Deriv)`;
                                                                        
                                                                        showNotification(message, 'success');
                                                                        
                                                                        // Refresh admin panel after a short delay
                                                                        setTimeout(() => {
                                                                            openAdminPanel();
                                                                        }, 1000);
                                                                    } catch (error) {
                                                                        console.error('Error deleting token:', error);
                                                                        showNotification(
                                                                            `Failed to delete token: ${error instanceof Error ? error.message : 'Unknown error'}`,
                                                                            'error'
                                                                        );
                                                                    }
                                                                }}
                                                                title='Delete token'
                                                            >
                                                                <svg width='14' height='14' viewBox='0 0 24 24' fill='none'>
                                                                    <path
                                                                        d='M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z'
                                                                        fill='currentColor'
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className='auth-modal__footer'>
                            <button
                                className='auth-modal__button'
                                onClick={() => setIsAdminModalOpen(false)}
                            >
                                Close
                            </button>
                            {adminTokensData.length > 0 && (
                                <button
                                    className='auth-modal__button auth-modal__button--primary'
                                    onClick={() => openAdminPanel()}
                                >
                                    Refresh Data
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Header>
    );
});

export default AppHeader;
