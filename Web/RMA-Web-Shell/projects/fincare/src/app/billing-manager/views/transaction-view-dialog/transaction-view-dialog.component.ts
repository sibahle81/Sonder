import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TransactionTypeEnum } from '../../../shared/enum/transactionTypeEnum';
import { Transaction } from '../../models/transaction';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { InvoiceAllocation } from '../../../shared/models/invoice-allocation';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { BehaviorSubject } from 'rxjs';
import 'src/app/shared/extensions/date.extensions';
import 'src/app/shared/extensions/string.extensions';
import { DebitTransactionAllocation } from '../../../shared/models/debit-transaction-allocation';
@Component({
  selector: 'app-transaction-view-dialog',
  templateUrl: './transaction-view-dialog.component.html',
  styleUrls: ['./transaction-view-dialog.component.css']
})
export class TransactionViewDialogComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  linkedTransactionsDataSource$: BehaviorSubject<Transaction[]> = new BehaviorSubject([]);
  invoiceAllocationsDataSource$: BehaviorSubject<InvoiceAllocation[]> = new BehaviorSubject([]);
  debitAllocationsDataSource$: BehaviorSubject<DebitTransactionAllocation[]> = new BehaviorSubject([]);
  invoiceAllocationDisplayColumns = ['transactionType', 'documentNumber', 'amount', 'createdDate', 'createdBy', 'modifiedBy', 'modifiedDate', 'isDeleted', 'actions'];
  linkedTransactionDisplayColumns = ['transactionType', 'documentNumber', 'amount', 'transactionDate', 'createdDate', 'createdBy', 'modifiedBy', 'modifiedDate'];
  debitAllocationDisplayColumns = ['transactionType', 'amount', 'createdDate', 'createdBy', 'modifiedBy', 'modifiedDate'];

  dialogData: Transaction;

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly confirmService: ConfirmationDialogsService,
    private readonly toastr: ToastrManager,
    public dialogRef: MatDialogRef<TransactionViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Transaction) {
    this.dialogData = data;
  }

  ngOnInit() {
    this.invoiceAllocationsDataSource$.next(this.dialogData.transaction.invoiceAllocations);
    this.linkedTransactionsDataSource$.next(this.dialogData.transaction.linkedTransactions);
    this.debitAllocationsDataSource$.next(this.dialogData.transaction.debitTransactionAllocations);
    this.isLoading$.next(false);
  }

  getTransactionTypeDesc(id: TransactionTypeEnum): string {
    return TransactionTypeEnum[id];
  }

  checkIfAllocationReversed(isDeleted: boolean): string {
    const result = isDeleted ? 'Yes' : 'No';
    return result;
  }

  getDocumentNumber(tran: Transaction): string {
    switch (tran.transactionType) {
      case TransactionTypeEnum.Payment:
      case TransactionTypeEnum.CreditNote:
        if (tran.rmaReference && tran.rmaReference !== String.Empty) {
          return tran.rmaReference;
        } else {
          return tran.bankReference;
        }

      default:
        if (tran.rmaReference && tran.rmaReference !== String.Empty) {
          return tran.rmaReference;
        } else {
          return tran.bankReference;
        }
    }
  }

  reverseAllocation($event: InvoiceAllocation) {
    if ($event.isDeleted) {
      this.toastr.errorToastr('Invoice allocation is already reversed');
      return;
    }

    this.confirmService.confirmWithoutContainer('Reverse allocation', `Please confirm invoice allocation reversal of R ${$event.amount}`, 'Center', 'Center', 'OK', 'Cancel').subscribe(dialogResult => {
      if (dialogResult) {
        const index = this.data.transaction.invoiceAllocations.indexOf($event);
        if (index > -1) {
          this.invoiceService.reverseAllocation($event).subscribe(() => {
            this.toastr.successToastr('Invoice allocation reversed');
            $event.isDeleted = true;
            this.dialogRef.close($event);
          });
        }
      }
    });
  }
}
