import { localize } from '@deriv/translations';

Blockly.Blocks.donchian_period = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('period {{ input_period }}', { input_period: '%1' }),
            args0: [
                {
                    type: 'input_value',
                    name: 'DONCHIAN_PERIOD',
                    check: 'Number',
                },
            ],
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            previousStatement: null,
            nextStatement: null,
            category: 'tools',
            tooltip: localize('Period for Donchian Channels calculation (default: 20)'),
        };
    },
    meta() {
        return {
            display_name: localize('Donchian Period'),
            description: localize('Period parameter for Donchian Channels indicator'),
        };
    },
};

Blockly.JavaScript.donchian_period = block => {
    const period = Blockly.JavaScript.valueToCode(block, 'DONCHIAN_PERIOD', Blockly.JavaScript.ORDER_ATOMIC) || '20';
    
    const code = `period: ${period}`;
    return code;
};
