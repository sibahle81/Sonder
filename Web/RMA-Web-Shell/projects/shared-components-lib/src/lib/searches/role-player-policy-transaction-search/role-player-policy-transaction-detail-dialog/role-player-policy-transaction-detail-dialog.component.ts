import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RolePlayerPolicyTransaction } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-transaction';
import { CategoryInsuredEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/categoryInsuredEnum';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';

@Component({
  templateUrl: './role-player-policy-transaction-detail-dialog.component.html'
})
export class RolePlayerPolicyTransactionDetailDialogComponent {

  rolePlayerPolicyTransaction: RolePlayerPolicyTransaction;

  constructor(
    private readonly datePipe: DatePipe,
    public dialogRef: MatDialogRef<RolePlayerPolicyTransactionDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.rolePlayerPolicyTransaction = data.rolePlayerPolicyTransaction ? data.rolePlayerPolicyTransaction : null;
  }

  cancel() {
    this.dialogRef.close();
  }

  calculateDays(startDate: Date, endDate: Date): number {
    if (!startDate || !endDate) { return; }

    const date1 = new Date(this.datePipe.transform(new Date(startDate), 'yyyy-MM-dd'));
    const date2 = new Date(this.datePipe.transform(new Date(endDate), 'yyyy-MM-dd'));

    var diff = date2.getTime() - date1.getTime();
    return diff > 0 ? (Math.ceil(diff / (1000 * 3600 * 24))) : 0;
  }

  getTransactionType(transactionType: TransactionTypeEnum): string {
    return this.formatLookup(TransactionTypeEnum[+transactionType]);
  }

  getCategoryInsuredName(categoryInsured: CategoryInsuredEnum): string {
    return this.formatLookup(CategoryInsuredEnum[categoryInsured]);
  }

  formatLookup(lookup: string): string {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  formatMoney(value: string): string {
    return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }
}
