import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BeneficiaryBankDetail } from './beneficiary-bank-detail.model';

@Injectable()
export class BeneficiaryBankingDetailService {
  private apiUrl = 'clc/api/Policy/Beneficiary';
  constructor(
    private readonly commonService: CommonService) {
  }

  GetBeneficiariesAndBankingDetails(policyId: number): Observable<BeneficiaryBankDetail[]> {
    return this.commonService.get<BeneficiaryBankDetail[]>(policyId, `${this.apiUrl}/GetBeneficiaryAndBankingDetail`);
  }
}
