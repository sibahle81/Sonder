import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { DiscountType } from '../models/discount-type';
import { LastViewedItem } from '../models/last-viewed-item';

@Injectable()
export class DiscountTypeService {

    private apiUrl = 'clc/api/Product/DiscountType';

    constructor(
        private readonly commonService: CommonService) {
    }


    getDiscountType(): Observable<DiscountType[]> {
        return this.commonService.getAll<DiscountType[]>(this.apiUrl);
    }

    getDiscountTypeById(id: number): Observable<DiscountType> {
        return this.commonService.get<DiscountType>(id, this.apiUrl);
    }

    addDiscountType(discountType: DiscountType): Observable<number> {
        return this.commonService.postGeneric<DiscountType, number>(this.apiUrl, discountType);
    }

    editDiscountType(discountType: DiscountType): Observable<boolean> {
        return this.commonService.edit<DiscountType>(discountType, this.apiUrl);
    }

    searchDiscountTypes(query: string): Observable<DiscountType[]> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<DiscountType[]>(`${this.apiUrl}/Search/${urlQuery}`);
    }

    getLastViewedItems(): Observable<LastViewedItem[]> {
        return this.commonService.getAll<LastViewedItem[]>(`${this.apiUrl}/LastViewed`);
    }
}
