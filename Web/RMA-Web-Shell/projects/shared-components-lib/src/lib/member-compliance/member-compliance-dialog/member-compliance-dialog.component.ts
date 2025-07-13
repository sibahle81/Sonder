import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DebtorStatusEnum } from 'projects/fincare/src/app/shared/enum/debtor-status.enum';

@Component({
  templateUrl: './member-compliance-dialog.component.html',
  styleUrls: ['./member-compliance-dialog.component.css']
})
export class MemberComplianceDialogComponent {

  showTermsApplication = false;
  termsArrangement = DebtorStatusEnum.TermsArrangement;

  constructor(
    public dialogRef: MatDialogRef<MemberComplianceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  getDebtorStatus(debtorStatus: DebtorStatusEnum): string {
    return this.formatLookup(DebtorStatusEnum[+debtorStatus]);
  }

  rolePlayerQualifiesForTermsArrangement(): boolean {
    if (this.data.complianceResult.debtorStatus == DebtorStatusEnum.TermsArrangement) {
      return false;
    }

    if(this.data.complianceResult.isBillingCompliant) {
      return false;
    }

    return true;
  }

  formatLookup(lookup: string): string {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  close(): void {
    if (this.showTermsApplication) {
      this.toggleTermsArrangement();
    } else {
      this.dialogRef.close(null);
    }
  }

  toggleTermsArrangement() {
    this.showTermsApplication = !this.showTermsApplication;
  }
}
