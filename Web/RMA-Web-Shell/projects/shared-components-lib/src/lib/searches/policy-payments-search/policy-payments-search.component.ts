import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Payment } from 'projects/fincare/src/app/shared/models/payment.model';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';
import { PolicyPaymentSearchDataSource } from './policy-payments-search.datasource';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { PaymentService } from 'projects/fincare/src/app/payment-manager/services/payment.service';
import { debounceTime } from 'rxjs/operators';
import { PaymentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/payment-status-enum';

@Component({
  selector: 'lib-policy-payments-search',
  templateUrl: './policy-payments-search.component.html',
  styleUrls: ['./policy-payments-search.component.css']
})
export class PolicyPaymentsSearchComponent extends PermissionHelper implements OnInit, OnChanges, OnDestroy {

  @Input() title = 'Search Payments';
  @Input() allowMultiple = false;
  @Input() policyId: number;
  @Input() triggerReset : boolean;
  @Output() paymentSelectedEmit = new EventEmitter<Payment[]>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: PolicyPaymentSearchDataSource;
  selectedPayments: Payment[];

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  form: any;

  searchTerm = '';
  selectedPayment: Payment;

  constructor(
      private readonly formBuilder: FormBuilder,
      private readonly paymantService: PaymentService
  ) {
      super();
      this.dataSource = new PolicyPaymentSearchDataSource(this.paymantService);
     
  }

  ngOnInit() {
      this.dataSource.policyId = this.policyId;  
      this.createForm();
      this.configureSearch();
      this.getData();
      this.isLoading$.next(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
      if (changes.triggerReset) {
          this.getData();
          this.selectedPayments = [];
      }
  }

  createForm(): void {
      if (this.form) { return; }
      this.form = this.formBuilder.group({
          //searchTerm: [{ value: null, disabled: false }]
      });
  }

  configureSearch() {
      this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
          this.search(response as string);
      });

      this.isLoading$.value
  }

  search(searchTerm: string) {
      this.searchTerm = searchTerm;
      if (!this.searchTerm || this.searchTerm === '') {
          this.getData();
      } else {
          this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
          this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
          this.getData();
      }
  }

  getData() {
      this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
  }

  paymentSelected(payment: Payment) {
      if (!this.selectedPayments) { this.selectedPayments = []; }

      if (this.allowMultiple) {
          let index = this.selectedPayments.findIndex(a => a.paymentId === payment.paymentId);
          if (index > -1) {
              this.selectedPayments.splice(index, 1);
          } else {
              this.selectedPayments.push(payment);
          }
      } else {
          if (this.selectedPayments.length > 0) {
              this.selectedPayments[0] = payment;
          } else {
              this.selectedPayments.push(payment);
          }
      }

      this.paymentSelectedEmit.emit(this.selectedPayments);
  }

  reset() {
      this.searchTerm = null;
      this.selectedPayment = null;

      this.form.patchValue({
          searchTerm: this.searchTerm
      });
  }

  getPaymentStatus(paymentStatus: PaymentStatusEnum): string {
      return this.formatLookup(PaymentStatusEnum[+paymentStatus]);
  }

  getPaymentType(id: number) {
      if (!id) { return };
      return this.formatLookup(PaymentTypeEnum[id]);
    }

  ToArray(anyEnum: { [x: string]: any; }) {
      const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
      return Object.keys(anyEnum)
          .filter(StringIsNumber)
          .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
      return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  isSelected($event: Payment): boolean {
      return !this.selectedPayments ? false : this.selectedPayments.some(s => s.paymentId == $event.paymentId)
  }

  getDisplayedColumns() {
      const columnDefinitions = [
          { def: 'policyReference', show: true },
          { def: 'paymentType', show: true },
          { def: 'product', show: true },
          { def: 'reference', show: true },
          { def: 'senderAccountNo', show: true },
          { def: 'amount', show: true },
          { def: 'paymentStatus', show: true },
          { def: 'createdBy', show: true },
          { def: 'createdDate', show: true },
          { def: 'modifiedBy', show: true },
          { def: 'modifiedDate', show: true },
          { def: 'selectSingle', show: !this.allowMultiple },
          { def: 'selectMultiple', show: this.allowMultiple }
      ];
      return columnDefinitions
          .filter(cd => cd.show)
          .map(cd => cd.def);
  }

  ngOnDestroy() : void  {
      this.isLoading$.unsubscribe(); 
      this.loadingMessage$.unsubscribe();
      this.paymentSelectedEmit.unsubscribe();
  }
}
