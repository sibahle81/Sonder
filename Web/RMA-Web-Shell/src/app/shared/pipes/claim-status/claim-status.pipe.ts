import { Pipe, PipeTransform } from '@angular/core';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';

@Pipe({
  name: 'claimStatus'
})
export class ClaimStatusPipe implements PipeTransform {

  transform(value: number, args?: any): string {
    switch (value) {
      case ClaimStatusEnum.New:
        return 'New';
      case ClaimStatusEnum.Received:
        return 'New';
      case ClaimStatusEnum.PendingRequirements:
        return 'Pending';
      case ClaimStatusEnum.AwaitingDecision:
        return 'Pending';
      case ClaimStatusEnum.PendingPolicyAdmin:
        return 'Pending';
      case ClaimStatusEnum.Closed:
        return 'Closed';
      case ClaimStatusEnum.Cancelled:
        return 'Declined';
      case ClaimStatusEnum.AwaitingReversalDecision:
        return 'Reversed';
      case ClaimStatusEnum.Paid:
        return 'Paid';
      case ClaimStatusEnum.Declined:
        return 'Declined';
      case ClaimStatusEnum.PendingInvestigations:
        return 'Pending';
      case ClaimStatusEnum.InvestigationCompleted:
        return 'Pending';
      case ClaimStatusEnum.Approved:
        return 'Approved';
      case ClaimStatusEnum.Authorised:
        return 'Authorised';
      case ClaimStatusEnum.Reopened:
        return 'Re-opened';
      case ClaimStatusEnum.ExGratia:
        return 'Re-opened';
      case ClaimStatusEnum.ExGratiaApproved:
        return 'Ex-Gratia Approved';
      case ClaimStatusEnum.ExGratiaAuthorised:
        return 'Ex-Gratia Authorised';
      case ClaimStatusEnum.NoClaim:
        return 'Declined';
      case ClaimStatusEnum.Unclaimed:
        return 'Unclaimed Benefit';
      case ClaimStatusEnum.ReturnToAssessor:
        return 'Pending';
      case ClaimStatusEnum.Waived:
        return 'Pending';
      case ClaimStatusEnum.Unpaid:
        return 'Unpaid';
      case ClaimStatusEnum.PolicyAdminCompleted:
        return 'Pending';
      case ClaimStatusEnum.PaymentRecovery:
        return 'Payment Recovery';
      case ClaimStatusEnum.AwaitingDeclineDecision:
        return 'Awaiting Decline Desision';
      case ClaimStatusEnum.ReturnToAssessorAfterDeclined:
        return 'Declined';
      case ClaimStatusEnum.Reversed:
        return 'Pending';
      case ClaimStatusEnum.ReversalRejected:
        return 'Reversed';
      case ClaimStatusEnum.Repay:
        return 'Pending';
      case ClaimStatusEnum.PaymentRecovered:
        return 'Payment Recovered';
      case ClaimStatusEnum.PaymentLoss:
        return 'Payment Loss';
      case ClaimStatusEnum.Tracing:
        return 'Tracing';
      case ClaimStatusEnum.Submitted:
        return 'New';
      case ClaimStatusEnum.PendingAcknowledgement:
        return 'Pending';
      case ClaimStatusEnum.PendingRequirements:
        return 'Pending';
      case ClaimStatusEnum.AutoAcknowledged:
        return 'Acknowledged';
      case ClaimStatusEnum.Finalized:
        return 'Closed';
      case ClaimStatusEnum.ClaimClosed:
        return 'Closed';
      default:
        break;
    }
  }
}
