import { Pipe, PipeTransform } from '@angular/core';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';

@Pipe({
  name: 'claimStatusDescription'
})
export class ClaimStatusDescriptionPipe implements PipeTransform {

  transform(value: number, args?: number): any {
    switch (value) {
      case ClaimStatusEnum.New:
      case ClaimStatusEnum.Submitted:
        return 'Claim notification captured and submitted';
      case ClaimStatusEnum.PendingRequirements:
        return 'Claim notification has been submitted and there is one or more documents missing';
      case ClaimStatusEnum.PendingAcknowledgement:
        return 'Claim is a Potential STP Claim, awaiting validations';
      case ClaimStatusEnum.AutoAcknowledged:
        if (args !== null && (args === ClaimLiabilityStatusEnum.LiabilityAccepted || args === ClaimLiabilityStatusEnum.Accepted)) {
          return 'STP Claim has passed all validations and it has been acknowledged';
        } else if (args !== null && (args === ClaimLiabilityStatusEnum.LiabilityNotAccepted || args === ClaimLiabilityStatusEnum.Declined)) {
          return 'STP Claim has passed all validations and it has been acknowledged';
        }
        break;
      case ClaimStatusEnum.Finalized:
        if (args !== null && (args === ClaimLiabilityStatusEnum.LiabilityAccepted || args === ClaimLiabilityStatusEnum.Accepted)) {
          return 'Claim has been auto-acknowledged and liability accepted';
        } else if (args !== null && args === ClaimLiabilityStatusEnum.OutstandingRequirements) {
          return 'Claim is closed because it has been pending for 28 days, and no related documents are received on day 28';
        }
        break;
      case ClaimStatusEnum.ClaimClosed:
        return 'STP Claim has passed all validations and it has been acknowledged. Claim type is "Notification Only"';
      default:
        break;
    }
  }

}
