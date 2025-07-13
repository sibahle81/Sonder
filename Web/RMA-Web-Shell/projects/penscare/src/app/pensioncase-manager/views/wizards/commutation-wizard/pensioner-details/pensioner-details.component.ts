import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  selector: 'app-pensioner-details',
  templateUrl: './pensioner-details.component.html',
  styleUrls: ['./pensioner-details.component.css']
})
export class PensionerDetailsComponent extends WizardDetailBaseComponent<null>  implements OnInit {

  @Input() isReadOnly = false;
  @Input() isWizard = false;
  @Input() form: FormGroup

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);

  }

  ngOnInit(): void {
  }

  createForm(id: number): void {

  }
  onLoadLookups(): void {

  }
  populateModel(): void {

  }
  populateForm(): void {

  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

}
