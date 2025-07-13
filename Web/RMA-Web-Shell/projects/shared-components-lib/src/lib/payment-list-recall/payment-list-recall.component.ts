import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { BaseSearchComponent } from 'projects/shared-components-lib/src/lib/base-search/base-search.component';
import { MatDialog } from '@angular/material/dialog';
import { PaymentDataSource } from 'projects/fincare/src/app/payment-manager/services/payment-list.datasource';
import { PaymentDialogComponent } from 'projects/fincare/src/app/payment-manager/views/payment-dialog/payment-dialog.component';
import { ToastrManager } from 'ng6-toastr-notifications';
import { SelectionModel } from '@angular/cdk/collections';
import { PaymentService } from 'projects/fincare/src/app/payment-manager/services/payment.service';
import { PaymentRecallNotesComponent } from '../payment-recall-notes/payment-recall-notes.component';
import { PaymentStatusEnum } from 'projects/fincare/src/app/shared/enum/payment-status-enum';
import { Payment } from 'projects/fincare/src/app/shared/models/payment.model';
import { DatePipe } from '@angular/common';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';

@Component({
  selector: 'app-payment-list-recall',
  templateUrl: './payment-list-recall.component.html',
  styleUrls: ['./payment-list-recall.component.css']
})
export class PaymentListRecallComponent extends BaseSearchComponent implements OnInit {

  selectedPaymentItemsCount: number;
  paymentsList: Payment[] = [];
  triggerRefresh : boolean;
  recallPaymentStatus : PaymentStatusEnum; 
  @Input() paymentTypeFilter: PaymentTypeEnum[] = this.ToArray(PaymentTypeEnum);
  morningCutOffTime: string;
  afternoonOpenTime: string;
  selection = new SelectionModel<PaymentDataSource>(true, []);
  constructor(
    dataSource: PaymentDataSource,
    formBuilder: UntypedFormBuilder,
    router: Router,
    public dialog: MatDialog,
    public datePipe: DatePipe,
    private readonly lookupService: LookupService,
    private readonly toastr: ToastrManager,
    private readonly service: PaymentService) {

    super(dataSource, formBuilder, router,
      '', // Redirect URL
      []); // Display Columns
  }  

  ngOnInit(): void {  
    this.recallPaymentStatus = PaymentStatusEnum.Pending;   
    this.refresh();
    this.createForm();
  }

  disableRecallFunction(): boolean { 
    const now = new Date();
    let currentTime = this.datePipe.transform(now, 'HH:mm:ss');
    if (currentTime >= this.morningCutOffTime && currentTime <= this.afternoonOpenTime) {
      return true;
    }else{
      return false;
    }
  }
  
  public recallSelectedPayment() {
    
    const row = new Payment();
    row.dialogQuestion = 'Are you sure you want to recall selected payments?';
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '300px',
      data: { payment: row }
    });

    dialogRef.afterClosed().subscribe(payment => {
      if (payment == null) {
        return;
      }      
      
      const noteDialogRef = this.dialog.open(PaymentRecallNotesComponent, {
        width: '1024px',
        data: { payments: this.paymentsList }
      });

      noteDialogRef.afterClosed().subscribe(payment => {
        if (payment == null) {
          return;
        }
        
        var response = this.service.recallMultiplePayments(this.paymentsList).subscribe(() => {
          this.toastr.successToastr('Payment recalled successfuly.'); 
          this.refresh()
        });
      });
    });
  }

  refresh() : void{
    this.selectedPaymentItemsCount = 0; 
    this.paymentsList = [];
    this.triggerRefresh = !this.triggerRefresh;
    this.lookupService.getItemByKey('PaymentRecallCutOffStartTime').subscribe(startTime => {
      this.morningCutOffTime = startTime;
    });
    this.lookupService.getItemByKey('PaymentRecallCutOffEndTime').subscribe(endTime => {
      this.afternoonOpenTime = endTime;
    })
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
        .filter(StringIsNumber)
        .map(key => anyEnum[key]);
 }

  setPayment($event: Payment[]) {
    this.selectedPaymentItemsCount = $event && $event.length > 0 ? $event.length : 0; 
    this.paymentsList = ($event as Payment[]);   
  }

  isItemSelected() : boolean {
    return (this.selectedPaymentItemsCount == 0 || this.selectedPaymentItemsCount == null);
  }
}
