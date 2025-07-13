import { Component } from '@angular/core';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { ProductOption } from '../../models/product-option';
import { MatTableDataSource } from '@angular/material/table';
import { Benefit } from '../../models/benefit';
import { BenefitService } from '../../services/benefit.service';
import { ProductOptionService } from '../../services/product-option.service';
import { ProductService } from '../../services/product.service';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'product-option-benefits',
  templateUrl: './product-option-benefits.component.html',
  styleUrls: ['./product-option-benefits.component.css']
})

export class ProductOptionBenefitsComponent extends WizardDetailBaseComponent<ProductOption> {
  dataSource = new MatTableDataSource<Benefit>();
  displayedColumns = ['selected', 'code', 'name', 'benefitBaseRateLatest', 'benefitRateLatest'];
  benefitsOriginalFull: Benefit[];
  benefits: Benefit[];
  productOption: ProductOption;
  productRuleLimit: boolean;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly benefitService: BenefitService,
    private readonly productOptionService: ProductOptionService,
    private readonly productService: ProductService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: number): void {
  }

  onLoadLookups(): void {
  }

  populateModel(): void {
    const selected = this.dataSource.data.filter(d => d.selected).map(a => a.id);
    this.model.benefitsIds = selected;
    this.validateforRuleAndAssistanceClass();
  }

  populateForm(): void {
    if (this.model.productId > 0) {
      this.productService.getProduct(this.model.productId).subscribe(product => {
        this.benefitService.getBenefitsForProductId(this.model.productId).subscribe(results => {
          this.benefitsOriginalFull = results;
          results.forEach(d => d.selected = false);
          if (this.validateforRuleAndAssistanceClass() === true) {
            for (let i = results.length - 1; i >= 0; i--) {
              const element = results[i];
              if (element?.benefitRateLatest >= 30000) {
                results.splice(i, 1);
              }
            }
          } else {
            this.benefits = this.benefitsOriginalFull;
          }
          this.benefits = results;
          this.dataSource.data = this.benefits;

          if (this.model.benefitsIds != null) {
            this.model.benefitsIds.forEach(b => {
              const benefit = this.benefits.find(a => a.id === b);
              if (benefit != null) {
                benefit.selected = true;
              }
            });
          }
          this.dataSource.data = this.benefits;
          this.isLoading$.next(false);
        });
      });
    }
  }

  validateforRuleAndAssistanceClass(): boolean {
    try {
      this.productRuleLimit = false;
      if (this.model.productClassId.toString() === '3') {
        for (const element of this.model.ruleItems) {
          const ruleData: any = JSON.parse(element.ruleConfiguration);
          if (ruleData.length > 0) {
            const name = ruleData[0].fieldDescription;
            if (name === 'Total Cover Amount') {
              this.productRuleLimit = true;
              return true;
            }
          }
        }
      }
    } catch (error) {
      const catchedError = error;
    }
    return false;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    // if (this.model.benefitsIds === undefined || this.model.benefitsIds.length === 0) {
    //   validationResult.errorMessages = ['No benefits linked'];
    //   validationResult.errors = 1;
    // }
    return validationResult;
  }

  addBenefit(event: any, benefit: Benefit) {
    if (event.checked) {
      benefit.selected = true;
    } else {
      benefit.selected = false;
    }
  }

  getData(id: any) {
    this.isLoading$.next(true);
    this.validateforRuleAndAssistanceClass();
    this.productOptionService.getBenefitsForOption(id).subscribe(benefits => {
      benefits.forEach(benefit => {
        if (benefit.benefitRates.length > 0) {
          const currentRate = benefit.benefitRates.find(x => x.benefitRateStatusText === 'Current');
          benefit.benefitBaseRateLatest = currentRate.baseRate;
          benefit.benefitRateLatest = currentRate.benefitAmount;
        }
      });

      if (this.productRuleLimit === true) {
        benefits.forEach(benefit => {
          if (benefit.benefitRates.length > 0) {
            const currentRate = benefit.benefitRates.find(x => x.benefitRateStatusText === 'Current');
            if (currentRate.benefitAmount <= 30000) {
              benefit.selected = true;
              this.dataSource.data.push(benefit);
            }
          }
        });
      } else {
        this.benefits = benefits;
        this.benefits.forEach(benefit => benefit.selected = true);

        this.dataSource.data = this.benefits;
      }

      this.isLoading$.next(false);
    });
  }
}
