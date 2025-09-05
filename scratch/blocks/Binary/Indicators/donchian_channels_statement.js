import { localize } from '@deriv/translations';
import { runGroupedEvents, runIrreversibleEvents } from '../../../utils';

Blockly.Blocks.donchian_channels_statement = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('set {{ variable }} to Donchian Channels {{ channel_line | DONCHIAN_CHANNEL_LINE }}', {
                variable: '%1',
                channel_line: '%2',
            }),
            message1: localize('with period: {{ input_period }}', { input_period: '%1' }),
            args0: [
                {
                    type: 'field_variable',
                    name: 'VARIABLE',
                    variable: 'dc',
                },
                {
                    type: 'field_dropdown',
                    name: 'DONCHIAN_CHANNEL_LINE',
                    options: () => window.Blockly.config.donchianChannelsResult,
                },
            ],
            args1: [
                {
                    type: 'input_statement',
                    name: 'STATEMENT',
                    check: null,
                },
            ],
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            previousStatement: null,
            nextStatement: null,
            category: 'tools',
            tooltip: localize('Donchian Channels show the highest high and lowest low over a specified period. Upper channel is the highest high, lower channel is the lowest low, and middle channel is their average.'),
            helpUrl: 'https://academy.deriv.com',
        };
    },
    meta() {
        return {
            display_name: localize('Donchian Channels'),
            description: localize('Donchian Channels indicator showing price channels over a specified period'),
        };
    },
    onchange: runGroupedEvents(
        false,
        runIrreversibleEvents([
            'finish_loading',
        ])
    ),
};

Blockly.JavaScript.donchian_channels_statement = block => {
    const variableName = Blockly.JavaScript.variableDB_.getName(
        block.getFieldValue('VARIABLE'),
        Blockly.Variables.NAME_TYPE
    );
    const channelLineType = block.getFieldValue('DONCHIAN_CHANNEL_LINE');
    const input = Blockly.JavaScript.statementToCode(block, 'STATEMENT');
    
    const code = `${variableName} = Bot.getDonchianChannels(${input || 'Bot.getTicksArray()'}, ${channelLineType});\n`;
    
    return code;
};
