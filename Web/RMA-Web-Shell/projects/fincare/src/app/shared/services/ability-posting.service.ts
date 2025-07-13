import { PostedPayments } from '../../finance-manager/models/posted-payments';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

import { CommonService } from '../../../../../shared-services-lib/src/lib/services/common/common.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AbilityPosting } from '../../finance-manager/models/ability-posting.model';

@Injectable()
export class AbilityPostingService {
    private apiUrl = 'fin/api/abilityposting';
    constructor(
        private readonly commonService: CommonService,
        private readonly authService: AuthService) {
    }

    getAbilityPosting(id: number): Observable<AbilityPosting> {
        return this.commonService.get<AbilityPosting>(id, `${this.apiUrl}`);
    }

    getAbilityPostings(): Observable<AbilityPosting[]> {
        return this.commonService.getAll<AbilityPosting[]>(`${this.apiUrl}`);
    }

    addAbilityPosting(abilityPosting: AbilityPosting): Observable<number> {
        return this.commonService.add(abilityPosting, `${this.apiUrl}`);
    }

    editAbilityPosting(abilityPosting: AbilityPosting): Observable<boolean> {
        return this.commonService.edit(abilityPosting, `${this.apiUrl}`);
    }

    removeAbilityPosting(id: number): Observable<boolean> {
        return this.commonService.remove(id, `${this.apiUrl}`);
    }

    postToAbility(): Observable<boolean> {
        return this.commonService.getAll('AbilityPosting/Post');
    }

    getPostedPayments(): Observable<PostedPayments[]> {
        return this.commonService.getAll<PostedPayments[]>('fin/api/AbilityPostingAudit');
    }
}
