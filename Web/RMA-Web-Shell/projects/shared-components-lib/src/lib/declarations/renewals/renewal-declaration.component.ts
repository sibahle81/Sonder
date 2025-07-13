import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { IndustryClassDeclarationConfiguration } from 'projects/clientcare/src/app/member-manager/models/industry-class-declaration-configuration';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { RolePlayerPolicyDeclaration } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-declaration';
import { RolePlayerPolicyDeclarationDetail } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-declaration-detail';
import { CategoryInsuredEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/categoryInsuredEnum';
import { RolePlayerPolicyDeclarationStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/role-player-policy-declaration-status.enum';
import { RolePlayerPolicyDeclarationTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/role-player-policy-declaration-type.enum';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { BehaviorSubject } from 'rxjs';
import { VarianceDialogComponent } from './variance-dialog/variance-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MaxAverageEarning } from 'projects/clientcare/src/app/member-manager/models/max-average-earning';
import { DatePipe } from '@angular/common';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ClientItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/client-item-type-enum';
import { productUtility } from 'projects/shared-utilities-lib/src/lib/product-utility/product-utility';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';
import "src/app/shared/extensions/date.extensions";
import { MinimumAllowablePremium } from 'projects/clientcare/src/app/member-manager/models/minimum-allowable-premium';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { RolePlayerPolicyDeclarationContext } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-declaration-context';

@Component({
  selector: 'renewal-declaration',
  templateUrl: './renewal-declaration.component.html',
  styleUrls: ['./renewal-declaration.component.css']
})

export class RenewalDeclarationComponent extends PermissionHelper implements OnInit, OnChanges {

  editRatePermission = 'Edit Policy Rates';
  viewAuditPermission = 'View Audits';

  @Input() policy: Policy;

  //optional inputs
  @Input() isWizard = false;
  @Input() isReadOnly = false;
  @Input() refresh = false;

  @Output() applyToAllEmit = new EventEmitter<RolePlayerPolicyDeclarationContext>();

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  form: UntypedFormGroup;

  industryClassDeclarationConfiguration: IndustryClassDeclarationConfiguration;
  configuredMaximum: MaxAverageEarning;
  minimumAllowableEarningsPerEmployee = 0;
  maximumAllowableEarningsPerEmployee = 0;
  configuredMinimumAllowablePremium: MinimumAllowablePremium;

  selectedRolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration;
  selectedRolePlayerPolicyDeclarationDetail: RolePlayerPolicyDeclarationDetail;

  categoryInsureds: CategoryInsuredEnum[];

  current = RolePlayerPolicyDeclarationStatusEnum.Current;
  isCoid = false;
  isMining = false;
  unSkilled = CategoryInsuredEnum.Unskilled;
  cancelled = PolicyStatusEnum.Cancelled;

  constructor(
    private readonly declarationService: DeclarationService,
    private readonly formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.categoryInsureds = this.ToArray(CategoryInsuredEnum);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.refresh && !changes.refresh.firstChange) {
      this.autoProcessPremiums();
    } else if (this.policy) {
      this.isCoid = productUtility.isCoid(this.policy.productOption.product);
      this.getIndustryClassDeclarationConfiguration();
    }
  }

  getIndustryClassDeclarationConfiguration() {
    this.loadingMessage$.next('loading configuration...please wait');
    this.declarationService.getIndustryClassDeclarationConfiguration(+this.policy.policyOwner.company.industryClass).subscribe(result => {
      if (result) {
        this.industryClassDeclarationConfiguration = result;
      }

      this.isMining = this.policy.policyOwner.company.industryClass == IndustryClassEnum.Mining;

      if (this.isMining && !this.isReadOnly) {
        this.autoProcessPremiums();
      }

      this.isLoading$.next(false);
    });
  }

  autoProcessPremiums() {
    this.policy.rolePlayerPolicyDeclarations.forEach(rolePlayerPolicyDeclaration => {
      rolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationDetails.forEach(rolePlayerPolicyDeclarationDetail => {
        this.calculatePremium(rolePlayerPolicyDeclaration, rolePlayerPolicyDeclarationDetail, false);
        this.setMinimumAllowablePremiumForCoverPeriod(rolePlayerPolicyDeclaration);
        this.sumTotalDeclarationPremium(rolePlayerPolicyDeclaration);
      });
    });
  }

  rolePlayerPolicyDeclarationDetailSelected(rolePlayerPolicyDeclarationDetail: RolePlayerPolicyDeclarationDetail) {
    this.policy.rolePlayerPolicyDeclarations.forEach(s => {
      if (s.rolePlayerPolicyDeclarationDetails.includes(rolePlayerPolicyDeclarationDetail)) {
        this.selectedRolePlayerPolicyDeclaration = s;
      }
    });

    this.setMaximumForCoverPeriod(this.selectedRolePlayerPolicyDeclaration);
    this.selectedRolePlayerPolicyDeclarationDetail = rolePlayerPolicyDeclarationDetail;
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      productOption: [{ value: this.getProductOptionName(), disabled: true }],
      categoryInsured: [{ value: this.getCategoryInsuredName(this.selectedRolePlayerPolicyDeclarationDetail.categoryInsured), disabled: true }],
      rate: [{ value: this.selectedRolePlayerPolicyDeclarationDetail.rate, disabled: !this.userHasPermission(this.editRatePermission) }],
      averageNumberOfEmployees: [{ value: this.selectedRolePlayerPolicyDeclarationDetail.averageNumberOfEmployees ? this.selectedRolePlayerPolicyDeclarationDetail.averageNumberOfEmployees : null, disabled: this.isReadOnly }, Validators.required],
      averageEmployeeEarnings: [{ value: this.selectedRolePlayerPolicyDeclarationDetail.averageEmployeeEarnings ? this.selectedRolePlayerPolicyDeclarationDetail.averageEmployeeEarnings : null, disabled: this.isReadOnly }, [Validators.required, Validators.min(this.selectedRolePlayerPolicyDeclarationDetail.averageNumberOfEmployees * 5000), Validators.max(this.configuredMaximum ? this.configuredMaximum.maxAverageEarnings : 0)]],
      liveInAllowance: [{ value: this.selectedRolePlayerPolicyDeclarationDetail.liveInAllowance ? this.selectedRolePlayerPolicyDeclarationDetail.liveInAllowance : 0, disabled: this.isReadOnly }, [Validators.max(this.selectedRolePlayerPolicyDeclarationDetail.averageNumberOfEmployees ? this.selectedRolePlayerPolicyDeclarationDetail.averageNumberOfEmployees : 0)]]
    });

    this.form.markAsPristine();
    this.isLoading$.next(false);
  }

  readForm() {
    this.selectedRolePlayerPolicyDeclarationDetail.averageNumberOfEmployees = +this.form.controls.averageNumberOfEmployees.value;
    this.selectedRolePlayerPolicyDeclarationDetail.averageEmployeeEarnings = +this.form.controls.averageEmployeeEarnings.value;
    this.selectedRolePlayerPolicyDeclarationDetail.rate = +this.form.controls.rate.value;
    this.selectedRolePlayerPolicyDeclarationDetail.liveInAllowance = +this.form.controls.liveInAllowance.value ? +this.form.controls.liveInAllowance.value : 0;

    this.calculatePremium(this.selectedRolePlayerPolicyDeclaration, this.selectedRolePlayerPolicyDeclarationDetail, true);
    this.setMinimumAllowablePremiumForCoverPeriod(this.selectedRolePlayerPolicyDeclaration);
  }

  getLiveInAllowanceForCoverPeriod(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration): number {
    const startDate = new Date(rolePlayerPolicyDeclaration.declarationYear, this.industryClassDeclarationConfiguration.renewalPeriodStartMonth - 1, this.industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth);
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

  calculatePremium(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration, rolePlayerPolicyDeclarationDetail: RolePlayerPolicyDeclarationDetail, applyAll: boolean) {
    const numberOfMonths = this.getMonths(rolePlayerPolicyDeclarationDetail);
    const liveInAllowanceForCoverPeriod = this.isMining ? this.getLiveInAllowanceForCoverPeriod(rolePlayerPolicyDeclaration) : 0;
    const totalLiveInAllowanceEarnings = rolePlayerPolicyDeclarationDetail.liveInAllowance * liveInAllowanceForCoverPeriod * numberOfMonths;
    const proRataLiveInAllowancePremium = totalLiveInAllowanceEarnings * (rolePlayerPolicyDeclarationDetail.rate / 100);

    const proRataDays = this.calculateDays(rolePlayerPolicyDeclarationDetail.effectiveFrom, rolePlayerPolicyDeclarationDetail.effectiveTo);
    const annualizedEarnings = this.policy.policyStatus != PolicyStatusEnum.PendingCancelled ? (rolePlayerPolicyDeclarationDetail.averageEmployeeEarnings / proRataDays) * rolePlayerPolicyDeclaration.fullYearDays : rolePlayerPolicyDeclarationDetail.averageEmployeeEarnings;
    const totalAnnualPremium = +(annualizedEarnings * (rolePlayerPolicyDeclarationDetail.rate / 100));
    const annualPremiumPerDay = totalAnnualPremium / rolePlayerPolicyDeclaration.fullYearDays;
    const proRataPremium = annualPremiumPerDay * proRataDays

    rolePlayerPolicyDeclarationDetail.premium = proRataPremium + proRataLiveInAllowancePremium;

    if (applyAll && !this.isReadOnly) {
      const rolePlayerPolicyDeclarationContext = new RolePlayerPolicyDeclarationContext();
      rolePlayerPolicyDeclarationContext.rolePlayerPolicyDeclaration = rolePlayerPolicyDeclaration;
      rolePlayerPolicyDeclarationContext.rolePlayerPolicyDeclarationDetail = rolePlayerPolicyDeclarationDetail;
      this.applyToAllEmit.emit(rolePlayerPolicyDeclarationContext);
    }
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

  calculateDays(startDate: Date, endDate: Date): number {
    const date1 = new Date(this.datePipe.transform(new Date(startDate).getCorrectUCTDate(), 'yyyy-MM-dd'));
    const date2 = new Date(this.datePipe.transform(new Date(endDate).getCorrectUCTDate(), 'yyyy-MM-dd'));

    var diff = date2.getTime() - date1.getTime();
    return diff > 0 ? (Math.ceil(diff / (1000 * 3600 * 24))) : 0;
  }

  getProductName(): string {
    return this.policy.productOption.product.name + ' (' + this.policy.productOption.product.code + ')';
  }

  getProductOptionName(): string {
    return this.policy.productOption.name + ' (' + this.policy.productOption.code + ')';
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

    return isValid;
  }

  openVarianceDialog($event: RolePlayerPolicyDeclaration) {
    const dialogRef = this.dialog.open(VarianceDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        rolePlayerPolicyDeclaration: $event,
        isReadOnly: this.isReadOnly || (this.isWizard && $event.varianceReason && $event.varianceReason != String.Empty),
        allRequiredDocumentsUploaded: $event.allRequiredDocumentsUploaded
      }
    });
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
    if (isValid) {
      let totalPremium = 0;

      let totalAverageEmployees = 0;
      let totalAverageEarnings = 0;

      rolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationDetails.forEach(rolePlayerPolicyDeclarationDetail => {
        if (!rolePlayerPolicyDeclarationDetail.isDeleted) {
          totalPremium += rolePlayerPolicyDeclarationDetail.premium;

          totalAverageEmployees += rolePlayerPolicyDeclarationDetail.averageNumberOfEmployees;
          totalAverageEarnings += rolePlayerPolicyDeclarationDetail.averageEmployeeEarnings;
        }
      });

      if (this.configuredMinimumAllowablePremium && this.configuredMinimumAllowablePremium.minimumPremium && this.configuredMinimumAllowablePremium.minimumPremium > 0 && +totalPremium < this.configuredMinimumAllowablePremium.minimumPremium) {
        const minimumPremiumPerDay = this.configuredMinimumAllowablePremium.minimumPremium / rolePlayerPolicyDeclaration.fullYearDays;
        totalPremium = minimumPremiumPerDay * rolePlayerPolicyDeclaration.prorataDays;
      }

      const earningsPerEmployee = totalAverageEarnings / totalAverageEmployees;
      rolePlayerPolicyDeclaration.variancePercentage = null;

      if (this.isCoid) {
        if (rolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationType == RolePlayerPolicyDeclarationTypeEnum.Actual && (rolePlayerPolicyDeclaration.originalEarningsPerEmployee && rolePlayerPolicyDeclaration.originalEarningsPerEmployee > 0) && (rolePlayerPolicyDeclaration.originalEarningsPerEmployee != earningsPerEmployee)) {
          const variance = (1 - (earningsPerEmployee / rolePlayerPolicyDeclaration.originalEarningsPerEmployee)) * -100;
          if (Math.abs(+variance.toFixed(2)) >= this.industryClassDeclarationConfiguration.varianceThreshold) {
            rolePlayerPolicyDeclaration.variancePercentage = +(variance.toFixed(2));
          } else {
            rolePlayerPolicyDeclaration.varianceReason = null;
          }
        } else {
          rolePlayerPolicyDeclaration.varianceReason = null;
        }
      }

      rolePlayerPolicyDeclaration.invoiceAmount = +totalPremium;
      rolePlayerPolicyDeclaration.totalPremium = +totalPremium;

      rolePlayerPolicyDeclaration.adjustmentAmount = rolePlayerPolicyDeclaration.invoiceAmount - rolePlayerPolicyDeclaration.originalTotalPremium;
      rolePlayerPolicyDeclaration.requiresTransactionModification = rolePlayerPolicyDeclaration.adjustmentAmount !== 0;
    } else {
      rolePlayerPolicyDeclaration.invoiceAmount = 0;
      rolePlayerPolicyDeclaration.totalPremium = 0;
    }
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

  getCoverPeriod(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration): string {
    const policyInceptionDateCoverYear = this.getCoverPeriodYear(new Date(this.policy.policyInceptionDate));
    const policyExpiryDateCoverYear = this.getCoverPeriodYear(new Date(this.policy.expiryDate));

    let startDate = this.getSelectedRolePlayerPolicyDeclarationStartDate(rolePlayerPolicyDeclaration);
    let endDate = this.getSelectedRolePlayerPolicyDeclarationEndDate(rolePlayerPolicyDeclaration);

    rolePlayerPolicyDeclaration.fullYearDays = this.calculateDays(startDate, endDate);

    if (policyInceptionDateCoverYear == rolePlayerPolicyDeclaration.declarationYear) {
      startDate = new Date(this.policy.policyInceptionDate);
      endDate = endDate;
    } else if (policyExpiryDateCoverYear == rolePlayerPolicyDeclaration.declarationYear) {
      const days = this.calculateDays(new Date(this.policy.expiryDate), endDate);
      endDate = days > 1 ? this.policy.expiryDate : endDate;
    }

    rolePlayerPolicyDeclaration.prorataDays = this.calculateDays(startDate, endDate);

    if (rolePlayerPolicyDeclaration.prorataDays > rolePlayerPolicyDeclaration.fullYearDays) {
      rolePlayerPolicyDeclaration.fullYearDays = rolePlayerPolicyDeclaration.prorataDays;
    }

    return `${this.datePipe.transform(startDate, 'yyyy-MM-dd')} to ${this.datePipe.transform(endDate, 'yyyy-MM-dd')}`;
  }

  getSelectedRolePlayerPolicyDeclarationStartDate(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration): Date {
    const defaultStartDate = new Date(rolePlayerPolicyDeclaration.declarationYear, this.industryClassDeclarationConfiguration.renewalPeriodStartMonth - 1, this.industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth);
    return defaultStartDate;
  }

  getSelectedRolePlayerPolicyDeclarationEndDate(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration): Date {
    const defaultEndDate = new Date(rolePlayerPolicyDeclaration.declarationYear + 1, this.industryClassDeclarationConfiguration.renewalPeriodStartMonth - 1, this.industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth);
    return defaultEndDate;
  }

  isWithinPolicyCover($event: RolePlayerPolicyDeclaration): boolean {
    const coverStart = this.getCoverPeriodYear(this.policy.policyInceptionDate);
    return $event.declarationYear >= coverStart;
  }

  reset() {
    this.selectedRolePlayerPolicyDeclaration = null;
    this.selectedRolePlayerPolicyDeclarationDetail = null;
  }

  mathAbs(value: number): number {
    return Math.abs(value);
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

  openRolePlayerPolicyDeclarationAuditDialog(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClientManager,
        clientItemType: ClientItemTypeEnum.RolePlayerPolicyDeclaration,
        itemId: rolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationId,
        heading: `${rolePlayerPolicyDeclaration.declarationYear} ${this.getRolePlayerPolicyDeclarationType(rolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationType)} Declaration Audit`,
        propertiesToDisplay: ['RolePlayerPolicyDeclarationStatus', 'RolePlayerPolicyDeclarationType', 'PenaltyPercentage', 'TotalPremium',
          'VariancePercentage', 'VarianceReason']
      }
    });
  }

  openRolePlayerPolicyDeclarationDetailAuditDialog(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration, rolePlayerPolicyDeclarationDetail: RolePlayerPolicyDeclarationDetail) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClientManager,
        clientItemType: ClientItemTypeEnum.RolePlayerPolicyDeclarationDetail,
        itemId: rolePlayerPolicyDeclarationDetail.rolePlayerPolicyDeclarationDetailId,
        heading: `${rolePlayerPolicyDeclaration.declarationYear} ${this.getRolePlayerPolicyDeclarationType(rolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationType)} ${this.getCategoryInsuredName(rolePlayerPolicyDeclarationDetail.categoryInsured)} Declaration Detail Audit`,
        propertiesToDisplay: ['CategoryInsured', 'Rate', 'AverageNumberOfEmployees', 'AverageEmployeeEarnings',
          'Premium', 'LiveInAllowance']
      }
    });
  }
}
