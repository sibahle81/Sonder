import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Bank } from '../Entities/bank';

@Injectable()
export class BankService {

    private apiBank = 'mdm/api/Bank';

    constructor(private readonly commonService: CommonService) {
    }

    getBank(id: number): Observable<Bank> {
        return this.commonService.get<Bank>(id, `${this.apiBank}`);
    }

    getBanks(): Observable<Bank[]> {
        return this.commonService.getAll<Bank[]>(`${this.apiBank}`);
    }


    addBank(bank: Bank): Observable<number> {
        return this.commonService.postGeneric<Bank, number>(`${this.apiBank}`, bank);
    }

    editBank(bank: Bank): Observable<boolean> {
        return this.commonService.edit<Bank>(bank, `${this.apiBank}`);
    }

    removeBank(id: number): Observable<boolean> {
        return this.commonService.remove(id, `${this.apiBank}`);
    }
}
