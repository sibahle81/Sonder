import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { Claim } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim.model';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject } from 'rxjs';
import { PreauthTypeEnum } from '../../../medi-manager/enums/preauth-type-enum';
import { PreAuthorisation } from '../../../preauth-manager/models/preauthorisation';
import { MediCarePreAuthService } from '../../../preauth-manager/services/medicare-preauth.service';
import { InvoiceDetails } from '../../models/medical-invoice-details';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { MatDialog } from '@angular/material/dialog';
import { isNullOrUndefined } from 'util';
import { SwitchBatchType } from '../../../shared/enums/switch-batch-type';
import { MedicalInvoiceAssessModalComponent } from '../../modals/medical-invoice-assess/medical-invoice-assess.component';
import { MedicareMedicalInvoiceCommonService } from '../../services/medicare-medical-invoice-common.service';
import { tap } from 'rxjs/operators';
import { Invoice } from '../../models/medical-invoice';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-invoice-assessment-details',
  templateUrl: './invoice-assessment-details.component.html',
  styleUrls: ['./invoice-assessment-details.component.css']
})
export class InvoiceAssessmentDetailsComponent extends WizardDetailBaseComponent<Invoice> implements OnInit {
  loadingData$ = new BehaviorSubject<boolean>(false);
  invoiceId = 0;
  switchBatchType: SwitchBatchType = SwitchBatchType.MedEDI;
  invoiceDetails: InvoiceDetails;
  createForm(id: number): void {

  }
  onLoadLookups(): void {

  }
  populateModel(): void {

  }
  populateForm(): void {
    if (this.context) {
            this.invoiceId = this.context.wizard.linkedItemId;
      this.onAssesInvoice();
    }
  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  constructor(public dialog: MatDialog,
    readonly invoiceService: MedicareMedicalInvoiceCommonService,
    private readonly toastr: ToastrManager,
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {

  }

  onAssesInvoice() {
    this.loadingData$.next(true);
    this.invoiceService.getInvoiceDetails(
      this.invoiceId
    ).pipe(tap(invoice => {
      if (invoice) {
        this.invoiceDetails = invoice;
        if (this.context && this.context.wizard){
          if (this.context.wizard.currentStepIndex ==0){
            this.openAssessmentDialog();
          }          
        }       
      }
      this.loadingData$.next(false);
    })).subscribe();
  }

  openAssessmentDialog() {
    if (this.invoiceDetails.switchBatchId) {
      this.switchBatchType = this.invoiceDetails.switchBatchId;
    }
    this.dialog.open(MedicalInvoiceAssessModalComponent, {
      width: '85%',
      data: { invoiceDataClicked: this.invoiceDetails, switchBatchTypePassed: this.switchBatchType }
    });
  }
}


