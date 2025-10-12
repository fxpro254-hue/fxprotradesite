import React, { useEffect, useState } from 'react';
import './dtrader-iframe.scss';

const DTraderContainer: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if we're in development mode
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (isDevelopment) {
            // In development, show message to run D-Trader separately
            setIsLoading(false);
        } else {
            // In production, load the built D-Trader
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const isDevelopment = process.env.NODE_ENV === 'development';

    return (
        <div className='dtrader-container'>
            {isLoading && (
                <div className='dtrader-loading'>
                    <div className='dtrader-loading__spinner'></div>
                    <p>Loading D-Trader...</p>
                </div>
            )}
            {!isLoading && (
                <div className='dtrader-content'>
                    {isDevelopment ? (
                        <div className='dtrader-dev-message'>
                            <div className='dtrader-dev-message__icon'>📊</div>
                            <h2>D-Trader Manual Trading</h2>
                            <p className='dtrader-dev-message__subtitle'>
                                Professional trading interface powered by Deriv
                            </p>
                            
                            <div className='dtrader-dev-message__box'>
                                <h3>🚀 Development Mode</h3>
                                <p>To use D-Trader during development:</p>
                                <ol>
                                    <li>
                                        <strong>Open a new terminal</strong> and run:
                                        <code>npm run dtrader:serve core</code>
                                    </li>
                                    <li>
                                        D-Trader will start on: 
                                        <a href="https://localhost:8443" target="_blank" rel="noopener noreferrer">
                                            https://localhost:8443
                                        </a>
                                    </li>
                                    <li>
                                        Keep both servers running simultaneously
                                    </li>
                                </ol>
                            </div>

                            <div className='dtrader-dev-message__box dtrader-dev-message__box--info'>
                                <h3>📦 Production Build</h3>
                                <p>For production deployment:</p>
                                <code>npm run build</code>
                                <p className='dtrader-dev-message__note'>
                                    This will build both D-Bot and D-Trader together, and they'll work seamlessly on the same URL.
                                </p>
                            </div>

                            <div className='dtrader-dev-message__features'>
                                <h3>✨ Features</h3>
                                <div className='dtrader-dev-message__grid'>
                                    <div className='feature-card'>
                                        <span className='feature-icon'>📈</span>
                                        <h4>Real-time Charts</h4>
                                        <p>Advanced charting with multiple indicators</p>
                                    </div>
                                    <div className='feature-card'>
                                        <span className='feature-icon'>💱</span>
                                        <h4>Multiple Markets</h4>
                                        <p>Forex, Indices, Commodities & more</p>
                                    </div>
                                    <div className='feature-card'>
                                        <span className='feature-icon'>⚡</span>
                                        <h4>Quick Trading</h4>
                                        <p>Fast execution with one-click trading</p>
                                    </div>
                                    <div className='feature-card'>
                                        <span className='feature-icon'>🎯</span>
                                        <h4>Trade Types</h4>
                                        <p>Rise/Fall, Higher/Lower, Matches/Differs</p>
                                    </div>
                                </div>
                            </div>

                            <div className='dtrader-dev-message__actions'>
                                <a 
                                    href="https://localhost:8443" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className='btn btn-primary'
                                >
                                    Open D-Trader (Port 8443)
                                </a>
                                <button 
                                    className='btn btn-secondary'
                                    onClick={() => window.open('https://deriv.com/dtrader', '_blank')}
                                >
                                    Learn More
                                </button>
                            </div>
                        </div>
                    ) : (
                        <iframe
                            src='/dtrader/index.html'
                            className='dtrader-iframe'
                            title='D-Trader'
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default DTraderContainer;
