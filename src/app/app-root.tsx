const PremiumLoader = ({ message }: { message?: string }) => (
    <div className="fx-loader-wrapper">
        <div className="fx-logo-container">
            <img src="/icon-512.png" alt="FxPro Trades" className="fx-logo" />
            <div className="fx-glow-ring" />
        </div>
        <p className="fx-loader-text">{message}</p>
    </div>
);