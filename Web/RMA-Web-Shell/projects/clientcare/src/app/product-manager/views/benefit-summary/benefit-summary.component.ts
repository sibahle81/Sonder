import { Component } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Benefit } from '../../models/benefit';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { BenefitSummary } from '../../models/benefit-summary';
import { RuleConfigurationSummary } from '../../models/rule-configuration-summary';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { RuleService } from 'projects/shared-components-lib/src/lib/rules-engine/shared/services/rule.service';
import { ProductService } from '../../services/product.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { BenefitRateSummary } from '../../models/benefit-benefitRate-summary';
import { formatDate, formatCurrency, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-benefit-summary',
  templateUrl: './benefit-summary.component.html',
  styleUrls: ['./benefit-summary.component.css']
})
export class BenefitSummaryComponent extends WizardDetailBaseComponent<Benefit> {

  ignoredFields = [];
  benefitSummary: BenefitSummary;
  ruleConfigurations: RuleConfigurationSummary[] = [];
  notes: string[] = [];
  product: string;

  benefitTypes: Lookup[];
  selectedBenefitType: string;

  coverMemberTypes: Lookup[];
  selectedCoverMemberType: string;

  benefitRates: BenefitRateSummary[] = [];

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly ruleService: RuleService,
    private readonly productService: ProductService,
    private readonly lookupService: LookupService,
    private readonly decimalPipe: DecimalPipe
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void { }

  populateModel(): void {
    this.benefitSummary.code = this.model.code;
    this.benefitSummary.name = this.model.name;
    this.benefitSummary.product = this.product;
    this.benefitSummary.benefitType = this.selectedBenefitType;
    this.benefitSummary.coverMemberType = this.selectedCoverMemberType;
    this.benefitSummary.startDate = this.model.startDate == null ? '' : formatDate(this.model.startDate, 'yyyy/MM/dd', 'en-US');
    this.benefitSummary.endDate = this.model.endDate == null ? '' : formatDate(this.model.endDate, 'yyyy/MM/dd', 'en-US');
    this.benefitSummary.status = this.model.statusText;
    this.benefitSummary.excessAmount = this.model.excessAmount;
  }

  createForm(): void { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  populateForm(): void {
    this.resetObjects();
    this.getProduct();
  }

  getProduct() {
    if (this.model.productId) {
      this.productService.getProduct(this.model.productId).subscribe(result => {
        this.product = result.name;
        this.getBenefitType();
      });
    } else {
      this.getBenefitType();
    }
  }

  getBenefitType() {
    if (this.model.benefitType) {
      this.lookupService.getBenefitTypes().subscribe(result => {
        this.benefitTypes = result;
        this.selectedBenefitType = (this.benefitTypes.find(i => i.id === this.model.benefitType)).name;
        this.getCoverMemberType();
      });
    } else {
      this.getCoverMemberType();
    }
  }

  getCoverMemberType() {
    if (this.model.coverMemberType) {
      this.lookupService.getCoverMemberTypes().subscribe(result => {
        this.coverMemberTypes = result;
        this.selectedCoverMemberType = (this.coverMemberTypes.find(i => i.id === this.model.coverMemberType)).name;
        this.getPremium();
      });
    } else {
      this.getPremium();
    }
  }

  getPremium() {
    if (this.model.benefitRates) {
      let count = 0 as number;
      for (const i of this.model.benefitRates) {
        const obj = this.model.benefitRates[count];
        const benefitRateSummary = new BenefitRateSummary();

        benefitRateSummary.premium = this.formatPremium(obj.baseRate);
        benefitRateSummary.amount = formatCurrency(obj.benefitAmount, 'en-ZA', 'R');
        benefitRateSummary.status = obj.benefitRateStatusText;
        benefitRateSummary.effectiveDate = obj.effectiveDate == null ? '' : formatDate(obj.effectiveDate, 'yyyy/MM/dd', 'en-US');

        this.benefitRates.push(benefitRateSummary);

        count++;
      }
      this.getNotes();
    } else {
      this.getNotes();
    }
  }

  formatPremium(rate: number): string {
    return `R ${this.decimalPipe.transform(rate, '1.2-10')}`;
  }

  getNotes() {
    if (this.model.benefitNotes) {
      let count = 0 as number;
      for (const i of this.model.benefitNotes) {
        const productNote = (this.model.benefitNotes[count]);
        const note = new Note();
        note.text = productNote.text;
        this.notes.push(note.text);
        count++;
      }
      this.getRuleItems();
    } else {
      this.getRuleItems();
    }
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
    this.populateModel();
  }

  resetObjects() {
    let benefitSummary = new BenefitSummary();
    let ruleConfigurations: RuleConfigurationSummary[] = [];
    let notes: string[] = [];
    let benefitRates: BenefitRateSummary[] = [];

    this.benefitSummary = benefitSummary;
    this.ruleConfigurations = ruleConfigurations;
    this.notes = notes;
    this.benefitRates = benefitRates;
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
