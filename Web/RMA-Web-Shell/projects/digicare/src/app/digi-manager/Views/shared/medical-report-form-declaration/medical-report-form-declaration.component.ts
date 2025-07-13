import { style } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Tenant } from 'projects/shared-models-lib/src/lib/security/tenant';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthCare-provider-model';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  selector: 'app-medical-report-form-declaration',
  templateUrl: './medical-report-form-declaration.component.html',
  styleUrls: ['./medical-report-form-declaration.component.css']
})

export class MedicalReportFormDeclarationComponent extends WizardDetailBaseComponent<ProgressMedicalReportForm> implements OnInit {
  public form: UntypedFormGroup
  showSearchProgress = false
  today = new Date();
  disabled: boolean = true;
  tenant: Tenant;
  userHealthCareProviders: UserHealthCareProvider[];
  disablePracticeNumber = false;
  isAccident: boolean = true;

  constructor(appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly userService: UserService,
    private readonly datePipe: DatePipe) {
    super(appEventsManager, authService, activatedRoute);

  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {

    if (this.form) { return; }

    this.form = this.formBuilder.group({

      healthcareProviderPracticeNumber: new UntypedFormControl(''),
      healthcareProviderName: new UntypedFormControl({ value: '', disabled: this.disabled }),
      reportDate: new UntypedFormControl({ value: '', disabled: this.disabled }),
      isDeclarationAccepted: new UntypedFormControl(''),
      healthcareProviderId: new UntypedFormControl(''),
      healthCareProviderList: new UntypedFormControl('')
    });
  }

  populateForm(): void {
    if (!this.model && !this.form.controls) return;

    const form = this.form.controls;
    const model = this.model;
    form.healthcareProviderPracticeNumber.setValue(model.medicalReportForm.healthcareProviderPracticeNumber);
    form.healthcareProviderName.setValue(model.medicalReportForm.healthcareProviderName);
    form.healthcareProviderId.setValue(model.medicalReportForm.healthcareProviderId);
    if (new Date(model.medicalReportForm.reportDate) > new Date('0001/01/01'))
      form.reportDate.setValue(this.datePipe.transform(model.medicalReportForm.reportDate, 'yyyy-MM-dd'));
    else
      form.reportDate.setValue(this.datePipe.transform(this.today, 'yyyy-MM-dd'))

    form.isDeclarationAccepted.setValue(model.medicalReportForm.isDeclarationAccepted);

    if (model.medicalReportForm.eventCategoryId == 1)
      this.isAccident = true;
    else if (model.medicalReportForm.eventCategoryId == 2)
      this.isAccident = false;
    this.getUserHealthCareProviders();
    this.disablePracticeNumber = (this.userHealthCareProviders !== undefined || !this.isNotSet(form.healthcareProviderPracticeNumber));
  }

  populateModel(): void {
    if (!this.form) return;
    const formModel = this.form.controls;
    const user = this.authService.getCurrentUser();

    this.getCurrentTenant();

    if (user) {
      this.model.medicalReportForm.createdBy = user.email;
      this.model.medicalReportForm.modifiedBy = user.email;
      if (this.tenant)
        this.model.medicalReportForm.tenantId = this.tenant.id;
    }

    this.model.medicalReportForm.reportDate = formModel.reportDate.value;
    this.model.medicalReportForm.healthcareProviderName = formModel.healthcareProviderName.value;
    this.model.medicalReportForm.healthcareProviderPracticeNumber = formModel.healthcareProviderPracticeNumber.value;
    this.model.medicalReportForm.healthcareProviderId = formModel.healthcareProviderId.value;
    this.model.medicalReportForm.isDeclarationAccepted = formModel.isDeclarationAccepted.value;
  }

  getCurrentTenant(): void {
    this.userService.getTenant(this.authService.getCurrentUser().email).subscribe(
      tenant => {
        this.tenant = tenant;
      }
    );
  }

  getUserHealthCareProviders(): void {
    const user = this.authService.getCurrentUser();
    this.userService.getUserHealthCareProviders(user.email).subscribe(
      userHealthCareProviders => {

        if (userHealthCareProviders) {

          if (userHealthCareProviders.length == 1)
            this.setHealthCareProviderDetails(userHealthCareProviders[0]);
          else
            this.userHealthCareProviders = userHealthCareProviders;
        }
      }
    );
  }

  selected($event: any) {
    if ($event && $event.value) {
      this.setHealthCareProviderDetails($event.value);
    }
  }

  setHealthCareProviderDetails(userHealthCareProvider: UserHealthCareProvider) {

    this.form.patchValue({
      healthcareProviderPracticeNumber: userHealthCareProvider.practiceNumber,
      healthcareProviderName: userHealthCareProvider.name,
      healthcareProviderId: userHealthCareProvider.compCareMSPId
    });
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.form == null) return;

    if (!this.form.get("isDeclarationAccepted").value) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Declaration not accepted`);
    }

    if (!this.form.get("healthcareProviderPracticeNumber").value) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Healthcare provider's practice number is required`);
    }
    return validationResult;
  }

  onLoadLookups(): void { }

  clearForm(): void {
    this.form.patchValue({
      healthcareProviderPracticeNumber: '',
      healthcareProviderName: ''
    });
  }

  isNotSet(str): boolean {
    return (!str || 0 === str.length || str === undefined);
  }

}
