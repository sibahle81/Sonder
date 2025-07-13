import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { EmailRequest } from './email-request';

@Injectable()
export class SendEmailService {
    private apiUrl = 'cmp/api/SendEmail/Send';

    constructor(
        private readonly commonService: CommonService) {
    }

    sendEmail(request: EmailRequest): Observable<number> {
        return this.commonService.postGeneric<EmailRequest, number>( this.apiUrl, request);
    }
}
