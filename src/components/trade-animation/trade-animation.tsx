import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import ContractResultOverlay from '@/components/contract-result-overlay';
import { contract_stages } from '@/constants/contract-stage';
import { DBOT_TABS } from '@/constants/bot-contents';
import { popover_zindex } from '@/constants/z-indexes';
import { useStore } from '@/hooks/useStore';
import { LabelPairedPlayLgFillIcon, LabelPairedSquareLgFillIcon } from '@deriv/quill-icons/LabelPaired';
import { Localize } from '@deriv-com/translations';
import { rudderStackSendRunBotEvent } from '../../analytics/rudderstack-common-events';
import { observer as globalObserver } from '../../external/bot-skeleton/utils/observer';
import Button from '../shared_ui/button';
import CircularWrapper from './circular-wrapper';
import ContractStageText from './contract-stage-text';

type TTradeAnimation = {
    className?: string;
    should_show_overlay?: boolean;
};

const TradeAnimation = observer(({ className, should_show_overlay }: TTradeAnimation) => {
    const { dashboard, run_panel, summary_card } = useStore();
    const { client } = useStore();
    const { active_tab } = dashboard;
    const { is_contract_completed, profit } = summary_card;
    const {
        contract_stage,
        is_stop_button_visible,
        is_stop_button_disabled,
        onRunButtonClick,
        onStopButtonClick,
        performSelfExclusionCheck,
    } = run_panel;
    const { account_status } = client;
    const cashier_validation = account_status?.cashier_validation;
    const [shouldDisable, setShouldDisable] = React.useState(false);
    const [isTradingHubRunning, setIsTradingHubRunning] = React.useState(false); // Track trading hub state
    const [isSmartTradingRunning, setIsSmartTradingRunning] = React.useState(false); // Track smart trading state
    const [isSpeedBotRunning, setIsSpeedBotRunning] = React.useState(false); // Track speed bot state
    const is_unavailable_for_payment_agent = cashier_validation?.includes('WithdrawServiceUnavailableForPA');

    // perform self-exclusion checks which will be stored under the self-exclusion-store
    React.useEffect(() => {
        performSelfExclusionCheck();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        const handleTradingHubStateChange = (state: { isRunning: boolean }) => {
            setIsTradingHubRunning(state.isRunning);
        };

        const handleSmartTradingStateChange = (state: { isRunning: boolean; strategyId: string }) => {
            setIsSmartTradingRunning(state.isRunning);
        };

        const handleSpeedBotStateChange = (state: { isRunning: boolean }) => {
            setIsSpeedBotRunning(state.isRunning);
        };

        globalObserver.register('trading_hub.state_changed', handleTradingHubStateChange);
        globalObserver.register('smart_trading.state_changed', handleSmartTradingStateChange);
        globalObserver.register('speed_bot.state_changed', handleSpeedBotStateChange);

        // Request current states from all components after listeners are registered
        const timer = setTimeout(() => {
            globalObserver.emit('trading_hub.request_state');
            globalObserver.emit('smart_trading.request_state');
            globalObserver.emit('speed_bot.request_state');
        }, 100);

        return () => {
            clearTimeout(timer);
            globalObserver.unregister('trading_hub.state_changed', handleTradingHubStateChange);
            globalObserver.unregister('smart_trading.state_changed', handleSmartTradingStateChange);
            globalObserver.unregister('speed_bot.state_changed', handleSpeedBotStateChange);
        };
    }, []);

    React.useEffect(() => {
        if (shouldDisable) {
            setTimeout(() => {
                setShouldDisable(false);
            }, 1000);
        }
    }, [shouldDisable]);

    const status_classes = ['', '', ''];
    const is_purchase_sent = contract_stage === (contract_stages.PURCHASE_SENT as unknown);
    const is_purchase_received = contract_stage === (contract_stages.PURCHASE_RECEIVED as unknown);

    let progress_status = contract_stage - (is_purchase_sent || is_purchase_received ? 2 : 3);

    if (progress_status >= 0) {
        if (progress_status < status_classes.length) {
            status_classes[progress_status] = 'active';
        }

        if (is_contract_completed) {
            progress_status += 1;
        }

        for (let i = 0; i < progress_status - 1; i++) {
            status_classes[i] = 'completed';
        }
    }

    const is_disabled = is_stop_button_disabled || shouldDisable;

    const strategy = {
        [DBOT_TABS.TRADING_HUB]: { event: 'trading_hub', running: isTradingHubRunning },
        [DBOT_TABS.SMART_TRADING]: { event: 'smart_trading', running: isSmartTradingRunning },
        [DBOT_TABS.SPEED_BOT]: { event: 'speed_bot', running: isSpeedBotRunning },
    }[active_tab];
    const isRunning = strategy?.running ?? is_stop_button_visible;
    const showButton =
        !!strategy || is_stop_button_visible ||
        [DBOT_TABS.DASHBOARD, DBOT_TABS.BOT_BUILDER, DBOT_TABS.ANALYSIS_TOOL].includes(active_tab);
    const button_props = isRunning
        ? {
            id: 'db-animation__stop-button',
            class: 'animation__stop-button',
            text: <Localize i18n_default_text='Stop' />,
            icon: <LabelPairedSquareLgFillIcon fill='#fff' />,
        }
        : {
            id: 'db-animation__run-button',
            class: 'animation__run-button',
            text: <Localize i18n_default_text='Run' />,
            icon: <LabelPairedPlayLgFillIcon fill='#fff' />,
        };
    const show_overlay = should_show_overlay && is_contract_completed;

    return (
        <div className={classNames('animation__wrapper', className)}>
            {showButton && (
                <Button
                    is_disabled={is_disabled && !is_unavailable_for_payment_agent}
                    className={button_props.class}
                    id={button_props.id}
                    icon={button_props.icon}
                    onClick={() => {
                        setShouldDisable(true);
                        if (strategy) {
                            globalObserver.emit(`${strategy.event}.${strategy.running ? 'stop' : 'start'}`);
                            return;
                        }
                        if (is_stop_button_visible) {
                            onStopButtonClick();
                            return;
                        }
                        onRunButtonClick();
                        if (active_tab === DBOT_TABS.DASHBOARD || active_tab === DBOT_TABS.BOT_BUILDER) {
                            rudderStackSendRunBotEvent({
                                subpage_name: active_tab === DBOT_TABS.DASHBOARD ? 'dashboard' : 'bot_builder',
                            });
                        }
                    }}
                    has_effect
                    {...(is_stop_button_visible || !is_unavailable_for_payment_agent ? { primary: true } : { green: true })}
                >
                    {button_props.text}
                </Button>
            )}
            <div
                className={classNames('animation__container', className, {
                    'animation--running': contract_stage > 0,
                    'animation--completed': show_overlay,
                })}
            >
                {show_overlay && <ContractResultOverlay profit={profit ?? 0} />}
                <span className='animation__text'>
                    <ContractStageText contract_stage={contract_stage} />
                </span>
                <div className='animation__progress'>
                    <div className='animation__progress-line'>
                        <div className={`animation__progress-bar animation__progress-${contract_stage}`} />
                    </div>
                    {status_classes.map((status_class, i) => (
                        <CircularWrapper key={`status_class-${status_class}-${i}`} className={status_class} />
                    ))}
                </div>
            </div>
        </div>
    );
});

export default TradeAnimation;
