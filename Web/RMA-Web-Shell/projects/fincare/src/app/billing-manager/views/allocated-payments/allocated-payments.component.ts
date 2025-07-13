import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AllocatedPaymentsDatasource } from './allocated-payments.datasource';
import * as XLSX from 'xlsx';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Constants } from 'projects/shared-utilities-lib/src/lib/pipe-formats/constants';
import { MatDialog } from '@angular/material/dialog';
import { AllocatedPayment } from '../../../shared/models/allocated-payment';
import { AllocatedPaymentsDetailsDialogComponent } from './allocated-payments-details-dialog/allocated-payments-details-dialog.component';
import { BehaviorSubject } from 'rxjs';
import { InterBankTransferService } from '../../services/interbanktransfer.service';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { RmaBankAccount } from '../../models/rmaBankAccount';

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
  rmaBankAccounts: RmaBankAccount[];
  products: Product[] = [];
  loadingProducts = true;
  selectedBankAccountId: number;
  selectedBankAccount: RmaBankAccount;
  placeHolder = 'Search by User Reference, Policy Number, Debtor Name,Invoice Number or Bank Account Number';

  displayedColumns = ['expand', 'debtorNumber', 'invoiceNumber', 'policyNumber', 'bankAccountNumber', 'userReference', 'amount', 'userReference1', 'userReference2','bankStatementEntryId'];
  isLoadingBankAccounts$: BehaviorSubject<boolean> = new BehaviorSubject(false);

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
              private readonly interBankTransferService: InterBankTransferService,
              private readonly productService: ProductService,
              private readonly datePipe: DatePipe,
              private readonly alertService: AlertService,
              private readonly formBuilder: UntypedFormBuilder,
              private readonly toastr: ToastrManager,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    this.dataSource.filter = '';
    this.dataSource.setControls(this.paginator, this.sort);

    this.createForm();
    this.getRmaBankAccounts();
    this.getProducts();
  }


  createForm() {
    this.form = this.formBuilder.group({
      startDate: [null],
      endDate: [null],
      dateType: [null],
      bankAccount: [null],
      period: [null],
      product: [null, [Validators.required]],
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

    this.form.patchValue({
      period: null,
    });
  }

  getData() {
    this.dataSource.filter = '';
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.getData({
      startDate: this.form.get('startDate').value,
      endDate: this.form.get('endDate').value,
      dateType: this.form.get('dateType').value,
      bankAccount: this.selectedBankAccount?.accountNumber,
      productId: this.form.get('product').value,
      periodYear: new Date(this.form.get("period").value).getFullYear(),
      periodMonth: new Date(this.form.get("period").value).getMonth(),
    });

    if (this.dataSource.data != null) {
      this.canExport = 1;
    }
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

  showMoreInformation(item: AllocatedPayment){
    const dialogRef = this.dialog.open(AllocatedPaymentsDetailsDialogComponent, {
      width: "60%",
      data: { item },
    });
  }

  getRmaBankAccounts() {
    this.isLoadingBankAccounts$.next(true);
    this.interBankTransferService.getRmaBankAccounts().subscribe(results => {
      this.rmaBankAccounts = results;
      this.form.get('bankAccount').setValue(0);
      this.isLoadingBankAccounts$.next(false);
    }, error => { this.toastr.errorToastr(error.message);
       this.isLoadingBankAccounts$.next(false); });
  }

  selectedBankAccountChanged($event: { value: number; }) {
    this.selectedBankAccountId = $event.value;
    if (this.selectedBankAccountId === 0) {
      this.selectedBankAccount = null;
    } else {
      this.selectedBankAccount = this.rmaBankAccounts.find(s => s.rmaBankAccountId === this.selectedBankAccountId);
    }
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
  
}
