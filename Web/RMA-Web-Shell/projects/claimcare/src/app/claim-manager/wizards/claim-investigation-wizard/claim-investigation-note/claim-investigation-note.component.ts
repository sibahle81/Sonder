import { Component, ViewChild } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { ClaimRecoveryReasonEnum } from 'projects/shared-models-lib/src/lib/enums/claim-recovery-reason-enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ClaimInvestigationModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim-investigation-model';
import { ClaimNotesComponent } from 'projects/claimcare/src/app/claim-manager/views/claim-notes/claim-notes.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'claim-investigation-note',
  templateUrl: './claim-investigation-note.component.html',
  styleUrls: ['./claim-investigation-note.component.css']
})
export class ClaimInvestigationNoteComponent extends WizardDetailBaseComponent<ClaimInvestigationModel> {

  @ViewChild(ClaimNotesComponent, { static: true }) claimNotesComponent: ClaimNotesComponent;

  form: UntypedFormGroup;
  isNotes = false;
  hasPermission: boolean;
  recoveryReason: ClaimRecoveryReasonEnum;
  requiredPermission = 'Create Claim Investigation';
  isFraudulentCase: boolean;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
    this.onLoadLookups();
  }

  onLoadLookups(): void {
    this.createForm(0);
    this.hasPermission = userUtility.hasPermission(this.requiredPermission);
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      fraudulentCase: '',
    });
  }

  populateModel(): void {
    const formModel = this.form.getRawValue();
    this.model.fraudulentCase = formModel.fraudulentCase;
  }

  populateForm(): void {
    this.isNotes = true;
    this.form.patchValue({
      fraudulentCase: this.model.fraudulentCase,
      isFraudulentCase: this.model.fraudulentCase,
    });
    this.claimNotesComponent.getNotes(this.model.personEventId, ServiceTypeEnum.ClaimManager, 'PersonEvent');

  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }
    return validationResult;
  }

  fraudulentCase($event: any) {
    this.isFraudulentCase = $event.checked;
    this.model.fraudulentCase = this.isFraudulentCase;
  }

  back() {
  }
}
