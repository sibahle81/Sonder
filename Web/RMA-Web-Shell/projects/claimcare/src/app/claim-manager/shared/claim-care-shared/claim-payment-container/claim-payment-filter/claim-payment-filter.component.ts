import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { ClaimInvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-status.enum';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { BehaviorSubject } from 'rxjs';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';

@Component({
  selector: 'claim-payment-filter',
  templateUrl: './claim-payment-filter.component.html',
  styleUrls: ['./claim-payment-filter.component.css']
})
export class ClaimPaymentFilterComponent extends UnSubscribe implements OnChanges {

  @Input() personEvent: PersonEventModel;

  @Output() invoiceStatusEmit: EventEmitter<ClaimInvoiceStatusEnum> = new EventEmitter();
  
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  placeholder$: BehaviorSubject<string> = new BehaviorSubject('search by invoice Id');

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: UntypedFormGroup;
  currentQuery: any;
  invoiceStatuses: ClaimInvoiceStatusEnum[];
  invoiceTypes: ClaimInvoiceTypeEnum[];
  invoiceType: ClaimInvoiceTypeEnum;
  invoiceStatus: ClaimInvoiceStatusEnum;

  constructor(private formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
  ) {
    super();
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createForm();
  }

  getLookups() {
    this.invoiceStatuses = this.ToArray(ClaimInvoiceStatusEnum);
    this.invoiceTypes = this.ToArray(ClaimInvoiceTypeEnum);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  search(searchTerm: string) {
    this.currentQuery = searchTerm;
    if (this.currentQuery.length >= 3) {
      this.currentQuery = this.currentQuery.trim();
    }
  }

  refreshLoading($event) {
    this.isLoading$.next($event);
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      searchTerm: [{ value: null, disabled: false }],
      invoiceFilter: [{ value: null, disabled: false }],
      invoiceType: [{ value: 0, disabled: false }],
    });

    this.form.patchValue({
      invoiceFilter: ClaimInvoiceStatusEnum[ClaimInvoiceStatusEnum.PaymentRequested],
      invoiceType: 'Unknown',
    })

    this.invoiceStatus = ClaimInvoiceStatusEnum.PaymentRequested;
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  invoiceTypeChange($event: ClaimInvoiceTypeEnum) {
    this.invoiceType = $event;
  }

  invoiceStatusChange($event: ClaimInvoiceStatusEnum) {
    this.invoiceStatus = $event;
    this.invoiceStatusEmit.emit($event);
  }
}
