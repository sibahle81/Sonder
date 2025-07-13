import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormArray } from '@angular/forms';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { RuleService } from 'projects/shared-components-lib/src/lib/rules-engine/shared/services/rule.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Benefit } from '../../models/benefit';
import { BenefitService } from '../../services/benefit.service';
import { BaseRulesComponent } from '../base-rules/base-rules.component';
import { ProductService } from '../../services/product.service';
import { Constants } from '../../../constants';

@Component({
    templateUrl: '../base-rules/base-rules.component.html',
    selector: 'benefit-rules'
})
export class BenefitRulesComponent extends BaseRulesComponent<Benefit> implements AfterViewInit {
    lookupUrl = 'rul/api/Rule/ByRuleTypeIds/2,3';

    constructor(
        authService: AuthService,
        appEventsManager: AppEventsManager,
        activatedRoute: ActivatedRoute,
        formBuilder: UntypedFormBuilder,
        ruleService: RuleService,
        private readonly benefitService: BenefitService,
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
        if (this.model.productId > 0) {
            this.productService.getProduct(this.model.productId).subscribe(product => {
                this.filterRulesByProduct(product, true, Constants.benefit);
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

        var minBenefitAmount = 0;
        var maxBenefitAmount = 0;
        for (const rule of this.model.ruleItems) {
            var ruleDetails = JSON.parse(rule.ruleConfiguration);
            if (ruleDetails[0].fieldName == 'Minimum Benefit Ammount') {
                minBenefitAmount = ruleDetails[0].fieldValue;
            }
            if (ruleDetails[0].fieldName == 'Maximum Benefit Ammount') {
                maxBenefitAmount = ruleDetails[0].fieldValue;
            }
        }

        if (this.model.name === Constants.benefitRuleFuneralexpenses || this.model.name === Constants.benefitRuleConstantAttendanceAllowance) {  
            if (minBenefitAmount != maxBenefitAmount) {
                validationResult.errors = validationResult.errors + 1;
                validationResult.errorMessages.push('For benefit funeral and CCA the minimum and maximum should be the same');
            }
        }

        if (minBenefitAmount < 0) {
            validationResult.errors = validationResult.errors + 1;
            validationResult.errorMessages.push('Minimum benefit amount cannot be less than 0');
        }
        if (maxBenefitAmount < 0) {
            validationResult.errors = validationResult.errors + 1;
            validationResult.errorMessages.push('Maximum benefit amount cannot be less than 0');
        }
        return validationResult;
    }

    getSavedRules(data: Benefit) {
        this.form.setControl('ruleConfigurations', new UntypedFormArray([]));
        if (data.ruleItems) {
            data.ruleItems.forEach(rule => {
                this.savedRules(rule);
            });
        } else if (data.id) {
            this.benefitService.getBenefitRules(data.id).subscribe(items => {
                this.ruleItems = items;
                this.ruleItems.forEach(rule => {
                    this.savedRules(rule);
                });
            });
        }
    }

}
