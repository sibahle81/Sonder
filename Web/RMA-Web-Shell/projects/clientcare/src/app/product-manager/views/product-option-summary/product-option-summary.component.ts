import { Component } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { ProductOption } from '../../models/product-option';
import { ProductOptionSummary } from '../../models/product-option-summary';
import { BenefitSummary } from '../../models/benefit-summary';
import { BenefitService } from '../../services/benefit.service';
import { RuleConfigurationSummary } from '../../models/rule-configuration-summary';
import { RuleService } from 'projects/shared-components-lib/src/lib/rules-engine/shared/services/rule.service';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { formatDate } from '@angular/common';
import 'src/app/shared/extensions/date.extensions';

@Component({
  selector: 'app-product-option-summary',
  templateUrl: './product-option-summary.component.html',
  styleUrls: ['./product-option-summary.component.css']
})
export class ProductOptionSummaryComponent extends WizardDetailBaseComponent<ProductOption> {

  ignoredFields = [];
  productOptionSummary: ProductOptionSummary;
  benefitSummary: BenefitSummary[] = [];
  ruleConfigurations: RuleConfigurationSummary[] = [];
  notes: string[] = [];
  coverTypes: string[] = [];
  paymentFrequencys: string[] = [];

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly benefitService: BenefitService,
    private readonly ruleService: RuleService,
    private readonly lookupService: LookupService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void {
  }

  populateModel(): void {
    this.productOptionSummary = new ProductOptionSummary();

    this.productOptionSummary.optionCode = this.model.code;
    this.productOptionSummary.optionName = this.model.name;
    this.productOptionSummary.optionDescription = this.model.description;
    this.productOptionSummary.startDate = this.model.startDate == null ? '' : formatDate(this.model.startDate, 'yyyy/MM/dd', 'en-US');
    this.productOptionSummary.endDate = this.model.endDate == null ? '' : formatDate(this.model.endDate, 'yyyy/MM/dd', 'en-US');
    this.productOptionSummary.optionStatus = this.model.statusText;

    if (!String.isNullOrEmpty (this.model.commissionScale)) {
      this.productOptionSummary.scale = this.model.commissionScale;
    } else {
      // Prevent 7% from displaying as 7.000000001
      this.productOptionSummary.maxAdminFeePercentage = Math.round(this.model.maxAdminFeePercentage * 10000) / 10000.0;
      this.productOptionSummary.maxCommissionFeePercentage = Math.round(this.model.maxCommissionFeePercentage * 10000) / 10000.0;
      this.productOptionSummary.maxBinderFeePercentage = Math.round(this.model.maxBinderFeePercentage * 10000) / 10000.0;
    }
  }

  createForm(): void {
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  populateForm(): void {
    this.resetObjects();
    this.getBenefits(this.model.benefitsIds);
  }

  getBenefits(ids: number[]) {
    if (ids) {
      this.benefitService.getBenefitsByBenefitIds(ids).subscribe(results => {
        results.forEach((element) => {
          const benefitSummary = new BenefitSummary();
          benefitSummary.name = element.name;
          benefitSummary.code = element.code;
          benefitSummary.premium = 'R ' + element.benefitBaseRateLatest.toLocaleString();
          benefitSummary.amount = 'R ' + element.benefitRateLatest.toLocaleString();
          this.benefitSummary.push(benefitSummary);
        });
      });
    }
    this.getRuleItems();
  }

  getRuleItems() {
    if (this.model.ruleItems) {
      let count = 0 as number;
      for (const i of this.model.ruleItems) {
        const jsonObj = JSON.parse(this.model.ruleItems[count].ruleConfiguration) as RuleConfigurationSummary;

        if (jsonObj === null) {
          const ruleId = this.model.ruleItems[count].ruleId;
          this.ruleService.getRule(ruleId).subscribe(rule => {
            const config = new RuleConfigurationSummary();
            config.description = rule.name;
            config.value = 'No configuration required';
            this.ruleConfigurations.push(config);
          });
        } else {
          const x = jsonObj[0];
          const config = new RuleConfigurationSummary();
          config.description = x.fieldName;
          config.value = x.fieldValue;
          this.ruleConfigurations.push(config);
        }
        count++;
      }
    }
    this.getNotes();
  }

  getNotes() {
    if (this.model.productOptionNotes) {
      let count = 0 as number;
      for (const i of this.model.productOptionNotes) {
        const productNote = (this.model.productOptionNotes[count]);
        const note = new Note();
        note.text = productNote.text;
        this.notes.push(note.text);
        count++;
      }
    }
    this.getCoverTypes(this.model.coverTypeIds);
  }

  getCoverTypes(coverTypeIds: number[]) {
    if (coverTypeIds) {
      this.lookupService.getCoverTypesByIds(coverTypeIds).subscribe(results => {
        results.forEach((element) => {
          this.coverTypes.push(element.name);
        });
      });
    }
    this.getPaymentFrequencys(this.model.paymentFrequencyIds);
  }

  getPaymentFrequencys(paymentFrequencyIds: number[]) {
    if (paymentFrequencyIds) {
      this.lookupService.getPaymentFrequencyByIds(paymentFrequencyIds).subscribe(results => {
        results.forEach((element) => {
          this.paymentFrequencys.push(element.name);
        });
      });
    }
    this.populateModel();
  }

  resetObjects() {
    const productOptionSummary: ProductOptionSummary = null;
    const benefitSummary: BenefitSummary[] = [];
    const ruleConfigurations: RuleConfigurationSummary[] = [];
    const notes: string[] = [];
    const coverTypes: string[] = [];
    const paymentFrequencys: string[] = [];

    this.productOptionSummary = productOptionSummary;
    this.benefitSummary = benefitSummary;
    this.ruleConfigurations = ruleConfigurations;
    this.notes = notes;
    this.coverTypes = coverTypes;
    this.paymentFrequencys = paymentFrequencys;
  }

  getObjectType(object): any {
    if (typeof object === null) { return; }
    return typeof object;
  }

  formatCamelCase(property): string {
    return property.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  }

  asIsOrder(a, b) {
    return 1;
  }
}
