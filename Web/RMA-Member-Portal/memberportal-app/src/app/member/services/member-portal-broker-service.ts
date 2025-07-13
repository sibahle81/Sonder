import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PagedRequestResult } from 'src/app/core/models/pagination/PagedRequestResult.model';
import { CommonService } from 'src/app/core/services/common/common.service';
import { ConstantApi } from 'src/app/shared/constants/constant';
import { Policy } from 'src/app/shared/models/policy';

@Injectable()
export class MemberPortalBrokerService {

    constructor(private readonly commonService: CommonService) {
    }

    getPoliciesForMember(memberId: number): Observable<Policy[]> {
        return this.commonService.get<Policy[]>(memberId, `${ConstantApi.PolicyApiUrl}/GetPoliciesForMember`);
    }

    sendPolicyInformationDocument(policy: Policy) {
        return this.commonService.edit(policy, `${ConstantApi.PolicyApiUrl}/SendPolicyInformationDocument`);
    }

    search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Policy>> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<PagedRequestResult<Policy>>(`${ConstantApi.PolicyApiUrl}/GetAllPoliciesForMember/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
    }
}
