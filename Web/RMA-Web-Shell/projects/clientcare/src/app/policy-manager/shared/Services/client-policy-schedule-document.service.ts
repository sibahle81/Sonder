import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';
import { OneTimePinModel } from 'projects/shared-models-lib/src/lib/security/onetimepinmodel';

@Injectable({
    providedIn: 'root'
})
export class ClientPolicyScheduleDocumentsService {

    private apiClientPolicyScheduleDocuments = 'clc/api/Policy/ClientPolicyScheduleDocuments';

    constructor(
        private readonly commonService: CommonService
    ) {
    }

    getOneTimePinByPolicyNumber(policyNumber: string): Observable<OneTimePinModel> {
        return this.commonService.get<OneTimePinModel>(policyNumber, `${this.apiClientPolicyScheduleDocuments}/GetOneTimePinByPolicyNumber`);
    }

    getPolicyDocumentsByPolicyNumber(policyNumber: string, oneTimePin: number): Observable<MailAttachment[]> {
        return this.commonService.getAll<MailAttachment[]>(`${this.apiClientPolicyScheduleDocuments}/GetPolicyDocumentsByPolicyNumber/${policyNumber}/${oneTimePin}`);
    }

    GetDocumentPassword(policyId: number): any {
        return this.commonService.get<string>(policyId, `${this.apiClientPolicyScheduleDocuments}/GetDocumentPassword`);
    }
}
