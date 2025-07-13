import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { ClaimTracerInvoice } from 'projects/clientcare/src/app/policy-manager/shared/entities/claim-tracer-invoice';
import { ClaimsCalculatedAmount } from 'projects/clientcare/src/app/policy-manager/shared/entities/claims-calculated-amount';
import { UnclaimedBenefitInvestmentResult } from 'projects/clientcare/src/app/policy-manager/shared/entities/UnclaimedBenefitInvestmentResult';

@Injectable({
  providedIn: 'root'
})
export class UnclaimBnefitsValuesService {

  private UnclaimedBenefitsApi = 'clm/api/claim';
  private unclaimedBenefitURL = 'clm/api/UnclaimedBenefit';

  constructor(
    private readonly commonService: CommonService
  ) { }

  GetUnclaimedBenefitByClaimId(claimId: number): Observable<ClaimTracerInvoice> {
    return this.commonService.get<ClaimTracerInvoice>(claimId, `${this.UnclaimedBenefitsApi}/GetUnclaimedBenefitValues`);
  }

  GetClaimsCalculatedAmountByClaimId(claimId: number): Observable<ClaimsCalculatedAmount> {
    return this.commonService.get<ClaimsCalculatedAmount>(claimId, `${this.UnclaimedBenefitsApi}/GetClaimsCalculatedAmountByClaimId`);
  }

  getUnclaimedBenefitInvestmentAmount(unclaimedBenefitAmount: number, startDate: any, endDate: any,
    investigationAmount: number, investigationFeeDate: any): Observable<UnclaimedBenefitInvestmentResult> {

    const unclaimedAmountParam = encodeURIComponent(unclaimedBenefitAmount.toString());
    const investigationAmountParam = encodeURIComponent(investigationAmount.toString());
    const investigationDateParam = encodeURIComponent(investigationFeeDate);
    const startDateParam = encodeURIComponent(startDate);
    const endDateParam = encodeURIComponent(endDate);

    const url = `${this.unclaimedBenefitURL}/GetUnclaimedBenefitAmout?unclaimedBenefitAmount=${unclaimedAmountParam}&startDate=${startDateParam}&endDate=${endDateParam}&investigationFeeAmount=${investigationAmountParam}&investigationDate=${investigationDateParam}`;

    return this.commonService.getAll<UnclaimedBenefitInvestmentResult>(url);

  }
}
