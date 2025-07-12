import { localize } from '@deriv-com/translations';
import { excludeOptionFromContextMenu, modifyContextMenu } from '../../../utils';

window.Blockly.Blocks.purchase = {
    init() {
        this.jsonInit(this.definition());

        // Allow this block to be used in conditional statements
        this.setNextStatement(true);
        this.setPreviousStatement(true);
    },
    definition() {
        return {
            message0: localize('Purchase {{ contract_type }} trade each tick {{ trade_each_tick }}', { 
                contract_type: '%1', 
                trade_each_tick: '%2' 
            }),
            message1: localize('Barrier: {{ barrier }}', { barrier: '%1' }),
            message2: localize('Second barrier: {{ second_barrier }}', { second_barrier: '%1' }),
            message3: localize('Prediction: {{ prediction }}', { prediction: '%1' }),
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'PURCHASE_LIST',
                    options: [
                        [localize('Rise'), 'CALL'],
                        [localize('Fall'), 'PUT'],
                        [localize('Touch'), 'ONETOUCH'],
                        [localize('No Touch'), 'NOTOUCH'],
                        [localize('Ends Between'), 'EXPIRYRANGE'],
                        [localize('Ends Outside'), 'EXPIRYMISS'],
                        [localize('Stays Between'), 'RANGE'],
                        [localize('Goes Outside'), 'UPORDOWN'],
                        [localize('Asian Up'), 'ASIANU'],
                        [localize('Asian Down'), 'ASIAND'],
                        [localize('Matches'), 'DIGITMATCH'],
                        [localize('Differs'), 'DIGITDIFF'],
                        [localize('Even'), 'DIGITEVEN'],
                        
                        [localize('Odd'), 'DIGITODD'],
                        [localize('Over'), 'DIGITOVER'],
                        [localize('Under'), 'DIGITUNDER'],
                        [localize('High Tick'), 'TICKHIGH'],
                        [localize('Low Tick'), 'TICKLOW'],
                        [localize('Reset Call'), 'RESETCALL'],
                        [localize('Reset Put'), 'RESETPUT'],
                        [localize('Only Ups'), 'RUNHIGH'],
                        [localize('Only Downs'), 'RUNLOW'],
                        [localize('Call Spread'), 'CALLSPREAD'],
                        [localize('Put Spread'), 'PUTSPREAD'],
                        [localize('Up'), 'MULTUP'],
                        [localize('Down'), 'MULTDOWN'],
                        [localize('Buy'), 'ACCU'],
                        [localize('Rise Equals'), 'CALLE'],
                        [localize('Fall Equals'), 'PUTE']
                    ],
                },
                {
                    type: 'field_dropdown',
                    name: 'TRADE_EACH_TICK',
                    options: [
                        [localize('No'), 'false'],
                        [localize('Yes'), 'true']
                    ],
                },
            ],
            args1: [
                {
                    type: 'input_value',
                    name: 'BARRIER_OFFSET',
                    check: 'Number',
                },
            ],
            args2: [
                {
                    type: 'input_value',
                    name: 'SECONDBARRIER_OFFSET',
                    check: 'Number',
                },
            ],
            args3: [
                {
                    type: 'input_value',
                    name: 'PREDICTION',
                    check: 'Number',
                },
            ],
            previousStatement: true,
            nextStatement: true,
            colour: window.Blockly.Colours.Special1.colour,
            colourSecondary: window.Blockly.Colours.Special1.colourSecondary,
            colourTertiary: window.Blockly.Colours.Special1.colourTertiary,
            tooltip: localize('This block purchases contract of a specified type. All contract types are available regardless of trade definition settings. Use barrier and prediction inputs for contracts that require them. When "trade each tick" is enabled, a new contract will be purchased on every tick.'),
            category: window.Blockly.Categories.Before_Purchase,
        };
    },
    meta() {
        return {
            display_name: localize('Purchase'),
            description: localize(
                'Use this block to purchase the specific contract you want. All contract types are available in the dropdown regardless of your trade definition settings. You may add multiple Purchase blocks together with conditional blocks to define your purchase conditions. When "trade each tick" is enabled, a new contract will be purchased on every tick instead of just once. This block can only be used within the Purchase conditions block.'
            ),
            key_words: localize('buy'),
        };
    },
    onchange(event) {
        if (!this.workspace || window.Blockly.derivWorkspace.isFlyoutVisible || this.workspace.isDragging()) {
            return;
        }

        // Handle contract type changes to show/hide barrier inputs
        if (event.type === window.Blockly.Events.BLOCK_CHANGE && event.name === 'PURCHASE_LIST') {
            this.updateBarrierInputsVisibility();
        } else if (event.type === window.Blockly.Events.BLOCK_CREATE && event.ids.includes(this.id)) {
            this.updateBarrierInputsVisibility();
        }
        
        // Validate that this block is used in the correct context
        this.validatePlacement();
    },

    validatePlacement() {
        // Check if this block is properly placed within before_purchase or conditional blocks
        let parent = this.getParent();
        let isInValidContext = false;
        
        while (parent) {
            if (parent.type === 'before_purchase' || 
                parent.type === 'controls_if' || 
                parent.type === 'controls_ifelse' ||
                parent.type === 'logic_compare' ||
                parent.type === 'controls_whileUntil' ||
                parent.type === 'controls_repeat' ||
                parent.type === 'controls_forEach') {
                isInValidContext = true;
                break;
            }
            parent = parent.getParent();
        }
        
        // Set visual indicator if placement is invalid
        if (!isInValidContext) {
            this.setWarningText('This block should be placed within Purchase conditions or conditional blocks');
        } else {
            this.setWarningText(null);
        }
    },

    updateBarrierInputsVisibility() {
        const contractType = this.getFieldValue('PURCHASE_LIST');
        
        // Define which contracts need barriers
        const contractsNeedingBarrier = [
            'CALL', 'PUT', 'ONETOUCH', 'NOTOUCH', 'RUNHIGH', 'RUNLOW'
        ];
        
        const contractsNeedingTwoBarriers = [
            'EXPIRYRANGE', 'EXPIRYMISS', 'RANGE', 'UPORDOWN', 'CALLSPREAD', 'PUTSPREAD'
        ];
        
        // DIGITEVEN and DIGITODD don't need any barriers or predictions - they work automatically
        const contractsNeedingPrediction = [
            'DIGITOVER', 'DIGITUNDER', 'DIGITMATCH', 'DIGITDIFF'
        ];

        // Show/hide barrier input
        const needsBarrier = contractsNeedingBarrier.includes(contractType) || contractsNeedingTwoBarriers.includes(contractType);
        this.setInputsInline(false);
        
        if (needsBarrier) {
            this.getInput('BARRIER_OFFSET').setVisible(true);
        } else {
            this.getInput('BARRIER_OFFSET').setVisible(false);
        }

        // Show/hide second barrier input
        if (contractsNeedingTwoBarriers.includes(contractType)) {
            this.getInput('SECONDBARRIER_OFFSET').setVisible(true);
        } else {
            this.getInput('SECONDBARRIER_OFFSET').setVisible(false);
        }

        // Show/hide prediction input
        if (contractsNeedingPrediction.includes(contractType)) {
            this.getInput('PREDICTION').setVisible(true);
        } else {
            this.getInput('PREDICTION').setVisible(false);
        }
    },
    populatePurchaseList(event) {
        // Purchase list is now pre-populated with all contract types
        // No need to filter based on trade definition anymore
        return;
    },
    customContextMenu(menu) {
        const menu_items = [localize('Enable Block'), localize('Disable Block')];
        excludeOptionFromContextMenu(menu, menu_items);
        modifyContextMenu(menu);
    },
    // Remove restricted_parents to allow use in conditions
    // restricted_parents: ['before_purchase'],
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.purchase = block => {
    const purchaseList = block.getFieldValue('PURCHASE_LIST');
    const tradeEachTick = block.getFieldValue('TRADE_EACH_TICK');
    
    // Get barrier values and handle null/undefined properly
    const barrier = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block, 
        'BARRIER_OFFSET', 
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    );
    
    const secondBarrier = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block, 
        'SECONDBARRIER_OFFSET', 
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    );
    
    const prediction = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block, 
        'PREDICTION', 
        window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    );

    // Convert empty strings to null
    const barrierValue = barrier && barrier !== '' ? barrier : 'null';
    const secondBarrierValue = secondBarrier && secondBarrier !== '' ? secondBarrier : 'null';
    const predictionValue = prediction && prediction !== '' ? prediction : 'null';

    // Generate unique identifier for debugging conditional execution
    const uniqueId = Math.random().toString(36).substr(2, 9);
    
    // Add try-catch wrapper for better error handling in conditional blocks
    const code = `try {
    console.log('Executing purchase ${uniqueId}: ${purchaseList} with prediction ${predictionValue}');
    Bot.purchase('${purchaseList}', ${tradeEachTick}, ${barrierValue}, ${secondBarrierValue}, ${predictionValue});
} catch (e) {
    console.warn('Purchase block ${uniqueId} execution failed:', e.message);
}
`;
    return code;
};
