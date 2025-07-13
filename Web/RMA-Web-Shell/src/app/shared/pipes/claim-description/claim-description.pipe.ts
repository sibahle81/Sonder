import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'claimDescriptionPipe'
})
export class ClaimDescriptionPipe implements PipeTransform {

  transform(value: string, claimReason: string): any {
    const claimStatus = (value) ? value.toLowerCase() : '';
    const reason = (claimReason) ? claimReason.toLowerCase() : '' ;
    switch (claimStatus) {
      case 'new':
        if (reason === 'not fraudulent') {
          return 'Claim Investigated and not found to be fraudulent';
        } else {
          return reason === 'new'
          ? 'Claim captured, and no requirements received yet'
          : 'Documents was attached and indexed';
        }
        break;
      case 'pending':
        if (reason === 'unclaimed') {
          return 'Claim followed the follow up process and benefits are still unclaimed';
        }

        if (reason === 'pending requirements') {
          return 'Partial requirements were received and there are still outstanding requirements, the claim will be placed in a pending status.';
        }

        if (reason === 'pending policy admin') {
          return 'Information sent to the policy admin department for policy maintenance.';
        }

        if (reason === 'waived') {
          return 'Requirements were called for and the assessor wants to waive the requirement (if not required anymore)';
        }

        if (reason === 'pending investigations') {
          return 'Claim was referred to Forensics';
        }

        if (reason === 'investigations completed') { 
          return 'Claim received back from investigations with decision.';
        }

        if (reason === 'awaiting decision') {
          return 'All documentation / requirements received.';
        }

        if (reason === 'return to assessor') {
          return '2nd Authoriser has declined authorization.';
        }
        break;

      case 'closed':
        if (reason === 'fraudulent case') {
          return 'Fraudulent Case';
        } else {
          return 'Follow up process followed, and no documents received, then the claim should be closed.';
        }

      case 'declined':
        return 'Claim declined by Assessor.';

      case 'approved':
        return 'Claim approved by Assessor.';

      case 'authorized':
        return 'Claim authorized for payment by 2nd approver.';

      case 're-opened':
        if (reason === 're-opened') {
          return 'Re-opening a closed claim for finalization.';
        }

        if (reason === 'ex-Gratia') {
          return 'Claim decision overturned by RMA to pay claim.';
        }

        if (reason === 'ex-Gratia approved') {
          return 'Claim approved by Assessor.';
        }
        break;

     case 'paid':
        return 'Claim paid by finance.';
      default:
        break;
    }
  }
}
