import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { BillingService } from '../../../services/billing.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { BehaviorSubject } from 'rxjs';
import { PolicyPaymentAllocation } from '../../../models/policy-payment-allocation';
import { ReversePolicyPaymentRequest } from '../../../models/reverse-policy-payment-request';
import { BillingAllocationTypeEnum } from 'projects/fincare/src/app/shared/enum/billing-allocation-type.enum';

@Component({
  selector: 'policy-payment-list',
  templateUrl: './policy-payment-list.component.html',
  styleUrls: ['./policy-payment-list.component.css']
})

export class PolicyPaymentListComponent implements OnInit {
  @Input() paymentTrasanctions: PolicyPaymentAllocation[] = []
  @Output() onBusyProcessing = new EventEmitter<boolean>();
  @Output() onPaymentReversed = new EventEmitter<boolean>();
  isLoading$ = new BehaviorSubject(false);
  displayedColumns: string[] = ['select', 'createdDate', 'createdBy', 'amount', 'transactionType', 'reason'];
  paymentTransactionFormArry: FormArray;
  constructor(
    private billingService: BillingService,
    private readonly toastr: ToastrManager,
  ) { }

  ngOnInit(): void {
    this.paymentTransactionFormArry = new FormArray(
      this.paymentTrasanctions.map(
        (x: any) =>
          new FormGroup({
            isSelected: new FormControl({ value: x.isSelected === 'yes' ? true : false, disabled: this.disblePaymentReversal(x) }),
          })
      ))
  }

  getControl(index: number, controlName: string): FormControl {
    return (this.paymentTransactionFormArry.at(index) as FormGroup).get(controlName) as FormControl;
  }

  reversePayment(): void {
    let input = new ReversePolicyPaymentRequest()
    if (this.paymentTransactionFormArry.value === null || this.paymentTransactionFormArry.value.length === 0) {
      return;
    }
    let paymentIdsToReverse: number[] = [];
    let index = 0;
    this.paymentTransactionFormArry.controls.forEach(element => {
      const isSelected = element.get('isSelected');
      if (isSelected.value) {
        const payment = this.paymentTrasanctions[index];
        paymentIdsToReverse.push(payment.id);
      }
      index++;

    });
    if (paymentIdsToReverse.length === 0) {
      this.toastr.warningToastr('Please select a payment to reverse.');
      return;
    }
    input.paymentIds = paymentIdsToReverse;
    this.isLoading$.next(true);
    this.onBusyProcessing.emit(true);
    this.billingService.reversePayments(input).subscribe(r => {
      this.isLoading$.next(false);
      this.onBusyProcessing.emit(false);
      if (r) {
        this.onPaymentReversed.emit(true);
      }

    }, err => {
      this.isLoading$.next(false);
      this.onBusyProcessing.emit(false);
      this.toastr.errorToastr('Payment allocation(s) Failed...' + err.error.Error);
    });


  }

  disblePaymentReversal(payment: PolicyPaymentAllocation): boolean {
    return payment.isDeleted || payment.transactionTypeLinkId === 1;
  }

  mapBillingAllocationType(billingAllocationType: BillingAllocationTypeEnum): string {

    return this.formatLookup(BillingAllocationTypeEnum[+billingAllocationType]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');

  }
}
