import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import ContractResultOverlay from '@/components/contract-result-overlay';
import { contract_stages } from '@/constants/contract-stage';
import { useStore } from '@/hooks/useStore';
import { LabelPairedPlayLgFillIcon, LabelPairedSquareLgFillIcon } from '@deriv/quill-icons/LabelPaired';
import { Localize } from '@deriv-com/translations';
import { rudderStackSendRunBotEvent } from '../../analytics/rudderstack-common-events';
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
        onStopBotClick,
        performSelfExclusionCheck,
    } = run_panel;
    const { account_status } = client;
    const cashier_validation = account_status?.cashier_validation;
    const [shouldDisable, setShouldDisable] = React.useState(false);
    const is_unavailable_for_payment_agent = cashier_validation?.includes('WithdrawServiceUnavailableForPA');

    // perform self-exclusion checks which will be stored under the self-exclusion-store
    React.useEffect(() => {
        performSelfExclusionCheck();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const button_props = React.useMemo(() => {
        if (is_stop_button_visible) {
            return {
                id: 'db-animation__stop-button',
                class: 'animation__stop-button',
                text: <Localize i18n_default_text='Stop' />,
                icon: <LabelPairedSquareLgFillIcon fill='#fff' />,
            };
        }
        return {
            id: 'db-animation__run-button',
            class: 'animation__run-button',
            text: <Localize i18n_default_text='Run' />,
            icon: <LabelPairedPlayLgFillIcon fill='#fff' />,
        };
    }, [is_stop_button_visible]);
    const show_overlay = should_show_overlay && is_contract_completed;

    const TAB_NAMES = [
        'dashboard',
        'bot_builder', 
        'chart',
        'tutorial',
        'analysis_tool',
        'signals',
        'trading_hub',
        'free_bots',
    ] as const;
    const getTabName = (index: number) => TAB_NAMES[index];

    // Define which tabs should show the run button
    // 0: dashboard, 1: bot_builder, 4: analysis_tool, 5: signals
    const allowedTabs = [0, 1, 4, 5];
    const shouldShowButton = allowedTabs.includes(active_tab);

    return (
        <div className={classNames('animation__wrapper', className)}>
            {shouldShowButton && (
                <Button
                    is_disabled={is_disabled && !is_unavailable_for_payment_agent}
                    className={button_props.class}
                    id={button_props.id}
                    icon={button_props.icon}
                    onClick={() => {
                        setShouldDisable(true);
                        if (is_stop_button_visible) {
                            onStopBotClick();
                            return;
                        }
                        onRunButtonClick();
                        // Only send analytics if we have a valid tab name
                        const tabName = getTabName(active_tab);
                        if (tabName) {
                            // Convert tab names to match expected analytics values
                            const analyticsTabName = tabName === 'chart' ? 'charts' : 
                                                    tabName === 'tutorial' ? 'tutorials' : 
                                                    tabName;
                            if (['dashboard', 'bot_builder', 'charts', 'tutorials'].includes(analyticsTabName)) {
                                rudderStackSendRunBotEvent({ 
                                    subpage_name: analyticsTabName as 'dashboard' | 'bot_builder' | 'charts' | 'tutorials'
                                });
                            }
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
