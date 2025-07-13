import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { MedicalInvoiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Invoice } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { InvoiceLineDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-details';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { MedicareMedicalInvoiceSwitchBatchService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-switch-batch.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { MedicalSwitchBatch } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-switch-batch';
import { SwitchBatchType } from 'projects/medicare/src/app/shared/enums/switch-batch-type';

export enum SelectType {
  single,
  multiple
}

@Component({
  selector: 'app-invoice-switch-batch-list',
  templateUrl: './invoice-switch-batch-list.component.html',
  styleUrls: ['./invoice-switch-batch-list.component.css']
})
export class InvoiceSwitchBatchListComponent implements OnInit {

  @Input() switchBatchSearchResponse: MedicalSwitchBatch[];

  constructor(private medicalInvoiceService: MedicalInvoiceService,
    private medicareMedicalInvoiceSwitchBatchService: MedicareMedicalInvoiceSwitchBatchService,
    private router: Router,
    private route: ActivatedRoute,
    private readonly wizardService: WizardService,
    private readonly alertService: AlertService,
    readonly confirmservice: ConfirmationDialogsService) {
    this.getRouteData()
  }

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  dataSourceSwitchBatchSearchList;

  loading$ = new BehaviorSubject<boolean>(false);

  selection = new SelectionModel<InvoiceDetails>(true, []);

  displayedColumnsSwitchBatchSearchList: string[] = [
    'description',
    'switchBatchNumber',
    'dateSubmitted',
    'dateReceived',
    'dateCompleted',
    'invoicesCounted',
    'invoicesProcessed',
    'amountCountedInclusive',
    'switchFileName',
    'viewInvoice',
    'assignedUser'
  ];
  switchBatchType: SwitchBatchType;
  switchBatchTypeEnum = SwitchBatchType;

  onClickView(switchBatchId) {
    this.loading$.next(true);
    this.router.navigate(['/medicare/invoice-switch-batch-view-details', switchBatchId, this.switchBatchType]);
  }

  ngOnInit() {
    this.dataSourceSwitchBatchSearchList = new MatTableDataSource<MedicalSwitchBatch>(this.switchBatchSearchResponse);
    this.dataSourceSwitchBatchSearchList.sort = this.sort;
    this.dataSourceSwitchBatchSearchList.paginator = this.paginator;
  }

  getRouteData() {
    this.route.params.subscribe((params: any) => {
      if (params.switchBatchType) {
        this.switchBatchType = +params.switchBatchType;
      }
    });
  }

}
