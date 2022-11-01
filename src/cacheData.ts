import { CacheData } from "./commons/definition";

export let cacheData: CacheData = null;

export function initCacheData() {
    cacheData = new CacheData();
}