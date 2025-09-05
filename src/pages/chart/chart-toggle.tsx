import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { observer as globalObserver } from '../../external/bot-skeleton/utils/observer';
import SmartTradingDisplay from './smart-trading-display';
import SpeedBotDisplay from './speed-bot-display';
import './chart-toggle.scss';

const ChartToggle = observer(({ children }: { children: React.ReactNode }) => {
    const [activeDisplay, setActiveDisplay] = useState('smart-trading'); // Changed default to 'smart-trading'
    const { run_panel } = useStore();

    // Use run_panel store to check if drawer is open
    const { is_drawer_open } = run_panel;

    useEffect(() => {
        // Emit event when display changes
        globalObserver.emit('chart_tab.display_changed', activeDisplay);
    }, [activeDisplay]);

    const handleDisplayChange = (display: string) => {
        setActiveDisplay(display);
    };

    return (
        <div className={`chart-display-container ${is_drawer_open ? 'run-panel-active' : ''}`}>
            <div className='chart-display-toggle'>
                {/* Reordered buttons - Smart Trading first */}
                <button
                    className={`chart-display-toggle__button ${activeDisplay === 'smart-trading' ? 'active' : ''}`}
                    onClick={() => handleDisplayChange('smart-trading')}
                >
                    Smart Trading
                </button>
                <button
                    className={`chart-display-toggle__button ${activeDisplay === 'speed-bot' ? 'active' : ''}`}
                    onClick={() => handleDisplayChange('speed-bot')}
                >
                    Speed Bot
                </button>
                <button
                    className={`chart-display-toggle__button ${activeDisplay === 'charts' ? 'active' : ''}`}
                    onClick={() => handleDisplayChange('charts')}
                >
                    Charts
                </button>
            </div>
            <div className='chart-display-content'>
                {activeDisplay === 'charts' ? (
                    children
                ) : activeDisplay === 'speed-bot' ? (
                    <SpeedBotDisplay />
                ) : (
                    <SmartTradingDisplay />
                )}
            </div>
        </div>
    );
});

export default ChartToggle;
