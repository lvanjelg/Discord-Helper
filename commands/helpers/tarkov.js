// Shared helper for querying the tarkov.dev JSON API and caching
// item/quest names for slash-command autocomplete (like the Stash bot).
//
// The JSON API (https://json.tarkov.dev/) returns name fields as translation
// keys. Localized text comes from appending "_<lang>" to the endpoint URL
// (e.g. "/regular/items_en"). Each base response includes a `translations`
// array of JSONPath strings pointing at the keyed fields, which we merge with
// the "_en" map to get real names.
const axios = require('axios');

const API_URL = 'https://json.tarkov.dev/';
const GAME_MODE = 'regular';
const LANG = 'en';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Localized raw data caches
let itemsCache = { data: null, fetchedAt: 0 };
let tasksCache = { data: null, fetchedAt: 0 };
let tradersCache = { data: null, fetchedAt: 0 };
let hideoutDataCache = { data: null, fetchedAt: 0 };
let craftsRawCache = { data: null, fetchedAt: 0 };
let bartersRawCache = { data: null, fetchedAt: 0 };

// Normalized caches for command enrichment
let craftsCache = { data: null, fetchedAt: 0 };
let bartersCache = { data: null, fetchedAt: 0 };
let hideoutCache = { data: null, fetchedAt: 0 };

function cachedFetch(cache, ttlMs, fetchFn) {
    const now = Date.now();
    if (cache.data && now - cache.fetchedAt < ttlMs) return Promise.resolve(cache.data);
    return fetchFn().then(data => {
        cache.data = data;
        cache.fetchedAt = now;
        return data;
    });
}

async function fetchJson(path) {
    try {
        const response = await axios.get(API_URL + path, {
            headers: { Accept: 'application/json' },
            timeout: 30000,
        });
        if (response.data && response.data.error) throw new Error(response.data.error);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error('tarkov.dev is temporarily unavailable (HTTP ' + error.response.status + '). Please try again later.');
        }
        throw new Error('Could not reach tarkov.dev. ' + (error.message || ''));
    }
}

// --- Localization: apply the "_en" translation map via JSONPath keys ---
function parsePath(jPath) {
    return String(jPath).replace(/^\$/, '').split('.').map(s => s.trim()).filter(Boolean);
}

function replaceIfKey(obj, key, map) {
    const val = obj[key];
    if (typeof val === 'string' && Object.prototype.hasOwnProperty.call(map, val)) {
        obj[key] = map[val];
    }
}

function applyTranslationsAt(node, segments, i, map) {
    if (node === null || typeof node !== 'object') return;
    const seg = segments[i];
    const isLast = i === segments.length - 1;

    if (seg === '*' || seg === '[*]') {
        if (Array.isArray(node)) {
            for (let idx = 0; idx < node.length; idx++) {
                if (isLast) replaceIfKey(node, idx, map);
                else applyTranslationsAt(node[idx], segments, i + 1, map);
            }
        } else {
            for (const key of Object.keys(node)) {
                if (isLast) replaceIfKey(node, key, map);
                else applyTranslationsAt(node[key], segments, i + 1, map);
            }
        }
        return;
    }

    if (Object.prototype.hasOwnProperty.call(node, seg)) {
        if (isLast) replaceIfKey(node, seg, map);
        else applyTranslationsAt(node[seg], segments, i + 1, map);
    }
}

function applyTranslations(base, map) {
    for (const jPath of base.translations || []) {
        try {
            applyTranslationsAt(base, parsePath(jPath), 0, map || {});
        } catch (error) {
            // ignore malformed paths
        }
    }
    return base.data;
}

async function fetchLocalized(path) {
    const [base, langData] = await Promise.all([
        fetchJson(path),
        fetchJson(path + '_' + LANG),
    ]);
    if (!base || !base.data) throw new Error('Unexpected response from tarkov.dev');
    return applyTranslations(base, (langData && langData.data) || {});
}

// --- Raw localized data fetchers ---
async function getItemsData() {
    return cachedFetch(itemsCache, CACHE_TTL_MS, () => fetchLocalized(GAME_MODE + '/items'));
}
async function getTasksData() {
    return cachedFetch(tasksCache, CACHE_TTL_MS, () => fetchLocalized(GAME_MODE + '/tasks'));
}
async function getTradersData() {
    return cachedFetch(tradersCache, CACHE_TTL_MS, () => fetchLocalized(GAME_MODE + '/traders'));
}
async function getHideoutData() {
    return cachedFetch(hideoutDataCache, CACHE_TTL_MS, () => fetchLocalized(GAME_MODE + '/hideout'));
}
async function getCraftsData() {
    return cachedFetch(craftsRawCache, CACHE_TTL_MS, () => fetchJson(GAME_MODE + '/crafts').then(r => r.data));
}
async function getBartersData() {
    return cachedFetch(bartersRawCache, CACHE_TTL_MS, () => fetchJson(GAME_MODE + '/barters').then(r => r.data));
}

// --- ID lookup helpers ---
function itemNameById(itemsData) {
    const map = {};
    for (const item of Object.values((itemsData && itemsData.items) || {})) {
        map[item.id] = item.name || item.shortName || item.normalizedName || item.id;
    }
    return map;
}
function traderById(tradersData) {
    const map = {};
    for (const trader of Object.values(tradersData || {})) {
        map[trader.id] = trader;
    }
    return map;
}
function stationById(hideoutData) {
    const map = {};
    for (const station of Object.values(hideoutData || {})) {
        map[station.id] = station;
    }
    return map;
}

// --- Public API (used by commands) ---
async function getItemNames() {
    const data = await getItemsData();
    return Object.values((data && data.items) || {}).map(i => i.name).filter(Boolean).sort();
}

async function getTaskNames() {
    const data = await getTasksData();
    return Object.values((data && data.tasks) || {}).map(t => t.name).filter(Boolean).sort();
}

// Preload the name caches in the background so autocomplete is instant.
async function preload() {
    try {
        await Promise.all([getItemNames(), getTaskNames()]);
        console.log('Preloaded tarkov.dev item/quest name caches.');
    } catch (error) {
        console.log('Could not preload tarkov.dev caches:', error.message);
    }
}

// Return up to 25 Discord autocomplete choices matching the search term.
function filterNames(names, search) {
    const q = (search || '').toLowerCase().replace(/\./g, '');
    return names
        .filter(name => name.toLowerCase().replace(/\./g, '').includes(q))
        .slice(0, 25)
        .map(name => ({ name: name.slice(0, 100), value: name.slice(0, 100) }));
}

async function getItem(name) {
    const [itemsData, tradersData] = await Promise.all([getItemsData(), getTradersData()]);
    const items = Object.values((itemsData && itemsData.items) || {});
    const lower = String(name).toLowerCase();
    const item = items.find(i => i.name && i.name.toLowerCase() === lower)
        || items.find(i => i.shortName && i.shortName.toLowerCase() === lower)
        || items.find(i => i.normalizedName && i.normalizedName.toLowerCase() === lower);
    if (!item) return null;

    const traders = traderById(tradersData);
    return {
        id: item.id,
        name: item.name,
        shortName: item.shortName,
        wikiLink: item.wikiLink,
        inspectImageLink: item.inspectImageLink,
        description: item.description,
        avg24hPrice: item.avg24hPrice,
        low24hPrice: item.low24hPrice ?? item.lastLowPrice ?? null,
        sellFor: (item.sellToTrader || [])
            .map(o => ({
                priceRUB: o.priceRUB,
                vendor: { name: (traders[o.trader] && traders[o.trader].name) || 'Unknown Trader' },
            }))
            .filter(o => o.priceRUB),
    };
}

async function getTask(name) {
    const [tasksData, tradersData, itemsData] = await Promise.all([getTasksData(), getTradersData(), getItemsData()]);
    const tasks = Object.values((tasksData && tasksData.tasks) || {});
    const lower = String(name).toLowerCase();
    const task = tasks.find(t => t.name && t.name.toLowerCase() === lower);
    if (!task) return null;

    const traders = traderById(tradersData);
    const iNames = itemNameById(itemsData);
    const trader = task.trader ? traders[task.trader] : null;
    const finish = task.finishRewards || {};

    return {
        name: task.name,
        wikiLink: task.wikiLink,
        taskImageLink: task.taskImageLink,
        trader: trader ? { name: trader.name, imageLink: trader.imageLink } : null,
        experience: task.experience,
        minPlayerLevel: task.minPlayerLevel,
        kappaRequired: task.kappaRequired,
        lightkeeperRequired: task.lightkeeperRequired,
        finishRewards: {
            items: (finish.items || []).map(i => ({ count: i.count, item: { name: iNames[i.item] || '?' } })),
            skillLevelReward: (finish.skillLevelReward || []).map(s => ({ name: s.skill || s.name || '?' })),
            traderStanding: (finish.traderStanding || []).map(s => ({ standing: s.standing })),
        },
    };
}

async function getCrafts() {
    return cachedFetch(craftsCache, CACHE_TTL_MS, async () => {
        const [crafts, hideoutData, itemsData] = await Promise.all([getCraftsData(), getHideoutData(), getItemsData()]);
        const iNames = itemNameById(itemsData);
        const sNames = stationById(hideoutData);
        return crafts.map(c => ({
            id: c.id,
            station: { name: (sNames[c.station] && sNames[c.station].name) || 'Hideout' },
            level: c.level,
            requiredItems: (c.requiredItems || []).map(r => ({ count: r.count, item: { id: r.item, name: iNames[r.item] || '?' } })),
            rewardItems: ((c.rewardItems && c.rewardItems.length ? c.rewardItems : [c.productItem]) || [])
                .filter(Boolean)
                .map(r => ({ count: r.count, item: { id: r.item, name: iNames[r.item] || '?' } })),
        }));
    });
}

async function getBarters() {
    return cachedFetch(bartersCache, CACHE_TTL_MS, async () => {
        const [barters, tradersData, itemsData] = await Promise.all([getBartersData(), getTradersData(), getItemsData()]);
        const iNames = itemNameById(itemsData);
        const tNames = traderById(tradersData);
        return barters.map(b => ({
            id: b.id,
            trader: { name: (tNames[b.trader] && tNames[b.trader].name) || 'Trader' },
            level: b.minTraderLevel,
            requiredItems: (b.requiredItems || []).map(r => ({ count: r.count, item: { id: r.item, name: iNames[r.item] || '?' } })),
            rewardItems: ((b.rewardItems && b.rewardItems.length ? b.rewardItems : [b.offeredItem]) || [])
                .filter(Boolean)
                .map(r => ({ count: r.count, item: { id: r.item, name: iNames[r.item] || '?' } })),
        }));
    });
}

async function getHideoutStations() {
    return cachedFetch(hideoutCache, CACHE_TTL_MS, async () => {
        const [hideoutData, itemsData] = await Promise.all([getHideoutData(), getItemsData()]);
        const iNames = itemNameById(itemsData);
        return Object.values(hideoutData || {}).map(st => ({
            id: st.id,
            name: st.name,
            levels: (st.levels || []).map(lvl => ({
                level: lvl.level,
                itemRequirements: (lvl.itemRequirements || []).map(r => ({ count: r.count, item: { id: r.item, name: iNames[r.item] || '?' } })),
            })),
        }));
    });
}

// Objective fields on a task that can reference an item that is REQUIRED for
// the quest (find / hand over / plant / use / mark / key / kill-with).
const OBJECTIVE_ITEM_FIELDS = ['item', 'questItem', 'items', 'markerItem', 'requiredKeys', 'containsAll', 'usingWeapon'];

async function getTasksRequiringItem(itemId) {
    const tasksData = await getTasksData();
    const tasks = Object.values((tasksData && tasksData.tasks) || {});
    const result = [];
    for (const task of tasks) {
        const reqObjectives = (task.objectives || []).filter(o =>
            OBJECTIVE_ITEM_FIELDS.some(f => o[f] === itemId || (Array.isArray(o[f]) && o[f].includes(itemId)))
        );
        const neededKey = Array.isArray(task.neededKeys) && task.neededKeys.includes(itemId);
        if (reqObjectives.length > 0 || neededKey) {
            result.push({
                name: task.name,
                wikiLink: task.wikiLink,
                objectives: reqObjectives.map(o => ({ type: o.type, count: o.count })),
                neededKey,
            });
        }
    }
    return result;
}

module.exports = { getItemNames, getTaskNames, getItem, getTask, getCrafts, getBarters, getHideoutStations, getTasksRequiringItem, filterNames, preload };
