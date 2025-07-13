import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpResponse, HttpHandler } from '@angular/common/http';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService, CACHABLE_URL, CACHABLE_URL_EXCEPTION, CacheItem } from '../services/cache/cache.service';

@Injectable()
export class CachingInterceptor implements HttpInterceptor {
  constructor(private cache: CacheService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRequestCachable(req)) {
      return next.handle(req);
    }

    const cachedResponse = this.cache.get(req);
    if (cachedResponse !== null) {
      return of(cachedResponse);
    }

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cache.put(req, event);
        }
      })
    );
  }

  private isRequestCachable(req: HttpRequest<any>): boolean {
    let found = false;
    CACHABLE_URL.forEach(cacheItem => {
      if ((req.method === 'GET') && (req.url.toLowerCase().indexOf(cacheItem.url.toLowerCase()) > -1)) {
        let excludeRequest = this.excludeFromCache( cacheItem, req.url);
        if(excludeRequest === false)
          found = true;
      }
    });

    return found;
  }

  private excludeFromCache(cachekey: CacheItem, url: string): boolean {
    let found = false;
    CACHABLE_URL_EXCEPTION.forEach(item => {
      if (item.url.toLowerCase().indexOf(cachekey.url.toLowerCase()) > -1 && url.toLowerCase().indexOf(item.url.toLowerCase()) > -1)
        found = true;
    });
    return found;
  }
}
