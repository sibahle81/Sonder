import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { MedicareMedicalInvoiceCommonService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-common.service';
import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';
import { BehaviorSubject } from 'rxjs';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'holistic-medical-invoices',
  templateUrl: './holistic-medical-invoices.component.html',
  styleUrls: ['./holistic-medical-invoices.component.css']
})
export class HolisticMedicalInvoicesComponent extends UnSubscribe implements OnChanges {

  @Input() personEvent: PersonEventModel;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  invoiceDetails: InvoiceDetails[] = [];
  displayedColumnsInvoiceDetails: string[] = [
    'claimReferenceNumber',
    'HCPInvoiceNumber',
    'RMAInvoiceNo',
    'invoiceStatus',
    'MSP',
    'hcpInvoiceNumber',
    'hcpAccountNumber',
    'serviceDate',
    'invoiceDate',
    'paymentConfirmationDate',
    'invoiceAmount',
    'authorisedAmount',
    'actions'
  ];
  public invoiceDetailsDataSource = new MatTableDataSource<InvoiceDetails>();
  selectedInvoice: InvoiceDetails;
  invoiceStatusEnum: typeof InvoiceStatusEnum = InvoiceStatusEnum;
  invoiceStatusColor: string = "";
  isViewInvoice = false;
  isShowInvoices = true;
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  constructor(
    private medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.personEvent = this.personEvent;
    this.getInvoiceDetailsByPersonEventId(this.personEvent.personEventId);
  }

  expandCollapse(row) {
    if (row.isExpanded) {
      row.isExpanded = false;
    } else {
      row.isExpanded = true;
    }
  }

  menus: { title: string; url: string; disable: boolean }[];

  filterMenu(invoice: InvoiceDetails) {
    this.menus = [];
    this.menus = [
      { title: 'View', url: '', disable: false },
      {
        title: 'Edit', url: '',
        disable: true
      },
      {
        title: 'Assess Invoice', url: '',
        disable: true
      },
      {
        title: 'Payment Breakdown', url: '', disable: true
      }
    ];

  }

  onMenuItemClick(invoice: InvoiceDetails, menu: any): void {
    switch (menu.title) {
      case 'View':
        this.onClickView(invoice);
        break;
      case 'Edit':
        //this.onEditInvoice(invoice);
        break;
      case 'Assess Invoice':
        //this.onAssesInvoice(invoice);
        break;
      case 'Payment Breakdown':
        //this.onClickPaymentBreakdown(invoice);
        break;
    }

  }

  onClickView(invoice: InvoiceDetails) {
    this.isViewInvoice = true;
    this.isShowInvoices = false;
    this.selectedInvoice = invoice;
  }

  getInvoiceDetailsByPersonEventId(personEventId: number) {
    this.medicareMedicalInvoiceCommonService.getInvoiceDetailsByPersonEventId(personEventId).pipe(takeUntil(this.unSubscribe$)).subscribe(invoices => {
      if(invoices){
        this.invoiceDetails = invoices;
        this.invoiceDetailsDataSource.data = invoices;
        setTimeout(() => {
          this.invoiceDetailsDataSource.paginator = this.paginator;
          this.invoiceDetailsDataSource.sort = this.sort;
        });
        this.isLoading$.next(false);
      } else {this.isLoading$.next(false);}
    });
  }

  getStatusColor(invoiceStatusID: number): string {
    switch (invoiceStatusID) {
      case this.invoiceStatusEnum.Allocated:
        this.invoiceStatusColor = "#FFA500";
        break;
      case this.invoiceStatusEnum.PaymentRequested:
      case this.invoiceStatusEnum.Partially:
        this.invoiceStatusColor = "#78AAFF";
        break;
      case this.invoiceStatusEnum.Paid:
        this.invoiceStatusColor = "#00C600";
        break;
      case this.invoiceStatusEnum.Rejected:
        this.invoiceStatusColor = "#FF3300";
        break;
      default:
        this.invoiceStatusColor = "";
        break;
    }
    return this.invoiceStatusColor;
  }

  navigateBack() {
    this.isViewInvoice = true;
    if (this.isViewInvoice) {
      this.isViewInvoice = false;
      this.isShowInvoices = true;
    }
  }

}
