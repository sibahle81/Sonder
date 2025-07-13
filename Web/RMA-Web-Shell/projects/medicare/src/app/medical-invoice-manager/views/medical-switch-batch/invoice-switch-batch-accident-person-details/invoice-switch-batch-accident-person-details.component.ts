import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { InvoiceLineDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-details';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { MedicareMedicalInvoiceSwitchBatchService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-switch-batch.service';
import { DatePipe } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { MedicalInvoiceClaimService } from 'projects/medicare/src/app/medical-invoice-manager/services/medical-invoice-claim.service';
import { isNullOrUndefined } from 'util';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { VatCodeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/vat-code.enum';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SwitchBatchInvoiceMapParams } from '../../../models/switch-batch-invoice-map-params';

@Component({
  selector: 'app-invoice-switch-batch-accident-person-details',
  templateUrl: './invoice-switch-batch-accident-person-details.component.html',
  styleUrls: ['./invoice-switch-batch-accident-person-details.component.css']
})
export class InvoiceSwitchBatchAccidentPersonDetailsComponent implements OnInit {
  
  @Input() selectedPersonEventSearchResultsInput: any;
  @Input() startWizardBatchSelectedData: any;
  @Output() lastQueryShowPEVTableEvent = new EventEmitter<[]>();
  switchBatchSearchResponseData$: any;
  switchBatchInvoiceMapParams: SwitchBatchInvoiceMapParams;
  GetPersonEventAccidentDetails$: Observable<any>;
  loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    public dialogRef: MatDialogRef<InvoiceSwitchBatchAccidentPersonDetailsComponent>,
    public readonly datepipe: DatePipe,
    private router: Router,
    private readonly wizardService: WizardService,
    private readonly alertService: AlertService,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly medicalInvoiceClaimService: MedicalInvoiceClaimService,
    private readonly medicareMedicalInvoiceSwitchBatchService: MedicareMedicalInvoiceSwitchBatchService,
    private userService: UserService,
    public dialog: MatDialog) { }

  ngOnInit() {
    
  }

  ngOnChanges(changes: SimpleChanges) {
    this.loading$.next(true);
    this.selectedPersonEventSearchResultsInput = changes.selectedPersonEventSearchResultsInput.currentValue;
    if (!isNullOrUndefined(this.selectedPersonEventSearchResultsInput) && this.selectedPersonEventSearchResultsInput.length > 0) {
      this.switchBatchInvoiceMapParams = {
        switchBatchInvoiceId: this.startWizardBatchSelectedData.switchBatchInvoiceId,
        possiblePersonEventId: this.selectedPersonEventSearchResultsInput[0].personEventId,
        possibleEventId: this.selectedPersonEventSearchResultsInput[0].eventId,
        claimId: this.selectedPersonEventSearchResultsInput[0].claimId,
        claimReferenceNumberMatch: this.selectedPersonEventSearchResultsInput[0].claimReferenceNumber
      }      

      this.showAccidentPersonDetails(this.selectedPersonEventSearchResultsInput[0].eventId);
    }

    this.loading$.next(false);
  }

  onSelectedAccidentPersonDetailsToMap() {
    this.confirmservice.confirmWithoutContainer('Confirm PersonEvent Map?', 'Are you sure you want to map the Invoice to this PersonEvent?',
      'Center', 'Center', 'Yes', 'No').subscribe(result => {
        if (result === true) {
          this.loading$.next(true);
          this.dialogRef.close(this.switchBatchInvoiceMapParams);
        }
      });
  }

  onLoadLastQuery() {
    this.selectedPersonEventSearchResultsInput.length = 0;
    this.lastQueryShowPEVTableEvent.emit([]);
  }

  showAccidentPersonDetails(EventId: number) {
    this.GetPersonEventAccidentDetails$ = this.medicalInvoiceClaimService.getPersonEventAccidentDetailsByEventId(EventId);
  }

}
