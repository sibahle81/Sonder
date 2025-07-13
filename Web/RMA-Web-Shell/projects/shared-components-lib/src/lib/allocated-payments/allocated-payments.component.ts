import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AllocatedPaymentsDatasource } from './allocated-payments.datasource';
import * as XLSX from 'xlsx';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Constants } from 'projects/shared-utilities-lib/src/lib/pipe-formats/constants';

export const MONTH_FORMATS = {
  parse: {
    dateInput: 'MMMM YYYY',
  },
  display: {
    dateInput: 'MMMM YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-allocated-payments',
  templateUrl: './allocated-payments.component.html',
  styleUrls: ['./allocated-payments.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_FORMATS }
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('isExpanded', style({ height: '*', visibility: 'visible' })),
      transition('isExpanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AllocatedPaymentsComponent implements OnInit {
  canExport: number;
  searchText: string;
  placeHolder = 'Search by User Reference, Policy Number, Debtor Name,Invoice Number or Bank Account Number';

  displayedColumns = ['expand', 'debtorNumber', 'invoiceNumber', 'policyNumber', 'bankAccountNumber', 'userReference', 'amount', 'userReference1', 'userReference2','bankStatementEntryId'];

  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  form: UntypedFormGroup;
  formIsValid = false;
  displayStartDate: Date;
  displayEndDate: Date;
  amountFormat = Constants.amountFormat;
  constructor(public readonly dataSource: AllocatedPaymentsDatasource,
              private readonly router: Router,
              private readonly datePipe: DatePipe,
              private readonly alertService: AlertService,
              private readonly formBuilder: UntypedFormBuilder,
              private readonly toastr: ToastrManager) {
  }

  ngOnInit() {
    this.dataSource.filter = '';
    this.dataSource.setControls(this.paginator, this.sort);

    this.createForm();
  }


  createForm() {
    this.form = this.formBuilder.group({
      startDate: [null],
      endDate: [null],
      dateType: [null]
    });
    this.displayStartDate = null;
    this.displayEndDate = null;
  }

  validateDates(): void {
    this.displayStartDate = this.form.get('startDate').value;
    this.displayEndDate = this.form.get('endDate').value;

    this.form.get('endDate').setErrors(null);
    this.form.get('startDate').setErrors(null);
    this.formIsValid = true;
    if (!this.form.get('startDate').value) {
      this.form.get('startDate').markAsTouched();
      this.form.get('startDate').setErrors({ required: true });
      this.formIsValid = false;
      return;
    }

    const startDate = new Date(this.form.get('startDate').value);
    const endDate = new Date(this.form.get('endDate').value);

    if (this.form.get('startDate').value && this.form.get('endDate').value && endDate < startDate) {
      this.form.get('endDate').setErrors({ min: true });
      this.form.get('startDate').setErrors({ min: true });
      this.formIsValid = false;
    }

  }

  getData() {
    this.dataSource.filter = '';
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.getData({
      startDate: this.form.get('startDate').value,
      endDate: this.form.get('endDate').value,
      dateType: this.form.get('dateType').value
    });

    if (this.dataSource.data != null) {
      this.canExport = 1;
    }
  }

  exporttoCSV(): void {
    this.dataSource.data.forEach(element => {
      delete element.debtorPaymentId;
      delete element.bankStatementEntryId;
      delete element.isExpanded;
    });
    const workSheet = XLSX.utils.json_to_sheet(this.dataSource.data, { header: [] });
    const workBook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
    XLSX.writeFile(workBook, 'AllocatedPayments.xlsx');
    this.toastr.successToastr('Allocated payments exported successfully');
  }

  searchData(data) {
    this.applyFilter(data);
  }

  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.paginator.length = this.dataSource.filteredData.length;
    this.dataSource.paginator.firstPage();
  }

  viewReport() {
    this.getData();
  }

  resetSearch() {
    this.form.patchValue({
      startDate: null,
      endDate: null
    });
    this.displayStartDate = null;
    this.displayEndDate = null;
  }

  clearInput() {
    this.searchText = '';
    this.applyFilter(this.searchText);
  }

  clear() {
    this.router.navigate(['fincare/billing-manager/']);
  }
  expandCollapse(row) {
    if (row.isExpanded) {
      row.isExpanded = false;
    } else {
      row.isExpanded = true;
    }
  }
}
