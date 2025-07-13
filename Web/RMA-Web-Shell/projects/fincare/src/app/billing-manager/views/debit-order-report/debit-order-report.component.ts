import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DebitOrderReportDatasource } from './debit-order-report.datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import * as XLSX from 'xlsx';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { InterBankTransferService } from '../../services/interbanktransfer.service';
import { RmaBankAccount } from '../../models/rmaBankAccount';
import { BehaviorSubject } from 'rxjs';
import { Constants } from 'projects/shared-utilities-lib/src/lib/pipe-formats/constants';
import { CollectionTypeEnum } from 'projects/shared-models-lib/src/lib/enums/collection-type-enum';
import { MatDialog } from '@angular/material/dialog';
import { DebitOrder } from '../../../shared/models/debit-order';
import { DebitOrderInfoDialogComponent } from './debit-order-info-dialog/debit-order-info-dialog.component';

export const MONTH_FORMATS = {
  parse: {
    dateInput: "MMMM YYYY",
  },
  display: {
    dateInput: "MMMM YYYY",
    monthYearLabel: "MMMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};
@Component({
  selector: "app-debit-order-report",
  templateUrl: "./debit-order-report.component.html",
  styleUrls: ["./debit-order-report.css"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_FORMATS },
  ],
})
export class DebitOrderReportComponent implements OnInit {
  canExport = false;
  selectedDebitOrderType = 1;

  get isLoading(): boolean {
    return this.dataSource.isLoading;
  }
  get isError(): boolean {
    return this.dataSource.isError;
  }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild("filter", { static: false }) filter: ElementRef;
  form: UntypedFormGroup;
  formIsValid = false;
  displayStartDate: Date;
  displayEndDate: Date;
  loadingIndustries = true;
  loadingProducts = true;
  loadingDebitOrderTypes = true;
  products: Product[] = [];
  industries: Lookup[] = [];
  debitOrderTypes: Lookup[] = [];

  rmaBankAccounts: RmaBankAccount[];
  selectedBankAccountId: number;
  selectedBankAccount: RmaBankAccount;
  isLoadingBankAccounts$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  amountFormat = Constants.amountFormat;

  getDisplayedColumns(): string[] {
    const columnDefinitions = [
      { display: "moreInfo", def: "moreInfo", show: true },
      { display: "Control Number", def: "controlNumber", show: true },
      { display: "Control Name", def: "controlName", show: true },
      { display: "Year", def: "year", show: true },
      { display: "Period", def: "period", show: true },
      { display: "Collection Status", def: "collectionStatus", show: true },
      { display: "Debit Order Date", def: "debitOrderDate", show: true },
      { display: "Account Number", def: "accountNumber", show: true },
      { display: "Account Holder", def: "accountHolder", show: true },
      { display: "Policy Number", def: "policyNumber", show: true },
      { display: "Amount", def: "debitOrdeAmount", show: true },
      {
        display: "December Debit Day",
        def: "decemberDebitDay",
        show: this.selectedDebitOrderType === CollectionTypeEnum.Normal,
      },
    ];

    return columnDefinitions.filter((cd) => cd.show).map((cd) => cd.def);
  }

  constructor(
    public readonly dataSource: DebitOrderReportDatasource,
    private readonly router: Router,
    private readonly datePipe: DatePipe,
    private readonly alertService: AlertService,
    private readonly productService: ProductService,
    private readonly lookupService: LookupService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly toastr: ToastrManager,
    private readonly interBankTransferService: InterBankTransferService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.dataSource.clearData();
    this.dataSource.filter = "";
    this.dataSource.setControls(this.paginator, this.sort);
    this.createForm();
    this.getIndustries();
    this.getProducts();
    this.getDebitOrderTypes();
    this.getRmaBankAccounts();
  }

  getIndustries(): void {
    this.loadingIndustries = true;
    this.lookupService.getIndustryClasses().subscribe((data) => {
      this.industries = data;
      this.loadingIndustries = false;
      if (this.industries.length > 0) {
        if (this.industries[0].id > 0) {
          this.industries.unshift({ id: 0, name: "All" } as Lookup);
        }
      }
    });
  }

  getProducts() {
    this.loadingProducts = true;
    this.productService.getProducts().subscribe((results) => {
      this.products = results;
      if (this.products.length > 0) {
        this.products.unshift({ id: 0, name: "All" } as Product);
      }
      this.loadingProducts = false;
    });
  }

  getDebitOrderTypes(): void {
    this.loadingDebitOrderTypes = true;
    this.lookupService.getDebitOrderTypes().subscribe((data) => {
      this.debitOrderTypes = data;
      this.loadingDebitOrderTypes = false;
    });
  }

  createForm() {
    this.form = this.formBuilder.group({
      startDate: [null],
      endDate: [null],
      period: [null],
      industry: [null, [Validators.required]],
      product: [null, [Validators.required]],
      debitOrderTypes: [null, [Validators.required]],
      bankAccount: [null],
    });
    this.displayStartDate = null;
    this.displayEndDate = null;
  }

  getData() {
    const value = this.form.getRawValue();

    this.dataSource.getData({
      startDate: this.form.get("startDate").value,
      endDate: this.form.get("endDate").value,
      periodYear: new Date(this.form.get("period").value).getFullYear(),
      periodMonth: new Date(this.form.get("period").value).getMonth(),
      industryId: value.industry,
      productId: value.product,
      debitOrderType: value.debitOrderTypes,
      bankAccountNumber: this.selectedBankAccount?.accountNumber,
    });

    if (this.dataSource.data != null) {
      this.canExport = true;
    }
  }

  exporttoCSV(): void {
    this.dataSource.data.forEach((element) => {
      delete element.invoiceId;
      delete element.policyId;
      delete element.isExpanded;
    });
    const workSheet = XLSX.utils.json_to_sheet(this.dataSource.data, {
      header: [],
    });
    const workBook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, "SheetName");
    XLSX.writeFile(workBook, "DebitOrders.xlsx");
    this.toastr.successToastr("Debit Orders exported successfully");
  }

  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  clear() {
    this.router.navigate(["fincare/billing-manager/"]);
  }

  validateDates(): void {
    this.displayStartDate = this.form.get("startDate").value;
    this.displayEndDate = this.form.get("endDate").value;

    this.form.get("endDate").setErrors(null);
    this.form.get("startDate").setErrors(null);
    

    if (!this.form.get("startDate").value && !this.form.get("endDate").value) {
      this.form.get("startDate").markAsTouched();
      this.form.get("startDate").setErrors({ required: true });
      this.form.get("endDate").markAsTouched();
      this.form.get("endDate").setErrors({ required: true });
      this.formIsValid = false;
      return;
    }

    const startDate = new Date(this.form.get("startDate").value);
    const endDate = new Date(this.form.get("endDate").value);

    if (
      this.form.get("startDate").value &&
      this.form.get("endDate").value &&
      endDate < startDate
    ) {
      this.form.get("endDate").setErrors({ min: true });
      this.form.get("startDate").setErrors({ min: true });
    }

    this.form.patchValue({
      period: null,
    });
  }

  isApplicationInvalid(): boolean {
    const industryValue = this.form.get('industry').value;
    const productValue = this.form.get('product').value;
    const debitOrderTypesValue = this.form.get('debitOrderTypes').value;

    return (!industryValue && !productValue && !debitOrderTypesValue);
  }

  chosenYearHandler(selectedDate: any) {
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const period = new Date(this.form.get("period").value);
    const month = period.getMonth();
    this.setDateValues(year, month);
  }

  chosenMonthHandler(selectedDate: any, datepicker: MatDatepicker<Date>) {
    datepicker.close();
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    this.setDateValues(year, month);
    this.formIsValid = true;
  }

  setDateValues(year: number, month: number): void {
    const today = new Date();
    const periodDate = new Date(year, month, 1);
    this.form.patchValue({
      period: periodDate,
      startDate: null,
      endDate: null,
    });
    this.displayStartDate = null;
    this.displayEndDate = null;
  }

  viewReport() {
    this.getData();
  }

  resetSearch() {
    this.form.patchValue({
      period: null,
      startDate: null,
      endDate: null,
      industry: null,
      product: null,
      debitOrderTypes: null,
      bankAccount: null,
    });
    this.displayStartDate = null;
    this.displayEndDate = null;
    const result = this.dataSource;
    result.clearData();
  }

  getRmaBankAccounts() {
    this.isLoadingBankAccounts$.next(true);
    this.interBankTransferService.getRmaBankAccounts().subscribe(
      (results) => {
        this.rmaBankAccounts = results;
        this.form.get("bankAccount").setValue(0);
        this.isLoadingBankAccounts$.next(false);
      },
      (error) => {
        this.toastr.errorToastr(error.message);
        this.isLoadingBankAccounts$.next(false);
      }
    );
  }

  selectedBankAccountChanged($event: { value: number }) {
    this.selectedBankAccountId = $event.value;
    if (this.selectedBankAccountId === 0) {
      this.selectedBankAccount = null;
    } else {
      this.selectedBankAccount = this.rmaBankAccounts.find(
        (s) => s.rmaBankAccountId === this.selectedBankAccountId
      );
    }
  }

  showMoreInformation(debitOrder: DebitOrder) {
    this.openDebitOrderDialog(debitOrder);
  }

  openDebitOrderDialog(debitOrder: DebitOrder) {
    const dialogRef = this.dialog.open(DebitOrderInfoDialogComponent, {
      width: "1024px",
      data: { debitOrder },
    });
  }
}
