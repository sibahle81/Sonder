import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormArray } from '@angular/forms';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { RuleService } from 'projects/shared-components-lib/src/lib/rules-engine/shared/services/rule.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { BaseRulesComponent } from '../base-rules/base-rules.component';

@Component({
    templateUrl: '../base-rules/base-rules.component.html',
    selector: 'product-rules'
})
export class ProductRulesComponent extends BaseRulesComponent<Product> implements AfterViewInit {
    lookupUrl = 'rul/api/Rule/ByRuleTypeIds/1,3';

    constructor(
        authService: AuthService,
        appEventsManager: AppEventsManager,
        activatedRoute: ActivatedRoute,
        formBuilder: UntypedFormBuilder,
        ruleService: RuleService,
        private readonly productService: ProductService) {
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
    }

    onValidateModel(validationResult: ValidationResult): ValidationResult {

        if (this.model != null) {
            if (this.model.ruleItems === null || this.model.ruleItems.length === 0) {
                validationResult.errors = validationResult.errors + 1;
                validationResult.errorMessages.push('At least one rule is required');
            }
        }

        var CapLimit = 0;
        var KickIn = 0;
      

        for (const rule of this.model.ruleItems) 
        {
            var ruleDetails = JSON.parse(rule.ruleConfiguration);

            if (ruleDetails[0].fieldName == 'Cap Cover Limit') 
                  CapLimit = ruleDetails[0].fieldValue;
            
            if (ruleDetails[0].fieldName == 'Kick In Lump-sum') 
                KickIn = ruleDetails[0].fieldValue;  
        }

        if (CapLimit < 0) {
            validationResult.errors = validationResult.errors + 1;
            validationResult.errorMessages.push('Cap Cover Limit cannot be less than 0');
        }

        if (KickIn < 0) {
            validationResult.errors = validationResult.errors + 1;
            validationResult.errorMessages.push('Kick-In amount cannot be less than 0');
        }



        return validationResult;
    }

    getSavedRules(data: Product) {
        this.form.setControl('ruleConfigurations', new UntypedFormArray([]));
        if (data.ruleItems) {
            data.ruleItems.forEach(rule => {
                this.savedRules(rule);
            });
        } else if (data.id) {
            this.productService.getProductRules(data.id).subscribe(items => {
                this.ruleItems = items;
                this.ruleItems.forEach(rule => {
                    this.savedRules(rule);
                });
            });
        }
    }
}
