import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Bank } from '../../../../../shared-models-lib/src/lib/lookup/bank';

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
}
