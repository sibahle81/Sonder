import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';
import { UnclaimedBenefitInterest } from '../claim-manager/shared/entities/unclaimedBenefit/unclaimedBenefitInterest';

@Injectable({
  providedIn: 'root'
})
export class UnclaimedBenefitManagerService {

  private claimUrl = 'clm/api/UnclaimedBenefit';
  private getAllUnclaimendBenefitUrl = 'GetAllUnclaimedBenefitInterest';

  constructor(private readonly commonService: CommonService) {}

    public GetAllUnclaimendBenefitInterests(): Observable<UnclaimedBenefitInterest[]>  {
      return this.commonService.getAll<UnclaimedBenefitInterest[]>(`${this.claimUrl}/${this.getAllUnclaimendBenefitUrl}`);
    }
}
