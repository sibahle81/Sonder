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

@Component({
  selector: 'app-invoice-under-assess-reasons-viewer-modal',
  templateUrl: './invoice-under-assess-reasons-viewer-modal.component.html',
  styleUrls: ['./invoice-under-assess-reasons-viewer-modal.component.css']
})
export class InvoiceUnderAssessReasonsViewerModalComponent implements OnInit {

  loading$ = new BehaviorSubject<boolean>(false);
  invoiceData:any;
  
  constructor(
    readonly confirmservice: ConfirmationDialogsService,
    @Inject(MAT_DIALOG_DATA) public invoiceDataClicked: any) {
      this.invoiceData = invoiceDataClicked.invoiceDataClicked;
     }
  
  ngOnInit() {
  }

}
