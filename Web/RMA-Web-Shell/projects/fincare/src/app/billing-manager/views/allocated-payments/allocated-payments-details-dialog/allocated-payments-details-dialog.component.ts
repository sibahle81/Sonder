import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-allocated-payments-details-dialog',
  templateUrl: './allocated-payments-details-dialog.component.html',
  styleUrls: ['./allocated-payments-details-dialog.component.css']
})
export class AllocatedPaymentsDetailsDialogComponent implements OnInit {chartIsNo: string;
  debtorName: string;
  transactionType: string;
  transactionDate: Date;
  statementDate: Date;
  hyphenDateProcessed: Date;
  hyphenDateReceived: Date;
  allocationDate: Date;
  productCategory: string;
  constructor(public dialogRef: MatDialogRef<AllocatedPaymentsDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    if (data.item) {
      this.debtorName = data.item.debtorName;
      this.transactionType = data.item.transactionType;
      this.transactionDate = data.item.transactionDate;
      this.statementDate = data.item.statementDate;
      this.hyphenDateProcessed = data.item.hyphenDateProcessed;
      this.hyphenDateReceived = data.item.hyphenDateReceived;
      this.allocationDate = data.item.allocationDate;
      this.productCategory = data.item.productCategory
    }
  }

  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close();
  }
}