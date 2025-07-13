import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedRequestResult } from 'src/app/core/models/pagination/PagedRequestResult.model';
import { CommonService } from 'src/app/core/services/common/common.service';
import { Rule } from '../models/rule';

@Injectable({
    providedIn: 'root'
})
export class RuleService {

    private apiUrl = 'rul/api/Rule';
    constructor(
        private readonly commonService: CommonService) {
    }

    getRules(): Observable<Rule[]> {
        return this.commonService.getAll<Rule[]>(this.apiUrl);
    }

    getRule(id: number): Observable<Rule> {
        return this.commonService.get<Rule>(id, this.apiUrl);
    }

    addRule(rule: Rule): Observable<number> {
        return this.commonService.add<Rule>(rule, this.apiUrl);
    }

    editRule(rule: Rule): Observable<boolean> {
        return this.commonService.edit<Rule>(rule, this.apiUrl);
    }

    search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Rule>> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<PagedRequestResult<Rule>>(`${this.apiUrl}/Search/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
    }

    getLastViewedRules(): Observable<Rule[]> {
        return this.commonService.getAll<Rule[]>(`${this.apiUrl}/LastViewed`);
    }


    getRulesForProducts(): Observable<Rule[]> {
        return this.commonService.getAll<Rule[]>(`${this.apiUrl}/GetRulesByTypes/1,3`);
    }

    getRulesForBenefit(): Observable<Rule[]> {
        return this.commonService.getAll<Rule[]>(`${this.apiUrl}/GetRulesByTypes/2,3`);
    }

    getRulesByRuleTypes(ruleTypeIds: number[]): Observable<Rule[]> {
        const ids = ruleTypeIds.join(',');
        return this.commonService.getAll<Rule[]>(`${this.apiUrl}/GetRulesByTypes/${ids}`);
    }
}
