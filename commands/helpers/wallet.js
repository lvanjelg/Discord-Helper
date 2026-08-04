// Persistent per-user casino wallet, stored in wallets.json at the project
// root (gitignored). Writes are queued so concurrent commands stay consistent.
const fs = require('fs');
const path = require('path');

const WALLET_FILE = path.join(__dirname, '..', '..', 'wallets.json');
const STARTER_BALANCE = 1000;
const DAILY_AMOUNT = 500;

let wallets = {};
let loaded = false;

function ensureLoaded() {
    if (loaded) return;
    try {
        if (fs.existsSync(WALLET_FILE)) {
            wallets = JSON.parse(fs.readFileSync(WALLET_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Could not load wallets:', error.message);
        wallets = {};
    }
    loaded = true;
}

// Wallets file is tiny, so we write synchronously for durability (no lost
// updates if the bot is killed right after a bet).
function saveNow() {
    try {
        fs.writeFileSync(WALLET_FILE, JSON.stringify(wallets, null, 2));
    } catch (error) {
        console.error('Could not save wallets:', error.message);
    }
}

function ensureWallet(userId) {
    ensureLoaded();
    const key = String(userId);
    if (!wallets[key]) {
        wallets[key] = { balance: STARTER_BALANCE, daily: '' };
        saveNow();
    }
    return wallets[key];
}

function getBalance(userId) {
    ensureLoaded();
    const w = wallets[String(userId)];
    return w ? w.balance : STARTER_BALANCE;
}

function addBalance(userId, delta) {
    const w = ensureWallet(userId);
    w.balance = Math.max(0, Math.round(w.balance + delta));
    saveNow();
    return w.balance;
}

function getTodayKey() {
    return new Date().toDateString();
}

function claimDaily(userId) {
    const w = ensureWallet(userId);
    const today = getTodayKey();
    if (w.daily === today) return false;
    w.daily = today;
    w.balance += DAILY_AMOUNT;
    saveNow();
    return true;
}

module.exports = { STARTER_BALANCE, DAILY_AMOUNT, getBalance, addBalance, claimDaily };
