import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { SmsTemplateMessage } from './sms-template-message';
import { SmsMessage } from './sms-message';
import { SmsToken } from './sms-token';


@Injectable()
export class SendSmsService {
    private apiUrl = 'cmp/api/SendSms';

    constructor(
        private readonly commonService: CommonService) {
    }

    send(sms: SmsMessage): Observable<number> {
        return this.commonService.postGeneric<SmsMessage, number>(`${this.apiUrl}/Send`, sms);
    }

    sendTemplateSms(templateId: number, mobileNumbers: string[],  tokens: SmsToken[]): Observable<number> {
        const sms = new SmsTemplateMessage();
        sms.templateId = templateId;
        sms.smsNumbers = mobileNumbers;
        sms.tokens = tokens;
        return this.commonService.postGeneric<SmsTemplateMessage, number>('SendTemplateSms', sms);
    }
}
