import { Component, OnInit, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SearchPolicyForInvoiceDataSource } from './invoice-search.datasource';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { InvoiceSearchResult } from '../../../shared/models/invoice-search-result';
import { Constants } from 'projects/shared-utilities-lib/src/lib/pipe-formats/constants';
import { SourceModuleEnum, SourceProcessEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ToastrManager } from 'ng6-toastr-notifications';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'policy-invoice-search',
  templateUrl: './invoice-search.component.html',
  styleUrls: ['./invoice-search.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('isExpanded', style({ height: '*', visibility: 'visible' })),
      transition('isExpanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class InvoiceSearchComponent implements OnInit {
  selectedFilterTypeId = 0; // default to Filter
  showActiveCheckBoxInput = true;
  rootMenus: { title: string, url: string, submenu: boolean, disable: boolean }[];
  subMenus: { title: string, url: string, disable: boolean }[];
  filters: { title: string, id: number }[];
  filterSearch: string;
  isSearching: boolean;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @Input() title: string;
  @Output() resultEmit: EventEmitter<InvoiceSearchResult> = new EventEmitter();

  currentQuery = '';
  router: any;
  form: UntypedFormGroup;
  headerTitle: string;
  displayedColumns = ['expand', 'policyNumber', 'firstName', 'accountNumber', 'invoiceAmount', 'invoiceStatus', 'invoiceNumber', 'actions'];
  numberFormat = Constants.amountFormat;
  placeHolder = 'Search by Invoice Number, Account Number, Client Name, or Registration Number';
  sourceModule: SourceModuleEnum[];
  sourceProcess: SourceProcessEnum[];

  selectedInvoiceIds: number[] = [];
  selectedInvoices: InvoiceSearchResult[] = [];

  ssrsBaseUrl: string;
  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  isDownload = 'true';
  reportTitle: string;
  format = 'pdf';
  isDownloading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isEmailing$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly appEventsManager: AppEventsManager,
    private readonly invoiceService: InvoiceService,
    private readonly lookupService: LookupService,
    private readonly toastr: ToastrManager,
    private readonly formBuilder: UntypedFormBuilder,
    public readonly dataSource: SearchPolicyForInvoiceDataSource
  ) { }

  ngOnInit(): void {
    this.headerTitle = this.title;
    this.dataSource.filter = '';
    this.dataSource.setControls(this.paginator, this.sort);

    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.ssrsBaseUrl = value;
    });
    this.createForm();
    this.getLookups();
  }

  loadData() {
    this.dataSource.getData({
      query: this.currentQuery,
      pageNumber: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      orderBy: isNullOrUndefined( this.sort.active)  ?  'InvoiceAmount' : this.sort.active,
      sortDirection: 'asc',
      showActive: this.showActiveCheckBoxInput
    });
  }

  getLookups() {
    this.sourceModule = this.ToArray(SourceModuleEnum);
    this.sourceProcess = this.ToArray(SourceProcessEnum);
  }

  onSelected(item: InvoiceSearchResult): void {
    this.resultEmit.emit(item);
  }

  search(): void {
    this.currentQuery = this.filter.nativeElement.value;

    if (this.currentQuery.length >= 3) {
      this.isSearching = true;

      this.loadData();

      this.isSearching = false;
    }
  }

  validateQuery() {
    this.form.get('query').setErrors(null);
    this.form.get('query').updateValueAndValidity();
    const query = this.form.get('query').value as string;

    switch (this.selectedFilterTypeId) {
      case 2:
        const maxDigits = query.match('^[0-9]{13}$');
        const numbersOnly = query.match('^[0-9]*$');
        if (maxDigits === null) {
          this.form.get('query').setErrors({ idCheck: true });
        }
        if (numbersOnly === null) {
          this.form.get('query').setErrors({ onlyNumbers: true });
        }
        if (maxDigits !== null && numbersOnly !== null) {
          this.form.get('query').setErrors(null);
          this.form.get('query').updateValueAndValidity();
        }
        break;
      case 7:
        const alphaOnly = query.match('^[a-zA-Z ]+$');
        if (alphaOnly === null) {
          this.form.get('query').setErrors({ onlyAlpha: true });
        }
        if (alphaOnly !== null) {
          this.form.get('query').setErrors(null);
          this.form.get('query').updateValueAndValidity();
        }
        break;
      default: return;
    }
  }

  createForm(): void {
    this.currentQuery = '';
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      filter: new UntypedFormControl(''),
      query: new UntypedFormControl('', [Validators.minLength(3), Validators.required]),
      ownerEmail: new UntypedFormControl(''),
    });
    this.patchDefaultValues();
  }

  patchDefaultValues() {
    this.form.patchValue({
      filter: this.filters
    });
  }

  selectedFilterChanged($event: any) {
    if (this.filters[0].id === 0) {
      this.filters.shift();
    }
    this.selectedFilterTypeId = $event.value as number;
  }

  ToArray(anyEnum: { [x: string]: any }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map((key) => anyEnum[key]);
  }

  getSourceModule(sourceModuleId: number): string {
    return this.formatLookup(SourceModuleEnum[+sourceModuleId]);
  }

  getSourceProcess(sourceProcessId: number): string {
    return this.formatLookup(SourceProcessEnum[+sourceProcessId]);
  }

  formatLookup(lookup: string): string {
    return lookup ? lookup.replace(/([a-z])([A-Z])/g, "$1 $2") : "N/A";
  }

  refresh() {
    this.currentQuery = '';
    this.filter.nativeElement.value = this.currentQuery;
    this.selectedInvoiceIds = [];
    this.selectedInvoices = [];
    this.loadData();
  }


  invoiceTransactionChecked(event: any, item: InvoiceSearchResult) {
    if (event.checked) {
      this.selectedInvoiceIds.push(item.invoiceId);
      this.selectedInvoices.push(item);
    } else {
      this.unTickInvoiceItem(item.invoiceId);
    }
  }

  unTickInvoiceItem(itemId: number) {
    for (let i = 0; i < this.selectedInvoiceIds.length; i++) {
      if ((this.selectedInvoiceIds[i] === itemId)) {
        this.selectedInvoiceIds.splice(i, 1);
        const itemIndex = this.selectedInvoices.findIndex(c => c.invoiceId === itemId);
        this.selectedInvoices.splice(itemIndex, 1);
        break;
      }
    }
  }

  invoiceAllChecked(event: any) {
    if (event.checked) {
      this.selectedInvoiceIds = [];
      [...this.dataSource.data].forEach(element => {
        this.selectedInvoiceIds.push(element.invoiceId);
        this.selectedInvoices.push(element);
      });

    } else {
      this.selectedInvoiceIds = [];
      this.selectedInvoices = [];
    }
  }

  downloadInvoice(invoiceId: number) {
    this.invoiceService.getInvoiceType(invoiceId).subscribe(invoiceType => {
      this.reportTitle = 'Invoice';
      this.parametersAudit = { invoiceId };
      this.reportServerAudit = this.ssrsBaseUrl;
      this.reportUrlAudit = 'RMA.Reports.FinCare/RMACoidInvoice';
      this.format = 'pdf';
      this.showParametersAudit = 'true';
      this.languageAudit = 'en-us';
      this.widthAudit = 150;
      this.heightAudit = 100;
      this.toolbarAudit = 'false';
    });
  }

  downloadSelectedInvoices() {
    this.isDownloading$.next(true);
    this.selectedInvoiceIds.forEach(invoiceId => {
      setTimeout(() => { this.downloadInvoice(invoiceId) }, 1000);
    });
    setTimeout(() => { this.reset() }, 2000);
  }

  expandCollapse(row) {
    if (row.isExpanded) {
      row.isExpanded = false;
    } else {
      row.isExpanded = true;
    }
  }

  emailSelectedInvoices() {
    this.isEmailing$.next(true);
    let emailAddress = this.form.get('ownerEmail').value && this.form.get('ownerEmail').value.length > 0 ? this.form.get('ownerEmail').value : '';
    let invoiceIds = [];
    let documentNumbers = '';
    this.selectedInvoices.forEach(invoice => {
      invoiceIds.push(invoice.invoiceId);
      documentNumbers += invoice.invoiceNumber + ','; //create comma seperated doc numbers
    });
    if (emailAddress && emailAddress.length > 0) {
      this.emailInvoice(this.selectedInvoices[0].rolePlayerId, invoiceIds, documentNumbers, emailAddress);
    }
    else {
      this.emailInvoice(this.selectedInvoices[0].rolePlayerId, invoiceIds, documentNumbers, this.selectedInvoices[0].emailAddress);
    }
  }

  emailInvoice(roleplayerId: number, invoiceIds: number[], invoiceNumber: string, toAddress: string) {
    this.invoiceService.emailDebtorInvoice(roleplayerId, invoiceIds, invoiceNumber, toAddress).subscribe((data) => {
      this.toastr.successToastr('Email(s) sent successfully');
      this.reset();
    },
      (error) => {
        this.toastr.errorToastr('Error occured trying to send email');
        this.isEmailing$.next(false);
      });
  }

  reset() {
    this.selectedInvoiceIds = [];
    this.selectedInvoices = [];
    this.form.get('ownerEmail').setValue('');
    this.isDownloading$.next(false);
    this.isEmailing$.next(false);
  }
}

