import { DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { ReferralTypeLimitConfiguration } from 'projects/claimcare/src/app/claim-manager/shared/claim-care-shared/claim-referral/referral-type-limit-configuration';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
  selector: 'app-authority-limits-edit',
  templateUrl: './authority-limits-edit.component.html',
  styleUrls: ['./authority-limits-edit.component.css'],
})
export class AuthorityLimitsEditComponent {
  form: UntypedFormGroup;
  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ReferralTypeLimitConfiguration,
    private dialogRef: DialogRef<AuthorityLimitsEditComponent>,
    private claimService: ClaimCareService,
    private formBuilder: UntypedFormBuilder,
    private alertService: ToastrManager
  ) {
    this.createForm();
    if (data) {
      this.setForm();
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  setForm() {
    this.form.controls.referralTypeLimitConfigurationId.setValue(this.data.referralTypeLimitConfigurationId);
    this.form.controls.amountLimit.setValue(this.data.amountLimit);
    this.form.controls.permissionName.setValue(this.data.permissionName);
    this.form.controls.referralTypeLimitGroupId.setValue(this.data.referralTypeLimitGroupId);
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      referralTypeLimitConfigurationId: 0,
      referralTypeLimitGroupId: 0,
      amountLimit: new UntypedFormControl('', [ Validators.required]),
      permissionName: new UntypedFormControl('', [ Validators.required, Validators.max(50),]),
    });
  }

  onSave() {
    let formDetails = this.form.valid ? this.form.value : null;
    if (formDetails) {
      this.isLoading = true;
      this.claimService.saveReferralTypeLimitConfiguration(formDetails).subscribe((result: number) => {
        if (result > 0) {
          this.alertService.successToastr('Authority limit saved successfully', 'success', true);
        } else {
          this.alertService.errorToastr('Authority limit not saved successfully', 'error', true);
        }
        this.isLoading = false;
        this.dialogRef.close();
      });
    }
  }
}
