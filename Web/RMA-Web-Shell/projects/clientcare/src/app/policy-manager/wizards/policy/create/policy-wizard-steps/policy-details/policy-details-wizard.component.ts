import { BehaviorSubject } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { ProductOption } from 'projects/clientcare/src/app/product-manager/models/product-option';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { UnderwriterEnum } from 'projects/shared-models-lib/src/lib/enums/underwriter-enum';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { PaymentMethodEnum } from 'projects/shared-models-lib/src/lib/enums/payment-method-enum';

@Component({
  templateUrl: './policy-details-wizard.component.html'
})

export class PolicyDetailsWizardComponent extends WizardDetailBaseComponent<Policy[]> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  products: Product[];
  productOptions: ProductOption[];

  targetedInceptionDate: Date;

  _requiredDeclarationsSubmitted = false;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly productService: ProductService,
    private readonly productOptionService: ProductOptionService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

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
    if (!this.model[0].targetedPolicyInceptionDate) {
      this.model[0].targetedPolicyInceptionDate = this.model[0].policyInceptionDate;
    }
    this.policyInceptionChanged(this.model[0]);

    this.getLookups();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    let paymentMethodIsValid = true;
    this.model.forEach(policy => {
      if (!policy.paymentMethodId) {
        paymentMethodIsValid = false;
      }
    });

    let bankAccountIsValid = true;
    this.model.forEach(policy => {
      const hasBankAccount = policy.policyOwner && policy.policyOwner.rolePlayerBankingDetails && policy.policyOwner.rolePlayerBankingDetails.length > 0;  
      if (policy.paymentMethodId == +PaymentMethodEnum.DebitOrder) {
        bankAccountIsValid = hasBankAccount;
      }
    });

    if (!bankAccountIsValid) {
      validationResult.errors += 1;
      validationResult.errorMessages.push('At least one bank account is required when collection method is debit order');
    }

    if (!paymentMethodIsValid) {
      validationResult.errors += 1;
      validationResult.errorMessages.push('Collection method is required');
    }

    if (!this._requiredDeclarationsSubmitted) {
      validationResult.errors += 1;
      validationResult.errorMessages.push('All included declaration details are required');
    }

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

  showInceptionDate(productOptionId: number): boolean {
    if (this.model.length == 1) {
      return true;
    } else {
      const productOption = this.productOptions.find(s => s.id == productOptionId);
      if (productOption) {
        const product = this.products.find(s => s.id == productOption.productId);
        if (product) {
          if (product.underwriterId == +UnderwriterEnum.RMAMutualAssurance && this.model.length > 0) {
            return true;
          }
        }
      }
    }

    return false;
  }

  policyInceptionChanged($event: Policy) {
    this.targetedInceptionDate = new Date($event.targetedPolicyInceptionDate);
    this.model.forEach(policy => {
      policy.targetedPolicyInceptionDate = this.targetedInceptionDate;
      policy.paymentFrequencyId = $event.paymentFrequencyId;
      policy.paymentMethodId = $event.paymentMethodId;
    });
  }

  getProductOptionName(productOptionId: number): string {
    return (this.productOptions.find(s => s.id === productOptionId))?.name;
  }

  requiredDeclarationsSubmitted($event: boolean) {
    this._requiredDeclarationsSubmitted = $event;
  }
}
