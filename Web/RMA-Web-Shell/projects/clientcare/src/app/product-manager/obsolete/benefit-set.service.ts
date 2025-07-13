import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { BenefitSet } from './benefit-set';
import { LastViewedItem } from '../models/last-viewed-item';

@Injectable()
export class BenefitSetService {

    private apiBenefitSet = 'clc/api/Product/BenefitSet';

    constructor(
        private readonly commonService: CommonService) {
    }

    getBenefitSet(id: any): Observable<BenefitSet> {
        return this.commonService.get<BenefitSet>(id, `${this.apiBenefitSet}`);
    }

    getBenefitSets(): Observable<BenefitSet[]> {
        return this.commonService.getAll<BenefitSet[]>(`${this.apiBenefitSet}`);
    }
    getBenefitSetsForProduct(productId: number): Observable<BenefitSet[]> {
        return this.commonService.getAll<BenefitSet[]>(`${this.apiBenefitSet}/BenefitSet/Product/${productId}`);
    }

    addBenefitSet(benefit: BenefitSet): Observable<number> {
        return this.commonService.postGeneric<BenefitSet, number>(`${this.apiBenefitSet}`, benefit);
    }

    editBenefitSet(benefit: BenefitSet): Observable<boolean> {
        return this.commonService.edit<BenefitSet>(benefit, `${this.apiBenefitSet}`);
    }

    getLastViewedItems(): Observable<LastViewedItem[]> {
        return this.commonService.getAll<LastViewedItem[]>(`${this.apiBenefitSet}/LastViewed`);
    }

    searchBenefitSets(query: string): Observable<BenefitSet[]> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<BenefitSet[]>(`${this.apiBenefitSet}/SearchBenefits/${urlQuery}`);
    }
}
