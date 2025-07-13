import { Component, OnInit, AfterViewInit, AfterContentChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { AlertService } from 'src/app/shared/services/alert.service';
import { DetailsComponent } from '../../details/details.component';
import { Rule } from '../shared/models/rule';
import { RuleConfig } from '../shared/models/rule-config';
import { BreadcrumbRuleService } from '../shared/services/breadcrumb-rule.service';
import { RuleService } from '../shared/services/rule.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'rule-details',
    templateUrl: './rule-details.component.html'
})
export class RuleDetailsComponent extends DetailsComponent implements OnInit, AfterViewInit, AfterContentChecked {
    ruleId: number;
    code: string;
    name: string;
    rule: Rule;
    enableForm = false;
    minDate: Date;
    isSTP = false;

    constructor(
        private readonly alertService: AlertService,
        router: Router,
        appEventsManager: AppEventsManager,

        private readonly formBuilder: FormBuilder,
        private readonly activatedRoute: ActivatedRoute,
        private readonly authService: AuthService,
        private readonly breadcrumbRuleService: BreadcrumbRuleService,
        private readonly ruleService: RuleService) {

        super(appEventsManager, alertService, router, 'Rule', 'rules-engine', 1);
    }

    ngAfterViewInit() {

    }

    ngAfterContentChecked() {
        if (!this.enableForm) {
            this.form.disable();
        }
    }

    ngOnInit(): void {
        this.activatedRoute.params.subscribe((params: any) => {
            if (params.id) {
                this.minDate = new Date();
                this.loadingStart('Loading rule config...');
                this.checkUserEditPermission();
                this.ruleId = params.id;
                this.setForm(params.id);
                this.getRule(params.id);
                this.form.disable();
                this.breadcrumbRuleService.setBreadcrumb('Edit a rule');
            }
        });
    }

    get ruleConfigurations(): FormArray {
        return this.form.get('ruleConfigurations') as FormArray;
    }

    createForm(id: any): void {
        this.clearDisplayName();
        if (this.form) { return; }

        this.form = this.formBuilder.group({
            id,
            ruleConfigurations: this.formBuilder.array([])
        });
    }

    checkUserEditPermission(): void {
        const permissions = this.authService.getCurrentUserPermissions();
        this.canEdit = permissions.find(permission => permission.name === 'Edit Rule') != null;
    }

    getRule(ruleId: number) {
        this.ruleService.getRule(ruleId).subscribe(data => {
            this.rule = data;
            this.code = this.rule.code;
            this.name = this.rule.name;
            if (this.rule.name.toLowerCase().includes('stp')) {
                this.isSTP = true;
            }
            if (this.rule.isConfigurable) {
                this.addRuleConfiguration(this.rule);
            }
            this.loadingStop();
        });
        this.form.disable();
    }

    addRuleConfiguration(rule: Rule) {
        const configs = JSON.parse(rule.configurationMetaData);

        if (this.isSTP) {
            const cumulativeEffectiveDate = new Date(configs[2].defaultValue);
            if (cumulativeEffectiveDate <= this.minDate) {
                configs[0].defaultValue = configs[1].defaultValue;
            }
            const trEffectiveDate = new Date(configs[5].defaultValue);
            if (trEffectiveDate <= this.minDate) {
                configs[3].defaultValue = configs[4].defaultValue;
            }
        }

        for (const config of configs) {
            const ruleItem = new RuleConfig();
            ruleItem.fieldName = config.fieldName;
            ruleItem.fieldType = config.fieldType;
            ruleItem.defaultValue = config.defaultValue;
            ruleItem.readOnlyField = config.readOnlyField;
            this.ruleConfigurations.push(this.formBuilder.group(ruleItem, [Validators.required, Validators.min]));
        }
    }

    setForm(ruleId: number): void {
        if (!this.form) {
            this.createForm(ruleId);
        }

        this.form.disable();
    }

    save(): void {
        if (this.isSTP) {
            if (!this.validateSTPForm()) {
                return;
            }
        } else if (this.form.invalid) {
            return;
             }

        const rule = this.readForm();
        this.form.disable();
        this.loadingStart(`Saving ${this.rule.name}...`);
        this.editRule(rule);
    }

    validateSTPForm(): boolean {

        const formModel = this.form.getRawValue();
        if (formModel.ruleConfigurations) {
            const today = new Date(this.minDate.toDateString());

            const oldConfigs = JSON.parse(this.rule.configurationMetaData);
            const newConfigs = formModel.ruleConfigurations;

            if (newConfigs[2].defaultValue == null || newConfigs[5].defaultValue == null) {
                this.alertService.error('Please enter valid date', 'Warning', true);
                return false;
            }

            const oldCumulativeEffectiveDate = new Date(oldConfigs[2].defaultValue);
            const oldTREffectiveDate = new Date(oldConfigs[5].defaultValue);
            const newCumulativeEffectiveDate = new Date(newConfigs[2].defaultValue);
            const newTREffectiveDate = new Date(newConfigs[5].defaultValue);

            if (oldConfigs[1].defaultValue === newConfigs[1].defaultValue
                && oldConfigs[4].defaultValue === newConfigs[4].defaultValue
                && oldCumulativeEffectiveDate.toDateString() === newCumulativeEffectiveDate.toDateString()
                && oldTREffectiveDate.toDateString() === newTREffectiveDate.toDateString()) {
                this.alertService.error('No changes have been made!', 'Warning', true);
                return false;
            } else {
                if (newConfigs[1].defaultValue <= 0 || newConfigs[4].defaultValue <= 0) {
                    this.alertService.error('Amount cannot be Zero/Negative', 'Warning', true);
                    return false;
                }
                if (newConfigs[1].defaultValue >= 10000 || newConfigs[4].defaultValue >= 10000) {
                    this.alertService.error('Amount must be less than 10000', 'Warning', true);
                    return false;
                }

                if (oldConfigs[1].defaultValue !== newConfigs[1].defaultValue && newCumulativeEffectiveDate < today) {
                    this.alertService.error('Date cannot be in the past', 'Warning', true);
                    return false;
                }

                if (oldConfigs[4].defaultValue !== newConfigs[4].defaultValue && newTREffectiveDate < today) {
                    this.alertService.error('Date cannot be in the past', 'Warning', true);
                    return false;
                }
            }
        }
        return true;
    }

    readForm(): Rule {
        const formModel = this.form.getRawValue();
        const rule = new Rule();
        rule.id = this.ruleId;
        rule.ruleTypeId = this.rule.ruleTypeId;
        rule.code = this.rule.code;
        rule.name = this.rule.name;
        rule.description = this.rule.description;
        rule.executionFilter = this.rule.executionFilter;
        rule.isConfigurable = this.rule.isConfigurable;

        if (formModel.ruleConfigurations) {
            if (this.isSTP) {
                const cumulativeEffectiveDate = new Date(formModel.ruleConfigurations[2].defaultValue);
                if (cumulativeEffectiveDate.toDateString() === this.minDate.toDateString()) {
                    formModel.ruleConfigurations[0].defaultValue = formModel.ruleConfigurations[1].defaultValue;
                }

                const trEffectiveDate = new Date(formModel.ruleConfigurations[5].defaultValue);
                if (trEffectiveDate.toDateString() === this.minDate.toDateString()) {
                    formModel.ruleConfigurations[3].defaultValue = formModel.ruleConfigurations[4].defaultValue;
                }
            }
            rule.configurationMetaData = JSON.stringify(formModel.ruleConfigurations);
        }
        return rule;
    }

    editRule(rule: Rule): void {
        this.ruleService.editRule(rule)
            .subscribe(() => this.done(this.rule.name));
    }

    editForm(): void {
        this.enableForm = true;
        this.form.enable();
        this.setCurrentValues();

        this.ruleConfigurations.controls.forEach(control => {
            if (control.value.readOnlyField) {
                control.disable();
            }
        });
    }
}
