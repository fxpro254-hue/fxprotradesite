import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import ErrorBoundary from '@/components/error-component/error-boundary';
import ErrorComponent from '@/components/error-component/error-component';
import TradingAssesmentModal from '@/components/trading-assesment-modal';
import { api_base } from '@/external/bot-skeleton';
import { useStore } from '@/hooks/useStore';
import { localize } from '@deriv-com/translations';
import './app-root.scss';

const AppContent = lazy(() => import('./app-content'));

const ErrorComponentWrapper = observer(() => {
    const { common } = useStore();

    if (!common.error) return null;

    return (
        <ErrorComponent
            header={common.error?.header}
            message={common.error?.message}
            redirect_label={common.error?.redirect_label}
            redirectOnClick={common.error?.redirectOnClick}
            should_clear_error_on_click={common.error?.should_clear_error_on_click}
            setError={common.setError}
            redirect_to={common.error?.redirect_to}
            should_redirect={common.error?.should_redirect}
        />
    );
});

/* ---------------- UNIQUE FXPROTRADES GOLD ORBIT LOADER ---------------- */
const GoldLoader = ({ message, theme = 'dark' }: { message?: string; theme?: 'light' | 'dark' }) => (
    <div className={`fx-loader-overlay ${theme}`}>
        <div className="fx-orbit-container">
            <div className="fx-orbit-inner gold" />
            <div className="fx-orbit-mid silver" />
            <div className="fx-orbit-outer bronze" />
            <div className="fx-center-glow" />
        </div>
        {message && <p className={`fx-loader-text ${theme}`}>{message}</p>}
    </div>
);

const AppRoot = () => {
    const store = useStore();
    const api_base_initialized = useRef(false);
    const [is_api_initialized, setIsApiInitialized] = useState(false);

    useEffect(() => {
        const initializeApi = async () => {
            if (!api_base_initialized.current) {
                await api_base.init();
                api_base_initialized.current = true;
                setIsApiInitialized(true);
            }
        };

        initializeApi();
    }, []);

    if (!store || !is_api_initialized)
        return <GoldLoader message={localize('Initializing FxProTrades...')} theme="dark" />;

    return (
        <Suspense fallback={<GoldLoader message={localize('Loading FxProTrades...')} theme="dark" />}>
            <ErrorBoundary root_store={store}>
                <ErrorComponentWrapper />
                <AppContent />
                <TradingAssesmentModal />
            </ErrorBoundary>
        </Suspense>
    );
};

export default AppRoot;
