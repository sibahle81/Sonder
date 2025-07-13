import { Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import { UntypedFormBuilder,  UntypedFormGroup, } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';
import { InvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-type-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Invoice } from '../../../shared/models/invoice';
import { SearchAccountResults } from '../../../shared/models/search-account-results';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { InvoiceListDataSource } from './invoice-list.datasource';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit, AfterViewInit {

  searchAccountResults: SearchAccountResults;
  dataSource: InvoiceListDataSource;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  showInvoices = false;
  displayedColumns = ['policyNumber', 'totalInvoiceAmount', 'invoiceStatus', 'invoiceNumber', 'selected', 'actions'];
  menus: { title: string, action: string, disable: boolean }[];
  form: UntypedFormGroup;
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
  statuses = [];
  selectedStatusId = 0;
  placeHolder = 'Search by Invoice No., Policy No.';
  searchString = '';
  debtorSelected = false;
  backLink = '/fincare/billing-manager';
  dataLength = 0;
  constructor(private readonly invoiceService: InvoiceService,
              private readonly lookupService: LookupService,
              private readonly toastr: ToastrManager,
              protected readonly router: Router,
              private formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit() {
    this.createForm();
    this.debtorSelected = false;
    this.dataSource = new InvoiceListDataSource(this.invoiceService);
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.ssrsBaseUrl = value;
    },
      error => {
        this.toastr.errorToastr(error.message);
      });
    this.lookupService.getInvoiceStatuses().subscribe((data: Lookup[]) => {
      this.statuses = [...data];
    },
      error => {
        this.toastr.errorToastr(error.message);
      });
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();
  }

  createForm() {
    this.form = this.formBuilder.group({
      statusType: [],
      filter: []
    }
    );
    this.form.get('statusType').setValue('-1');
  }

  loadData() {
    this.showInvoices = false;
    this.dataLength = 0;
    this.dataSource.getData({
      rolePlayerId: this.searchAccountResults.rolePlayerId,
      statusId: this.selectedStatusId,
      pageNumber: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      orderBy: this.sort.active,
      sortDirection: this.sort.direction,
      searchString: this.searchString
    });
    this.showInvoices = true;
  }

  accountSearchChangeHandler(searchAccountResults: SearchAccountResults): void {
    this.showInvoices = false;
    this.searchAccountResults = searchAccountResults;
    this.debtorSelected = true;

    this.paginator.pageIndex = 0;
    this.paginator.pageSize = 25;
  }

  getInvoiceStatusDesc(id: InvoiceStatusEnum): string {
    return InvoiceStatusEnum[id];
  }

  filterMenu() {
    this.menus =
      [
        { title: 'Download', action: 'download', disable: false }];
  }

  onMenuItemClick(item: Invoice, menu: any): void {
    switch (menu.action) {
      case 'download':
        this.isDownloading$.next(true);
        this.downloadInvoice(item.invoiceId);
        break;
    }
  }

  downloadInvoice(invoiceId: number) {
    this.invoiceService.getInvoiceType(invoiceId).subscribe(invoiceType => {
      this.reportTitle = 'Invoice';
      this.parametersAudit = { invoiceId };
      this.reportServerAudit = this.ssrsBaseUrl;
      if (invoiceType === InvoiceTypeEnum.Coid) {
        this.reportUrlAudit = 'RMA.Reports.FinCare/RMACoidInvoice';
      } else {
        this.reportUrlAudit = 'RMA.Reports.FinCare/RMAFuneralInvoice';
      }
      this.format = 'pdf';
      this.showParametersAudit = 'true';

      this.languageAudit = 'en-us';
      this.widthAudit = 150;
      this.heightAudit = 100;
      this.toolbarAudit = 'false';
      this.isDownloading$.next(false);
      this.deselectInvoices();
    });
  }

  downloadSelectedInvoices() {
    this.isDownloading$.next(true);
    this.dataSource.data.data.forEach(invoice => {
      if (invoice.selected) {
        this.downloadInvoice(invoice.invoiceId);
      }
    });
  }

  done(statusMessage: string) {
    this.toastr.successToastr(statusMessage);
  }

  error(statusMessage: string) {
    this.toastr.successToastr(statusMessage);
  }

  get invoicesSelected(): boolean {
    if (this.dataSource && this.dataSource.data && this.dataSource.data.data) {
      return this.dataSource.data.data.filter(i => i.selected).length > 0;
    } else {
      return false;
    }
  }

  deselectInvoices() {
    this.dataSource.data.data.forEach(invoice => {
      invoice.selected = false;
    });
  }

  statusTypeChanged(event: any) {
    this.selectedStatusId = event.value;
  }

  applyFilters() {
    if (this.form.get('filter').value) {
      this.searchString = this.form.get('filter').value;
    }
    else {
      this.searchString = null;
    }
    this.loadData();

  }
  reset() {
    this.form.get('filter').setValue('');
    this.debtorSelected = false;
    this.form.get('statusType').setValue('-1');
    this.showInvoices = false;
    this.dataLength = 0;
  }
  search() {
    this.applyFilters();
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }
}


