import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject } from 'rxjs';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';

@Component({
  selector: 'app-claim-medical-report-details-wizard',
  templateUrl: './claim-medical-report-details-wizard.component.html',
  styleUrls: ['./claim-medical-report-details-wizard.component.css']
})
export class ClaimMedicalReportDetailsWizardComponent extends WizardDetailBaseComponent<PersonEventModel> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  personEventModel: PersonEventModel;
  member: RolePlayer;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    return;
  }

  createForm(id: number): void {
    return;
  }

  onLoadLookups(): void {
    return;
  }

  populateModel(): void {
    return;
  }

  populateForm(): void {
    this.personEventModel = this.model;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}