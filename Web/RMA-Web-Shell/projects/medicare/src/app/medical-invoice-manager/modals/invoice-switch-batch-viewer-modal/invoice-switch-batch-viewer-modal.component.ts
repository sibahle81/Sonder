import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MedicalInvoicesList } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-list';
import { MedicalInvoiceLineItem } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-item';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { UntypedFormBuilder } from '@angular/forms';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { BehaviorSubject } from 'rxjs';
import { SwitchBatchType } from '../../../shared/enums/switch-batch-type';


@Component({
  selector: 'app-invoice-switch-batch-viewer-modal',
  templateUrl: './invoice-switch-batch-viewer-modal.component.html',
  styleUrls: ['./invoice-switch-batch-viewer-modal.component.css']
})
export class InvoiceSwitchBatchViewerModalComponent implements OnInit {

  loading$ = new BehaviorSubject<boolean>(false);
  invoiceData: any;
  switchBatchType: SwitchBatchType = SwitchBatchType.MedEDI;//default val used if not set/passed

  constructor(private readonly formBuilder: UntypedFormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private readonly alertService: AlertService,
    readonly confirmservice: ConfirmationDialogsService,
    @Inject(MAT_DIALOG_DATA) public invoiceDataClicked: any) {
    this.invoiceData = invoiceDataClicked.invoiceDataClicked;
    this.switchBatchType = invoiceDataClicked.switchBatchType;
  }


  currentUrl = this.router.url;

  displayedColumns: string[] = [
    "ServiceDate",
    "hcpTariffCode",
    "description",
    "icd10Code",
    "totalTariffAmount",
    "quantity",
    "InvUnitAmount",
    "authorisedAmount",
    "requestedAmount",
    "totalTariffVat",
    "totalIncl",
  ];
  
  public invoiceStatusEnum: typeof InvoiceStatusEnum = InvoiceStatusEnum;
  public payeeTypeEnum: typeof PayeeTypeEnum = PayeeTypeEnum;

  invoiceLineItems: MedicalInvoiceLineItem[] = [];
  resolvedData: MedicalInvoicesList[];
  

  dataSource = new MatTableDataSource<MedicalInvoiceLineItem>(this.invoiceLineItems);

  ngOnInit() {
    this.invoiceLineItems = this.invoiceData.switchBatchInvoiceLines
    this.dataSource = new MatTableDataSource<MedicalInvoiceLineItem>(this.invoiceLineItems);
  }

  onCloseView() {
    this.router.navigate(['/medicare/medical-invoice-list']);
  }

  ngOnDestroy() {
    this.activeRoute.snapshot.data
    this.invoiceLineItems = [];
  }

}
