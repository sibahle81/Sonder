import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Case } from '../entities/case';

@Injectable()
export class CaseService {

    private apiCase = 'clc/api/Policy/PolicyCase';

    constructor(
        private readonly commonService: CommonService) {
    }

    getCaseByPolicyId(policyId: number): Observable<Case> {
        return this.commonService.get<Case>(policyId, `${this.apiCase}/GetCaseByPolicyId`);
    }
}
