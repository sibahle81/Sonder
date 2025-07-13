import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AbilityPosting } from '../models/ability-posting.model';
import { AbilityPostingAudit } from '../models/ability-posting-audit.model';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

@Injectable()
export class AbilityPostingService {
    private apiUrl = 'fin/api/finance/abilityposting';
    constructor(
        private readonly commonService: CommonService) {
    }

    getAbilityPosting(id: number): Observable<AbilityPosting> {
        return this.commonService.get<AbilityPosting>(id, `${this.apiUrl}`);
    }

    getAbilityPostings(): Observable<AbilityPosting[]> {
        return this.commonService.getAll<AbilityPosting[]>(`${this.apiUrl}`);
    }

    addAbilityPosting(abilityPosting: AbilityPosting): Observable<number> {
        return this.commonService.postGeneric<AbilityPosting, number>(`${this.apiUrl}`, abilityPosting);
    }

    editAbilityPosting(abilityPosting: AbilityPosting): Observable<boolean> {
        return this.commonService.edit(abilityPosting, `${this.apiUrl}`);
    }

    removeAbilityPosting(id: number): Observable<boolean> {
        return this.commonService.remove(id, `${this.apiUrl}`);
    }

    postToAbility(): Observable<boolean> {
        return this.commonService.getAll(`${this.apiUrl}/Process`);
    }

    getPostedPayments(): Observable<AbilityPostingAudit[]> {
        return this.commonService.getAll<AbilityPostingAudit[]>('fin/api/finance/AbilityPostingAudit');
    }

    getPostedPaymentsByReference(reference: string): Observable<AbilityPostingAudit[]> {
        return this.commonService.get<AbilityPostingAudit[]>(reference , 'fin/api/finance/AbilityPostingAudit/GetAuditDetailsByReference');
    }

    addAbilityPostingAudit(abilityPostingAudit: AbilityPostingAudit): Observable<number> {
        return this.commonService.postGeneric<AbilityPostingAudit, number>('fin/api/finance/AbilityPostingAudit', abilityPostingAudit);
    }
}
