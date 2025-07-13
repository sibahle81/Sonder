import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { PaymentMethod } from 'projects/clientcare/src/app/client-manager/shared/Entities/payment-method';




@Injectable()
export class PaymentMethodService {

    private apiBankAccountType = 'mdm/Api/PaymentMethod';

    constructor(private readonly commonService: CommonService) {
    }

    getPaymentMethods(): Observable<PaymentMethod[]> {
        return this.commonService.getAll<PaymentMethod[]>(`${this.apiBankAccountType}`);
    }

    addPaymentMethod(method: PaymentMethod): Observable<number> {
        return this.commonService.postGeneric<PaymentMethod, number>(`${this.apiBankAccountType}`, method);
    }

    editPaymentMEthod(method: PaymentMethod): Observable<boolean> {
        return this.commonService.edit<PaymentMethod>(method, `${this.apiBankAccountType}`);
    }
}
