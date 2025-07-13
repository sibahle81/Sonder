import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { BankBranch } from '../../../../../shared-models-lib/src/lib/lookup/bank-branch';

@Injectable()
export class BankBranchService {

    private apiBankBranch = 'mdm/Api/BankBranch';

    constructor(private readonly commonService: CommonService) {
    }

    getBankBranch(id: number): Observable<BankBranch> {
        return this.commonService.get<BankBranch>(id, `${this.apiBankBranch}`);
    }

    getBranchesByBank(bankId: number): Observable<BankBranch[]> {
        return this.commonService.get<BankBranch[]>(bankId, `${this.apiBankBranch}`);
    }

    addBranch(branch: BankBranch): Observable<number> {
        return this.commonService.postGeneric<BankBranch, number>(`${this.apiBankBranch}`, branch);
    }

    editBranch(branch: BankBranch): Observable<boolean> {
        return this.commonService.edit<BankBranch>(branch, `${this.apiBankBranch}`);
    }
}
