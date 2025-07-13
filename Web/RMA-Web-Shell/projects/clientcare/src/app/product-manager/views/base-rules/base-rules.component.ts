import { AfterViewInit, Directive } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { UntypedFormBuilder, Validators, UntypedFormArray, UntypedFormControl } from '@angular/forms';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Rule } from 'projects/shared-components-lib/src/lib/rules-engine/shared/models/rule';
import { RuleConfig } from '../../../../../../shared-components-lib/src/lib/rules-engine/shared/models/rule-config';
import { RuleService } from 'projects/shared-components-lib/src/lib/rules-engine/shared/services/rule.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { RuleItem } from 'projects/shared-models-lib/src/lib/common/ruleItem';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Product } from '../../models/product';
import { Benefit } from '../../models/benefit';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { Constants } from '../../../constants';
import 'src/app/shared/extensions/string.extensions';

const territoryDescription = "S: South Africa; W: Worldwide";

@Directive()
export abstract class BaseRulesComponent<TModel> extends WizardDetailBaseComponent<TModel> implements AfterViewInit {
    rules: Rule[];
    ruleItems: RuleItem[];
    lookupUrl: string;
    isThreshold = false;
    selectedThreshold: number;
    thresholdRuleId: number;
    territory: string = territoryDescription;
    territories: string[] = ['South Africa', 'Worldwide'];

    count = 0;
    initialRules: Lookup[];
    constructor(
        authService: AuthService,
        appEventsManager: AppEventsManager,
        activatedRoute: ActivatedRoute,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly ruleService: RuleService) {
        super(appEventsManager, authService, activatedRoute);
    }

    abstract populateModel(): void;
    abstract populateForm(): void;
    abstract onValidateModel(validationResult: ValidationResult): ValidationResult;
    abstract getSavedRules(data: TModel);

    onLoadLookups(): void {
    }

    ngAfterViewInit(): void {
        this.subscribeRulesChange();
    }

    createForm(id: any): void {
        this.form = this.formBuilder.group({
            id: [id],
            ruleConfigurations: this.formBuilder.array([]),
            ruleIds: new UntypedFormControl()
        });
    }

    protected validateMultiSelects(): boolean {
        const ruleLookup = this.getLookupControl('RulesFoData');
        return ruleLookup.isValid;
    }

    protected getRules(): void {
        this.ruleService.getRules().subscribe(data => {
            this.rules = data;
            const ruleIds = this.form.get('ruleIds').value;
            if (ruleIds) {
                this.processRules(ruleIds);
            }
        });
    }

    protected filterRulesByProduct(product: Product, isRemove: boolean, type: string): void {
        const ruleLookup = this.getLookupControl('RulesFoData');
        if (this.count === 0) {
            this.count++
            this.initialRules = ruleLookup.items;
        } else { ruleLookup.items = this.initialRules }
    }

    protected filterRulesByBenefit(product: Product, isRemove: boolean): void {
        const ruleLookup = this.getLookupControl('RulesFoData');
        if (this.count === 0) {
            this.count++
            this.initialRules = ruleLookup.items;
            
        } else { ruleLookup.items = this.initialRules }
    }

    protected subscribeRulesChange(): void {
        if (this.isWizard && !this.form.disabled) {
            const ruleLookup = this.getLookupControl('RulesFoData');
            const ruleIds = ruleLookup.getSelectedItems();
            ruleLookup.onChange.pipe(debounceTime(1000)).subscribe((data: any) => {
                if (data) {
                    const rules = ruleLookup.getSelectedItems();
                    if (rules) { this.processRules(rules); }
                }
            });
        }
    }

    protected processRules(selectedRuleIds: number[]) {
        const rulesList = new Array<Rule>();
        selectedRuleIds.forEach(ruleId => {
            const rules = this.rules.find(rule => rule.id === ruleId && rule.isConfigurable);
            const rulethreshold = this.rules.find(rule => rule.id === ruleId && !rule.isConfigurable);
            if (rulethreshold) {
                if (rulethreshold.name.includes('Thres')) {
                    this.isThreshold = true;
                    this.thresholdRuleId = rulethreshold.id;
                }
            }
            const existingRules = this.ruleConfigurations.value.find((ruleConfig: RuleConfig) => ruleConfig.ruleId === ruleId);
            if (existingRules) {
                this.selectedThreshold = Number(existingRules.fieldValue);
            }
            if (rules && !existingRules) {
                rulesList.push(rules);
            }
        });

        this.removeRuleConfiguration(selectedRuleIds);
        if (rulesList.length > 0) {
            this.addRuleConfiguration(rulesList);
        }
    }

    protected removeRuleConfiguration(ruleIds: number[]) {
        const ruleConfigs =
            (this.ruleConfigurations.value).filter((item: RuleConfig) => ruleIds.find(i => i === item.ruleId)) as
            RuleConfig[];
        this.form.setControl('ruleConfigurations', new UntypedFormArray([]));
        ruleConfigs.forEach(ruleConfig => {
            this.ruleConfigurations.push(this.formBuilder.group(ruleConfig));
        });
    }

    protected addRuleConfiguration(rules: Rule[]) {
        rules.forEach(rule => {
            const configs = JSON.parse(rule.configurationMetaData);
            for (const config of configs) {
                const ruleItem = new RuleConfig();
                ruleItem.id = 0;
                ruleItem.ruleId = rule.id ? rule.id : 0;
                ruleItem.fieldValue = config.defaultValue;
                ruleItem.fieldName = config.fieldName;
                ruleItem.fieldDescription = rule.description;
                ruleItem.fieldType = config.fieldType;
                ruleItem.minLength = config.minLength;
                ruleItem.maxLength = config.maxLength;
                ruleItem.min =  config.minValue;
                ruleItem.max = config.maxValue;
                this.ruleConfigurations.push(this.formBuilder.group(ruleItem));
            }
        });
    }

    get ruleConfigurations(): UntypedFormArray {
        return this.form.get('ruleConfigurations') as UntypedFormArray;
    }

    getThreshold($event) {
        this.selectedThreshold = $event.value as number;
        const rules = this.rules.find(rule => rule.id === this.thresholdRuleId);
        if (this.ruleConfigurations.value.find(x => x.fieldName == 'Limit Threshold') == null) {
            const ruleItem = new RuleConfig();
            ruleItem.id = rules.id ? rules.id : 0;
            ruleItem.ruleId = this.thresholdRuleId;
            ruleItem.fieldValue = this.selectedThreshold.toString();
            ruleItem.fieldName = 'Limit Threshold';
            ruleItem.fieldDescription = 'Limit Threshold';
            ruleItem.fieldType = 'number';
            this.ruleConfigurations.push(this.formBuilder.group(ruleItem, Validators.required));
        } else {
            var configItem = this.ruleConfigurations.value.find(x => x.fieldName == 'Limit Threshold');
            configItem.fieldValue = this.selectedThreshold.toString();
        }
    }

    get getRuleItems(): any[] {
        const formModel = this.form.value;
        const ruleItems = Array<any>();
        if (formModel.ruleConfigurations) {
            formModel.ruleConfigurations.forEach((item: RuleConfig) => {
                const arrayItem = new Array(item);
                const index = ruleItems.findIndex(ruleItem => ruleItem.ruleId === item.ruleId);
                if (index >= 0) {
                    const ruleItem: any = {};
                    const array = (JSON.parse(ruleItems[index].ruleConfiguration) as Array<any>);
                    array.push(item);
                    ruleItem.ruleConfiguration = JSON.stringify(array);
                    ruleItem.ruleId = item.ruleId;
                    ruleItem.id = item.id ? item.id : 0;
                    ruleItems[index] = ruleItem;
                } else {
                    const ruleItem: any = {};
                    ruleItem.ruleConfiguration = JSON.stringify(arrayItem);
                    ruleItem.ruleId = item.ruleId;
                    ruleItem.id = item.id ? item.id : 0;
                    ruleItems.push(ruleItem);
                }
            });
        }

        const ruleLookup = this.getLookupControl('RulesFoData');
        const ruleIds = ruleLookup.getSelectedItems();
        ruleIds.forEach(ruleId => {
            if (!ruleItems.find(ruleItem => ruleItem.ruleId === ruleId)) {
                const ruleItem: any = {};
                ruleItem.ruleConfiguration = null;
                ruleItem.ruleId = ruleId;
                ruleItems.push(ruleItem);
            }
        });
        return ruleItems;
    }

    validateTerritory($event) {
        
        const value = $event.target.value.toUpperCase();
        const validationRegex = /^[SW]*$/;
        if (!validationRegex.test(value)) {
            $event.target.value = String.Empty;         
            this.territory = territoryDescription;   
        }
        else
        {
            switch (value)
            {
                case 'S': this.territory = this.territories[0];
                break;
                case 'W': this.territory = this.territories[1];
                break;
            }
        }
    }

    protected savedRules(rule: any) {
        if (rule.ruleConfiguration) {
            const formattedJson = rule.ruleConfiguration.replace(/'/g, '"');
            const configs = JSON.parse(formattedJson) as Array<any>;
            for (const config of configs) {
                const ruleItem = new RuleConfig();
                ruleItem.id = rule.id ? rule.id : 0;
                ruleItem.ruleId = rule.ruleId;
                ruleItem.fieldValue = config.fieldValue;
                ruleItem.fieldName = config.fieldName;
                ruleItem.fieldDescription = config.fieldDescription;
                ruleItem.fieldType = config.fieldType;
                ruleItem.minLength = config.minLength;
                ruleItem.maxLength = config.maxLength;
                ruleItem.min =  config.minValue;
                ruleItem.max = config.maxValue;
                this.ruleConfigurations.push(this.formBuilder.group(ruleItem, Validators.required));
            }
            if (!this.isWizard) {
                this.form.disable();
            }
        }
    }
}
