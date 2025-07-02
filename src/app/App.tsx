import { initSurvicate } from '../public-path';
import { lazy, Suspense, useEffect, useState } from 'react'; // Added useState
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import ChunkLoader from '@/components/loader/chunk-loader';
import RoutePromptDialog from '@/components/route-prompt-dialog';
import { StoreProvider } from '@/hooks/useStore';
import CallbackPage from '@/pages/callback';
import Endpoint from '@/pages/endpoint';
import PWAInstallModal from '@/components/pwa-install-modal/PWAInstallModal'; // Import the new modal
import { TAuthData } from '@/types/api-types';
import { initializeI18n, localize, TranslationProvider } from '@deriv-com/translations';
import CoreStoreProvider from './CoreStoreProvider';
import './app-root.scss';

const Layout = lazy(() => import('../components/layout'));
const AppRoot = lazy(() => import('./app-root'));

// Define an interface for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

const { TRANSLATIONS_CDN_URL, R2_PROJECT_NAME, CROWDIN_BRANCH_NAME } = process.env;
const i18nInstance = initializeI18n({
    cdnUrl: `${TRANSLATIONS_CDN_URL}/${R2_PROJECT_NAME}/${CROWDIN_BRANCH_NAME}`,
});

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route
            path='/'
            element={
                <Suspense
                    fallback={<ChunkLoader message={localize('Please wait while we connect to the server...')} />}
                >
                    <TranslationProvider defaultLang='EN' i18nInstance={i18nInstance}>
                        <StoreProvider>
                            <RoutePromptDialog />
                            <CoreStoreProvider>
                                <Layout />
                            </CoreStoreProvider>
                        </StoreProvider>
                    </TranslationProvider>
                </Suspense>
            }
        >
            <Route index element={<AppRoot />} />
            <Route path='endpoint' element={<Endpoint />} />
            <Route path='callback' element={<CallbackPage />} />
        </Route>
    )
);

function App() {
    const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallModal, setShowInstallModal] = useState(false);

    useEffect(() => {
        initSurvicate();
        window?.dataLayer?.push({ event: 'page_load' });

        return () => {
            const survicateBox = document.getElementById('survicate-box');
            if (survicateBox) {
                survicateBox.style.display = 'none';
            }
        };
    }, []);

    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault(); // Prevent the mini-infobar from appearing on mobile
            const typedEvent = event as BeforeInstallPromptEvent;
            setDeferredInstallPrompt(typedEvent);

            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            const alreadyInstalled = localStorage.getItem('dbot_pwa_already_installed') === 'true';

            if (!isStandalone && !alreadyInstalled) {
                setShowInstallModal(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handlePWAInstall = async () => {
        setShowInstallModal(false);
        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            const { outcome } = await deferredInstallPrompt.userChoice;
            if (outcome === 'accepted') {
                localStorage.setItem('dbot_pwa_already_installed', 'true');
                console.log('User accepted the PWA installation prompt');
            } else {
                console.log('User dismissed the PWA installation prompt');
            }
            setDeferredInstallPrompt(null);
        }
    };

    const handlePWAModalClose = () => {
        setShowInstallModal(false);
        sessionStorage.setItem('dbot_pwa_prompt_dismissed_this_session', 'true');
    };

    useEffect(() => {
        const accountsList = localStorage.getItem('accountsList');
        const clientAccounts = localStorage.getItem('clientAccounts');
        const activeLoginid = localStorage.getItem('active_loginid');
        const urlParams = new URLSearchParams(window.location.search);
        const accountCurrency = urlParams.get('account');

        if (!accountsList || !clientAccounts) return;

        try {
            const parsedAccounts = JSON.parse(accountsList);
            const parsedClientAccounts = JSON.parse(clientAccounts) as TAuthData['account_list'];
            const isValidCurrency = accountCurrency
                ? Object.values(parsedClientAccounts).some(
                      account => account.currency.toUpperCase() === accountCurrency.toUpperCase()
                  )
                : false;

            const updateLocalStorage = (token: string, loginid: string) => {
                localStorage.setItem('authToken', token);
                localStorage.setItem('active_loginid', loginid);
            };

            // Handle demo account
            if (accountCurrency?.toUpperCase() === 'DEMO') {
                const demoAccount = Object.entries(parsedAccounts).find(([key]) => key.startsWith('VR'));

                if (demoAccount) {
                    const [loginid, token] = demoAccount;
                    updateLocalStorage(String(token), loginid);
                    return;
                }
            }

            // Handle real account with valid currency
            if (accountCurrency?.toUpperCase() !== 'DEMO' && isValidCurrency) {
                const realAccount = Object.entries(parsedClientAccounts).find(
                    ([loginid, account]) =>
                        !loginid.startsWith('VR') && account.currency.toUpperCase() === accountCurrency?.toUpperCase()
                );

                if (realAccount) {
                    const [loginid, account] = realAccount;
                    if ('token' in account) {
                        updateLocalStorage(String(account?.token), loginid);
                    }
                    return;
                }
            }
        } catch (e) {
            console.warn('Error parsing accounts:', e);
        }
    }, []);

    // ✅ Register the service worker (for PWA support)
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/service-worker.js')
                    .then(registration => {
                        console.log('Service Worker registered with scope:', registration.scope);
                    })
                    .catch(error => {
                        console.log('Service Worker registration failed:', error);
                    });
            });
        }
    }, []);

    return (
        <>
            <RouterProvider router={router} />
            <PWAInstallModal
                show={showInstallModal && !!deferredInstallPrompt}
                onInstall={handlePWAInstall}
                onClose={handlePWAModalClose}
            />
        </>
    );
}

export default App;
