const ticksStorage = {
    R_10: [],
    R_25: [],
    R_50: [],
    R_75: [],
    R_100: [],
};

const ws = new WebSocket('wss://api.derivws.com/trading/v1/options/ws/public');

ws.onopen = () => {
    Object.keys(ticksStorage).forEach(subscribeTicks);
};

function subscribeTicks(symbol) {
    ws.send(
        JSON.stringify({
            ticks_history: symbol,
            count: 255,
            end: 'latest',
            style: 'ticks',
            subscribe: 1,
        })
    );
}

ws.onmessage = event => {
    const data = JSON.parse(event.data);
    if (data.history?.prices) {
        const symbol = data.echo_req.ticks_history;
        ticksStorage[symbol] = data.history.prices.map(parseFloat);
    } else if (data.tick) {
        const symbol = data.tick.symbol;
        ticksStorage[symbol].push(parseFloat(data.tick.quote));
        if (ticksStorage[symbol].length > 255) ticksStorage[symbol].shift();
    }
};

function updateTables() {
    const riseFallTable = document.getElementById('riseFallTable');
    const overUnderTable = document.getElementById('overUnderTable');
    riseFallTable.innerHTML = '';
    overUnderTable.innerHTML = '';

    Object.keys(ticksStorage).forEach(symbol => {
        const ticks = ticksStorage[symbol];
        if (ticks.length < 255) return;

        const { risePercentage, fallPercentage } = calculateTrendPercentage(symbol, 255);
        const isBuy = risePercentage > 57;
        const isSell = fallPercentage > 57;

        const rowRiseFall = document.createElement('tr');
        rowRiseFall.innerHTML = `<td>${symbol}</td><td>${isBuy ? 'Rise' : '----'}</td><td>${isSell ? 'Fall' : '----'}</td>`;
        riseFallTable.appendChild(rowRiseFall);

        const digitCounts = new Array(10).fill(0);
        ticks.forEach(tick => {
            const lastDigit = parseInt(tick.toString().slice(-1));
            digitCounts[lastDigit]++;
        });

        const totalTicks = ticks.length;
        const digitPercentages = digitCounts.map(count => (count / totalTicks) * 100);
        const isOver = digitPercentages[7] < 10 && digitPercentages[8] < 10 && digitPercentages[9] < 10;
        const isUnder = digitPercentages[0] < 10 && digitPercentages[1] < 10 && digitPercentages[2] < 10;

        const rowOverUnder = document.createElement('tr');
        rowOverUnder.innerHTML = `<td>${symbol}</td><td>${isOver ? 'Over 2' : '----'}</td><td>${isUnder ? 'Under 7' : '----'}</td>`;
        overUnderTable.appendChild(rowOverUnder);
    });
}

function calculateTrendPercentage(symbol, ticksCount) {
    const ticks = ticksStorage[symbol].slice(-ticksCount);
    if (ticks.length < 2) return { risePercentage: 0, fallPercentage: 0 };

    let riseCount = 0,
        fallCount = 0;
    for (let i = 1; i < ticks.length; i++) {
        if (ticks[i] > ticks[i - 1]) riseCount++;
        else if (ticks[i] < ticks[i - 1]) fallCount++;
    }

    const total = riseCount + fallCount;
    return {
        risePercentage: total > 0 ? (riseCount / total) * 100 : 0,
        fallPercentage: total > 0 ? (fallCount / total) * 100 : 0,
    };
}

setInterval(updateTables, 1000);
