// Shared helper for querying the tarkov.dev GraphQL API and caching
// item/quest names for slash-command autocomplete (like the Stash bot).
const axios = require('axios');

const API_URL = 'https://api.tarkov.dev/graphql';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

let itemNamesCache = { data: null, fetchedAt: 0 };
let taskNamesCache = { data: null, fetchedAt: 0 };
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

async function queryTarkov(query) {
    try {
        const response = await axios.post(API_URL, { query }, {
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            timeout: 20000,
        });
        if (response.data && response.data.errors) {
            throw new Error(response.data.errors.map(e => e.message).join('; '));
        }
        return response.data.data;
    } catch (error) {
        if (error.response) {
            throw new Error('tarkov.dev is temporarily unavailable (HTTP ' + error.response.status + '). Please try again later.');
        }
        throw new Error('Could not reach tarkov.dev. ' + (error.message || ''));
    }
}

async function getItemNames() {
    const now = Date.now();
    if (itemNamesCache.data && now - itemNamesCache.fetchedAt < CACHE_TTL_MS) {
        return itemNamesCache.data;
    }
    const data = await queryTarkov('{ items { id name } }');
    itemNamesCache.data = (data.items || []).map(i => i.name).sort();
    itemNamesCache.fetchedAt = now;
    return itemNamesCache.data;
}

async function getTaskNames() {
    const now = Date.now();
    if (taskNamesCache.data && now - taskNamesCache.fetchedAt < CACHE_TTL_MS) {
        return taskNamesCache.data;
    }
    const data = await queryTarkov('{ tasks { id name } }');
    taskNamesCache.data = (data.tasks || []).map(t => t.name).sort();
    taskNamesCache.fetchedAt = now;
    return taskNamesCache.data;
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
    const safeName = String(name).replace(/"/g, '');
    const data = await queryTarkov(`query {
        items(name: "${safeName}") {
            id
            name
            shortName
            wikiLink
            avg24hPrice
            low24hPrice
            sellFor { priceRUB vendor { name } }
            inspectImageLink
            description
        }
    }`);
    const items = data.items || [];
    return items.find(i => i.name && i.name.toLowerCase() === String(name).toLowerCase()) || items[0] || null;
}

async function getTask(name) {
    const data = await queryTarkov(`query {
        tasks {
            name
            kappaRequired
            experience
            minPlayerLevel
            lightkeeperRequired
            wikiLink
            taskImageLink
            finishRewards {
                items { count item { name } }
                offerUnlock { item { name } }
                skillLevelReward { name }
                traderStanding { standing }
            }
            trader { name imageLink }
        }
    }`);
    const tasks = data.tasks || [];
    return tasks.find(t => t.name && t.name.toLowerCase() === String(name).toLowerCase()) || null;
}

async function getCrafts() {
    return cachedFetch(craftsCache, CACHE_TTL_MS, async () => {
        const data = await queryTarkov(`{
            crafts {
                id
                station { name }
                level
                requiredItems { count item { id name } }
                rewardItems { count item { id name } }
            }
        }`);
        return data.crafts || [];
    });
}

async function getBarters() {
    return cachedFetch(bartersCache, CACHE_TTL_MS, async () => {
        const data = await queryTarkov(`{
            barters {
                id
                trader { name }
                level
                requiredItems { count item { id name } }
                rewardItems { count item { id name } }
            }
        }`);
        return data.barters || [];
    });
}

async function getHideoutStations() {
    return cachedFetch(hideoutCache, CACHE_TTL_MS, async () => {
        const data = await queryTarkov(`{
            hideoutStations {
                name
                levels {
                    level
                    itemRequirements { count item { id name } }
                }
            }
        }`);
        return data.hideoutStations || [];
    });
}

module.exports = { queryTarkov, getItemNames, getTaskNames, getItem, getTask, getCrafts, getBarters, getHideoutStations, filterNames, preload };
