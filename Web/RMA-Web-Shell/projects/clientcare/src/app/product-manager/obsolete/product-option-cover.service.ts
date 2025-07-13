import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { ProductOptionCover } from './product-option-cover';
import { LastViewedItem } from '../models/last-viewed-item';

@Injectable()
export class ProductOptionCoverService {

    private apiUrl = 'clc/api/Product/productoptioncover';
    private apiOptionUrl = 'clc/api/Product/productoption';
    constructor(
        private readonly commonService: CommonService) {
    }

    getProductOptionCoverByProductId(productId: number): Observable<ProductOptionCover[]> {
        return this.commonService.get<ProductOptionCover[]>(productId, `${this.apiUrl}/ByProductId`);
    }

    getProductOptionCoverByIds(ids: string): Observable<ProductOptionCover[]> {
        return this.commonService.getAll<ProductOptionCover[]>(`${this.apiUrl}/many/${ids}`);
    }

    getProductOptionCover(id: number): Observable<ProductOptionCover[]> {
        return this.commonService.get<ProductOptionCover[]>(id, this.apiUrl);
    }

    getLastViewedItems(): Observable<LastViewedItem[]> {
        return this.commonService.getAll<LastViewedItem[]>(`${this.apiOptionUrl}/LastViewed`);
      }

}
