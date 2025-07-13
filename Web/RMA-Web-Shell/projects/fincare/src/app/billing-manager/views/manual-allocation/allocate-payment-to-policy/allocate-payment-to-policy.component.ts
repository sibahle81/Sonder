import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Observable, observable, of } from 'rxjs';
import { getDate } from 'date-fns';
import { BillingService } from '../../../services/billing.service';
import { tap } from 'rxjs/operators';
import { FormArray, FormBuilder, FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { MatRadioChange } from '@angular/material/radio';
import { AllocatePolicyPayment } from '../../../models/allocate-policy-payment';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UnallocatedBankImportPayment } from 'projects/fincare/src/app/billing-manager/models/unallocatedBankImportPayment';
import { MatDialog } from '@angular/material/dialog';
import { PolicyPaymentListDialogComponent } from '../policy-payment-list-dialog/policy-payment-list-dialog.component';
import { PolicyBilling } from '../../../models/policy-billing';
import { PolicyBillingTransaction } from '../../../models/policy-billing-transactions';

@Component({
  selector: 'allocate-payment-to-policy',
  templateUrl: './allocate-payment-to-policy.component.html',
  styleUrls: ['./allocate-payment-to-policy.component.css']
})
export class AllocatePaymentToPolicyComponent implements OnInit {

  @Input() rolePlayerId: number = 0;
  @Input() allocationType: string = '';
  @Input() payementId: number = 0;
  @Input() paymentTransaction: UnallocatedBankImportPayment = null;
  @Output() onPaymentAllocated = new EventEmitter<boolean>();

  isLoading$ = new BehaviorSubject(false);
  policyBillingTransaction$ = new Observable<PolicyBillingTransaction[]>;
  datasource: PolicyBillingTransaction[] = [];
  policies: PolicyBillingTransaction[] = [];
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[] = ['select', 'policyNumber', 'billingDate', 'billingAmount', 'allocatedAmount', 'unAllocatedBalance', 'paymentToAllocate', 'actions'];
  toDate: Date | null = null;
  readonly startDate = moment(new Date()).add(-12, 'months');

  form: FormGroup;
  billingDate: string;
  isPolicyAllocationFromDebtor: boolean = true;
  paymentAllocationType: string = '';
  paymentsToAllocateFormArry: FormArray;
  constructor(
    private billingService: BillingService,
    private readonly formbuilder: FormBuilder,
    private authService: AuthService,
    private readonly toastr: ToastrManager,
    public dialog: MatDialog,) { }

  ngOnInit(): void {
    const today = new Date();
    this.createForm();
    this.form.controls['billingMonth'].valueChanges.subscribe((date: Date) => {
      this.billingDate = moment(date).format('yyyy-MM-DD');
      this.getPoliciesToAllocatePayment(this.rolePlayerId, this.billingDate);
    }
    )
  }

  getPoliciesToAllocatePayment(rolePlayerId: number, billingDate: string) {
    this.isLoading$.next(true);
    return this.billingService.getEmployerPoliciesByRoleplayerId(rolePlayerId, billingDate).pipe(tap((data) => {
      this.isLoading$.next(false);
      if (data && data.length > 0) {

        this.policies = [...data];
        this.datasource = data;
        this.paymentsToAllocateFormArry = new FormArray(
          this.datasource.map(
            (x: any) =>
              new FormGroup({
                amountToAllocate: new FormControl({ value: x.amountToAllocate === null ? 0 : x.amountToAllocate, disabled: true }, Validators.min(1)),
                isSelected: new FormControl(x.isSelected == 'yes' ? true : false),
              })
          )
        )
        this.policyBillingTransaction$ = of(this.policies);
      } else {
        this.policies = [];
        this.datasource = [];
      }
    }, err => {
      this.isLoading$.next(false);
      this.toastr.errorToastr('Unable to fetch invoices..' + err.err.Error);
    })).subscribe();
  }

  createForm() {
    this.form = this.formbuilder.group({
      billingMonth: [null, Validators.required],
    });
  }

  fromDateFilter = (date: Date): boolean => {
    return !this.toDate || date <= this.toDate;
  }

  allocate(): void {
    const currentUser = this.authService.getCurrentUser();
    if (this.paymentsToAllocateFormArry.value === null || this.paymentsToAllocateFormArry.value.length === 0) {
      return;
    }
    let policiesToAllocatePayment: PolicyBilling[] = [];
    let index = 0;
    this.paymentsToAllocateFormArry.value.forEach(element => {
      const value = element.amountToAllocate;
      const isSelected = element.isSelected;
      if (isSelected && (value !== ' ' && value > 0)) {
        const policy = this.policies[index];
        const policyToAllocate = new PolicyBilling();
        policyToAllocate.billingAmount = value;
        policyToAllocate.billingDate = policy.billingDate;
        policyToAllocate.policyId = policy.policyId;
        policiesToAllocatePayment.push(policyToAllocate);
      }
      index++;
    });

    if (!this.canAllocatePayment(policiesToAllocatePayment)) {
      return;
    }
    let allocatePaymentInput = new AllocatePolicyPayment();
    allocatePaymentInput.fromPaymentTransactionId = this.payementId;
    allocatePaymentInput.policyBillings = policiesToAllocatePayment;
    this.isLoading$.next(true);
    this.billingService.allocatePaymentToPolicy(allocatePaymentInput).subscribe((data) => {
      this.isLoading$.next(false);
      if (data) {
        this.toastr.successToastr('Payment(s) allocated successfully...');
        this.refreshScreen();
      } else {
        this.toastr.errorToastr('Payment allocation(s) Failed...');
      }

    }, err => {
      this.isLoading$.next(false);
      this.toastr.errorToastr('Payment allocation(s) Failed...' + err.error.Error);
    })
  }

  refreshScreen(): void {
    this.onPaymentAllocated.emit(true);
    this.paymentsToAllocateFormArry.reset();
    this.getPoliciesToAllocatePayment(this.rolePlayerId, this.billingDate);
  }

  onAllocationTypeChange(event: MatRadioChange): void {
    this.isPolicyAllocationFromDebtor = event.value === 0;
  }

  get paymentsToAllocate() {
    return this.form.controls["paymentsToAllocate"] as FormArray;
  }

  getControl(index: number, controlName: string): FormControl {
    return (this.paymentsToAllocateFormArry.at(index) as FormGroup).get(controlName) as FormControl;
  }

  isSelected(index: number): boolean {
    if (this.paymentsToAllocateFormArry.value === null || this.paymentsToAllocateFormArry.value.length === 0) {
      return false;
    }
    return this.paymentsToAllocateFormArry[index].isSelected;
  }

  canAllocatePayment(transactions: PolicyBilling[]): boolean {

    if (!this.paymentsToAllocateFormArry.valid || !this.form.valid) {
      this.toastr.warningToastr('Invalid input..');
      return false;
    }
    if (transactions === null || transactions.length == 0) {
      this.toastr.warningToastr('No payment transactions to allocate');
      return false;
    }
    if (this.paymentTransaction === null) {
      this.toastr.warningToastr('Invalid payment transaction');
      return false;
    }
    if (this.paymentTransaction.unallocatedAmount > -1) {
      this.toastr.warningToastr('Insufficient funds...');
      return false;
    }
    let totalPaymentToAllocate = 0;
    transactions.forEach(tx => {
      totalPaymentToAllocate += tx.billingAmount
    })
    if (this.paymentTransaction.unallocatedAmount > - totalPaymentToAllocate) {
      this.toastr.warningToastr('Total payment to allocate cannot be greater than unallocated statement amount.');
      return false;
    }
    return true;
  }

  isPolicySelected(i: number): boolean {
    return true;
  }

  onCheckboxChange($event, i): void {

    if ($event === undefined || i === undefined) {
      return;
    }
    if ($event.checked) {
      this.getControl(i, 'amountToAllocate').enable();
    } else {
      this.getControl(i, 'amountToAllocate').disable();
    }
  }

  openPaymentTransactionViewDialog(policy: PolicyBillingTransaction): void {
    if (policy === null) {
      return;
    }
    if (policy.paymentAllocations === null || policy.paymentAllocations.length === 0) {
      this.toastr.warningToastr(`Policy ${policy.policyNumber} does not have payment transactions.`);
      return;
    }
    const dialogRef = this.dialog.open(PolicyPaymentListDialogComponent, {
      width: '70%',
      disableClose: true,
      data: {
        policyTransactions: policy
      }
    });

    dialogRef.afterClosed().subscribe(reversed => {
      if (reversed) {
        this.refreshScreen();
      }
    });
  }

}
