import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import './dtrader.scss';

/**
 * DTrader Component
 * 
 * This component integrates the Deriv Trader (DTrader) interface into the bot application.
 * It embeds the DTrader webpack dev server running on https://localhost:8443/
 * 
 * Features:
 * - Full-screen iframe embedding
 * - Loading state with spinner
 * - Error handling for connection issues
 * - Responsive design
 * - Seamless integration with bot layout
 */

interface DTraderProps {
    /** Optional custom URL for DTrader instance */
    url?: string;
}

const DTrader: React.FC<DTraderProps> = observer(({ url = 'https://localhost:8443/' }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        // Reset states when URL changes
        setIsLoading(true);
        setHasError(false);
        setErrorMessage('');

        // Set timeout to detect loading issues
        const timeout = setTimeout(() => {
            if (isLoading) {
                setHasError(true);
                setErrorMessage(
                    'DTrader is taking longer than expected to load. Please ensure the DTrader dev server is running on https://localhost:8443/'
                );
                setIsLoading(false);
            }
        }, 15000); // 15 second timeout

        return () => clearTimeout(timeout);
    }, [url, isLoading]);

    const handleIframeLoad = () => {
        setIsLoading(false);
        setHasError(false);
        
        // Hide DTrader header after iframe loads
        try {
            const iframe = iframeRef.current;
            if (iframe && iframe.contentWindow) {
                // Add CSS to hide the header
                const style = iframe.contentWindow.document.createElement('style');
                style.textContent = `
                    header, 
                    .header,
                    [class*="header"],
                    [id*="header"],
                    .account-switcher-wrapper,
                    .traders-hub-header {
                        display: none !important;
                        height: 0 !important;
                        overflow: hidden !important;
                    }
                    body, #root, .app {
                        padding-top: 0 !important;
                        margin-top: 0 !important;
                    }
                `;
                iframe.contentWindow.document.head.appendChild(style);
            }
        } catch (error) {
            // CORS might prevent access to iframe content
            console.log('Unable to modify iframe content (CORS):', error);
        }
    };

    const handleIframeError = () => {
        setIsLoading(false);
        setHasError(true);
        setErrorMessage(
            'Failed to load DTrader. Please ensure the DTrader dev server is running. Run: npm run dtrader:serve:trader'
        );
    };

    const handleRetry = () => {
        setIsLoading(true);
        setHasError(false);
        setErrorMessage('');
        // Force iframe reload by updating key
        if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
        }
    };

    return (
        <div className='dtrader-container'>
            {isLoading && !hasError && (
                <div className='dtrader-loading'>
                    <div className='dtrader-spinner' />
                    <p className='dtrader-loading-text'>Loading DTrader...</p>
                    <p className='dtrader-loading-subtext'>
                        Connecting to https://localhost:8443/
                    </p>
                </div>
            )}

            {hasError && (
                <div className='dtrader-error'>
                    <div className='dtrader-error-icon'>⚠️</div>
                    <h2 className='dtrader-error-title'>Unable to Load DTrader</h2>
                    <p className='dtrader-error-message'>{errorMessage}</p>
                    <div className='dtrader-error-instructions'>
                        <h3>How to start DTrader:</h3>
                        <ol>
                            <li>Open a terminal in the project directory</li>
                            <li>Run: <code>npm run dtrader:serve:trader</code></li>
                            <li>Wait for the server to start on https://localhost:8443/</li>
                            <li>Click the retry button below</li>
                        </ol>
                    </div>
                    <button className='dtrader-retry-button' onClick={handleRetry}>
                        Retry Connection
                    </button>
                </div>
            )}

            <iframe
                ref={iframeRef}
                src={url}
                className={`dtrader-iframe ${isLoading || hasError ? 'dtrader-iframe--hidden' : ''}`}
                title='Deriv Trader'
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                allow='accelerometer; autoplay; camera; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; gyroscope; magnetometer; microphone; midi; payment; picture-in-picture; publickey-credentials-get; usb; xr-spatial-tracking'
                sandbox='allow-downloads allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-storage-access-by-user-activation'
                loading='eager'
            />
        </div>
    );
});

export default DTrader;
