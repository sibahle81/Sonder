import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';

@Component({
  templateUrl: './referral-context-search-dialog.component.html',
  styleUrls: ['./referral-context-search-dialog.component.css']
})
export class ReferralContextSearchDialogComponent {

  lead = ReferralItemTypeEnum.Lead;
  quote = ReferralItemTypeEnum.Quote;
  member = ReferralItemTypeEnum.Member;
  policy = ReferralItemTypeEnum.Policy;
  personEvent = ReferralItemTypeEnum.PersonEvent;
  claim = ReferralItemTypeEnum.Claim;
  debtor = ReferralItemTypeEnum.Debtor;
  payment = ReferralItemTypeEnum.Payment;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ReferralContextSearchDialogComponent>
  ) { }

  setReferralItem($event: any) {
    switch (this.data.referral.referralItemType) {
      case ReferralItemTypeEnum.Lead:
        this.data.referral.itemId = $event.leadId;
        this.data.referral.linkUrl = `/clientcare/lead-manager/lead-view/${this.data.referral.itemId}`;
        this.data.referral.referralItemTypeReference = '('+ $event.code + ') ' + $event.displayName;
        break;

      case ReferralItemTypeEnum.Quote:
        this.data.referral.itemId = $event.quoteId;
        this.data.referral.linkUrl = `/clientcare/quote-manager/quote-view/${this.data.referral.itemId}`;
        this.data.referral.referralItemTypeReference = $event.quotationNumber;
        break;

      case ReferralItemTypeEnum.Member:
        this.data.referral.itemId = $event.rolePlayerId;
        this.data.referral.linkUrl = `/clientcare/member-manager/member-wholistic-view/${this.data.referral.itemId}`;
        this.data.referral.referralItemTypeReference = $event.finPayee ? '('+ $event.finPayee.finPayeNumber + ') ' + $event.displayName : $event.displayName;
        break;

      case ReferralItemTypeEnum.Policy:
        this.data.referral.itemId = $event.policyId;
        this.data.referral.linkUrl = `/clientcare/member-manager/member-wholistic-view/${$event.policyOwnerId}/1/${this.data.referral.itemId}`;
        this.data.referral.referralItemTypeReference = $event.policyNumber;
        break;

      case ReferralItemTypeEnum.PersonEvent:
        this.data.referral.itemId = $event.personEventId;
        this.data.referral.linkUrl = `/claimcare/claim-manager/holistic-claim-view/${$event.eventId}/${$event.personEventId}`;
        this.data.referral.referralItemTypeReference = $event.personEventReferenceNumber;
        break;

      case ReferralItemTypeEnum.Claim:
        this.data.referral.referralItemType = ReferralItemTypeEnum.PersonEvent;
        this.data.referral.itemId = $event.personEventId;
        this.data.referral.linkUrl = `/claimcare/claim-manager/holistic-claim-view/${$event.eventId}/${$event.personEventId}`;
        this.data.referral.referralItemTypeReference = $event.claimReferenceNumber ? $event.claimReferenceNumber : $event.personEventReferenceNumber ? $event.personEventReferenceNumber : $event.eventReferenceNumber;
        break;

      case ReferralItemTypeEnum.Debtor:
        this.data.referral.itemId = $event.rolePlayerId;
        this.data.referral.linkUrl = `/fincare/billing-manager/view-debtor-transaction-history/${ $event.rolePlayerId}`;
        this.data.referral.referralItemTypeReference = $event.finPayee ? '('+ $event.finPayee.finPayeNumber + ') ' + $event.displayName : $event.displayName;;
        break;

      case ReferralItemTypeEnum.Payment:
        this.data.referral.itemId = $event.paymentId;
        this.data.referral.linkUrl = null;
        this.data.referral.referralItemTypeReference = null;
        break;

      // ADD YOUR NEW CONTEXTS HERE...

      default:
        this.data.referral.linkUrl = null;
        break;
    }

    this.dialogRef.close(this.data.referral);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
