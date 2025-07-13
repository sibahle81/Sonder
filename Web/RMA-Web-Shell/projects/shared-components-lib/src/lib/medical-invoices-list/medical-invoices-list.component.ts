import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { MedicareMedicalInvoiceCommonService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-common.service';
import { MedicalInvoiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'lib-medical-invoices-list',
  templateUrl: './medical-invoices-list.component.html',
  styleUrls: ['./medical-invoices-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('isExpanded', style({ height: '*', visibility: 'visible' })),
      transition('isExpanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class MedicalInvoicesListComponent implements OnInit {

  displayedColumnsInvoiceBreakdown: string[] = [
    'serviceDate',
    'hcpTariffCode',
    'requestedQuantity',
    'requestedAmountEx',
    'requestedVat',
    'creditAmount',
    'requestedAmount',
    'totalTariffAmount',
    'assessIncl',
    'tarrifDescription',
    'assessReason',
    'underAssessReason'
  ];
  invoiceDetails: InvoiceDetails[] = [];
  displayedColumnsInvoiceDetails: string[] = [
    'expand',
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
  personEvent: PersonEventModel;
  public invoiceDetailsDataSource = new MatTableDataSource<InvoiceDetails>();
  selectedInvoice: InvoiceDetails;
  invoiceStatusEnum: typeof InvoiceStatusEnum = InvoiceStatusEnum;
  invoiceStatusColor:string = "";
  isViewInvoice = false;
  isShowInvoices = true;
  public isInvoicesLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor(
    private medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService,
    public dialogRef: MatDialogRef<MedicalInvoicesListComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)  public data: any,) { }

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  ngOnInit(): void {
    this.personEvent = this.data.personEvent;
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
        disable:  true
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

  onClickView(invoice: InvoiceDetails){
    this.isViewInvoice= true;
    this.isShowInvoices = false;
    this.selectedInvoice = invoice;
  }

  getInvoiceDetailsByPersonEventId(personEventId: number) {
    this.isInvoicesLoading$.next(true);
    this.medicareMedicalInvoiceCommonService.getInvoiceDetailsByPersonEventId(personEventId).subscribe(invoices => {
      this.invoiceDetails = invoices;
      this.invoiceDetailsDataSource.data = invoices;
      setTimeout(() => {
        this.invoiceDetailsDataSource.paginator = this.paginator;
        this.invoiceDetailsDataSource.sort = this.sort;
      });
      this.isInvoicesLoading$.next(false);
    });
  }

  getStatusColor(invoiceStatusID:number ): string {
    switch (invoiceStatusID)
    {
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
            this.invoiceStatusColor= "";
            break;
    }
    return this.invoiceStatusColor;
}

navigateBack(){
  this.isViewInvoice= true;
  if(this.isViewInvoice){
    this.isViewInvoice= false;
    this.isShowInvoices = true;
  }
}

closeAll(){
  this.dialogRef.close();
}

}
