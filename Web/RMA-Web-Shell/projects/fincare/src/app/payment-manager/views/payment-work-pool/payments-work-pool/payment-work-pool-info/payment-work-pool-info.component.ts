import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject } from 'rxjs';
import { Payment } from '../../../../models/payment.model';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PaymentsWorkPoolComponent } from '../payments-work-pool.component';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';
import { PaymentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/payment-status-enum';

@Component({
  selector: 'app-payment-work-pool-info',
  templateUrl: './payment-work-pool-info.component.html',
  styleUrls: ['./payment-work-pool-info.component.css']
})
export class PaymentWorkPoolInfoComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
 
  payment :Payment;
  isMedicalInvoice = false;
  isPension = false;
  isRejected = false;
  constructor(
    private readonly datePipeService: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PaymentsWorkPoolComponent>,
  ) {  
    this.payment = this.data.payment;
  }

  ngOnInit(): void {
  this.getInitialData();
}
  getInitialData() {
    if(this.payment.paymentType == PaymentTypeEnum.MedicalInvoice){
      this.isMedicalInvoice = true;
    }
    if(this.payment.paymentType == PaymentTypeEnum.Pension){
      this.isPension = true;
    }
    if(this.payment.paymentStatus == PaymentStatusEnum.Rejected){
      this.isRejected = true;
    }
  }

 
  cancel() {
    this.dialogRef.close(null);
  }
}
