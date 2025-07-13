import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


import { BankAccountType } from '../Entities/bank-account-type';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

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

    addBankAccountTypes(account: BankAccountType): Observable<number> {
        return this.commonService.postGeneric<BankAccountType, number>(`${this.apiBankAccountType}`, account);
    }

    editBankAccountTypes(account: BankAccountType): Observable<boolean> {
        return this.commonService.edit<BankAccountType>(account, `${this.apiBankAccountType}`);
    }
}
