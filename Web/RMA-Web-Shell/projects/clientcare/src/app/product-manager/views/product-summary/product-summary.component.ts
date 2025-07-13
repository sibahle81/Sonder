import { Component } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../models/product';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { ProductSummary } from '../../models/product-summary';
import { UnderwriterService } from '../../services/underwriter.service';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { RuleConfigurationSummary } from '../../models/rule-configuration-summary';
import { formatDate } from '@angular/common';
import { RuleService } from 'projects/shared-components-lib/src/lib/rules-engine/shared/services/rule.service';

@Component({
  selector: 'app-product-summary',
  templateUrl: './product-summary.component.html',
  styleUrls: ['./product-summary.component.css']
})
export class ProductSummaryComponent extends WizardDetailBaseComponent<Product> {

  ignoredFields = [];
  productSummary: ProductSummary;
  underwriter: string;
  ruleConfigurations: RuleConfigurationSummary[] = [];
  notes: string[] = [];

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly ruleService: RuleService,
    private readonly underwriterService: UnderwriterService,
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void {
  }

  populateModel(): void {
    this.productSummary = new ProductSummary();

    this.productSummary.underwriter = this.underwriter;
    this.productSummary.productClass = ProductClassEnum[this.model.productClassId] as string;
    this.productSummary.productCode = this.model.code;
    this.productSummary.productName = this.model.name;
    this.productSummary.productStartDate = this.model.startDate == null ? '' : formatDate(this.model.startDate, 'yyyy/MM/dd', 'en-US');
    this.productSummary.productEndDate = this.model.endDate == null ? '' : formatDate(this.model.endDate, 'yyyy/MM/dd', 'en-US');
    this.productSummary.productDescription = this.model.description;
    this.productSummary.productStatus = this.model.productStatus === 1 ? 'Open for Business' : 'Closed for Business';
  }

  getUnderwriter() {
    if (this.model.underwriterId) {
      this.underwriterService.getUnderwriter(this.model.underwriterId).subscribe(data => {
        this.underwriter = data.name;
        this.getRuleItems();
      });
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
    this.getNotes();
  }

  getNotes() {
    if (this.model.productNotes) {
      let count = 0 as number;
      for (const i of this.model.productNotes) {
        const productNote = (this.model.productNotes[count]);
        const note = new Note();
        note.text = productNote.text;
        this.notes.push(note.text);
        count++;
      }
    }
    this.populateModel();
  }

  createForm(): void {
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  populateForm(): void {
    this.resetObjects();
    this.getUnderwriter();
  }

  resetObjects() {
    const productSummary = new ProductSummary();
    const underwriter = '';
    const ruleConfigurations: RuleConfigurationSummary[] = [];
    const notes: string[] = [];

    this.productSummary = productSummary;
    this.underwriter = underwriter;
    this.ruleConfigurations = ruleConfigurations;
    this.notes = notes;
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
