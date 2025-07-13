import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { CommonService } from "projects/shared-services-lib/src/lib/services/common/common.service";
import { InsuredLivesSummary } from "../entities/insured-lives-summary";
import { MemberVopdStatus } from "../entities/member-vopd-status";
import { PolicyOnboardOptionEnum } from "../enums/policy-onboard-option.enum";

@Injectable({
    providedIn: 'root'
})
export class MyValuePlusService {

    private readonly api = 'clc/api/Policy/Policy';

    constructor(private readonly commonService: CommonService) { }
    
    // MFT Check Endpoints
    verifyMyValuePlusImport(fileIdentifier: string, policyOnboardOption: PolicyOnboardOptionEnum): Observable<InsuredLivesSummary> {
        const api = `${this.api}/VerifyMyValuePlusImport/${fileIdentifier}/${policyOnboardOption}` ;
        return this.commonService.getAll<InsuredLivesSummary>(api);
    }

    // MFT Check Endpoints
    getMyValuePlusVopdStatus(fileIdentifier: string): Observable<MemberVopdStatus[]> {
        const url = `${this.api}/GetMyValuePlusVopdStatus/${fileIdentifier}`;
        return this.commonService.getAll<MemberVopdStatus[]>(url);
    }
}
