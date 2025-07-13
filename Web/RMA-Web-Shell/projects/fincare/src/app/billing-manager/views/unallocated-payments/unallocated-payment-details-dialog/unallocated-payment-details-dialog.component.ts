import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Constants } from 'projects/shared-utilities-lib/src/lib/pipe-formats/constants';

@Component({
  selector: 'app-unallocated-payment-details-dialog',
  templateUrl: './unallocated-payment-details-dialog.component.html',
  styleUrls: ['./unallocated-payment-details-dialog.component.css']
})
export class UnallocatedPaymentDetailsDialogComponent implements OnInit {
  hyphenDateProcessed: Date;
  hyphenDateReceived: Date;
  status: string;
  controlNumber: string;
  controlName: string;
  branchNumber: string;
  branchName: string;
  amountFormat = Constants.amountFormat;
  constructor(public dialogRef: MatDialogRef<UnallocatedPaymentDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      if (data.item) {
        this.hyphenDateProcessed = data.item.hyphenDateProcessed;
        this.hyphenDateReceived = data.item.hyphenDateReceived;
        this.status = data.item.status;
        this.controlNumber = data.item.controlNumber;
        this.controlName = data.item.controlName;
        this.branchName = data.item.branchName;
        this.branchNumber = data.item.branchNumber;
      }
    }
  
    ngOnInit(): void {
    }
  
    cancel() {
      this.dialogRef.close();
    }
  }