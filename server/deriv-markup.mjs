import { pathToFileURL } from 'node:url';

const isDate = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return false;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export async function readMarkup(dateFrom, dateTo, { appId, token, request = fetch } = {}) {
    if (!isDate(dateFrom) || !isDate(dateTo) || dateFrom > dateTo) {
        throw new Error('Provide an inclusive UTC date range as YYYY-MM-DD YYYY-MM-DD.');
    }
    if (!/^[A-Za-z0-9_-]+$/.test(appId ?? '') || !token) {
        throw new Error('Set DERIV_APP_ID and DERIV_APPLICATION_READ_TOKEN in your local environment.');
    }

    const url = new URL('https://api.derivws.com/applications/v1/markup-statistics');
    url.search = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
    const response = await request(url, {
        headers: { Authorization: 'Bearer ' + token, 'Deriv-App-ID': appId },
        redirect: 'error',
        signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error('Deriv markup report returned HTTP ' + response.status + '.');
    const { data } = await response.json();
    if (!Array.isArray(data?.breakdown)) throw new Error('Deriv returned an invalid markup report.');
    return data.breakdown.find(row => row?.app_id === appId) ?? null;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    try {
        const row = await readMarkup(process.argv[2], process.argv[3], {
            appId: process.env.DERIV_APP_ID,
            token: process.env.DERIV_APPLICATION_READ_TOKEN,
        });
        console.log(row ? JSON.stringify(row, null, 2) : 'Deriv returned no markup row for this app and date range.');
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
