import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { RoleplayerGroupPolicy } from '../../shared/entities/role-player-group-policy';

@Component({
  selector: 'app-group-policy-company',
  templateUrl: './group-policy-company.component.html',
  styleUrls: ['./group-policy-company.component.css']
})
export class GroupPolicyCompanyComponent extends WizardDetailBaseComponent<RoleplayerGroupPolicy> {

  isLoading = true;

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly productOptionService: ProductOptionService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups() { }

  createForm() {
    this.form = this.formBuilder.group({
      company: [''],
      policyNumber: [''],
      clientReference: [''],
      productOption: ['']
    });
  }

  populateForm() {
    this.isLoading = true;
    this.productOptionService.getProductOption(this.model.productOptionId).subscribe(
      data => {
        this.form.patchValue({
          company: this.model.companyName,
          policyNumber: this.model.parentPolicyNumber,
          clientReference: this.model.clientReference,
          productOption: data.name
        });
        this.isLoading = false;
      }
    );
    this.disable();
  }

  populateModel() {}

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
