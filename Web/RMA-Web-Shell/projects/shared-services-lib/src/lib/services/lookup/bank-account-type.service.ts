import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { BankAccountType } from 'projects/shared-models-lib/src/lib/lookup/bank-account-type';

@Injectable()
export class BankAccountTypeService {

    private apiBankAccountType = 'mdm/Api/BankAccountType';

    constructor(private readonly commonService: CommonService) {
    }

    getBankAccountTypes(): Observable<BankAccountType[]> {
        return this.commonService.getAll<BankAccountType[]>(`${this.apiBankAccountType}`);
    }

    getBankAccountType(bankAccountTypeId: number): Observable<BankAccountType> {
        return this.commonService.get<BankAccountType>(bankAccountTypeId, `${this.apiBankAccountType}`);
    }
}
