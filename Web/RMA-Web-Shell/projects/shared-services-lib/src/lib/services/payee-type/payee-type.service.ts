import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { PayeeType } from 'projects/shared-models-lib/src/lib/common/payee-type';

@Injectable()
export class PayeeTypeService {

    private apiPayeeType = 'mdm/api/PayeeType';

    constructor(private readonly commonService: CommonService) {
    }

    getPayeeTypes(): Observable<PayeeType[]> {
        return this.commonService.getAll<PayeeType[]>(`${this.apiPayeeType}`);
    }

    getPayeeTypeById(payeeTypeId: number): Observable<PayeeType> {
        return this.commonService.get<PayeeType>(payeeTypeId, `${this.apiPayeeType}/GetPayeeTypeById`);
    }
}
