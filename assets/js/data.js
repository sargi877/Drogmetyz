// assets/js/data.js

// TODO(owner): replace before real use
export const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_lIOz6261x2IwoQGQrdle9Ow392cnThihv105m-6z5b2yFe9VxoNPIe6248ohzZRUGJhULt4NgyI-/pub?output=csv";

const CACHE_KEY = 'drogmetyz-data-cache-v3';
const CACHE_TIME_KEY = 'drogmetyz-data-time-v3';

// Clear old cache versions to avoid stale empty data after schema changes
try {
    sessionStorage.removeItem('drogmetyz-data-cache-v2');
    sessionStorage.removeItem('drogmetyz-data-time-v2');
    sessionStorage.removeItem('drogmetyz-data-cache-v1');
    sessionStorage.removeItem('drogmetyz-data-time-v1');
} catch (e) {}
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cachedData = null;

export async function fetchCatalogData(forceRefresh = false) {
    if (cachedData && !forceRefresh) {
        return cachedData;
    }

    if (!forceRefresh) {
        const stored = sessionStorage.getItem(CACHE_KEY);
        const storedTime = sessionStorage.getItem(CACHE_TIME_KEY);
        if (stored && storedTime) {
            if (Date.now() - parseInt(storedTime, 10) < CACHE_TTL_MS) {
                cachedData = JSON.parse(stored);
                return cachedData;
            }
        }
    }

    if (SHEET_CSV_URL === "PASTE_PUBLISHED_CSV_URL_HERE") {
        return loadFallback();
    }

    try {
        const response = await fetch(SHEET_CSV_URL);
        if (!response.ok) throw new Error("Failed to fetch CSV");
        const csvText = await response.text();
        
        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: false,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.data.length < 2) {
                        resolve(loadFallback());
                        return;
                    }
                    const headers = results.data[0].map(h => h.trim());
                    const rows = results.data.slice(1).map(row => {
                        const obj = {};
                        headers.forEach((h, i) => {
                            obj[h] = row[i];
                        });
                        return obj;
                    });
                    const data = processRawData(rows);
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
                    sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
                    cachedData = data;
                    resolve(data);
                },
                error: (err) => {
                    console.error("PapaParse error:", err);
                    resolve(loadFallback());
                }
            });
        });
    } catch (err) {
        console.error("Fetch error:", err);
        return loadFallback();
    }
}

async function loadFallback() {
    try {
        const res = await fetch('data/catalog.snapshot.json');
        const raw = await res.json();
        const data = processRawData(raw);
        cachedData = data;
        return data;
    } catch (err) {
        console.error("Failed to load fallback snapshot:", err);
        return [];
    }
}

function processRawData(rows) {
    return rows.map(row => ({
        id: parseInt(row['ID'] || '0', 10),
        category: (row['Категорія'] || '').trim(),
        standardRaw: (row['Назва / Стандарт'] || '').trim(),
        diameter: (row['Діаметр (d, мм)'] || '').trim(),
        length: parseFloat(row['Довжина (l, мм)']) || 0,
        strengthClass: (row['Клас міцності (стійкість)'] || '').trim(),
        stockRaw: (row['Кількість'] || '').trim(),
        priceRaw: row['Ціна (грн)'] !== undefined ? (row['Ціна (грн)'] || '').trim() : ''
    }));
}

export function getLastUpdateTime() {
    const time = sessionStorage.getItem(CACHE_TIME_KEY);
    if (!time) return null;
    return new Date(parseInt(time, 10));
}
