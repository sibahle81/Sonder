import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { InvoiceDetails } from '../../../medical-invoice-manager/models/medical-invoice-details';
import { InvoiceStatusEnum } from '../../../medical-invoice-manager/enums/invoice-status.enum';
import { isNullOrUndefined } from 'util';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';

@Component({
  selector: 'app-under-assess-reasons-viewer',
  templateUrl: './under-assess-reasons-viewer.component.html',
  styleUrls: ['./under-assess-reasons-viewer.component.css'],
  standalone: true,
  imports: [ CommonModule, RouterModule, MatMenuModule, SharedComponentsLibModule]
})
export class UnderAssessReasonsViewerComponent implements OnInit {

  @Input() invoiceUnderAssessReasons: InvoiceDetails;

  public invoiceStatusEnum: typeof InvoiceStatusEnum = InvoiceStatusEnum;
  
  constructor() { }

  ngOnInit(): void {
  }

  checkIfFirstViewShow(){
    let results = this.invoiceUnderAssessReasons?.invoiceUnderAssessReasons?.length > 0
    return results
  }

  checkIfCommentExist(reason): string {
    return (!isNullOrUndefined(reason.comments) && reason.comments.length > 0) ? "-" + reason.comments : "";
  }

}
