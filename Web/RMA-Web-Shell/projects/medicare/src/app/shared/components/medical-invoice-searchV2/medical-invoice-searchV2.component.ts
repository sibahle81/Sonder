import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';

import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { MedicalInvoiceSearchV2DataSource } from './medical-invoice-searchV2.datasource';
import { MedicareMedicalInvoiceCommonService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-common.service';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { HcpInvoiceQueriesComponent } from 'projects/hcp/src/app/hcp-manager/views/hcp-invoice-queries/hcp-invoice-queries.component';
import { RolePlayerQueryItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-item-query-enums';

@Component({
  selector: 'medical-invoice-searchV2',
  templateUrl: './medical-invoice-searchV2.component.html',
  styleUrls: ['./medical-invoice-searchV2.component.css']
})

export class MedicalInvoiceSearchV2Component extends UnSubscribe implements OnInit, OnChanges {

  @Input() title: string = "Search medical invoice";
  @Input() allowMultiple: boolean = false; // optional will default to single select  

  @Input() rolePlayerId: number = -1; //HealthCareProviderId for HCP 
  @Input() isReadOnly: boolean = false; // optional defaults to false, if set to true the component will be readonly
  @Input() toggleDeselect: boolean = false;

  @Output() invoiceSelectedEmit: EventEmitter<InvoiceDetails[]> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  selectedInvoices: InvoiceDetails[];
  dataSource: MedicalInvoiceSearchV2DataSource;
  form: any;
  searchTerm = "";

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly invoiceService: MedicareMedicalInvoiceCommonService,
    public dialog: MatDialog,
  ) {
    super();
    this.dataSource = new MedicalInvoiceSearchV2DataSource(this.invoiceService);
  }

  ngOnChanges(changes: SimpleChanges): void {
    let deselectOnly: boolean = false;
    for (let propName in changes) {
      if (propName == 'toggleDeselect' && !changes['toggleDeselect'].firstChange) {        
        deselectOnly = true;
      }
    }
    if (deselectOnly) {
      this.selectedInvoices = [];
      this.invoiceSelectedEmit.emit(this.selectedInvoices);
    }
    else {
      this.dataSource.rolePlayerId = this.rolePlayerId;
      this.selectedInvoices = [];
      this.getData();
    }
  }

  ngOnInit(): void {
    this.createForm();
    this.configureSearch();
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      searchTerm: [{ value: null, disabled: false }]
    });

    this.getData();
  }

  deselectAll(): void {
    this.selectedInvoices = [];
    this.invoiceSelectedEmit.emit(this.selectedInvoices);
  }

  configureSearch(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
      this.search(response as string);
    });
  }

  search(searchTerm: string): void {
    this.paginator.pageIndex = 0;
    this.searchTerm = searchTerm;
    !this.searchTerm || this.searchTerm === '' ? this.getData() : this.searchTerm?.length >= 3 ? this.getData() : null;
  }

  getData(): void {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
  }

  reset(): void {
    if (!this.form) { return; }

    this.searchTerm = '';

    this.form.patchValue({
      searchTerm: this.searchTerm
    });

    this.selectedInvoices = [];
    this.invoiceSelectedEmit.emit(this.selectedInvoices);

    if (this.dataSource.data && this.dataSource.data.data) {
      this.dataSource.data.data = null;
    }

    this.getData();
  }

  getHCPDisplayColumns() {
    const columnDefinitions = [
      { def: 'hcpInvoiceNumber', show: true }
      , { def: 'invoiceNumber', show: true }
      , { def: 'invoiceDate', show: true }
      , { def: 'dateSubmitted', show: true }
      , { def: 'dateReceived', show: true }
      , { def: 'dateAdmitted', show: true }
      , { def: 'actions', show: true }
      , { def: 'selectSingle', show: !this.allowMultiple && !this.isReadOnly }
      , { def: 'selectMultiple', show: this.allowMultiple && !this.isReadOnly }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  invoiceSelected(invoice: InvoiceDetails): void {
    if (!this.selectedInvoices) { this.selectedInvoices = []; }

    if (this.allowMultiple) {
      let index = this.selectedInvoices.findIndex(a => a.invoiceId === invoice.invoiceId);
      if (index > -1) {
        this.selectedInvoices.splice(index, 1);
      } else {
        this.selectedInvoices.push(invoice);
      }
    } else {
      if (this.selectedInvoices.length > 0) {
        this.selectedInvoices[0] = invoice;
      } else {
        this.selectedInvoices.push(invoice);
      }
    }

    this.invoiceSelectedEmit.emit(this.selectedInvoices);
  }

  isSelected($event: InvoiceDetails): boolean {
    return !this.selectedInvoices ? false : this.selectedInvoices.some(s => s.invoiceId == $event.invoiceId)
  }

  onSelect(item: any): void {
    const dialogRef = this.dialog.open(HcpInvoiceQueriesComponent, {
      width: '75%',
      data: {
        rolePlayerQueryItemType: RolePlayerQueryItemTypeEnum.MedicalInvoice,
        itemId: item.invoiceId
      }
    });
  }
}
