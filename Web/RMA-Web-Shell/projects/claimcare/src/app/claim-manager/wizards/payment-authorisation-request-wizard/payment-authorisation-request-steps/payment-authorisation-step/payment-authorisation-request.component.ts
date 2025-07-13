import { Component, OnInit } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { BehaviorSubject } from 'rxjs';
import { ClaimInvoice } from '../../../../shared/entities/claim-invoice.model';
import { ClaimInvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-status.enum';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { PersonEventModel } from '../../../../shared/entities/personEvent/personEvent.model';
import { ClaimCareService } from '../../../../Services/claimcare.service';

@Component({
  templateUrl: './payment-authorisation-request.component.html'
})
export class PaymentAuthorisationRequest extends WizardDetailBaseComponent<ClaimInvoice> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  personEvent: PersonEventModel;

  pendingAuthorisation = +ClaimInvoiceStatusEnum.PendingAuthorization;

  approved = +ClaimInvoiceStatusEnum.PaymentRequested;
  rejected = +ClaimInvoiceStatusEnum.Rejected;

  constructor(
    private readonly appEventsManager: AppEventsManager,
    readonly activatedRoute: ActivatedRoute,
    readonly authService: AuthService,
    private readonly wizardService: WizardService,
    private readonly claimService: ClaimCareService) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

  onLoadLookups() { }

  createForm() { }

  populateModel() { }

  populateForm() {
    this.getPersonEvent();
   }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model.claimInvoiceStatusId == +ClaimInvoiceStatusEnum.PendingAuthorization) {
      validationResult.errors++;
      validationResult.errorMessages.push('The claim invoice must be approved or rejected');
    }

    return validationResult;
  }

  setClaimInvoiceStatus(claimInvoiceStatusId: number) {
    this.model.claimInvoiceStatusId = claimInvoiceStatusId;
    this.saveWizardData();
  }

  getClaimInvoiceType(id: number) {
    return this.formatText(ClaimInvoiceTypeEnum[id]);
  }

  getClaimInvoiceStatus(id: number) {
    if (!id) { return };
    return this.formatText(ClaimInvoiceStatusEnum[id]);
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'N/A';
  }

  formatMoney(value: string): string {
    return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  private saveWizardData() {
    const saveWizardRequest = this.context.createSaveWizardRequest();
    saveWizardRequest.updateLockedUser = true;
    saveWizardRequest.lockedToUser = this.authService.getUserEmail();
    saveWizardRequest.currentStep = this.context.wizard.currentStepIndex;
    this.wizardService.saveWizard(saveWizardRequest).subscribe();
  }

  getPersonEvent() {
    this.claimService.getPersonEventByClaimId(this.model.claimId).subscribe(result => {
      this.personEvent = result;
      this.isLoading$.next(false);
    });
  }
}