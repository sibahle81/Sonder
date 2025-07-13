import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { IndustryClassDeclarationConfiguration } from 'projects/clientcare/src/app/member-manager/models/industry-class-declaration-configuration';
import { MaxAverageEarning } from 'projects/clientcare/src/app/member-manager/models/max-average-earning';
import { MinimumAllowablePremium } from 'projects/clientcare/src/app/member-manager/models/minimum-allowable-premium';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { RateIndustry } from 'projects/clientcare/src/app/policy-manager/shared/entities/rate-industry';
import { RolePlayerPolicyDeclaration } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-declaration';
import { RolePlayerPolicyDeclarationDetail } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-declaration-detail';
import { CategoryInsuredEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/categoryInsuredEnum';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import { RolePlayerPolicyDeclarationStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/role-player-policy-declaration-status.enum';
import { RolePlayerPolicyDeclarationTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/role-player-policy-declaration-type.enum';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductOption } from 'projects/clientcare/src/app/product-manager/models/product-option';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { IndustryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/industry-type.enum';
import { UnderwriterEnum } from 'projects/shared-models-lib/src/lib/enums/underwriter-enum';
import { policyUtility } from 'projects/shared-utilities-lib/src/lib/policy-utility/policy-utility';
import { BehaviorSubject } from 'rxjs';
import "src/app/shared/extensions/date.extensions";

@Component({
  selector: 'roleplayer-policy-declaration',
  templateUrl: './roleplayer-policy-declaration.component.html',
  styleUrls: ['./roleplayer-policy-declaration.component.css']
})

export class RoleplayerPolicyDeclarationComponent extends PermissionHelper implements OnInit, OnChanges {

  editDeclarationSubmissionTypePermission = 'Edit Declaration Submission Type';
  adjustRatePermission = 'Adjust Member Rate';

  @Input() policy: Policy;
  @Input() startDate: Date;
  @Input() endDate: Date;

  //optional inputs
  @Input() isReadOnly = false;

  @Output() requiredDeclarationsValidEmit: EventEmitter<boolean> = new EventEmitter(false);

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  form: UntypedFormGroup;

  industryClassDeclarationConfiguration: IndustryClassDeclarationConfiguration;
  configuredMaximum: MaxAverageEarning;
  minimumAllowableEarningsPerEmployee = 0;
  maximumAllowableEarningsPerEmployee = 0;
  configuredMinimumAllowablePremium: MinimumAllowablePremium;

  industryRates: RateIndustry[];

  products: Product[];
  selectedProduct: Product;

  selectedRolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration;
  selectedRolePlayerPolicyDeclarationDetail: RolePlayerPolicyDeclarationDetail;

  productOptions: ProductOption[];
  supportedRolePlayerPolicyDeclarationTypes: RolePlayerPolicyDeclarationTypeEnum[] = [RolePlayerPolicyDeclarationTypeEnum.Budgeted, RolePlayerPolicyDeclarationTypeEnum.Estimates];

  startYear: number;
  endYear: number;

  categoryInsureds: CategoryInsuredEnum[];

  pendingCancelled = PolicyStatusEnum.PendingCancelled;
  budgeted = RolePlayerPolicyDeclarationTypeEnum.Budgeted;
  actual = RolePlayerPolicyDeclarationTypeEnum.Actual;
  history = RolePlayerPolicyDeclarationStatusEnum.History;

  isMining = false;
  unSkilled = CategoryInsuredEnum.Unskilled;

  constructor(
    private readonly declarationService: DeclarationService,
    private readonly productService: ProductService,
    private readonly productOptionService: ProductOptionService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.categoryInsureds = this.ToArray(CategoryInsuredEnum);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.policy && this.startDate && this.endDate) {
      this.reset();
      if (!this.products || !this.industryClassDeclarationConfiguration || !this.industryRates) {
        this.getProducts();
      } else {
        this.getCoverPeriodDateRange();
        this.createDeclarations();

        this.isLoading$.next(false);
      }
    }
  }

  getProducts() {
    this.loadingMessage$.next('loading products...please wait');
    this.productService.getProducts().subscribe(results => {
      this.products = results;

      this.policy.productOption.product = this.products.find(s => s.id == this.policy.productOption.productId);

      this.getProductOptions();
    });
  }

  getProductOptions() {
    this.loadingMessage$.next('loading product options...please wait');
    this.productOptionService.getProductOptionsIncludeDeleted().subscribe(results => {
      this.productOptions = results;
      this.getIndustryRates();
    });
  }

  getIndustryRates() {
    this.loadingMessage$.next('loading industry rates...please wait');
    const industryType = IndustryTypeEnum[+this.policy.policyOwner.company.industryId];
    const industryClass = IndustryClassEnum[+this.policy.policyOwner.company.industryClass];

    this.declarationService.getRatesForIndustry(industryType, industryClass).subscribe(results => {
      this.industryRates = results;
      this.getIndustryClassDeclarationConfiguration();
    });
  }

  getIndustryClassDeclarationConfiguration() {
    this.loadingMessage$.next('loading configuration...please wait');
    this.declarationService.getIndustryClassDeclarationConfiguration(+this.policy.policyOwner.company.industryClass).subscribe(result => {
      if (result) {
        this.isMining = this.policy.policyOwner.company.industryClass == IndustryClassEnum.Mining;
        this.industryClassDeclarationConfiguration = result;

        this.getCoverPeriodDateRange();
        this.createDeclarations();
      }

      this.isLoading$.next(false);
    });
  }

  getCoverPeriodDateRange() {
    this.startDate = new Date(this.startDate).getCorrectUCTDate();
    this.endDate = new Date(this.endDate).getCorrectUCTDate();

    this.startYear = this.getCoverPeriodYear(new Date(this.startDate));
    this.endYear = this.getCoverPeriodYear(new Date(this.endDate));
  }

  getSelectedRolePlayerPolicyDeclarationStartDate(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration): Date {
    const defaultStartDate = new Date(rolePlayerPolicyDeclaration.declarationYear, this.industryClassDeclarationConfiguration.renewalPeriodStartMonth - 1, this.industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth).getCorrectUCTDate();
    if (this.startYear >= rolePlayerPolicyDeclaration.declarationYear && this.startDate > defaultStartDate) {
      return this.startDate;
    } else {
      return defaultStartDate;
    }
  }

  getSelectedRolePlayerPolicyDeclarationEndDate(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration): Date {
    const defaultEndDate = new Date(rolePlayerPolicyDeclaration.declarationYear + 1, this.industryClassDeclarationConfiguration.renewalPeriodStartMonth - 1, this.industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth).getCorrectUCTDate();
    return defaultEndDate;
  }

  getDefaultRolePlayerPolicyDeclarationStartDate(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration): Date {
    return new Date(rolePlayerPolicyDeclaration.declarationYear, this.industryClassDeclarationConfiguration.renewalPeriodStartMonth - 1, this.industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth).getCorrectUCTDate();
  }

  getDefaultRolePlayerPolicyDeclarationEndDate(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration): Date {
    return new Date(rolePlayerPolicyDeclaration.declarationYear + 1, this.industryClassDeclarationConfiguration.renewalPeriodStartMonth - 1, this.industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth).getCorrectUCTDate();
  }

  createDeclarations() {
    if (this.policy.policyStatus != PolicyStatusEnum.PendingCancelled && this.policy.policyStatus != PolicyStatusEnum.PendingReinstatement) {
      const declarationsToRemove = this.policy.rolePlayerPolicyDeclarations.filter(s => s.declarationYear < this.startYear)
      if (declarationsToRemove && declarationsToRemove.length > 0) {
        declarationsToRemove.forEach(d => {
          const index = this.policy.rolePlayerPolicyDeclarations.findIndex(s => s === d);
          if (index > -1) {
            this.policy.rolePlayerPolicyDeclarations.splice(index, 1);
          }
        });
      }

      for (let i = this.startYear; i <= this.endYear; i++) {
        const index = this.policy.rolePlayerPolicyDeclarations.findIndex(s => s.declarationYear === i);
        if (index <= -1) {
          this.loadingMessage$.next(`generating declaration for period ${{ i }}...please wait`);
          this.selectedProduct = this.products.find(s => s.id == this.policy.productOption.productId);

          const roleplayerPolicyDeclaration = new RolePlayerPolicyDeclaration();
          roleplayerPolicyDeclaration.rolePlayerId = this.policy.policyOwnerId;
          roleplayerPolicyDeclaration.policyId = this.policy.policyId;
          roleplayerPolicyDeclaration.productId = this.selectedProduct.id;
          roleplayerPolicyDeclaration.rolePlayerPolicyDeclarationStatus = i == this.endYear ? RolePlayerPolicyDeclarationStatusEnum.Current : RolePlayerPolicyDeclarationStatusEnum.History;
          roleplayerPolicyDeclaration.rolePlayerPolicyDeclarationType = i < this.endYear ? RolePlayerPolicyDeclarationTypeEnum.Actual : RolePlayerPolicyDeclarationTypeEnum.Budgeted;
          roleplayerPolicyDeclaration.declarationYear = i;
          roleplayerPolicyDeclaration.originalTotalPremium = 0;

          roleplayerPolicyDeclaration.rolePlayerPolicyDeclarationDetails = this.createDeclarationDetails(roleplayerPolicyDeclaration);

          if (!this.policy.rolePlayerPolicyDeclarations || this.policy.rolePlayerPolicyDeclarations.length <= 0) {
            this.policy.rolePlayerPolicyDeclarations = [];
          }
          this.policy.rolePlayerPolicyDeclarations.push(roleplayerPolicyDeclaration);
        }
      }
    }
    this.getRolePlayerPolicyDeclarationProrataDays();
    this.policy.rolePlayerPolicyDeclarations.sort((a, b) => a.declarationYear - b.declarationYear);
  }

  createDeclarationDetails(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration): RolePlayerPolicyDeclarationDetail[] {
    const rolePlayerPolicyDeclarationDetails: RolePlayerPolicyDeclarationDetail[] = [];

    this.categoryInsureds.forEach(categoryInsured => {
      const rolePlayerPolicyDeclarationDetail = new RolePlayerPolicyDeclarationDetail();
      rolePlayerPolicyDeclarationDetail.categoryInsured = +CategoryInsuredEnum[categoryInsured];
      rolePlayerPolicyDeclarationDetail.productOptionId = this.policy.productOptionId;

      rolePlayerPolicyDeclarationDetail.effectiveFrom = this.getSelectedRolePlayerPolicyDeclarationStartDate(rolePlayerPolicyDeclaration);
      rolePlayerPolicyDeclarationDetail.effectiveTo = this.getDefaultRolePlayerPolicyDeclarationEndDate(rolePlayerPolicyDeclaration);

      const industryRate = this.getRate(this.policy, rolePlayerPolicyDeclaration.declarationYear, +CategoryInsuredEnum[categoryInsured]);
      rolePlayerPolicyDeclarationDetail.rate = +industryRate;
      rolePlayerPolicyDeclarationDetail.premium = 0;

      rolePlayerPolicyDeclarationDetails.push(rolePlayerPolicyDeclarationDetail);
    });

    return rolePlayerPolicyDeclarationDetails;
  }

  getRolePlayerPolicyDeclarationProrataDays() {
    this.policy.rolePlayerPolicyDeclarations.forEach(rolePlayerPolicyDeclaration => {
      const selectedStartDate = this.getSelectedRolePlayerPolicyDeclarationStartDate(rolePlayerPolicyDeclaration);
      const selectedEndDate = this.getSelectedRolePlayerPolicyDeclarationEndDate(rolePlayerPolicyDeclaration);

      const defaultStartDate = this.getDefaultRolePlayerPolicyDeclarationStartDate(rolePlayerPolicyDeclaration);
      const defaultEndDate = this.getDefaultRolePlayerPolicyDeclarationEndDate(rolePlayerPolicyDeclaration);

      rolePlayerPolicyDeclaration.fullYearDays = this.calculateDays(defaultStartDate, defaultEndDate);
      rolePlayerPolicyDeclaration.prorataDays = this.calculateDays(selectedStartDate, selectedEndDate);

      rolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationDetails.forEach(rolePlayerPolicyDeclarationDetail => {
        if (this.policy.policyStatus == PolicyStatusEnum.PendingCancelled) { // cancellation
          if (rolePlayerPolicyDeclaration.declarationYear == this.startYear) {
            rolePlayerPolicyDeclarationDetail.effectiveTo = this.startDate;
          } else if (rolePlayerPolicyDeclaration.declarationYear < this.startYear) {
            rolePlayerPolicyDeclarationDetail.effectiveTo = defaultEndDate;
          } else {
            rolePlayerPolicyDeclarationDetail.effectiveTo = selectedStartDate;
          }
        } else if (this.policy.policyStatus == PolicyStatusEnum.PendingReinstatement) { // reinstate
          if (rolePlayerPolicyDeclaration.declarationYear < this.startYear) {
            if (this.getCoverPeriodYear(new Date(this.policy.policyInceptionDate)) == rolePlayerPolicyDeclaration.declarationYear) {
              rolePlayerPolicyDeclarationDetail.effectiveFrom = selectedStartDate;
              rolePlayerPolicyDeclarationDetail.effectiveTo = selectedStartDate;
            } else {
              rolePlayerPolicyDeclarationDetail.effectiveFrom = defaultStartDate;
              rolePlayerPolicyDeclarationDetail.effectiveTo = defaultStartDate;
            }
          }
          if (rolePlayerPolicyDeclaration.declarationYear > this.startYear) {
            rolePlayerPolicyDeclarationDetail.effectiveFrom = defaultStartDate;
            rolePlayerPolicyDeclarationDetail.effectiveTo = defaultEndDate;
          }
          if (rolePlayerPolicyDeclaration.declarationYear == this.startYear) {
            if (this.startDate > new Date(rolePlayerPolicyDeclarationDetail.effectiveFrom)) {
              rolePlayerPolicyDeclarationDetail.effectiveFrom = this.startDate;
              rolePlayerPolicyDeclarationDetail.effectiveTo = defaultEndDate;
            }
          }
        } else if (!rolePlayerPolicyDeclarationDetail.rolePlayerPolicyDeclarationDetailId || rolePlayerPolicyDeclarationDetail.rolePlayerPolicyDeclarationDetailId <= 0) { // new
          rolePlayerPolicyDeclarationDetail.effectiveFrom = selectedStartDate;
          rolePlayerPolicyDeclarationDetail.effectiveTo = this.getDefaultRolePlayerPolicyDeclarationEndDate(rolePlayerPolicyDeclaration);
        } else if (rolePlayerPolicyDeclaration.declarationYear == this.startYear && selectedStartDate > new Date(rolePlayerPolicyDeclarationDetail.effectiveFrom)) { // maintenance
          rolePlayerPolicyDeclarationDetail.effectiveFrom = selectedStartDate;
        }

        this.calculatePremium(rolePlayerPolicyDeclaration, rolePlayerPolicyDeclarationDetail);
      });

      this.setMinimumAllowablePremiumForCoverPeriod(rolePlayerPolicyDeclaration);
      this.sumTotalDeclarationPremium(rolePlayerPolicyDeclaration);
      this.setCoverPeriod(rolePlayerPolicyDeclaration);
    });
  }

  getLiveInAllowanceForCoverPeriod(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration): number {
    const startDate = this.getSelectedRolePlayerPolicyDeclarationStartDate(rolePlayerPolicyDeclaration);
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
    const _date = new Date(date).getCorrectUCTDate();

    const configuredRenewalMonth = this.industryClassDeclarationConfiguration.renewalPeriodStartMonth;
    const configuredRenewalDay = this.industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth;

    const month = _date.getMonth() + 1;
    const day = _date.getDate();

    if ((month < configuredRenewalMonth) || (month === configuredRenewalMonth && day < configuredRenewalDay)) {
      return _date.getFullYear() - 1;
    }

    return _date.getFullYear();
  }

  getRate(policy: Policy, year: number, categoryInsured: CategoryInsuredEnum): number {
    let rate: number;

    if (this.selectedProduct.underwriterId === +UnderwriterEnum.RMAMutualAssurance) {
      const industryRate = this.industryRates.find(s => s.ratingYear === year && categoryInsured == s.skillSubCategory);
      rate = industryRate ? industryRate.indRate : 0;
    } else if (this.selectedProduct.underwriterId === +UnderwriterEnum.RMALifeAssurance) {
      rate = policy.productOption.baseRate ? policy.productOption.baseRate : 0;
    }

    return rate;
  }

  calculateDays(startDate: Date, endDate: Date): number {
    const s = new Date(startDate);
    const e = new Date(endDate);

    const date1 = new Date(this.datePipe.transform(new Date(s), 'yyyy-MM-dd'));
    const date2 = new Date(this.datePipe.transform(new Date(e), 'yyyy-MM-dd'));

    var diff = date2.getTime() - date1.getTime();
    return diff > 0 ? (Math.ceil(diff / (1000 * 3600 * 24))) : 0;
  }

  rolePlayerPolicyDeclarationDetailSelected(rolePlayerPolicyDeclarationDetail: RolePlayerPolicyDeclarationDetail) {
    this.policy.rolePlayerPolicyDeclarations.forEach(s => {
      if (s.rolePlayerPolicyDeclarationDetails.includes(rolePlayerPolicyDeclarationDetail)) {
        this.selectedRolePlayerPolicyDeclaration = s;
      }
    });

    this.setMinimumAllowablePremiumForCoverPeriod(this.selectedRolePlayerPolicyDeclaration);
    this.selectedRolePlayerPolicyDeclarationDetail = rolePlayerPolicyDeclarationDetail;
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      productOption: [{ value: this.getProductOptionName(this.selectedRolePlayerPolicyDeclarationDetail), disabled: true }],
      categoryInsured: [{ value: this.getCategoryInsuredName(this.selectedRolePlayerPolicyDeclarationDetail.categoryInsured), disabled: true }],
      rate: [{ value: null, disabled: this.isReadOnly || !this.userHasPermission(this.adjustRatePermission) }, [Validators.required, Validators.min(0), Validators.max(100)]],
      averageNumberOfEmployees: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      averageEmployeeEarnings: [{ value: null, disabled: this.isReadOnly }, [Validators.required]],
      liveInAllowance: [{ value: null, disabled: this.isReadOnly }],
      effectiveFrom: [{ value: null, disabled: this.isReadOnly || !this.selectedRolePlayerPolicyDeclarationDetail.rolePlayerPolicyDeclarationDetailId || this.selectedRolePlayerPolicyDeclarationDetail.rolePlayerPolicyDeclarationDetailId <= 0 || this.policy.policyStatus == PolicyStatusEnum.PendingCancelled || this.policy.policyStatus == PolicyStatusEnum.PendingReinstatement }, Validators.required],
      effectiveTo: [{ value: null, disabled: this.isReadOnly || !this.selectedRolePlayerPolicyDeclarationDetail.rolePlayerPolicyDeclarationDetailId || this.selectedRolePlayerPolicyDeclarationDetail.rolePlayerPolicyDeclarationDetailId <= 0 || this.policy.policyStatus == PolicyStatusEnum.PendingCancelled || this.policy.policyStatus == PolicyStatusEnum.PendingReinstatement }, Validators.required]
    });

    this.setForm();
  }

  setForm() {
    this.form.patchValue({
      rate: this.selectedRolePlayerPolicyDeclarationDetail.rate,
      averageNumberOfEmployees: this.selectedRolePlayerPolicyDeclarationDetail.averageNumberOfEmployees ? this.selectedRolePlayerPolicyDeclarationDetail.averageNumberOfEmployees : null,
      averageEmployeeEarnings: this.selectedRolePlayerPolicyDeclarationDetail.averageEmployeeEarnings ? this.selectedRolePlayerPolicyDeclarationDetail.averageEmployeeEarnings : null,
      liveInAllowance: this.selectedRolePlayerPolicyDeclarationDetail.liveInAllowance ? this.selectedRolePlayerPolicyDeclarationDetail.liveInAllowance : 0,
      effectiveFrom: this.selectedRolePlayerPolicyDeclarationDetail.effectiveFrom ? this.selectedRolePlayerPolicyDeclarationDetail.effectiveFrom : this.getSelectedRolePlayerPolicyDeclarationStartDate(this.selectedRolePlayerPolicyDeclaration),
      effectiveTo: this.selectedRolePlayerPolicyDeclarationDetail.effectiveTo ? this.selectedRolePlayerPolicyDeclarationDetail.effectiveTo : this.getDefaultRolePlayerPolicyDeclarationEndDate(this.selectedRolePlayerPolicyDeclaration),
    });

    this.isLoading$.next(false);
  }

  readForm() {
    this.selectedRolePlayerPolicyDeclarationDetail.averageNumberOfEmployees = +this.form.controls.averageNumberOfEmployees.value;
    this.selectedRolePlayerPolicyDeclarationDetail.averageEmployeeEarnings = +this.form.controls.averageEmployeeEarnings.value;
    this.selectedRolePlayerPolicyDeclarationDetail.rate = +this.form.controls.rate.value;
    this.selectedRolePlayerPolicyDeclarationDetail.liveInAllowance = +this.form.controls.liveInAllowance.value ? +this.form.controls.liveInAllowance.value : 0;

    this.selectedRolePlayerPolicyDeclarationDetail.effectiveFrom = new Date(this.datePipe.transform(this.form.controls.effectiveFrom.value, 'yyyy-MM-dd')).getCorrectUCTDate();
    this.selectedRolePlayerPolicyDeclarationDetail.effectiveTo = new Date(this.datePipe.transform(this.form.controls.effectiveTo.value, 'yyyy-MM-dd')).getCorrectUCTDate();

    this.calculatePremium(this.selectedRolePlayerPolicyDeclaration, this.selectedRolePlayerPolicyDeclarationDetail);
  }

  calculatePremium(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration, rolePlayerPolicyDeclarationDetail: RolePlayerPolicyDeclarationDetail) {
    const numberOfMonths = this.getMonths(rolePlayerPolicyDeclarationDetail);
    const liveInAllowanceForCoverPeriod = this.isMining ? this.getLiveInAllowanceForCoverPeriod(rolePlayerPolicyDeclaration) : 0;
    const totalLiveInAllowanceEarnings = rolePlayerPolicyDeclarationDetail.liveInAllowance * liveInAllowanceForCoverPeriod * numberOfMonths;
    const proRataLiveInAllowancePremium = totalLiveInAllowanceEarnings * (rolePlayerPolicyDeclarationDetail.rate / 100);

    const proRataDays = this.calculateDays(rolePlayerPolicyDeclarationDetail.effectiveFrom, rolePlayerPolicyDeclarationDetail.effectiveTo);
    const annualizedEarnings = this.policy.policyStatus != PolicyStatusEnum.PendingCancelled ? (rolePlayerPolicyDeclarationDetail.averageEmployeeEarnings / proRataDays) * rolePlayerPolicyDeclaration.fullYearDays : rolePlayerPolicyDeclarationDetail.averageEmployeeEarnings;
    const totalAnnualPremium = +(annualizedEarnings * (rolePlayerPolicyDeclarationDetail.rate / 100));
    const annualPremiumPerDay = totalAnnualPremium / rolePlayerPolicyDeclaration.fullYearDays;
    const proRataPremium = annualPremiumPerDay * proRataDays

    rolePlayerPolicyDeclarationDetail.premium = proRataPremium + proRataLiveInAllowancePremium ;
  }

  getMonths(rolePlayerPolicyDeclarationDetail: RolePlayerPolicyDeclarationDetail): number {
    const startDate = new Date(rolePlayerPolicyDeclarationDetail.effectiveFrom);
    const endDate = new Date(rolePlayerPolicyDeclarationDetail.effectiveTo);
    
    let months: number;

    months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months -= startDate.getMonth();
    months += endDate.getMonth();

    return months <= 0 ? 0 : months;
  }

  getProductName(RolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration): string {
    const product = this.products.find(s => s.id === RolePlayerPolicyDeclaration.productId);
    return product.name + ' (' + product.code + ')';
  }

  getProductOptionName(rolePlayerPolicyDeclarationDetail: RolePlayerPolicyDeclarationDetail): string {
    const productOption = this.productOptions.find(s => s.id === rolePlayerPolicyDeclarationDetail.productOptionId);
    return productOption.name + ' (' + productOption.code + ')';
  }

  getPolicyProductOptionName(policy: Policy): string {
    const productOption = this.productOptions.find(s => s.id === policy.productOptionId);
    return productOption.name + ' (' + productOption.code + ')';
  }

  getProductOptionNames(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration): string {
    let productOptions = String.Empty;
    const unique = [...new Set(rolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationDetails.map((item) => item.productOptionId))];
    unique.forEach(uniqueProductOptionId => {
      const productOption = this.productOptions.find(s => s.id === uniqueProductOptionId);
      productOptions += productOption.name + ' (' + productOption.code + ')' + ' ';
    });

    return productOptions;
  }

  getRolePlayerPolicyDeclarationStatus(rolePlayerPolicyDeclarationStatus: RolePlayerPolicyDeclarationStatusEnum) {
    return this.formatLookup(RolePlayerPolicyDeclarationStatusEnum[rolePlayerPolicyDeclarationStatus]);
  }

  getRolePlayerPolicyDeclarationType(rolePlayerPolicyDeclarationType: RolePlayerPolicyDeclarationTypeEnum) {
    return this.formatLookup(RolePlayerPolicyDeclarationTypeEnum[rolePlayerPolicyDeclarationType]);
  }

  getCategoryInsuredName(categoryInsured: CategoryInsuredEnum): string {
    return this.formatLookup(CategoryInsuredEnum[categoryInsured]);
  }

  validateAllRolePlayerPolicyDeclarationDetailsSupplied(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration): boolean {
    let isValid = true;

    isValid = rolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationDetails.some(s => !s.isDeleted);

    rolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationDetails.forEach(rolePlayerPolicyDeclarationDetail => {
      if (!rolePlayerPolicyDeclarationDetail.premium || (rolePlayerPolicyDeclarationDetail.premium && rolePlayerPolicyDeclarationDetail.premium <= 0)) {
        if (!rolePlayerPolicyDeclarationDetail.isDeleted) {
          isValid = false;
        }
      }
    });

    if (this.policy.policyStatus == PolicyStatusEnum.PendingCancelled) {
      isValid = rolePlayerPolicyDeclaration.invoiceAmount && +rolePlayerPolicyDeclaration.invoiceAmount.toFixed(2) > 0.00;
    }

    return isValid;
  }

  exclude(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration, rolePlayerPolicyDeclarationDetail: RolePlayerPolicyDeclarationDetail) {
    rolePlayerPolicyDeclarationDetail.isDeleted = !rolePlayerPolicyDeclarationDetail.isDeleted;
    rolePlayerPolicyDeclarationDetail.premium = rolePlayerPolicyDeclarationDetail.premium ? rolePlayerPolicyDeclarationDetail.premium : 0;

    const index = rolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationDetails.findIndex(s => s === rolePlayerPolicyDeclarationDetail);
    if (index > -1) {
      rolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationDetails[index] = rolePlayerPolicyDeclarationDetail;
      this.sumTotalDeclarationPremium(rolePlayerPolicyDeclaration);
    }
  }

  sumTotalDeclarationPremium(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration) {
    const isValid = this.validateAllRolePlayerPolicyDeclarationDetailsSupplied(rolePlayerPolicyDeclaration);
    if (isValid || this.policy.policyStatus == PolicyStatusEnum.PendingCancelled || this.policy.policyStatus == PolicyStatusEnum.PendingReinstatement) {
      let totalPremium = 0;
      rolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationDetails.forEach(rolePlayerPolicyDeclarationDetail => {
        if (!rolePlayerPolicyDeclarationDetail.isDeleted) {
          totalPremium += rolePlayerPolicyDeclarationDetail.premium;
        }
      });

      if (this.policy.policyStatus != PolicyStatusEnum.PendingCancelled && this.configuredMinimumAllowablePremium && this.configuredMinimumAllowablePremium.minimumPremium && this.configuredMinimumAllowablePremium.minimumPremium > 0 && +totalPremium < this.configuredMinimumAllowablePremium.minimumPremium) {
        const minimumPremiumPerDay = this.configuredMinimumAllowablePremium.minimumPremium / rolePlayerPolicyDeclaration.fullYearDays;
        totalPremium = minimumPremiumPerDay * rolePlayerPolicyDeclaration.prorataDays;
      }

      rolePlayerPolicyDeclaration.invoiceAmount = totalPremium;
      rolePlayerPolicyDeclaration.adjustmentAmount = rolePlayerPolicyDeclaration.invoiceAmount - rolePlayerPolicyDeclaration.originalTotalPremium != 0 ? rolePlayerPolicyDeclaration.invoiceAmount - rolePlayerPolicyDeclaration.originalTotalPremium : 0;

      rolePlayerPolicyDeclaration.requiresTransactionModification = rolePlayerPolicyDeclaration.adjustmentAmount !== 0;
      rolePlayerPolicyDeclaration.totalPremium = +totalPremium;
    } else {
      rolePlayerPolicyDeclaration.invoiceAmount = 0;
      rolePlayerPolicyDeclaration.totalPremium = 0;
    }

    this.requiredDeclarationsValidEmit.emit(!this.policy.rolePlayerPolicyDeclarations.some(s => s.totalPremium === 0));
  }

  isExcluded(rolePlayerPolicyDeclarationDetail: RolePlayerPolicyDeclarationDetail): boolean {
    const isExcluded = rolePlayerPolicyDeclarationDetail.isDeleted || this.calculateDays(rolePlayerPolicyDeclarationDetail.effectiveFrom, rolePlayerPolicyDeclarationDetail.effectiveTo) <= 0;

    if (isExcluded) {
      rolePlayerPolicyDeclarationDetail.premium = rolePlayerPolicyDeclarationDetail.premium ? rolePlayerPolicyDeclarationDetail.premium : 0;
    }

    return isExcluded;
  }

  save() {
    const isValid = this.validate();

    if (isValid) {
      this.readForm();
      const index = this.selectedRolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationDetails.findIndex(s => s === this.selectedRolePlayerPolicyDeclarationDetail);
      if (index > -1) {
        this.selectedRolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationDetails[index] = this.selectedRolePlayerPolicyDeclarationDetail;
      }

      this.sumTotalDeclarationPremium(this.selectedRolePlayerPolicyDeclaration);
      this.reset();
    }
  }

  validate(): boolean {
    const averageNumberOfEmployees = this.form.controls.averageNumberOfEmployees.value && this.form.controls.averageNumberOfEmployees.value > 0 ? +this.form.controls.averageNumberOfEmployees.value : 1;
    const averageEmployeeEarnings = this.form.controls.averageEmployeeEarnings.value && this.form.controls.averageEmployeeEarnings.value > 0 ? +this.form.controls.averageEmployeeEarnings.value : 0;
    const liveInAllowance = this.form.controls.liveInAllowance.value && this.form.controls.liveInAllowance.value > 0 ? +this.form.controls.liveInAllowance.value : 0;

    const calculatedEarningsPerEmployee = averageEmployeeEarnings / averageNumberOfEmployees;
    const createdDate = new Date(this.getSelectedRolePlayerPolicyDeclarationStartDate(this.selectedRolePlayerPolicyDeclaration));

    this.industryClassDeclarationConfiguration.maxAverageEarnings.sort((b, a) => a.industryClassDeclarationConfigurationId - b.industryClassDeclarationConfigurationId);

    this.configuredMaximum = this.industryClassDeclarationConfiguration.maxAverageEarnings.find(s => new Date(s.effectiveFrom).getTime() <= createdDate.getTime() && new Date(s.effectiveTo).getTime() > createdDate.getTime());
    if (!this.configuredMaximum) {
      this.configuredMaximum = this.industryClassDeclarationConfiguration.maxAverageEarnings.find(s => s.effectiveTo == null);
    }

    this.minimumAllowableEarningsPerEmployee = this.configuredMaximum ? this.configuredMaximum.minAverageEarnings : 0;
    this.maximumAllowableEarningsPerEmployee = this.configuredMaximum ? this.configuredMaximum.maxAverageEarnings : 0;

    let isValid = true;

    this.clearValidationToFormControl(this.form, 'averageEmployeeEarnings');
    if (calculatedEarningsPerEmployee > this.maximumAllowableEarningsPerEmployee) {
      isValid = false;
      this.applyValidationToFormControl(this.form, [Validators.required, Validators.max(this.configuredMaximum ? this.configuredMaximum.maxAverageEarnings : 0)], 'averageEmployeeEarnings');
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

  setCoverPeriod(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration) {
    let startDate = this.getSelectedRolePlayerPolicyDeclarationStartDate(rolePlayerPolicyDeclaration);
    let endDate = this.getDefaultRolePlayerPolicyDeclarationEndDate(rolePlayerPolicyDeclaration);

    const defaultStartDate = this.getDefaultRolePlayerPolicyDeclarationStartDate(rolePlayerPolicyDeclaration);
    const defaultEndDate = this.getDefaultRolePlayerPolicyDeclarationEndDate(rolePlayerPolicyDeclaration);

    if (this.policy.policyStatus == PolicyStatusEnum.PendingCancelled) {
      if (rolePlayerPolicyDeclaration.declarationYear == this.getCoverPeriodYear(new Date(this.policy.policyInceptionDate))) {
        startDate = new Date(this.policy.policyInceptionDate).getCorrectUCTDate();
        rolePlayerPolicyDeclaration.fullYearDays = this.calculateDays(startDate, defaultEndDate);
      } else if (rolePlayerPolicyDeclaration.declarationYear <= this.startYear) {
        startDate = defaultStartDate;
      } else {
        rolePlayerPolicyDeclaration.fullYearDays = this.calculateDays(defaultStartDate, defaultEndDate);
      }

      if (this.getSelectedRolePlayerPolicyDeclarationStartDate(rolePlayerPolicyDeclaration) > endDate) {
        endDate = defaultEndDate;
      } else {
        if(this.startDate > defaultStartDate && rolePlayerPolicyDeclaration.declarationYear == this.startYear) {
          endDate = this.startDate;
        } else {
          startDate = defaultStartDate;
          endDate = this.getSelectedRolePlayerPolicyDeclarationStartDate(rolePlayerPolicyDeclaration);
        }
      }

      rolePlayerPolicyDeclaration.prorataDays = this.calculateDays(startDate, endDate);
    }

    if (this.policy.policyStatus == PolicyStatusEnum.PendingReinstatement) {
      if (rolePlayerPolicyDeclaration.declarationYear < this.startYear) {
        if (this.getCoverPeriodYear(new Date(this.policy.policyInceptionDate)) == rolePlayerPolicyDeclaration.declarationYear) {
          startDate = startDate;
          endDate = startDate;
        } else {
          startDate = this.getDefaultRolePlayerPolicyDeclarationStartDate(rolePlayerPolicyDeclaration);
          endDate = this.getDefaultRolePlayerPolicyDeclarationStartDate(rolePlayerPolicyDeclaration);
          rolePlayerPolicyDeclaration.effectiveFrom = startDate;
          rolePlayerPolicyDeclaration.effectiveTo = endDate;
        }
      }
      if (rolePlayerPolicyDeclaration.declarationYear > this.startYear) {
        startDate = this.getDefaultRolePlayerPolicyDeclarationStartDate(rolePlayerPolicyDeclaration);
        endDate = this.getDefaultRolePlayerPolicyDeclarationEndDate(rolePlayerPolicyDeclaration);
      }
      if (rolePlayerPolicyDeclaration.declarationYear == this.startYear) {
        if (this.startDate > new Date(startDate)) {
          startDate = this.startDate;
          endDate = endDate;
        }
      }

      rolePlayerPolicyDeclaration.prorataDays = this.calculateDays(startDate, endDate);
    }

    rolePlayerPolicyDeclaration.effectiveFrom = startDate;
    rolePlayerPolicyDeclaration.effectiveTo = endDate;
  }

  setMinimumAllowablePremiumForCoverPeriod(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration) {
    const startDate = new Date(rolePlayerPolicyDeclaration.declarationYear, this.industryClassDeclarationConfiguration.renewalPeriodStartMonth - 1, this.industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth);

    if (this.industryClassDeclarationConfiguration.minimumAllowablePremiums) {
      const index = this.industryClassDeclarationConfiguration.minimumAllowablePremiums.findIndex(s => new Date(s.effectiveFrom) <= startDate && startDate < new Date(s.effectiveTo));

      if (index > -1) {
        this.configuredMinimumAllowablePremium = this.industryClassDeclarationConfiguration.minimumAllowablePremiums[index];
      } else {
        this.configuredMinimumAllowablePremium = this.industryClassDeclarationConfiguration.minimumAllowablePremiums.find(s => !s.effectiveTo);
      }
    }
  }

  setMaximumForCoverPeriod(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration) {
    const startDate = new Date(rolePlayerPolicyDeclaration.declarationYear, this.industryClassDeclarationConfiguration.renewalPeriodStartMonth - 1, this.industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth);

    if (this.industryClassDeclarationConfiguration.maxAverageEarnings) {
      const index = this.industryClassDeclarationConfiguration.maxAverageEarnings.findIndex(s => new Date(s.effectiveFrom) <= startDate && startDate < new Date(s.effectiveTo));

      if (index > -1) {
        this.configuredMaximum = this.industryClassDeclarationConfiguration.maxAverageEarnings[index];
      } else {
        this.configuredMaximum = this.industryClassDeclarationConfiguration.maxAverageEarnings.find(s => !s.effectiveTo);
      }
    }
  }

  getEffectiveFromDate(): Date {
    return new Date(this.form.controls.effectiveFrom.value);
  }

  getEffectiveToDate(): Date {
    const effectiveTo = new Date(this.form.controls.effectiveTo.value);
    const selectedCoverPeriodEndDate = this.getSelectedRolePlayerPolicyDeclarationEndDate(this.selectedRolePlayerPolicyDeclaration);
    return effectiveTo > selectedCoverPeriodEndDate ? new Date(selectedCoverPeriodEndDate) : effectiveTo;
  }

  getSupportedRolePlayerPolicyDeclarationTypes(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration): RolePlayerPolicyDeclarationTypeEnum[] {
    if (rolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationStatus == RolePlayerPolicyDeclarationStatusEnum.Current) {
      return [RolePlayerPolicyDeclarationTypeEnum.Budgeted, RolePlayerPolicyDeclarationTypeEnum.Estimates];
    } else {
      return [RolePlayerPolicyDeclarationTypeEnum.Actual, RolePlayerPolicyDeclarationTypeEnum.Estimates];
    }
  }

  reset() {
    this.selectedRolePlayerPolicyDeclaration = null;
    this.selectedRolePlayerPolicyDeclarationDetail = null;
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string): string {
    return lookup ? lookup.replace(/([a-z])([A-Z])/g, '$1 $2') : 'N/A';
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
}
