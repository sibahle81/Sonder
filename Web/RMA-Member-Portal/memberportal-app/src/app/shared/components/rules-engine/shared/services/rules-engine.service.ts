import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/core/services/common/common.service';
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

        return this.commonService.add<RuleRequest, RuleRequestResult>(ruleRequest, this.apiUrl);
    }
}
