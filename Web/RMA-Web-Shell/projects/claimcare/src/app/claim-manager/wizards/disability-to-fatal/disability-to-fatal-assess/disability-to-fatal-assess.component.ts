import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';

@Component({
  selector: 'app-disability-to-fatal-assess',
  templateUrl: './disability-to-fatal-assess.component.html',
  styleUrls: ['./disability-to-fatal-assess.component.css']
})
export class DisabilityToFatalAssessComponent extends WizardDetailBaseComponent<PersonEventModel> implements OnInit {

  defaultPEVTabIndex = 11;

  constructor(
    private readonly appEventsManager: AppEventsManager,
    readonly activatedRoute: ActivatedRoute,
    readonly authService: AuthService) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

  onLoadLookups() { }

  createForm() { }

  populateModel() { }

  populateForm() {
   }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}