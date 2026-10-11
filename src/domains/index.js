/**
 * Connect finished domain experiences here. Leave placeholder domains out of this map.
 * Keys must match a stable domain ID from src/data/domains.js.
 */
const modules = {};
export const getDomainModule = id => modules[id] || null;
