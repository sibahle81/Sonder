import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  selector: 'app-commutation-details',
  templateUrl: './commutation-details.component.html',
  styleUrls: ['./commutation-details.component.css']
})
export class CommutationDetailsComponent extends WizardDetailBaseComponent<null> implements OnInit {

  @Input() isReadOnly = false;
  @Input() isWizard = false;
  @Input() form: FormGroup

  commutationSchedules: Lookup[];
  commutationReasons: Lookup[];

  constructor(
    private lookupService: LookupService,
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,) {
    super(appEventsManager, authService, activatedRoute);

  }

  ngOnInit(): void {
    this.onLoadLookups();
  }

  createForm(id: number): void {

  }
  onLoadLookups(): void {
    this.lookupService.getCommutationReasons().subscribe((res) =>
    this.commutationReasons = res);
    this.lookupService.getCommutationSchedules().subscribe((res) =>
    this.commutationSchedules = res);
  }
  populateModel(): void {

  }
  populateForm(): void {

  }
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

}
