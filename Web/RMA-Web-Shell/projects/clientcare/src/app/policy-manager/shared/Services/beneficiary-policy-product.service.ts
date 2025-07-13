import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BeneficiaryPolicyProduct } from '../entities/beneficiary-policy-product';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

@Injectable()
export class BeneficiaryPolicyProductService {


    private apiBeneficiaryPolicyProduct = 'clc/api/Policy/BeneficiaryPolicyProduct';

    constructor(private readonly commonService: CommonService) {
    }

    getBeneficiaryPolicyProductsByPolicy(policyId: number): Observable<BeneficiaryPolicyProduct[]> {
        return this.commonService.get<BeneficiaryPolicyProduct[]>(policyId, `${this.apiBeneficiaryPolicyProduct}`);
    }

    getBeneficiaryPolicyProductsByBeneficiary(beneficiaryId: number): Observable<BeneficiaryPolicyProduct[]> {
        return this.commonService.get<BeneficiaryPolicyProduct[]>(beneficiaryId, `${this.apiBeneficiaryPolicyProduct}/ByBeneficiary`);
    }

    addBeneficiaryPolicyProducts(beneficiaryPolicyProducts: BeneficiaryPolicyProduct[]): Observable<number> {
        return this.commonService.addMultiple<BeneficiaryPolicyProduct>(beneficiaryPolicyProducts, `${this.apiBeneficiaryPolicyProduct}`);
    }

    editBeneficiaryPolicyProducts(beneficiaryPolicyProducts: BeneficiaryPolicyProduct[]): Observable<boolean> {
        return this.commonService.editMultiple<BeneficiaryPolicyProduct>(beneficiaryPolicyProducts, `${this.apiBeneficiaryPolicyProduct}`);
    }
}
