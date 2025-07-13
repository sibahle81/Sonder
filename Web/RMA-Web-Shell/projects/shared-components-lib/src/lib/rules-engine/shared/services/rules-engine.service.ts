import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Observable } from 'rxjs';
import { RuleRequest } from '../models/rule-request';
import { RuleRequestResult } from '../models/rule-request-result';

@Injectable()
export class RulesEngineService {
    private apiUrl = 'rul/api/RulesEngine';

    constructor(
        private readonly commonService: CommonService,
        private readonly authService: AuthService) {
    }

    executeRules(ruleRequest: RuleRequest): Observable<RuleRequestResult> {
        ruleRequest.requester = this.authService.getUserEmail();

        return this.commonService.postGeneric<RuleRequest, RuleRequestResult>(this.apiUrl, ruleRequest);
    }
}
