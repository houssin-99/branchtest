const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const core = require('./core');

// /C:/Users/houss/Desktop/School/branchtest/core.js
'use strict';

/**
 * Core utilities and feature system
 * - lightweight feature registration
 * - event emitter wrapper
 * - simple logger
 * - config loader
 * - task queue with concurrency
 * - CLI args parser
 */


/* ---------- Logger ---------- */
const levels = { error: 0, warn: 1, info: 2, debug: 3 };
let currentLevel = levels.info;

function setLogLevel(levelName) {
    if (levels[levelName] === undefined) return false;
    currentLevel = levels[levelName];
    return true;
}

function log(levelName, ...args) {
    if (levels[levelName] === undefined) return;
    if (levels[levelName] <= currentLevel) {
        const ts = new Date().toISOString();
        console.log(`[${ts}] [${levelName.toUpperCase()}]`, ...args);
    }
}

/* ---------- Feature Registry ---------- */
const features = new Map();

function registerFeature(name, initFn) {
    if (!name || typeof initFn !== 'function') throw new TypeError('registerFeature(name, fn)');
    if (features.has(name)) throw new Error(`Feature "${name}" already registered`);
    const entry = { name, initFn, instance: null, createdAt: Date.now() };
    features.set(name, entry);
    log('debug', 'Feature registered', name);
    return entry;
}

async function initFeature(name, opts = {}) {
    const entry = features.get(name);
    if (!entry) throw new Error(`Feature "${name}" not found`);
    if (entry.instance) return entry.instance;
    entry.instance = await Promise.resolve(entry.initFn(opts));
    log('info', 'Feature initialized', name);
    return entry.instance;
}

function getFeature(name) {
    const e = features.get(name);
    return e ? e.instance : undefined;
}

function listFeatures() {
    return Array.from(features.keys());
}

/* ---------- Event Bus ---------- */
const bus = new EventEmitter();
bus.setMaxListeners(50);

/* ---------- Config Loader ---------- */
function loadConfig(filePath) {
    if (!filePath) return {};
    const resolved = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolved)) {
        log('warn', 'Config file not found', resolved);
        return {};
    }
    try {
        const raw = fs.readFileSync(resolved, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        log('error', 'Failed to load config', err.message);
        return {};
    }
}

/* ---------- Simple Task Queue ---------- */
function createQueue(concurrency = 2) {
    const queue = [];
    let active = 0;

    function runNext() {
        if (active >= concurrency || queue.length === 0) return;
        const task = queue.shift();
        active++;
        Promise.resolve()
            .then(() => task.fn())
            .then(task.resolve, task.reject)
            .finally(() => {
                active--;
                runNext();
            });
    }

    return {
        push(fn) {
            return new Promise((resolve, reject) => {
                queue.push({ fn, resolve, reject });
                process.nextTick(runNext);
            });
        },
        size() {
            return queue.length + active;
        },
        drain() {
            return new Promise((res) => {
                const check = () => {
                    if (queue.length === 0 && active === 0) return res();
                    setTimeout(check, 50);
                };
                check();
            });
        },
    };
}

/* ---------- CLI Args Parser (very small) ---------- */
function parseArgs(argv = process.argv.slice(2)) {
    const out = { _: [] };
    argv.forEach((token) => {
        if (token.startsWith('--')) {
            const [k, v = true] = token.slice(2).split('=');
            out[k] = v;
        } else if (token.startsWith('-')) {
            const flags = token.slice(1).split('');
            flags.forEach((f) => (out[f] = true));
        } else {
            out._.push(token);
        }
    });
    return out;
}

/* ---------- Exports ---------- */
module.exports = {
    // logger
    log,
    setLogLevel,
    levels,

    // features
    registerFeature,
    initFeature,
    getFeature,
    listFeatures,

    // event bus
    bus,

    // config
    loadConfig,

    // queue
    createQueue,

    // cli
    parseArgs,
};

/* ---------- Example usage (commented)
core.setLogLevel('debug');
core.registerFeature('hello', () => ({ say: (n='world') => core.log('info','hello', n) }));
(async () => {
    await core.initFeature('hello');
    core.getFeature('hello').say();
})();
*/