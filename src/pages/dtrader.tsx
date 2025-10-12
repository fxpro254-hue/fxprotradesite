import { useEffect } from 'react';

const DTrader = () => {
    useEffect(() => {
        // Redirect to the dtrader build
        window.location.href = '/dtrader/index.html';
    }, []);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{
                textAlign: 'center',
                padding: '2rem'
            }}>
                <div style={{
                    fontSize: '48px',
                    marginBottom: '1rem',
                    animation: 'spin 2s linear infinite'
                }}>
                    ⚡
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Loading D-Trader...</h1>
                <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Redirecting to manual trading platform</p>
            </div>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default DTrader;
