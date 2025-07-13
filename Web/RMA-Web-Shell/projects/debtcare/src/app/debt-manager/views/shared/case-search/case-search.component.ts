import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';

import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
 

@Component({
  selector: 'case-search',
  templateUrl: './case-search.component.html',
  styleUrls: ['./case-search.component.css']
})

export class CaseSearchComponent extends WizardDetailBaseComponent<null> implements OnInit {

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,) {
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
