import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Injectable } from '@angular/core';
import { AbilityCollections } from '../../billing-manager/models/ability-collections';
import { Observable } from 'rxjs';
import { AbilityTransactionsAudit } from '../../billing-manager/models/ability-transaction-audit';
import { AbilityChart } from '../../billing-manager/models/abilty-chart';
import { AbilityCollectionPostingRequest } from '../../billing-manager/models/ability-collections-posting-request';

@Injectable({
    providedIn: 'root'
})
export class AbilityCollectionsService {
    private apiUrl = 'bill/api/billing/abilitycollections';
    private apiAudits = 'bill/api/billing/AbilityTransactionsAudit';
    constructor(
        private readonly commonService: CommonService,
        private readonly authService: AuthService) {
    }

    getAbilityCollection(id: number): Observable<AbilityCollections> {
        return this.commonService.get<AbilityCollections>(id, `${this.apiUrl}`);
    }

    getAbilityCollections(): Observable<AbilityCollections[]> {
        return this.commonService.getAll<AbilityCollections[]>(`${this.apiUrl}`);
    }

	
    getAbilityCollectionsByCompanyNoAndBranchNo(companyNo: number, branchNo: number): Observable<AbilityCollections[]> {

        let companyNoInt = (companyNo == undefined || companyNo == null)? -1: companyNo;
        let branchNoInt = (branchNo == undefined || branchNo == null)? -1: branchNo;

        return this.commonService.getAll<AbilityCollections[]>(`${this.apiUrl}/ByCompanyNoAndBranchNo?companyNo=${companyNoInt}&branchNo=${branchNoInt}`);
    }

    getAbilityRecoveryCollections(): Observable<AbilityCollections[]> {
        return this.commonService.getAll<AbilityCollections[]>(`${this.apiUrl}/Recovery`);
    }

    addAbilityCollections(abilityCollections: AbilityCollections): Observable<number> {
        return this.commonService.postGeneric<AbilityCollections, number>(`${this.apiUrl}`, abilityCollections);
    }

    editAbilityCollections(abilityCollections: AbilityCollections): Observable<boolean> {
        return this.commonService.edit(abilityCollections, `${this.apiUrl}`);
    }

    removeAbilityCollections(id: number): Observable<boolean> {
        return this.commonService.remove(id, `${this.apiUrl}`);
    }

    postToAbility(): Observable<boolean> {
        return this.commonService.getAll(`${this.apiUrl}/Process`);
    }

    postRecoveries(): Observable<boolean> {
        return this.commonService.getAll(`${this.apiUrl}/PostRecoveries`);
    }

    processTransaction(): Observable<boolean> {
        return this.commonService.getAll(`${this.apiUrl}/ProcessTransactions`);
    }

    processAudits(): Observable<boolean> {
        return this.commonService.getAll(`${this.apiAudits}/ProcessAudits`);
    }

    getTransactionDetails(): Observable<AbilityTransactionsAudit[]> {
        return this.commonService.getAll<AbilityTransactionsAudit[]>(`${this.apiAudits}`);
    }

    getAbilityPostingAuditByRef(query: string): Observable<AbilityTransactionsAudit[]> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<AbilityTransactionsAudit[]>(`${this.apiAudits}/GetAbilityPostingAuditByRef/${urlQuery}`);
    }
    getAbilityCharts(): Observable<AbilityChart[]> {
        return this.commonService.getAll<AbilityChart[]>(`${this.apiUrl}/GetAbilityIncomeAndBalanceSheetCharts`);
    }

    postCollectionSummaryToAbility(item :AbilityCollectionPostingRequest): Observable<number> {
        return this.commonService.postGeneric<any, number>(`${this.apiUrl}/PostCollectionSummaryToAbility`, item);
    }
}
