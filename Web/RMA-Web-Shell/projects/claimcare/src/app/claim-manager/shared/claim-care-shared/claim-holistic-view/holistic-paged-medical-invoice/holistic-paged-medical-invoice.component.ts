import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MedicareMedicalInvoiceCommonService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-common.service';
import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';
import { HolistPagedMedicalInvoiceDataSource } from './holistic-paged-medical-invoice.datasource';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';

@Component({
  selector: 'holistic-paged-medical-invoice',
  templateUrl: './holistic-paged-medical-invoice.component.html',
  styleUrls: ['./holistic-paged-medical-invoice.component.css']
})
export class HolisticPagedMedicalInvoiceComponent extends UnSubscribe implements OnChanges {

  @Input() personEvent: PersonEventModel;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  currentQuery = '';
  invoiceStatuses: InvoiceStatusEnum[] = [];
  invoiceStatus: InvoiceStatusEnum;

  dataSource: HolistPagedMedicalInvoiceDataSource;
  invoiceStatusColor: string;
  selectedInvoice: InvoiceDetails;

  allocated = InvoiceStatusEnum.Allocated;
  partially = InvoiceStatusEnum.Partially;
  paid = InvoiceStatusEnum.Paid;
  rejected = InvoiceStatusEnum.Rejected;

  constructor(private readonly medicalInvoice: MedicareMedicalInvoiceCommonService) {
    super();
    this.getLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new HolistPagedMedicalInvoiceDataSource(this.medicalInvoice);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    this.createSearchCriteria(this.personEvent.personEventId, this.invoiceStatus);
  }

  createSearchCriteria(personEventId: number, invoiceStatus: InvoiceStatusEnum) {
    let search = {
      personEventId: personEventId,
      invoiceStatus: invoiceStatus
    };

    this.currentQuery = JSON.stringify(search);
    this.getData();
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  onStatusChange($event: any) {
    this.invoiceStatus = +InvoiceStatusEnum[$event.value];
    this.createSearchCriteria(this.personEvent.personEventId, this.invoiceStatus);
  }

  getLookups() {
    this.invoiceStatuses = this.ToArray(InvoiceStatusEnum);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'claimReferenceNumber', show: true },
      { def: 'HCPInvoiceNumber', show: true },
      { def: 'RMAInvoiceNo', show: true },
      { def: 'invoiceStatus', show: true },
      { def: 'MSP', show: true },
      { def: 'hcpInvoiceNumber', show: true },
      { def: 'hcpAccountNumber', show: true },
      { def: 'serviceDate', show: true },
      { def: 'invoiceDate', show: true },
      { def: 'paymentConfirmationDate', show: true },
      { def: 'invoiceAmount', show: true },
      { def: 'authorizedAmount', show: true },
      { def: 'actions', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  menus: { title: string; url: string; disable: boolean }[];

  filterMenu(invoice: InvoiceDetails) {
    this.menus = [];
    this.menus = [
      { title: 'View', url: '', disable: false },
      { title: 'Edit', url: '', disable: true },
      { title: 'Assess Invoice', url: '', disable: true },
      { title: 'Payment Breakdown', url: '', disable: true }
    ];
  }

  getInvoiceStatus(id: any) {
    if (id <= 0) { return };
    return this.formatText(InvoiceStatusEnum[id]);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  onMenuItemClick(invoice: InvoiceDetails, menu: any): void {
    switch (menu.title) {
      case 'View':
        this.onClickView(invoice);
        break;
    }
  }

  onClickView(invoice: InvoiceDetails) {
    this.selectedInvoice = invoice;
  }

  close(){
    this.selectedInvoice = null;
  }
}
