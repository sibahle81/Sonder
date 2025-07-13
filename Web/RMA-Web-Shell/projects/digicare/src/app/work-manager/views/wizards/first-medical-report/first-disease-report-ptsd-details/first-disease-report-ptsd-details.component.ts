import { Component} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { FirstDiseaseMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-disease-medical-report-form';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';

@Component({
  selector: 'app-final-disease-report-ptsd-details',
  templateUrl: './first-disease-report-ptsd-details.component.html',
  styleUrls: ['./first-disease-report-ptsd-details.component.css']
})
export class FirstDiseaseReportPtsdDetailsComponent extends WizardDetailBaseComponent<FirstDiseaseMedicalReportForm> {

  constructor(appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
  }

      //#region Wizard implementation
      createForm(id: number): void {
        this.form = this.formBuilder.group({
          id: [id],
          ctlAxis1: new UntypedFormControl(''),
          ctlAxis2: new UntypedFormControl(''),
          ctlAxis3: new UntypedFormControl(''),
          ctlAxis4: new UntypedFormControl(''),
          ctlAxis5: new UntypedFormControl('')
        });
      }

      onLoadLookups(): void {

      }

      onValidateModel(validationResult: ValidationResult): ValidationResult {
        return validationResult;
      }

      populateForm(): void {

        const form = this.form.controls;
        const model = this.model;

        form.ctlAxis1.setValue(model.axis1);
        form.ctlAxis2.setValue(model.axis2);
        form.ctlAxis3.setValue(model.axis3);
        form.ctlAxis4.setValue(model.axis4);
        form.ctlAxis5.setValue(model.axis5);
      }

      populateModel(): void {

        const form = this.form.controls;
        const model = this.model;

        model.axis1 = form.ctlAxis1.value;
        model.axis2 = form.ctlAxis2.value;
        model.axis3 = form.ctlAxis3.value;
        model.axis4 = form.ctlAxis4.value;
        model.axis5 = form.ctlAxis5.value;
      }

      //#endregion Wizard implementation

}
