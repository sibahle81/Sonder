import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';

@Component({
  templateUrl: './beneficiary-bank-account-dialog.component.html'
})
export class BeneficiaryBankAccountDialogComponent {

  selectedBeneficiary: RolePlayer;

  constructor(
    public dialogRef: MatDialogRef<BeneficiaryBankAccountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.selectedBeneficiary = data.selectedBeneficiary ? data.selectedBeneficiary : null;
     }

  beneficiarySelected($event: RolePlayer) {
    this.selectedBeneficiary = $event;
  }

  setBankAccount($event: RolePlayerBankingDetail) {
    const result = {
      payeeRolePlayer: this.selectedBeneficiary,
      payeeRolePlayerBankingDetail: $event
    };

    this.dialogRef.close(result);
  }


  cancel() {
    this.dialogRef.close();
  }
}
