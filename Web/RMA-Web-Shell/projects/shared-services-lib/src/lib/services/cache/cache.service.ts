import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { Cache } from './cache';
import { CacheEntry } from './cache.entry';


export class CacheItem {
  constructor(url: string, maxAge: number) {
    this.url = url;
    this.maxAge = maxAge;
  }
  url: string;
  maxAge: number;
}

export const CACHABLE_URL: Array<CacheItem> = [
  new CacheItem('mdm/api/', 120),
  new CacheItem('rul/api/Rule', 120),
  new CacheItem('digi/api/MasterData/', 120),
  new CacheItem('bpm/api/WizardConfiguration', 120)
];

export const CACHABLE_URL_EXCEPTION: Array<CacheItem> = [
   new CacheItem('mdm/api/Period', 0)
];

@Injectable({ providedIn: 'root' })
export class CacheService implements Cache {
  private cacheMap = new Map<string, CacheEntry>();
  private instanceId: number;

  constructor() {
    this.instanceId = Math.random();
  }

  get(req: HttpRequest<any>): HttpResponse<any> | null {
    const entry = this.cacheMap.get(req.urlWithParams.toLowerCase());
    if (!entry) { return null; }

    const maxAge = this.getMaxAge(req.url);
    const minutes = Math.abs(Date.now() - entry.entryTime) / 60000;

    const isExpired = minutes > maxAge;

    return isExpired ? null : entry.response;
  }

  put(req: HttpRequest<any>, res: HttpResponse<any>): void {
    const entry: CacheEntry = { url: req.urlWithParams, response: res, entryTime: Date.now() };
    this.cacheMap.set(req.urlWithParams.toLowerCase(), entry);
    this.deleteExpiredCache();
  }

  private deleteExpiredCache() {
    this.cacheMap.forEach(entry => {
      const maxAge = this.getMaxAge(entry.url);
      if ((Math.abs(Date.now() - entry.entryTime) / 60000) > maxAge) {
        this.cacheMap.delete(entry.url.toLowerCase());
      }
    });
  }

  private getMaxAge(sourceUrl: string): number {
    let maxAge = 120;
    CACHABLE_URL.forEach(cacheItem => {
      if (sourceUrl.toLowerCase().indexOf(cacheItem.url.toLowerCase()) > -1) {
        maxAge = cacheItem.maxAge;
      }
    });
    return maxAge;
  }
}
