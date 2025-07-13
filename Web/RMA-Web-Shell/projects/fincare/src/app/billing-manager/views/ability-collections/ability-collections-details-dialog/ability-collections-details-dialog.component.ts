import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UnallocatedPaymentDetailsDialogComponent } from '../../unallocated-payments/unallocated-payment-details-dialog/unallocated-payment-details-dialog.component';

@Component({
  selector: 'app-ability-collections-details-dialog',
  templateUrl: './ability-collections-details-dialog.component.html',
  styleUrls: ['./ability-collections-details-dialog.component.css']
})
export class AbilityCollectionsDetailsDialogComponent implements OnInit {
  chartIsNo: string;
  chartIsName: string;
  chartBsNo: string;
  chartBsName: string;
  level1: string;
  level2: string;

  constructor(public dialogRef: MatDialogRef<AbilityCollectionsDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    if (data.item) {
      this.chartIsNo = data.item.chartIsNo;
      this.chartIsName = data.item.chartIsName;
      this.chartBsNo = data.item.chartBsNo;
      this.chartBsName = data.item.chartBsName;
      this.level1 = data.item.level1;
      this.level2 = data.item.level2;
    }
  }

  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close();
  }
}
