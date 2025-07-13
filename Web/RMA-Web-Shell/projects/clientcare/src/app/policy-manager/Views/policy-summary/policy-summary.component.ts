import { Component, OnInit, ViewChild } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Case } from '../../shared/entities/case';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { PolicySummaryDataSource } from './policy-summary-datasource';
import { RolePlayerBenefit } from '../../shared/entities/role-player-benefit';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { PaymentFrequencyEnum } from 'projects/shared-models-lib/src/lib/enums/payment-frequency.enum';
import { ProductOption } from '../../../product-manager/models/product-option';
import { Benefit } from '../../../product-manager/models/benefit';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { CoverMemberTypeEnum } from 'projects/shared-models-lib/src/lib/enums/cover-member-type-enum';
import { FuneralPolicyPremiumService } from '../../shared/Services/funeral-policy-premium.service';
import { PolicyService } from '../../shared/Services/policy.service';
import { EuropAssistPremiumMatrix } from '../../shared/entities/europ-assist-premium-matrix';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { HttpErrorResponse } from '@angular/common/http';
import { FuneralPolicyPremium } from '../../shared/entities/funeral-policy-premium';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { CaseTypeEnum } from '../../shared/enums/case-type.enum';
import { fromEvent, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap, concatMap, catchError, filter, map } from 'rxjs/operators';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { TopUpBenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/top-up-benefit-type-enum';

@Component({
  selector: 'policy-summary',
  templateUrl: './policy-summary.component.html',
  styleUrls: ['./policy-summary.component.css']
})
export class PolicySummaryComponent extends WizardDetailBaseComponent<Case> implements OnInit {
  paymentFrequencies: Lookup[];
  coverMemberTypes: Lookup[];
  loadingPaymentFrequencies = false;
  benefits: RolePlayerBenefit[];
  displayedColumns = ['rolePlayerName', 'memberType', 'productOptionName', 'benefitName', 'benefitRateLatest', 'benefitBaseRateLatest'];
  productOption: ProductOption;
  installmentPremium = 0;
  annualPremium = 0;
  totalBasePremium = 0;
  intermediaryServiceFee = 0;
  europAssistFee: any;
  additionalBenefitsAmount: number;
  isManualPremium = false;
  isValuePlus = false;
  mainMemberFuneralPremium = 0;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  adminFeePercentage = 0;
  commissionFeePercentage = 0;
  binderFeePercentage = 0;
  premiumAdjustmentPercentage = 0;
  europAssistPremiumMatrix: EuropAssistPremiumMatrix;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly productOptionService: ProductOptionService,
    private readonly funeralPolicyPremiumService: FuneralPolicyPremiumService,
    private readonly policyService: PolicyService,
    private readonly alertService: AlertService,
    public readonly dataSource: PolicySummaryDataSource    
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.createForm(0);
  }

  ngOnInit() {
    super.ngOnInit();
    this.dataSource.setControls(this.paginator, this.sort);
  }

  onLoadLookups(): void {
    this.getPaymentFrequencies();
    this.getCoverMemberTypes();
  }

  populateModel(): void {
    this.model.mainMember.policies[0].paymentFrequency = this.form.value.paymentFrequency;
    this.model.mainMember.policies[0].installmentPremium = this.installmentPremium;
    this.model.mainMember.policies[0].annualPremium = this.annualPremium;
    this.model.mainMember.policies[0].commissionPercentage = this.commissionFeePercentage;
    this.model.mainMember.policies[0].adminPercentage = this.adminFeePercentage;
    this.model.mainMember.policies[0].binderFeePercentage = this.binderFeePercentage;
    this.model.mainMember.policies[0].premiumAdjustmentPercentage = this.premiumAdjustmentPercentage;
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      paymentFrequency: ['', [Validators.min(1)]],
      totalBasePremium: [0],
      totalOfficePremium: [0],
      adminFee: [0, [Validators.required]],
      commissionFee: [0, [Validators.required]],
      binderFee: [0, [Validators.required]],
      premiumAdjustment: [0, [Validators.required]],
      isEuropAssist: [null],
      isManualPremium: [false],
    });

    this.form.get('totalBasePremium').disable();
    this.form.get('totalOfficePremium').disable();
    this.form.get('premiumAdjustment').disable();
  }

  private getCoverMemberTypes(): void {
    this.lookupService.getCoverMemberTypes().subscribe({
      next: (data: Lookup[]) => {
        this.coverMemberTypes = data;
      }
    });
  }

  private getPaymentFrequencies(): void {
    this.loadingPaymentFrequencies = true;
    this.lookupService.getPaymentFrequencies().subscribe(
      data => {
        this.paymentFrequencies = data;
        this.loadingPaymentFrequencies = false;
      }
    );

    this.policyService.getEuropAssistPremiumMatrices().subscribe(matrices => {
      this.europAssistPremiumMatrix = matrices[0];
    });
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model) {
      if (this.model.mainMember.policies[0].commissionPercentage < 0) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push('Please specify the commission percentage for the policy');
      }
      if (this.model.mainMember.policies[0].adminPercentage < 0) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push('Please specify the admin percentage for the policy');
      }
      if (this.installmentPremium <= 0.0 || this.model.mainMember.policies[0].installmentPremium <= 0.0) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push('Policy premium cannot be zero');
      }
    }
    return validationResult;
  }

  populateForm(): void {
    if (this.model
      && this.model.mainMember
      && this.model.mainMember.policies
      && this.model.mainMember.policies.length > 0
      && this.model.mainMember.policies[0].productOption
      && this.model.mainMember.policies[0].productOption.id
    ) {
      this.dataSource.isLoading = true;
      this.benefits = [];
      this.productOption = this.model.mainMember.policies[0].productOption;
      this.isValuePlus = this.model.mainMember.policies[0].productOption.product.productClassId === ProductClassEnum.ValuePlus;

      if (this.model && this.europAssistPremiumMatrix) {
        const europRMAAssistFee = this.europAssistPremiumMatrix.basePremium + this.europAssistPremiumMatrix.profitExpenseLoadingPremium;
        this.europAssistFee = europRMAAssistFee / (1 - this.model.mainMember.policies[0].commissionPercentage);
      }

      if (this.model.mainMember.policies && this.model.mainMember.policies.length > 0) {
        const policy = this.model.mainMember.policies[0];
        if (policy.benefits) {
          const policyBenefits = policy.benefits.filter(b => b.coverMemberType === CoverMemberTypeEnum.MainMember);
          const benefitIds = policyBenefits.map(b => b.id);
          this.benefits = this.model.mainMember.benefits.filter(b => benefitIds.includes(b.id));
        }
      }

      if (this.model.caseTypeId === CaseTypeEnum.ReinstatePolicy) {
        this.form.get('adminFee').disable();
        this.form.get('commissionFee').disable();
        this.form.get('binderFee').disable();
      }
      
      this.getBenefits(this.productOption);
    }
  }

  onPaymentFrequencyChange(): void {
    this.calculateTotalPremium(this.form.value.paymentFrequency);
  }

  calculateTotalPremium(paymentFrequency: PaymentFrequencyEnum) {
    if (!this.isManualPremium) {
      const member = this.model.newMainMember ? this.model.newMainMember : this.model.mainMember;
      if (this.productOption && this.benefits && this.benefits.length > 0) {

        this.totalBasePremium = 0.00;

        let multiplier = 0;
        switch (paymentFrequency) {
          case PaymentFrequencyEnum.Annually:
            multiplier = 12.0;
            break;
          case PaymentFrequencyEnum.BiAnnually:
            multiplier = 6.0;
            break;
          case PaymentFrequencyEnum.Quarterly:
            multiplier = 3.0;
            break;
          case PaymentFrequencyEnum.Monthly:
            multiplier = 1.0;
            break;
          default:
            return;
        }

        if (multiplier === 0) { return; }

        this.form.patchValue({
          paymentFrequency
        });

        const policy = this.model.mainMember.policies[0];
        const isGroupPolicy = policy.parentPolicyId && policy.parentPolicyId > 0;
        
        const benefits = this.benefits.filter(b => b !== null && b.benefitBaseRateLatest > 0.00);
        if (this.model.mainMember.policies[0].policyLifeExtension == null || this.model.mainMember.policies[0].policyLifeExtension == undefined) {
          let totalBasePremium = 0.00;
          totalBasePremium = benefits.reduce((sum, current) => sum + current.benefitBaseRateLatest, 0);
          if (isGroupPolicy) {
            // Get the parent policy's inception date
            const inceptionDate = new Date(this.model.mainMember.policies[0].parentPolicyInceptionDate);
            // Get the cutoff date for group scheme premium rounding
            this.lookupService.getItemByKey('GroupRoundingCutoffDate').subscribe(
              setting => {
                const cutoffDate = new Date(setting === undefined ? '2100-01-01' : setting);
                if (inceptionDate > cutoffDate) {
                  this.funeralPolicyPremiumService.getUnRoundedGroupPolicyPremium(totalBasePremium, this.adminFeePercentage, this.binderFeePercentage, this.commissionFeePercentage, this.premiumAdjustmentPercentage).subscribe({
                    next: (data: FuneralPolicyPremium) => { 
                      this.setPremiums(data, totalBasePremium, multiplier, policy.isEuropAssist, 2); 
                    },
                    error: (response: HttpErrorResponse) => {
                      this.showErrorMessage(response);
                    }
                  });
                } else {
                  this.funeralPolicyPremiumService.getRoundedGroupPolicyPremium(totalBasePremium, this.adminFeePercentage, this.binderFeePercentage, this.commissionFeePercentage, this.premiumAdjustmentPercentage).subscribe({
                    next: (data: FuneralPolicyPremium) => { 
                      this.setPremiums(data, totalBasePremium, multiplier, policy.isEuropAssist, 0); 
                    },
                    error: (response: HttpErrorResponse) => {
                      this.showErrorMessage(response);
                    }
                  });
                }
              }
            );
          } else {
            this.funeralPolicyPremiumService.getIndividualPolicyPremium(totalBasePremium, this.adminFeePercentage, this.binderFeePercentage, this.commissionFeePercentage, this.premiumAdjustmentPercentage).subscribe({
              next: (data: FuneralPolicyPremium) => { this.setPremiums(data, totalBasePremium, multiplier, policy.isEuropAssist, 2); },
              error: (response: HttpErrorResponse) => {
                this.showErrorMessage(response);
              }
            });
          }
        } else {
          const basicBenefits = benefits.filter(b => b.benefitType === BenefitTypeEnum.Basic);
          const basicPremiumAmount = basicBenefits.reduce((sum, current) => sum + current.benefitBaseRateLatest, 0);

          if (this.isValuePlus) {
            const additionalBenefits = benefits.filter(b => b.benefitType === BenefitTypeEnum.Additional);
            const vasBenefit =  additionalBenefits.find(b => b.benefitType === BenefitTypeEnum.Additional && b.benefitName.includes('(VAS)'));
            const vasAmount = vasBenefit.benefitBaseRateLatest;
            this.additionalBenefitsAmount = additionalBenefits.reduce((sum, current) => sum + current.benefitBaseRateLatest, 0);

            this.totalBasePremium = basicPremiumAmount + Number(this.additionalBenefitsAmount) - vasAmount;
            this.installmentPremium = basicPremiumAmount + Number(this.additionalBenefitsAmount) ;
          }
          else
          {
            this.totalBasePremium = basicPremiumAmount;
            this.installmentPremium = this.totalBasePremium + Number(this.additionalBenefitsAmount);
          }
          this.form.patchValue({
            totalBasePremium: this.totalBasePremium.toFixed(10),
            totalOfficePremium: this.installmentPremium.toFixed(2)
          });
        }
      }
    }
  }

  private showErrorMessage(response: HttpErrorResponse): void {
    let msg = 'Could not calculate policy premium';
    if (response.error && response.error.Error) {
      msg = response.error.Error;
    } else {
      msg = response.message;
    }
    this.alertService.error(msg, 'Premium Calculation');
  }

  private setPremiums(data: FuneralPolicyPremium, totalBasePremium: number, multiplier: number, isEuropAssist: boolean, round: number) {
    totalBasePremium = totalBasePremium * multiplier;
    this.installmentPremium = data.premium * multiplier;
    if (isEuropAssist) {
      this.installmentPremium += this.europAssistFee;
    }
    // Add the premium adjustment percentage to the base premium, because that is the value
    // that is used in the premium calculation.
    this.totalBasePremium = totalBasePremium + (totalBasePremium * this.premiumAdjustmentPercentage);
    this.form.patchValue({
      totalBasePremium: this.totalBasePremium.toFixed(6),
      totalOfficePremium: this.installmentPremium.toFixed(round)
    });
  }

  validateAdminFee(adminFee: number): void {
    this.adminFeePercentage = (adminFee / 100);
    if (this.productOption && this.adminFeePercentage >= 0) {
      if (this.adminFeePercentage > this.productOption.maxAdminFeePercentage) {
        this.form.get('adminFee').setErrors({ max: true });
      } else {
        const paymentFrequency = this.form.value.paymentFrequency;
        this.calculateTotalPremium(paymentFrequency);
      }
    }
  }

  validateCommissionFee(commissionFee: number): void {
    this.commissionFeePercentage = (commissionFee / 100);
    if (this.productOption && this.commissionFeePercentage >= 0) {
      if (this.commissionFeePercentage > this.productOption.maxCommissionFeePercentage) {
        this.form.get('commissionFee').setErrors({ max: true });
      } else {
        const paymentFrequency = this.form.value.paymentFrequency;
        this.calculateTotalPremium(paymentFrequency);
      }
    }
  }

  validateBinderFee(binderFee: number): void {
    this.binderFeePercentage = (binderFee / 100);
    if (this.productOption && this.binderFeePercentage >= 0) {
      if (this.binderFeePercentage > this.productOption.maxBinderFeePercentage) {
        this.form.get('binderFee').setErrors({ max: true });
      } else {
        const paymentFrequency = this.form.value.paymentFrequency;
        this.calculateTotalPremium(paymentFrequency);
      }
    }
  }

  getBenefits(productOption: ProductOption) {
    if (productOption && productOption.id) {
      this.dataSource.isLoading = true;
      this.benefits = [];
      const benefitIds = this.getSelectedBenefitIds();
      var policyId = 0;
      var funeralPremium;

      if (this.isValuePlus){
        if (this.model.newMainMember) {
          policyId = this.model.newMainMember.policy.policyId
          funeralPremium = this.getFuneralPremiumForMainMember( this.model.newMainMember.benefits);
        } else {
          policyId = this.model.mainMember.policies[0].policyId
          funeralPremium = this.getFuneralPremiumForMainMember(this.model.mainMember.benefits);
        }

        var spouseDeleteCount =  this.model.spouse?.filter(s=>s.isDeleted == true).length;
        var childDeleteCount =  this.model.children?.filter(s=>s.isDeleted == true).length;
        var spouseCount =  this.model.spouse?.filter(s=>s.isDeleted == false).length;
        var childCount =  this.model.children?.filter(s=>s.isDeleted == false).length;


        this.policyService.getMainMemberFuneralPremium(policyId, spouseCount, childCount)
        .pipe(
          concatMap((result1) => {
            this.mainMemberFuneralPremium = result1;
            return  this.productOptionService.getBenefitsForOptionAndBenefits(productOption.id, benefitIds).pipe(
              catchError((error: HttpErrorResponse) => {
                return of(null);
              })
            );
          }),
          catchError((error: HttpErrorResponse) => {
            return of(null);
          })
        )
        .subscribe(
          data => {
            this.additionalBenefitsAmount = 0.00;
            if (this.isValuePlus) {
              // Load additional benefits that carry premiums and cover amounts

            } else {
              const additionalBenefits = data.filter(s => s.benefitType === BenefitTypeEnum.Additional);
              if (additionalBenefits) {
                this.additionalBenefitsAmount = Number(additionalBenefits.reduce((sum, current) => sum + current.benefitRates[0].baseRate, 0).toFixed(2));
              }
            }
            // Load basic benefits for the main member, who could be the new main member in continuation cases
            if (this.model.newMainMember) {
              this.loadMemberBenefits(this.model.newMainMember, data);
            } else {
              this.loadMemberBenefits(this.model.mainMember, data);
            }
            // Load benefits for other family members
            this.model.spouse?.forEach(spouse => {
                this.loadMemberBenefits(spouse, data);
            });
            this.model.children?.forEach(child => {
              this.loadMemberBenefits(child, data);
            });
            this.model.extendedFamily?.forEach(member => {
              this.loadMemberBenefits(member, data);
            });

            if (this.isValuePlus){
              var mainBenefits = this.benefits.filter(b =>b.benefitType == BenefitTypeEnum.Additional && b.coverMemberType == CoverMemberTypeEnum.MainMember  && b.benefitName.indexOf('Funeral') > 0);
              if (mainBenefits.length > 0)
              {
                mainBenefits[0].benefitBaseRateLatest = this.mainMemberFuneralPremium;  
              }
            }
            
            // Sort & display the benefits
            this.benefits = this.benefits.sort(this.compareBenefit);
            this.dataSource.getData(this.benefits);
            this.dataSource.isLoading = false;
            
            this.patchFormValues();
          }
        );
      }
      else
      {
          this.productOptionService.getBenefitsForOptionAndBenefits(productOption.id, benefitIds).subscribe(
          data => 
            {
            this.additionalBenefitsAmount = 0.00;
            if (this.isValuePlus) {
              // Load additional benefits that carry premiums and cover amounts

            } else {
              const additionalBenefits = data.filter(s => s.benefitType === BenefitTypeEnum.Additional);
              if (additionalBenefits) {
                this.additionalBenefitsAmount = Number(additionalBenefits.reduce((sum, current) => sum + current.benefitRates[0].baseRate, 0).toFixed(2));
              }
            }
            // Load basic benefits for the main member, who could be the new main member in continuation cases
            if (this.model.newMainMember) {
              this.loadMemberBenefits(this.model.newMainMember, data);
            } else {
              this.loadMemberBenefits(this.model.mainMember, data);
            }
            // Load benefits for other family members
            this.model.spouse?.forEach(spouse => {
                this.loadMemberBenefits(spouse, data);
            });
            this.model.children?.forEach(child => {
              this.loadMemberBenefits(child, data);
            });
            this.model.extendedFamily?.forEach(member => {
              this.loadMemberBenefits(member, data);
            });

            // Sort & display the benefits
            this.benefits = this.benefits.sort(this.compareBenefit);
            this.dataSource.getData(this.benefits);
            this.dataSource.isLoading = false;
            this.patchFormValues();
          }
        );
      }
    }
  }

  private loadMemberBenefits(member: RolePlayer, data: Benefit[]): void {
    if (!member) { return; }
    if (member.isDeleted) { return; }
    member.benefits = member.benefits.filter(b => b.rolePlayerName === member.displayName);
    member.benefits.forEach(b => {
      const benefit = data?.find(s => s.id === b.id);
      if (benefit) {
        b.benefitName = benefit.name;
        b.memberType = this.coverMemberTypes.find(s => s.id === benefit.coverMemberType).name;
        b.rolePlayerName = b.rolePlayerName;
        this.benefits.push(b);
      }
    });
  }

  private compareBenefit(a: RolePlayerBenefit, b: RolePlayerBenefit): number {
    const coverMemberTypeComparison = a.coverMemberType - b.coverMemberType;
    if (coverMemberTypeComparison !== 0) {
      return coverMemberTypeComparison;
    }
    const benefitTypeComparison = a.benefitType - b.benefitType;
    if (benefitTypeComparison !== 0) {
      return benefitTypeComparison;
    }
    return a.rolePlayerName.localeCompare(b.rolePlayerName);
  }

  private getSelectedBenefitIds(): number[] {
    let benefitIds: number[] = [];
    if (this.model.newMainMember) {
      benefitIds.push(...this.getMemberBenefit(this.model.newMainMember));
    } else {
      benefitIds.push(...this.getMemberBenefit(this.model.mainMember));
    }
    benefitIds.push(...this.getMembersBenefits(this.model.spouse));
    benefitIds.push(...this.getMembersBenefits(this.model.children));
    benefitIds.push(...this.getMembersBenefits(this.model.extendedFamily));
    return this.getDistinctBenefitIds(benefitIds);
  }

  private getDistinctBenefitIds(benefitIds: number[]): number[] {
    let result: number[] = [];
    benefitIds.forEach(b => {
      if (!result.includes(b)) {
        result.push(b);
      }
    });
    return result;
  }

  private getMembersBenefits(members: RolePlayer[]): number[] {
    var benefitIds: number[] = [];
    if (members) {
      members.forEach(m => {
        benefitIds.push(...this.getMemberBenefit(m));
      })
    }
    return benefitIds;
  }

  private getMemberBenefit(member: RolePlayer): number[] {
    var benefitIds: number[] = [];
    if (member && member.benefits && member.benefits.length > 0) {
      const benefits = member.benefits.filter(b => b.selected && b.benefitType === BenefitTypeEnum.Basic);
      if (benefits.length > 0) {
        benefitIds.push(benefits[0].id);
      }
    }
    return benefitIds;
  }

  memberPassesAgeGroupRules(benefit: Benefit, memberBenefit: RolePlayerBenefit): boolean {
    let passed = true;

    if (memberBenefit && benefit) {
      if (benefit.ruleItems.length === 0) {
        return true;
      }

      let age = memberBenefit.age;
      if (!memberBenefit.ageIsYears) {
        age = 0;
      }

      benefit.ruleItems.forEach(rule => {
        const formattedJson = rule.ruleConfiguration.replace(/'/g, '"');
        const configs = JSON.parse(formattedJson) as Array<any>;
        for (const config of configs) {
          if (config.fieldName === 'Maximum Entry Age (Years)') {
            passed = passed && age <= config.fieldValue;
          } else if (config.fieldName === 'Minimum Entry Age (Years)') {
            passed = passed && age >= config.fieldValue;
          }
        }
      });
    }
    return passed;
  }

  patchFormValues() {
    if (!this.model.mainMember.policies[0].paymentFrequency) {
      this.model.mainMember.policies[0].paymentFrequency = PaymentFrequencyEnum.Monthly;
    }
    this.adminFeePercentage = this.model.mainMember.policies[0].adminPercentage;
    this.commissionFeePercentage = this.model.mainMember.policies[0].commissionPercentage;
    this.binderFeePercentage = this.model.mainMember.policies[0].binderFeePercentage;
    this.premiumAdjustmentPercentage = this.model.mainMember.policies[0].premiumAdjustmentPercentage == null ? 0.0 : this.model.mainMember.policies[0].premiumAdjustmentPercentage;

    if (!this.premiumAdjustmentPercentage) {
      this.premiumAdjustmentPercentage = 0.0;
    }

    this.form.patchValue({
      paymentFrequency: this.model.mainMember.policies[0].paymentFrequency,
      adminFee: this.getRoundedValue(this.adminFeePercentage),
      commissionFee: this.getRoundedValue(this.commissionFeePercentage),
      binderFee: this.getRoundedValue(this.binderFeePercentage),
      premiumAdjustment: this.getRoundedValue(this.premiumAdjustmentPercentage),
      isEuropAssist: this.model.mainMember.policies && this.model.mainMember.policies[0] ? this.model.mainMember.policies[0].isEuropAssist : false,
    });
    this.form.get('isEuropAssist').disable();
    this.calculateTotalPremium(this.model.mainMember.policies[0].paymentFrequency);
  }

  getRoundedValue(value: number): number {
    const result = Math.round(value * 100000) / 1000;
    return result;
  }

  isMemberRemovalDateNowEffective(roleplayer: RolePlayer): boolean {
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);
    const today = new Date(dtm).getTime();

    if (roleplayer.endDate) {
      const effectiveDateYear = new Date(roleplayer.endDate).getFullYear();
      const effectiveDate = new Date(roleplayer.endDate).getTime();
      if (effectiveDateYear === 1) {
        return false;
      } else if (effectiveDate < today && roleplayer.isDeleted) {
        return true;
      }
    } else {
      return false;
    }
  }

  manualPremiumChange(e: any) {
    if (e.checked) {
      this.form.get('totalBasePremium').enable();
      this.form.get('totalOfficePremium').enable();
      this.form.get('premiumAdjustment').enable();
      this.isManualPremium = true;
      this.premiumAdjustmentPercentage = 0.0;
    } else {
      this.form.get('totalBasePremium').disable();
      this.form.get('totalOfficePremium').disable();
      this.form.get('premiumAdjustment').disable();
      this.isManualPremium = false;
    }
  
  }

  getFuneralPremiumForMainMember(RolePlayerBenefits: RolePlayerBenefit[]) : Number{
    var funeralPremium ; 
    
    var mainBenefits = RolePlayerBenefits.filter(b => b.benefitType == BenefitTypeEnum.Additional && b.benefitName.indexOf('Funeral') > 0 && b.coverMemberType == CoverMemberTypeEnum.MainMember)
    if (mainBenefits.length > 0)
      {
        funeralPremium  = mainBenefits[0].benefitBaseRateLatest;
      }

      return funeralPremium;
  }

}
