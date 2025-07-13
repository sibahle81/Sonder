import { BehaviorSubject } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductOption } from 'projects/clientcare/src/app/product-manager/models/product-option';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { KeyValue } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';

@Component({
  templateUrl: './policy-schedule-preview-wizard.component.html'
})

export class PolicySchedulePreviewWizardComponent extends WizardDetailBaseComponent<Policy[]> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  products: Product[];
  productOptions: ProductOption[];

  wizardId: string;

  reportUrl: string;
  parameters: KeyValue<string, string>[];

  expanded: boolean;

  _form: UntypedFormGroup;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly productService: ProductService,
    private readonly productOptionService: ProductOptionService,
    private readonly formBuilder: UntypedFormBuilder
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.wizardId = params.linkedId;
      if(this.model) {
        this.setPolicy(this.model[0]);
      }
    });
  }

  createForm(id: number): void {
    this._form = this.formBuilder.group({
      policy: [{ value: null }]
    });
  }

  onLoadLookups(): void {
    return;
  }

  populateModel(): void {
    this.reset();
  }

  populateForm(): void {
    this.getLookups();
    this.setForm();
    this.setPolicy(this.model[0]);
  }

  setForm() {
    this._form.patchValue({
      policy: this.model[0]
    });
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  getLookups() {
    this.getProducts();
  }

  getProducts() {
    this.loadingMessage$.next('loading products...please wait');
    this.productService.getProducts().subscribe(results => {
      this.products = results;
      this.getProductOptions();
    });
  }

  getProductOptions() {
    this.loadingMessage$.next('loading product options...please wait');
    this.productOptionService.getProductOptions().subscribe(results => {
      this.productOptions = results;
      this.isLoading$.next(false);
    });
  }

  getProductOptionName(productOptionId: number): string {
    var productOption = this.productOptions.find(s => s.id === productOptionId);
    return productOption.name + ' (' + productOption.code + ')';
  }

  setPolicy($event: Policy) {
    this.parameters = [{ key: 'WizardId', value: this.wizardId }, { key: 'PolicyId', value: $event.policyId.toString() }];
    this.reportUrl = 'RMA.Reports.ClientCare.Policy/RMAPolicySchedules/RMAAssurancePolicySchedule/RMAAssurancePolicySchedulePreview';
  }

  reset() {
    this._form.controls.policy.reset();
    this.parameters = null;
    this.reportUrl = null;
  }
}
