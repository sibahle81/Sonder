import { Component, ViewChild } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { UntypedFormGroup, UntypedFormBuilder ,UntypedFormControl, Validators} from '@angular/forms';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { ClaimRecoveryReasonEnum } from 'projects/shared-models-lib/src/lib/enums/claim-recovery-reason-enum';
import { ClaimNotesComponent } from 'projects/claimcare/src/app/claim-manager/views/claim-notes/claim-notes.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ClaimantRecoveryModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claimant-recovery-model';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'claimant-recovery-reason',
  templateUrl: './claimant-recovery-reason.component.html',
  styleUrls: ['./claimant-recovery-reason.component.css']
})
export class ClaimantRecoveryReasonComponent extends WizardDetailBaseComponent<ClaimantRecoveryModel> {

  @ViewChild(ClaimNotesComponent, { static: true }) claimNotesComponent: ClaimNotesComponent;

  form: UntypedFormGroup;
  isNotes = false;
  hasPermission: boolean;
  recoveryReason: ClaimRecoveryReasonEnum;
  requiredPermission = 'Create Claimant Recovery';
  paymentDays = Array<{ id: number, value: number }>();

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
    this.SettingPaymentDays();
    this.hasPermission = userUtility.hasPermission(this.requiredPermission);
  }
  createForm(id: number): void {
    this.form = this.formBuilder.group({
      recoveryReason: new UntypedFormControl('', [Validators.required ]),
      recoverAmount: new UntypedFormControl('', [Validators.required ]),
      paymentPlan: new UntypedFormControl('', [Validators.required ]),
      paymentDay: new UntypedFormControl('', [Validators.required ])
    });
  }

  populateModel(): void {
    const formModel = this.form.getRawValue();
    this.model.recoveryAmount = formModel.recoverAmount;
    this.model.recoveryReason = formModel.recoveryReason;
    this.model.paymentPlan = formModel.paymentPlan;
    this.model.paymentDay = formModel.paymentDay;
  }

  populateForm(): void {
    this.isNotes = true;
    this.form.patchValue({
      recoverAmount: this.model.recoveryAmount,
      recoveryReason: this.model.recoveryReason,
      paymentPlan: this.model.paymentPlan,
      paymentDay: this.model.paymentDay,
    });
    this.claimNotesComponent.getNotes(this.model.claimId, ServiceTypeEnum.ClaimManager, 'Claim');

  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }
    return validationResult;
  }

  SettingPaymentDays() {
    for (let n = 1; n <= 32; n++) {
      if (this.paymentDays.length === 31) {
        break;
      } else { this.paymentDays.push({ id: n, value: n }); }
    }
  }

  back() {
  }
}
