import { PremiumListingFileAudit } from './../../shared/models/premium-listing-file-audit';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { ConstantApi } from 'src/app/shared/constants/constant';
import { Policy } from 'src/app/shared/models/policy';
import { Statement } from 'src/app/shared/models/statement';
import { Brokerage } from 'src/app/shared/models/brokerage';
import { Representative } from 'src/app/shared/models/representative';
import { RolePlayerPolicy } from 'src/app/shared/models/role-player-policy';


@Injectable()
export class BrokerPolicyService {

    constructor(private readonly commonService: CommonService) {
    }

    getPolicy(id: number): Observable<Policy> {
        return this.commonService.get<Policy>(id, `${ConstantApi.PolicyApiUrl}`);
    }

    getStatementByPolicy(policyId: number): Observable<Statement[]> {
        return this.commonService.getAll<Statement[]>(`${ConstantApi.BillingInvoice}/GetStatementByPolicy/${policyId}`);
    }

    uploadPremiumListing(content: any): Observable<number> {
        const url = `${ConstantApi.PolicyApiUrl}/UploadPremiumListing`;
        return this.commonService.post<any>(url, content);
    }

    clientReferenceExists(clientReference: string): Observable<boolean> {
        return this.commonService.get<boolean>(clientReference, `${ConstantApi.PolicyApiUrl}/ClientReferenceExists`);
    }

    getPremiumListingFileAudits(): Observable<PremiumListingFileAudit[]> {
        return this.commonService.getAll<PremiumListingFileAudit[]>(`${ConstantApi.PremiumListingFileUrl}`);
    }

    GetPremiumListingFileAuditsByBrokerEmail(email: string): Observable<PremiumListingFileAudit[]> {
        return this.commonService.getAll<PremiumListingFileAudit[]>(`${ConstantApi.PremiumListingFileUrl}/GetPremiumListingFileAuditsByBrokerEmail/${email}`);
    }

    addPremiumListingFileAudit(premiumListingFileAudit: PremiumListingFileAudit): Observable<number> {
        return this.commonService.add<PremiumListingFileAudit>(premiumListingFileAudit, `${ConstantApi.PremiumListingFileUrl}`);
    }

    brokerUploadPremiumListing(content: any): Observable<number> {
        const url = `${ConstantApi.PremiumListingFileUrl}/BrokerUploadPremiumListing`;
        return this.commonService.post<any>(url, content);
    }

    GetBrokerageByUserId(userId: number): Observable<Brokerage> {
        return this.commonService.get<Brokerage>(userId, `${ConstantApi.BrokerageApi}/GetBrokerageByUserId`);
    }

    getRepresentative(id: number): Observable<Representative> {
        return this.commonService.get<Representative>(id, `${ConstantApi.RepresentativeApi}`);
    }

    searchPoliciesForCase(query: string): Observable<RolePlayerPolicy[]> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<RolePlayerPolicy[]>(`${ConstantApi.RolePlayerPolicyUrl}/SearchPoliciesForCase/${urlQuery}`);
    }

    updateAffordabilityCheck( content: any): Observable<number> {
        const url = `${ConstantApi.PolicyApiUrl}/UpdateAffordabilityCheck`;
        return this.commonService.post<number>(url, content);
   
      }
}
