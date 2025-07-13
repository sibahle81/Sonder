import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { CommonService } from "projects/shared-services-lib/src/lib/services/common/common.service";
import { InsuredLivesSummary } from "../entities/insured-lives-summary";
import { MemberVopdStatus } from "../entities/member-vopd-status";
import { PolicyOnboardOptionEnum } from "../enums/policy-onboard-option.enum";

@Injectable({
    providedIn: 'root'
})
export class ConsolidatedFuneralService {

    private readonly api = 'clc/api/Policy/Policy';

    constructor(private readonly commonService: CommonService) { }

    verifyConsolidatedFuneralImport(fileIdentifier: string, policyOnboardOption: PolicyOnboardOptionEnum, policyNumber: string): Observable<InsuredLivesSummary> {
        const api = `${this.api}/VerifyConsolidatedFuneralImport/${fileIdentifier}/${policyOnboardOption}/${policyNumber}`;
        return this.commonService.getAll<InsuredLivesSummary>(api);
    }

    getConsolidatedFuneralVopdStatus(fileIdentifier: string): Observable<MemberVopdStatus[]> {
        const url = `${this.api}/GetConsolidatedFuneralVopdStatus/${fileIdentifier}`;
        return this.commonService.getAll<MemberVopdStatus[]>(url);
    }
}
