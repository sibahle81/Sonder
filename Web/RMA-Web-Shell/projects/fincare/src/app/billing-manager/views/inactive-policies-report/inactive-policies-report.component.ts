import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { InactivePoliciesDatasource } from './inactive-policies-report.datasource';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Format } from 'projects/shared-utilities-lib/src/lib/pipes/format';
import { DataGridUtil } from 'projects/shared-utilities-lib/src/lib/grid/datagrid.util';
import * as XLSX from 'xlsx';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';


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
  selector: 'app-inactive-policies-report',
  templateUrl: './inactive-policies-report.component.html',
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_FORMATS }
  ]
})

export class InactivePoliciesReportComponent implements OnInit {
  canExport: number;
  searchText: string;
  form: UntypedFormGroup;
  formIsValid = false;
  displayStartDate: Date;
  displayEndDate: Date;

  placeHolder = 'Search by Policy Number';
  displayedColumns = ['policyNumber', 'policyStatus', 'policyInceptionDate', 'firstInstallmentDate',
   'annualPremium', 'installmentPremium'];
  
  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  constructor(public readonly dataSource: InactivePoliciesDatasource,
              private readonly router: Router,
              private readonly datePipe: DatePipe,
              private readonly formBuilder: UntypedFormBuilder,
              private readonly alertService: AlertService,
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
    endDate: [null]
  });
  this.displayStartDate = null;
  this.displayEndDate = null;
}

 getData() {
  this.dataSource.getData({   startDate: this.form.get('startDate').value,
  endDate: this.form.get('endDate').value});

   if (this.dataSource.data != null) {
       this.canExport = 1;
     }
 }

 validateDates(): void {
  this.displayStartDate = this.form.get('startDate').value ;
  this.displayEndDate = this.form.get('endDate').value ;

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

 resetSearch() {
  this.form.patchValue({
    startDate: null,
    endDate: null
  });
  this.displayStartDate = null;
  this.displayEndDate = null;
}

viewReport() {
  this.getData();
}

exporttoCSV(): void {
  this.dataSource.data.forEach(element => {
      delete element.policyId;
      delete element.brokerageId;
      delete element.productOptionId;
      delete element.representativeId;
      delete element.juristicRepresentativeId;
      delete element.policyOwnerId;
      delete element.policyPayeeId;
      delete element.paymentFrequencyId;
      delete element.paymentMethodId;
      delete element.policyCancelReasonId;
      delete element.policyMovementId;
  });
  const workSheet = XLSX.utils.json_to_sheet(this.dataSource.data, {header:[]});
  const workBook: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workBook, workSheet, 'SheetName');
  XLSX.writeFile(workBook, 'InactivePolicies.xlsx');
  this.toastr.successToastr('Inactive policies exported successfully');
}

searchData(data) {
  this.applyFilter(data);
}

applyFilter(filterValue: any) {
  this.dataSource.filter = filterValue.trim().toLowerCase();
  this.paginator.length = this.dataSource.filteredData.length;
  this.dataSource.paginator.firstPage();
}

clearInput() {
  this.searchText = '';
  this.applyFilter(this.searchText);
}

clear() {
this.router.navigate(['fincare/billing-manager/']);
}

}
