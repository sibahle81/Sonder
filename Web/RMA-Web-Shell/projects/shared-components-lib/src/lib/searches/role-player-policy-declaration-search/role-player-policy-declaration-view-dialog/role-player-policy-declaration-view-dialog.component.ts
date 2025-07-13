import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';

@Component({
  templateUrl: './role-player-policy-declaration-view-dialog.component.html'
})
export class RolePlayerPolicyDeclarationViewDialogComponent {

  policy: Policy;

  constructor(
    public dialogRef: MatDialogRef<RolePlayerPolicyDeclarationViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.policy = data.policy ? data.policy : null;
  }

  cancel() {
    this.dialogRef.close();
  }
}
