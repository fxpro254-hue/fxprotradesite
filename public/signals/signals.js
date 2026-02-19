const ticksStorage = {
    R_10: [],
    R_25: [],
    R_50: [],
    R_75: [],
    R_100: [],
    '1HZ10V': [],
    '1HZ15V': [],
    '1HZ25V': [],
    '1HZ30V': [],
    '1HZ50V': [],
    '1HZ75V': [],
    '1HZ90V': [],
    '1HZ100V': [],
};

const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=52152');

const subscribeTicks = symbol => {
    ws.send(
        JSON.stringify({
            ticks_history: symbol,
            count: 255,
            end: 'latest',
            style: 'ticks',
            subscribe: 1,
        })
    );
};

ws.onopen = () => {
    ['R_10', 'R_25', 'R_50', 'R_75', 'R_100', '1HZ10V', '1HZ15V', '1HZ25V', '1HZ30V', '1HZ50V', '1HZ75V', '1HZ90V', '1HZ100V'].forEach(
        subscribeTicks
    );
};

const calculateTrendPercentage = (symbol, ticksCount) => {
    const ticks = ticksStorage[symbol].slice(-ticksCount);
    if (ticks.length < 2) return { risePercentage: 0, fallPercentage: 0 };

    let riseCount = 0;
    let fallCount = 0;

    for (let i = 1; i < ticks.length; i++) {
        if (ticks[i] > ticks[i - 1]) riseCount++;
        else if (ticks[i] < ticks[i - 1]) fallCount++;
    }

    const total = riseCount + fallCount;
    return {
        risePercentage: total > 0 ? (riseCount / total) * 100 : 0,
        fallPercentage: total > 0 ? (fallCount / total) * 100 : 0,
    };
};

ws.onmessage = event => {
    const data = JSON.parse(event.data);
    if (data.history && data.history.prices) {
        const symbol = data.echo_req.ticks_history;
        ticksStorage[symbol] = data.history.prices.map(price => parseFloat(price));
    } else if (data.tick) {
        const symbol = data.tick.symbol;
        ticksStorage[symbol].push(parseFloat(data.tick.quote));
        if (ticksStorage[symbol].length > 255) ticksStorage[symbol].shift();
    }
};

function updateTables() {
    
    const overUnderTable = document.getElementById('overUnderTable');
    const combinedTable = document.getElementById('combinedTable');

    riseFallTable.innerHTML = '';
    overUnderTable.innerHTML = '';
    combinedTable.innerHTML = '';

    Object.keys(ticksStorage).forEach(symbol => {
        const ticks = ticksStorage[symbol];
        if (ticks.length < 255) return;

       

        // Last digit analysis
        const digitCounts = new Array(10).fill(0);
        ticks.forEach(tick => {
            const lastDigit = parseInt(tick.toString().slice(-1));
            digitCounts[lastDigit]++;
        });

        const totalTicks = ticks.length;
        const digitPercentages = digitCounts.map(count => (count / totalTicks) * 100);

        const overClass =
            digitPercentages[7] < 10 && digitPercentages[8] < 10 && digitPercentages[9] < 10 ? 'over' : 'neutral';
        const underClass =
            digitPercentages[0] < 10 && digitPercentages[1] < 10 && digitPercentages[2] < 10 ? 'under' : 'neutral';

        // Generate over/under table row
        overUnderTable.innerHTML += `<tr>
            <td>${displayName} </td>
            <td><span class="signal-box ${overClass}">${overClass === 'over' ? 'Over 2' : '----'}</span></td>
            <td><span class="signal-box ${underClass}">${underClass === 'under' ? 'Under 7' : '----'}</span></td>
        </tr>`;

        // Generate combined table row for desktop (Over/Under first, then Rise/Fall)
        combinedTable.innerHTML += `<tr>
            <td>${displayName}</td>
            <td><span class="signal-box ${overClass}">${overClass === 'over' ? 'Over 2' : '----'}</span></td>
            <td><span class="signal-box ${underClass}">${underClass === 'under' ? 'Under 7' : '----'}</span></td>
            <td><span class="signal-box ${riseClass}">${isBuy ? 'Rise' : '----'}</span></td>
            <td><span class="signal-box ${fallClass}">${isSell ? 'Fall' : '----'}</span></td>
        </tr>`;
    });
}

setInterval(updateTables, 1000); // Update every second
