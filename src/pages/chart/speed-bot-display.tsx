import React from 'react';
import { observer } from 'mobx-react-lite';
import { localize } from '@deriv-com/translations';
import { Text } from '@deriv-com/ui';
import './speed-bot-display.scss';

const SpeedBotDisplay = observer(() => {
    return (
        <div className="speed-bot-display">
            <div className="speed-bot-header">
                <h2>{localize('Speed Bot')}</h2>
                <Text className="speed-bot-subtitle">
                    {localize('Ultra-fast automated trading with advanced algorithms')}
                </Text>
            </div>
            
            <div className="coming-soon-container">
                <div className="coming-soon-card">
                    <div className="coming-soon-icon">🚀</div>
                    <h3>{localize('Coming Soon')}</h3>
                    <Text className="coming-soon-description">
                        {localize('We are working on an advanced Speed Bot feature that will revolutionize your trading experience with lightning-fast execution and intelligent decision-making capabilities.')}
                    </Text>
                    
                    <div className="features-preview">
                        <h4>{localize('Upcoming Features')}</h4>
                        <ul className="features-list">
                            <li>⚡ {localize('Ultra-fast trade execution')}</li>
                            <li>🧠 {localize('AI-powered market analysis')}</li>
                            <li>📊 {localize('Real-time strategy optimization')}</li>
                            <li>🔄 {localize('Advanced risk management')}</li>
                            <li>📱 {localize('Mobile-optimized interface')}</li>
                        </ul>
                    </div>
                    
                    <div className="notify-section">
                        <Text className="notify-text">
                            {localize('Stay tuned for updates!')}
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default SpeedBotDisplay;
