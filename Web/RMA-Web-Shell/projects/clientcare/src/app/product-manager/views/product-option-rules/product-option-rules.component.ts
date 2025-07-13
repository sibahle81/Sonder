import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormArray } from '@angular/forms';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { RuleService } from 'projects/shared-components-lib/src/lib/rules-engine/shared/services/rule.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { ProductOption } from '../../models/product-option';
import { ProductOptionService } from '../../services/product-option.service';
import { BaseRulesComponent } from '../base-rules/base-rules.component';
import { ProductService } from '../../services/product.service';
import { Constants } from '../../../constants';

@Component({
    templateUrl: '../base-rules/base-rules.component.html',
    selector: 'product-option-rules'
})
export class ProductOptionRulesComponent extends BaseRulesComponent<ProductOption> implements AfterViewInit {
    lookupUrl = 'rul/api/Rule/ByRuleTypeIds/4,3';

    constructor(
        authService: AuthService,
        appEventsManager: AppEventsManager,
        activatedRoute: ActivatedRoute,
        formBuilder: UntypedFormBuilder,
        ruleService: RuleService,
        private readonly productService: ProductService,
        private readonly productOptionService: ProductOptionService) {
        super(authService, appEventsManager, activatedRoute, formBuilder, ruleService);
    }

    populateModel(): void {
        this.validateMultiSelects();
        this.model.ruleItems = this.getRuleItems;
    }

    populateForm(): void {
        this.getSavedRules(this.model);

        if (this.model.ruleItems == null) {
            this.model.ruleItems = [];
        }

        this.form.patchValue({
            ruleIds: this.model.ruleItems.map(t => t.ruleId),
        });

        this.getRules();
        if (this.model.productId > 0) {
            this.productService.getProduct(this.model.productId).subscribe(product => {
                this.filterRulesByProduct(product, true, Constants.productOption);
            })
        }
    }

    onValidateModel(validationResult: ValidationResult): ValidationResult {
        if (this.model != null) {
            if (this.model.ruleItems === null || this.model.ruleItems.length === 0) {
                validationResult.errors = validationResult.errors + 1;
                validationResult.errorMessages.push('At least one rule is required');
            }
        }
        return validationResult;
    }

    getSavedRules(data: ProductOption) {
        this.form.setControl('ruleConfigurations', new UntypedFormArray([]));
        if (data.ruleItems) {
            data.ruleItems.forEach(rule => {
                this.savedRules(rule);
            });
        } else if (data.id) {
            this.productOptionService.getProductOptionRules(data.id).subscribe(items => {
                this.ruleItems = items;
                this.ruleItems.forEach(rule => {
                    this.savedRules(rule);
                });
            });
        }
    }
}
