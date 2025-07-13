import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { BaseSearchComponent } from 'projects/shared-components-lib/src/lib/base-search/base-search.component';
import { MatDialog } from '@angular/material/dialog';
import { Payment } from 'projects/fincare/src/app/payment-manager/models/payment.model';
import { PaymentDataSource } from 'projects/fincare/src/app/payment-manager/services/payment-list.datasource';
import { PaymentDialogComponent } from 'projects/fincare/src/app/payment-manager/views/payment-dialog/payment-dialog.component';
import { ToastrManager } from 'ng6-toastr-notifications';
import { SelectionModel } from '@angular/cdk/collections';
import { PaymentService } from 'projects/fincare/src/app/payment-manager/services/payment.service';
import { PaymentReversalNotesComponent } from '../payment-reversal-notes/payment-reversal-notes.component';
import { PaymentStatusEnum } from 'projects/fincare/src/app/shared/enum/payment-status-enum';

@Component({
  selector: 'app-payment-list-reversal',
  templateUrl: './payment-list-reversal.component.html', 
  styleUrls: ['./payment-list-reversal.component.css']
})
export class PaymentListReversalComponent extends BaseSearchComponent implements OnInit {

  selectedPaymentItemsCount: number;
  paymentsList: Payment[] = [];
  triggerRefresh : boolean;
  reversePaymentStatus : PaymentStatusEnum; 

  selection = new SelectionModel<PaymentDataSource>(true, []);
  constructor(
    dataSource: PaymentDataSource,
    formBuilder: UntypedFormBuilder,
    router: Router,
    public dialog: MatDialog,
    private readonly toastr: ToastrManager,
    private readonly service: PaymentService) {

    super(dataSource, formBuilder, router,
      '', // Redirect URL
      []); // Display Columns
  }  

  ngOnInit(): void {   
    this.reversePaymentStatus = PaymentStatusEnum.Reconciled;  
    this.refresh();
    this.createForm();
  }  

  refresh() : void{
    this.selectedPaymentItemsCount = 0; 
    this.paymentsList = [];
    this.triggerRefresh = !this.triggerRefresh;
  }

  setPayment($event: Payment[]) {   
    this.paymentsList = ($event as Payment[]); 
    this.openPaymentReverseDialog()  
  }

  isItemSelected() : boolean {
    return (this.selectedPaymentItemsCount == 0 || this.selectedPaymentItemsCount == null);
  }

  openPaymentReverseDialog(): void    {
    const row =  this.paymentsList[0];
    row.dialogQuestion = 'Are you sure you want to reverse this payment (Policy Number : ' + row.policyReference + ') ?';
   const dialogRef = this.dialog.open(PaymentDialogComponent, {
     width: '500px',
     data: { payment: row }
   });

   dialogRef.afterClosed().subscribe(payment => {
     if (payment == null) {
       return;
     }

     const noteDialogRef = this.dialog.open(PaymentReversalNotesComponent, {
       width: '1024px',
       data: { payment: payment }
     });

     noteDialogRef.afterClosed().subscribe(payment => {
       if (payment == null) {
         return;
       }

       this.service.reversePayment(row).subscribe(() => {
         this.toastr.successToastr('Payment reversal successfully.');
         this.refresh()
       });
     });
   });
 }

}
