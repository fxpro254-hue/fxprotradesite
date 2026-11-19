export const contractSpots = contract => ({
    entry_tick: contract.entry_spot ?? contract.entry_tick_display_value ?? contract.entry_tick,
    entry_tick_time: contract.entry_spot_time ?? contract.entry_tick_time,
    exit_tick: contract.exit_spot ?? contract.exit_tick_display_value ?? contract.exit_tick,
    exit_tick_time: contract.exit_spot_time ?? contract.exit_tick_time,
});
