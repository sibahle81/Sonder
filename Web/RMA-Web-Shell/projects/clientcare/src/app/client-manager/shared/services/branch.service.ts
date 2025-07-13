import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Branch } from '../Entities/branch';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Injectable()
export class BranchService {

    private apiBranch = 'clc/api/Client/Branch';

    constructor(
        private readonly commonService: CommonService,
        private readonly authService: AuthService) {
    }

    getBranch(id: number): Observable<Branch> {
        return this.commonService.get<Branch>(id, `${this.apiBranch}`);
    }

    getBranchesByClient(clientId: number): Observable<Branch[]> {
        return this.commonService.get<Branch[]>(clientId, `${this.apiBranch}/ByClient`);
    }

    addBranch(branch: Branch): Observable<number> {
        return this.commonService.postGeneric<Branch, number>(`${this.apiBranch}`, branch);
    }

    editBranch(branch: Branch): Observable<boolean> {
        return this.commonService.edit<Branch>(branch, `${this.apiBranch}`);
    }

    editBranchAddress(branchId: number, addressId: number): Observable<boolean> {
        const branch = new Branch();
        branch.id = branchId;
        branch.addressId = addressId;

        return this.commonService.edit<Branch>(branch, `${this.apiBranch}/EditBranchAddress`);
    }

    editBranchBank(branchId: number, bankId: number): Observable<boolean> {
        const branch = new Branch();
        branch.id = branchId;
        branch.bankAccountId = bankId;

        return this.commonService.edit<Branch>(branch, `${this.apiBranch}/EditBranchBank`);
    }
}
