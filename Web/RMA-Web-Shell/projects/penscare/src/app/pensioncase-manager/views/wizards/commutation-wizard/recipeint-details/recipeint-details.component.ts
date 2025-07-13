import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

@Component({
  selector: 'app-recipeint-details',
  templateUrl: './recipeint-details.component.html',
  styleUrls: ['./recipeint-details.component.css']
})
export class RecipeintDetailsComponent extends WizardDetailBaseComponent<null> implements OnInit {

  @Input() isReadOnly = false;
  @Input() isWizard = false;
  @Input() form: FormGroup;

  beneficiaryTypes: Lookup[];

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private lookupService: LookupService) {
    super(appEventsManager, authService, activatedRoute);

  }

  ngOnInit(): void {
    this.lookupService.getBeneficiaryTypes().subscribe((res) => {
      this.beneficiaryTypes = res});
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
