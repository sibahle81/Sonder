import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { CommonService } from "projects/shared-services-lib/src/lib/services/common/common.service";
import { Policy } from "../../shared/entities/policy";

@Injectable()
export class BulkPolicySendService {

    private readonly api = 'clc/api/Policy/Policy';

    constructor(
        private readonly commonService: CommonService
    ) { }

    getPolicy(policyNumber: string): Observable<Policy> {
        const url = `${this.api}/GetPolicyByNumber/${policyNumber}`;
        return this.commonService.getAll<Policy>(url);
    }

    sendPolicySchedules(policyId: number, recipient: string): Observable<boolean> {
        const url = `${this.api}/SendBulkGroupSchedules/${policyId}/${recipient}`;
        return this.commonService.getAll<boolean>(url);
    }
}
