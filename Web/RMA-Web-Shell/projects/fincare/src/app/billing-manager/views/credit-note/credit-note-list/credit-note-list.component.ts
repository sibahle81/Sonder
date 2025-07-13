import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SourceModuleEnum, SourceProcessEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { Constants } from 'projects/shared-utilities-lib/src/lib/pipe-formats/constants';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { SearchCreditNoteDataSource } from './search-credit-note.datatasource';
import { CreditNoteSearchResult } from 'projects/fincare/src/app/shared/models/credit-note-search-result';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-credit-note-list',
  templateUrl: './credit-note-list.component.html',
  styleUrls: ['./credit-note-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('isExpanded', style({ height: '*', visibility: 'visible' })),
      transition('isExpanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class CreditNoteListComponent implements OnInit {
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
  @Output() resultEmit: EventEmitter<CreditNoteSearchResult> = new EventEmitter();

  currentQuery: any;
  router: any;
  form: UntypedFormGroup;
  headerTitle: string;
  displayedColumns = ['expand', 'finPayeNumber', 'creditNoteNumber', 'policyNumber', 'creditNoteAmount', 'actions'];
  numberFormat = Constants.amountFormat;
  placeHolder = 'Search by Credit Note Number, Account Number, Client Name, Registration Number or Policy Number';
  sourceModule: SourceModuleEnum[];
  sourceProcess: SourceProcessEnum[];

  selectedCreditNoteIds: number[] = [];
  selectedCreditNotes: CreditNoteSearchResult[] = [];

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
    private readonly formBuilder: UntypedFormBuilder,
    private readonly toastr: ToastrManager,
    public readonly dataSource: SearchCreditNoteDataSource
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
      orderBy: this.sort.active,
      sortDirection: 'asc',
      showActive: this.showActiveCheckBoxInput
    });
  }

  getLookups() {
    this.sourceModule = this.ToArray(SourceModuleEnum);
    this.sourceProcess = this.ToArray(SourceProcessEnum);
  }

  onSelected(item: CreditNoteSearchResult): void {
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
    this.selectedCreditNoteIds = [];
    this.selectedCreditNotes = [];
    this.loadData();
  }


  creditNoteTransactionChecked(event: any, item: CreditNoteSearchResult) {
    if (event.checked) {
      this.selectedCreditNoteIds.push(item.transactionId);
      this.selectedCreditNotes.push(item);
    } else {
      this.unTickCreditNoteItem(item.transactionId);
    }
  }

  unTickCreditNoteItem(itemId: number) {
    for (let i = 0; i < this.selectedCreditNoteIds.length; i++) {
      if ((this.selectedCreditNoteIds[i] === itemId)) {
        this.selectedCreditNoteIds.splice(i, 1);
        const itemIndex = this.selectedCreditNotes.findIndex(c => c.transactionId === itemId);
        this.selectedCreditNotes.splice(itemIndex, 1);
        break;
      }
    }
  }

  creditNoteAllChecked(event: any) {
    if (event.checked) {
      this.selectedCreditNoteIds = [];
      [...this.dataSource.data].forEach(element => {
        this.selectedCreditNoteIds.push(element.transactionId);
        this.selectedCreditNotes.push(element);
      });

    } else {
      this.selectedCreditNoteIds = [];
      this.selectedCreditNotes = [];
    }
  }

  downloadCreditNote(transactionId: number) {
    this.reportTitle = 'Credit Note';
    this.parametersAudit = { transactionId };
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.FinCare/RMACreditNote';
    this.format = 'pdf';
    this.showParametersAudit = 'true';
    this.languageAudit = 'en-us';
    this.widthAudit = 150;
    this.heightAudit = 100;
    this.toolbarAudit = 'false';

  }


  downloadSelectedCreditNotes() {
    this.isDownloading$.next(true);
    this.selectedCreditNoteIds.forEach(transactionId => {
      setTimeout(() => { this.downloadCreditNote(transactionId) }, 1000);
    });
    this.isDownloading$.next(false);
    setTimeout(() => { this.reset() }, 2000);
  }

  expandCollapse(row) {
    if (row.isExpanded) {
      row.isExpanded = false;
    } else {
      row.isExpanded = true;
    }
  }

  emailSelectedCreditNotes() {
    this.isEmailing$.next(true);
    let emailAddress = this.form.get('ownerEmail').value && this.form.get('ownerEmail').value.length > 0 ? this.form.get('ownerEmail').value : '';
    let transactionIds = [];
    let documentNumbers = '';
    this.selectedCreditNotes.forEach(creditNote => {
      transactionIds.push(creditNote.transactionId);
      documentNumbers += creditNote.documentReference + ','; //create comma seperated doc numbers
    });
    if (emailAddress && emailAddress.length > 0) {
      this.emailCreditNote(this.selectedCreditNotes[0].rolePlayerId, transactionIds, documentNumbers, emailAddress);
    }
    else {
      this.emailCreditNote(this.selectedCreditNotes[0].rolePlayerId, transactionIds, documentNumbers, this.selectedCreditNotes[0].emailAddress);
    }
  }

  emailCreditNote(roleplayerId: number, transactionIds: number[], creditNoteNumber: string, toAddress: string) {
    this.invoiceService.emailDebtorCreditNote(roleplayerId, transactionIds, creditNoteNumber, toAddress).subscribe(() => {
      this.toastr.successToastr('Email(s) sent successfully');
      this.reset();
    },
      (error) => {
        this.toastr.errorToastr('Error occured trying to send email');
        this.isEmailing$.next(false);
      });
  }

  reset() {
    this.selectedCreditNoteIds = [];
    this.selectedCreditNotes = [];
    this.form.get('ownerEmail').setValue('');
    this.isDownloading$.next(false);
    this.isEmailing$.next(false);
  }
}
