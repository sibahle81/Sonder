import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { GroupPolicySchemeService } from '../group-policy-scheme-selection/group-policy-scheme.service';
import { UpgradeDowngradePolicyCase } from '../../shared/entities/upgrade-downgrade-policy-case';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { ProductOption } from '../../../product-manager/models/product-option';
import { Product } from '../../../product-manager/models/product';
import { Benefit } from '../../../product-manager/models/benefit';
import { ProductService } from '../../../product-manager/services/product.service';
import { ChangePolicyOption } from '../../shared/entities/change-policy-option';

@Component({
  selector: 'app-group-scheme-product-option',
  templateUrl: './group-scheme-product-option.component.html',
  styleUrls: ['./group-scheme-product-option.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class GroupSchemeProductOptionComponent extends WizardDetailBaseComponent<UpgradeDowngradePolicyCase> implements AfterContentChecked {

  today: Date;
  isLoading = false;
  isLoadingProducts = false;
  isLoadingProductOptions = false;
  isLoadingBenefits = false;
  currentOptionLoaded = false;

  productId: number;
  products: Product[];
  productOptions: ProductOption[];

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    public readonly formBuilder: UntypedFormBuilder,
    private readonly alertService: AlertService,
    private readonly productService: ProductService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly schemeService: GroupPolicySchemeService,
    private readonly productOptionService: ProductOptionService
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.today = new Date();
    this.today.setHours(0, 0, 0);
  }

  isFirstDayOfMonth = (d: Date): boolean => {
    if (!d) { return false; }
    const date = d.getDate();
    const val = date === 1;
    return val;
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  onLoadLookups(): void {
    if (!this.products || this.products.length === 0) {
      this.isLoadingProducts = true;
      this.productService.getProducts().subscribe({
        next: (data: Product[]) => {
          this.products = data;
          this.products.sort(this.compareProduct);
        },
        error: (response: HttpErrorResponse) => {
          const errorMessage = response.error.Error ? response.error.Error : response.message;
          this.alertService.error(errorMessage, 'Product Error');
          this.isLoadingProducts = false;
        },
        complete: () => {
          this.isLoadingProducts = false;
        }
      });
    }
  }

  compareProduct(a: Product, b: Product): number {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) { return -1; }
    if (nameA > nameB) { return 1; }
    return 0;
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      effectiveDate: [null, [Validators.required]],
      productId: [null],
      productOptionId: [null, [Validators.required]],
      beforeProductOption: [null]
    });
    this.form.get('beforeProductOption').disable();
  }

  populateForm(): void {
    if (!this.model.productOption) { return; }
    if (!this.model.productOption.before) { return; }
    this.form.patchValue({
      effectiveDate: this.getEffectiveDate(),
      productId: this.model.productId,
      productOptionId: this.model.productOption.after ? this.model.productOption.after : this.model.productOption.before
    });

    // Load existing product option & benefits of selected policy
    if (!this.currentOptionLoaded) {
      this.isLoading = true;
      this.schemeService.getPolicyProductOption(this.model.policyId).subscribe({
        next: (data: ProductOption) => {
          this.productId = this.model.productId ? this.model.productId : data.productId;
          this.form.patchValue({
            beforeProductOption: data.name,
            productId: this.productId
          });
          this.loadProductOptions(this.productId);
          this.loadCurrentBenefits(data.benefits);
          this.currentOptionLoaded = true;
        },
        error: (response: HttpErrorResponse) => {
          const errorMessage = response.error.Error ? response.error.Error : response.message;
          this.alertService.error(errorMessage, 'Product Option Error');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.loadProductOptions(this.productId);
    }
  }

  private loadCurrentBenefits(benefits: Benefit[]): void {
    if (!this.model.benefits) { 
      this.model.benefits = []; 
    }
    
    for (let benefit of benefits) {
      const idx = this.model.benefits.findIndex(b => b.before === benefit.id);
      if (idx < 0) {
        this.model.benefits.push({ before: benefit.id, after: null } as ChangePolicyOption);
      }
    }
  }

  private getEffectiveDate(): Date {
    let date = new Date(this.model.effectiveDate);
    if (date.getTime() < this.today.getTime()) {
      date = this.startOfNextMonth();
    } else if (date.getDate() > 1) {
      date = this.startOfNextMonth();
    }
    return date;
  }

  private startOfNextMonth(): Date {
    const date = new Date();
    date.setHours(0, 0, 0);
    if (date.getDate() > 1) {
      date.setMonth(date.getMonth() + 1, 1);
    }
    return date;
  }

  populateModel(): void {
    const value = this.form.getRawValue();
    this.model.effectiveDate = value.effectiveDate;
    this.model.productId = this.productId;
    this.model.productOption.after = value.productOptionId;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  loadProductOptions(productId: number): void {
    this.productId = productId;
    this.isLoadingProductOptions = true;
    this.productOptionService.getProductOptionNamesByProductId(this.productId).subscribe({
      next: (data: ProductOption[]) => {
        this.productOptions = data.sort(this.compareProductOption);
      },
      error: (response: HttpErrorResponse) => {
        const errorMessage = response.error.Error ? response.error.Error : response.message;
        this.alertService.error(errorMessage, 'Product Option Error');
        this.isLoadingProductOptions = false;
      },
      complete: () => {
        this.isLoadingProductOptions = false;
      }
    });
  }

  compareProductOption(a: ProductOption, b: ProductOption): number {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) { return -1; }
    if (nameA > nameB) { return 1; }
    return 0;
  }
}
