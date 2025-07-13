import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { QuoteV2 } from '../../../../models/quoteV2';
import { BehaviorSubject } from 'rxjs';
import { QuoteStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/quote-status.enum';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductOption } from 'projects/clientcare/src/app/product-manager/models/product-option';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { QuoteDetailsV2 } from '../../../../models/quoteDetailsV2';
import { CategoryInsuredEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/categoryInsuredEnum';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { IndustryClassDeclarationConfiguration } from 'projects/clientcare/src/app/member-manager/models/industry-class-declaration-configuration';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { LeadService } from 'projects/clientcare/src/app/lead-manager/services/lead.service';
import { Lead } from 'projects/clientcare/src/app/lead-manager/models/lead';
import { MaxAverageEarning } from 'projects/clientcare/src/app/member-manager/models/max-average-earning';
import { MinimumAllowablePremium } from 'projects/clientcare/src/app/member-manager/models/minimum-allowable-premium';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'rma-rml-quote-details-capture',
  templateUrl: './rma-rml-quote-details-capture.component.html',
  styleUrls: ['./rma-rml-quote-details-capture.component.css']
})
export class RmaRmlQuoteDetailsCaptureComponent extends UnSubscribe implements OnChanges {

  editRatePermission = 'Edit Quote Rates';

  @Input() quote: QuoteV2;
  @Input() isReadOnly = false;

  form: UntypedFormGroup;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  lead: Lead;

  industryClassDeclarationConfiguration: IndustryClassDeclarationConfiguration;
  configuredMaximum: MaxAverageEarning;
  minimumAllowableEarningsPerEmployee = 0;
  maximumAllowableEarningsPerEmployee = 0;
  configuredMinimumAllowablePremium: MinimumAllowablePremium;

  selectedQuoteDetail: QuoteDetailsV2;

  quoteStatuses: QuoteStatusEnum[];
  products: Product[];
  productOptions: ProductOption[];

  isMining = false;
  unSkilled = CategoryInsuredEnum.Unskilled;

  isMinimumPremiumApplied: boolean;

  constructor(
    private readonly productService: ProductService,
    private readonly productOptionService: ProductOptionService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly declarationService: DeclarationService,
    private readonly leadService: LeadService,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getLookups();
  }

  getLookups() {
    this.quoteStatuses = this.ToArray(QuoteStatusEnum);
    this.getProducts();
  }

  getProducts() {
    this.loadingMessage$.next('loading products...please wait');
    this.productService.getProducts().subscribe(results => {
      this.products = results;
      this.getProductOptions();
    });
  }

  getProductOptions() {
    this.loadingMessage$.next('loading product options...please wait');
    this.productOptionService.getProductOptionsIncludeDeleted().subscribe(results => {
      this.productOptions = results;
      this.getLead();
    });
  }

  getLead() {
    this.loadingMessage$.next('loading lead...please wait');
    this.leadService.getLead(this.quote.leadId).subscribe(results => {
      this.lead = results;
      this.isMining = this.lead.company.industryClass == IndustryClassEnum.Mining;
      this.getIndustryClassDeclarationConfiguration();
    });
  }

  getIndustryClassDeclarationConfiguration() {
    this.loadingMessage$.next('loading configurations...please wait');
    this.declarationService.getIndustryClassDeclarationConfiguration(this.lead.company.industryClass).subscribe(result => {
      if (result) {
        this.industryClassDeclarationConfiguration = result;
        this.configuredMaximum = this.industryClassDeclarationConfiguration.maxAverageEarnings.find(s => s.effectiveTo == null);
        this.configuredMinimumAllowablePremium = this.industryClassDeclarationConfiguration.minimumAllowablePremiums.find(s => s.effectiveTo == null);
      }
      this.isLoading$.next(false);
    });
  }

  createForm() {
    this.form = this.formBuilder.group({
      productOption: [{ value: this.getProductOptionName(this.selectedQuoteDetail), disabled: true }],
      categoryInsured: [{ value: this.getCategoryInsuredName(this.selectedQuoteDetail.categoryInsured), disabled: true }],
      industryRate: [{ value: this.selectedQuoteDetail.industryRate, disabled: !this.userHasPermission(this.editRatePermission) }],
      averageNumberOfEmployees: [{ value: this.selectedQuoteDetail.averageNumberOfEmployees ? this.selectedQuoteDetail.averageNumberOfEmployees : null, disabled: this.isReadOnly }, Validators.required],
      averageEmployeeEarnings: [{ value: this.selectedQuoteDetail.averageEmployeeEarnings ? this.selectedQuoteDetail.averageEmployeeEarnings : null, disabled: this.isReadOnly }, Validators.required],
      liveInAllowance: [{ value: this.selectedQuoteDetail.liveInAllowance ? this.selectedQuoteDetail.liveInAllowance : null, disabled: this.isReadOnly }]
    });

    this.form.markAsPristine();
    this.isLoading$.next(false);
  }

  readForm() {
    this.selectedQuoteDetail.averageNumberOfEmployees = +this.form.controls.averageNumberOfEmployees.value;
    this.selectedQuoteDetail.averageEmployeeEarnings = +this.form.controls.averageEmployeeEarnings.value;
    this.selectedQuoteDetail.industryRate = +this.form.controls.industryRate.value;
    this.selectedQuoteDetail.liveInAllowance = +this.form.controls.liveInAllowance.value ? +this.form.controls.liveInAllowance.value : 0;

    this.calculatePremium(this.selectedQuoteDetail);
  }

  getLiveInAllowanceForCoverPeriod(): number {
    const declarationYear = this.getCoverPeriodYear(new Date().getCorrectUCTDate());
    const startDate = new Date(declarationYear, this.industryClassDeclarationConfiguration.renewalPeriodStartMonth - 1, this.industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth);
    const index = this.industryClassDeclarationConfiguration.liveInAllowances.findIndex(s => new Date(s.effectiveFrom) <= startDate && startDate < new Date(s.effectiveTo));

    let allowance = 0;

    if (this.industryClassDeclarationConfiguration.liveInAllowances) {
      if (index > -1) {
        allowance = this.industryClassDeclarationConfiguration.liveInAllowances[index].allowance;
      } else {
        const latestAllowance = this.industryClassDeclarationConfiguration.liveInAllowances.find(s => !s.effectiveTo);
        allowance = new Date(latestAllowance.effectiveFrom) <= startDate ? latestAllowance.allowance : 0;
      }
    }

    return allowance;
  }

  getCoverPeriodYear(date: Date): number {
    const _date = new Date(date);

    const configuredRenewalMonth = this.industryClassDeclarationConfiguration.renewalPeriodStartMonth;
    const configuredRenewalDay = this.industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth;

    const month = _date.getMonth() + 1;
    const day = _date.getDate();

    if ((month < configuredRenewalMonth) || (month === configuredRenewalMonth && day < configuredRenewalDay)) {
      return _date.getFullYear() - 1;
    }

    return _date.getFullYear();
  }

  calculatePremium(quoteDetail: QuoteDetailsV2) {
    const totalLiveInAllowanceEarnings = this.isMining ? quoteDetail.liveInAllowance * this.getLiveInAllowanceForCoverPeriod() * 12 : 0;
    quoteDetail.premium = +((quoteDetail.averageEmployeeEarnings + totalLiveInAllowanceEarnings) * (quoteDetail.industryRate / 100));
  }

  validateAllQuoteDetailsSupplied(): boolean {
    let isValid = true;

    isValid = this.quote.quoteDetailsV2.some(s => !s.isDeleted);

    this.quote.quoteDetailsV2.forEach(quoteDetail => {
      if (!quoteDetail.premium || (quoteDetail.premium && quoteDetail.premium <= 0)) {
        if (!quoteDetail.isDeleted) {
          isValid = false;
        }
      }
    });

    return isValid;
  }

  isExcluded(quoteDetail: QuoteDetailsV2): boolean {
    return quoteDetail.isDeleted;
  }

  quoteDetailSelected(quoteDetail: QuoteDetailsV2) {
    this.selectedQuoteDetail = quoteDetail;
    this.createForm();
  }

  exclude(quoteDetail: QuoteDetailsV2) {
    const atLeastOneQuoteDetailIncluded = this.quote.quoteDetailsV2.filter(s => !s.isDeleted && s.productOptionId == quoteDetail.productOptionId).length > 1;
    if (atLeastOneQuoteDetailIncluded || quoteDetail.isDeleted) {
      quoteDetail.isDeleted = !quoteDetail.isDeleted;

      const index = this.quote.quoteDetailsV2.findIndex(s => s.quoteDetailId === quoteDetail.quoteDetailId);
      if (index > -1) {
        this.quote.quoteDetailsV2[index] = quoteDetail;
        this.sumTotalQuotePremium();
      }
    } else {
      this.openMessageDialog('Validation', 'At least one line item per product option must be included');
    }
  }

  save() {
    const isValid = this.validate();
    if (isValid) {
      this.readForm();
      const index = this.quote.quoteDetailsV2.findIndex(s => s.quoteId === this.selectedQuoteDetail.quoteDetailId);
      if (index > -1) {
        this.quote.quoteDetailsV2[index] = this.selectedQuoteDetail;
      }

      const totalCount = this.quote.quoteDetailsV2.length;
      const excludedCount = this.quote.quoteDetailsV2.filter(s => s.isDeleted).length;

      if ((!this.quote.totalPremium || this.quote.totalPremium == 0) && (totalCount - excludedCount > 1)) {
        this.openApplyToAllDialog();
      } else {
        this.sumTotalQuotePremium();
        this.reset();
      }
    }
  }

  validate(): boolean {
    const averageNumberOfEmployees = this.form.controls.averageNumberOfEmployees.value && this.form.controls.averageNumberOfEmployees.value > 0 ? +this.form.controls.averageNumberOfEmployees.value : 1;
    const averageEmployeeEarnings = this.form.controls.averageEmployeeEarnings.value && this.form.controls.averageEmployeeEarnings.value > 0 ? +this.form.controls.averageEmployeeEarnings.value : 0;
    const liveInAllowance = this.form.controls.liveInAllowance.value && this.form.controls.liveInAllowance.value > 0 ? +this.form.controls.liveInAllowance.value : 0;

    const calculatedEarningsPerEmployee = averageEmployeeEarnings / averageNumberOfEmployees;

    if (!this.configuredMaximum) {
      this.configuredMaximum = this.industryClassDeclarationConfiguration.maxAverageEarnings.find(s => s.effectiveTo == null);
    }

    this.minimumAllowableEarningsPerEmployee = this.configuredMaximum ? this.configuredMaximum.minAverageEarnings : 0;
    this.maximumAllowableEarningsPerEmployee = this.configuredMaximum ? this.configuredMaximum.maxAverageEarnings : 0;

    let isValid = true;

    this.clearValidationToFormControl(this.form, 'averageEmployeeEarnings');
    if (calculatedEarningsPerEmployee > this.maximumAllowableEarningsPerEmployee) {
      isValid = false;
      this.applyValidationToFormControl(this.form, [Validators.required, Validators.max(this.maximumAllowableEarningsPerEmployee)], 'averageEmployeeEarnings');
    } else if (averageNumberOfEmployees * this.minimumAllowableEarningsPerEmployee > averageEmployeeEarnings) {
      this.applyValidationToFormControl(this.form, [Validators.required, Validators.min(averageNumberOfEmployees * this.minimumAllowableEarningsPerEmployee)], 'averageEmployeeEarnings');
      isValid = false;
    }

    this.clearValidationToFormControl(this.form, 'liveInAllowance');
    if (liveInAllowance && liveInAllowance > 0 && averageNumberOfEmployees && averageNumberOfEmployees > 0 && liveInAllowance > averageNumberOfEmployees) {
      this.applyValidationToFormControl(this.form, [Validators.max(averageNumberOfEmployees ? averageNumberOfEmployees : 0)], 'liveInAllowance');
      isValid = false;
    }

    return isValid;
  }

  sumTotalQuotePremium() {
    const isValid = this.validateAllQuoteDetailsSupplied();
    if (isValid) {
      let totalPremium = 0;
      this.quote.quoteDetailsV2.forEach(quoteDetail => {
        if (!quoteDetail.isDeleted) {
          totalPremium += quoteDetail.premium;
        }
      });
      if (this.configuredMinimumAllowablePremium && this.configuredMinimumAllowablePremium.minimumPremium && this.configuredMinimumAllowablePremium.minimumPremium > 0 && +totalPremium < this.configuredMinimumAllowablePremium.minimumPremium) {
        this.quote.totalPremium = this.configuredMinimumAllowablePremium.minimumPremium;
        this.isMinimumPremiumApplied = true;
      } else {
        this.quote.totalPremium = +totalPremium;
      }
    } else {
      this.quote.totalPremium = null;
    }
  }

  reset() {
    this.selectedQuoteDetail = null;
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  getProductName(productId: number): string {
    const product = this.products.find(s => s.id === productId);
    return product.name + ' (' + product.code + ')';
  }

  getProductOptionName(quoteDetail: QuoteDetailsV2): string {
    const productOption = this.productOptions.find(s => s.id === quoteDetail.productOptionId);
    return productOption.name + ' (' + productOption.code + ')';
  }

  getProductOptionNames(quote: QuoteV2): string {
    let productOptions = String.Empty;
    const unique = [...new Set(quote.quoteDetailsV2.map((item) => item.productOptionId))];
    unique.forEach(uniqueProductOptionId => {
      const productOption = this.productOptions.find(s => s.id === uniqueProductOptionId);
      productOptions += productOption.name + ' (' + productOption.code + ')' + ' + ';
    });

    const lastIndex = productOptions.lastIndexOf(' + ');
    return productOptions.slice(0, lastIndex) + productOptions.slice(lastIndex + 3);
  }

  getQuoteStatus(quoteStatus: QuoteStatusEnum) {
    return this.formatLookup(QuoteStatusEnum[quoteStatus]);
  }

  getCategoryInsuredName(categoryInsured: CategoryInsuredEnum): string {
    return this.formatLookup(CategoryInsuredEnum[categoryInsured]);
  }

  formatLookup(lookup: string): string {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  formatMoney(value: string): string {
    return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  applyValidationToFormControl(form: UntypedFormGroup, validationToApply: any, controlName: string) {
    form.get(controlName).setValidators(validationToApply);
    form.get(controlName).markAsTouched();
    form.get(controlName).updateValueAndValidity();
  }

  clearValidationToFormControl(form: UntypedFormGroup, controlName: string) {
    form.get(controlName).clearValidators();
    form.get(controlName).markAsTouched();
    form.get(controlName).updateValueAndValidity();
  }

  openApplyToAllDialog() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Earnings Captured',
        text: 'Would you like to apply the captured earnings to all other included submissions ?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.applyToAll();
      } else {
        this.sumTotalQuotePremium();
        this.reset();
      }
    });
  }

  applyToAll() {
    this.quote.quoteDetailsV2.forEach(quoteDetail => {
      if (!quoteDetail.isDeleted && quoteDetail.categoryInsured == this.selectedQuoteDetail.categoryInsured) {
        quoteDetail.averageNumberOfEmployees = this.selectedQuoteDetail.averageNumberOfEmployees;
        quoteDetail.averageEmployeeEarnings = this.selectedQuoteDetail.averageEmployeeEarnings;

        quoteDetail.liveInAllowance = this.isMining && quoteDetail.categoryInsured == this.unSkilled ? this.selectedQuoteDetail.liveInAllowance : null;

        this.calculatePremium(quoteDetail);
      }
    });

    this.sumTotalQuotePremium();
    this.reset();
  }

  openMessageDialog(title: string, message: string) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: title,
        text: message
      }
    });
  }
}
