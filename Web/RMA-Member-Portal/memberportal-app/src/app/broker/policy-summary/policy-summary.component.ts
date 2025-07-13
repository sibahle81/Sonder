import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { ValidationResult } from 'src/app/shared/components/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'src/app/shared/components/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { CoverMemberTypeEnum } from 'src/app/shared/enums/cover-member-type-enum';
import { PaymentFrequencyEnum } from 'src/app/shared/enums/payment-frequency.enum';
import { Benefit } from 'src/app/shared/models/benefit';
import { Case } from 'src/app/shared/models/case';
import { Lookup } from 'src/app/shared/models/lookup.model';
import { ProductOption } from 'src/app/shared/models/product-option';
import { RolePlayerBenefit } from 'src/app/shared/models/role-player-benefit';
import { RolePlayer } from 'src/app/shared/models/roleplayer';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { ProductOptionService } from 'src/app/shared/services/product-option.service';

@Component({
  selector: 'policy-summary',
  templateUrl: './policy-summary.component.html',
  styleUrls: ['./policy-summary.component.css']
})
export class PolicySummaryComponent extends WizardDetailBaseComponent<Case> implements OnInit, AfterViewInit {
  paymentFrequencies: Lookup[];
  loadingPaymentFrequencies = false;
  benefits: RolePlayerBenefit[];
  displayedColumns = ['rolePlayerName', 'productOptionName', 'benefitName', 'benefitRateLatest', 'benefitBaseRateLatest'];
  installmentPremium = 0;
  annualPremium = 0;
  totalBasePremium = 0;
  officePremium = 0;
  intermediaryServiceFee = 0;

  productOption: ProductOption;
  commissionFeePercentage = 0;
  adminFeePercentage = 0;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public dataSource = new MatTableDataSource<RolePlayerBenefit>();

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly lookupService: LookupService,
    private readonly productOptionService: ProductOptionService
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.createForm(0);
  }

  ngOnInit() {
    super.ngOnInit();

  }

  onLoadLookups(): void {
    this.getPaymentFrequencies();
    this.isMatSort$.subscribe(result => {
      if (result) {
        setTimeout(() => {
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        })
      }
    })
  }

  populateModel(): void {
    this.model.mainMember.policies[0].paymentFrequency = this.form.value.paymentFrequency;
    this.model.mainMember.policies[0].installmentPremium = this.installmentPremium;
    this.model.mainMember.policies[0].annualPremium = this.annualPremium;
    this.model.mainMember.policies[0].commissionPercentage = this.commissionFeePercentage;
    this.model.mainMember.policies[0].adminPercentage = this.adminFeePercentage;
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      paymentFrequency: ['', [Validators.min(1)]],
      totalBasePremium: [null],
      totalOfficePremium: [null],
      commissionFee: [0, [Validators.required]],
      adminFee: [0, [Validators.required]]
    });

    this.form.get('totalBasePremium').disable();
    this.form.get('totalOfficePremium').disable();
  }

  getPaymentFrequencies(): void {
    this.loadingPaymentFrequencies = true;
    this.lookupService.getPaymentFrequencies().subscribe(
      data => {
        this.paymentFrequencies = data;
        this.loadingPaymentFrequencies = false;
      }
    );
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
    }
    return validationResult;
  }

  populateForm(): void {
    if (this.model && this.model.mainMember && this.model.mainMember.policies &&
      this.model.mainMember.policies.length > 0 && this.model.mainMember.policies[0].productOption &&
      this.model.mainMember.policies[0].productOption.id) {
      this.isLoading$.next(true);
      this.benefits = [];
      this.productOption = this.model.mainMember.policies[0].productOption;

      if (this.model.mainMember.policies && this.model.mainMember.policies.length > 0) {
        const policy = this.model.mainMember.policies[0];
        if (policy.benefits) {
          const policyBenefits = policy.benefits.filter(b => b.coverMemberType === CoverMemberTypeEnum.MainMember);
          const benefitIds = policyBenefits.map(b => b.id);
          this.benefits = this.model.mainMember.benefits.filter(b => benefitIds.includes(b.id));
        }
      }
      this.getBenefits(this.productOption);
    }
  }

  onPaymentFrequencyChange(): void {
    this.calculateTotalPremium(this.form.value.paymentFrequency);
  }

  calculateTotalPremium(paymentFrequency: PaymentFrequencyEnum) {
    if (this.productOption && this.model.mainMember.benefits && this.model.mainMember.benefits.length > 0) {

      this.totalBasePremium = this.benefits.filter(y => y !== null).reduce((sum, current) => sum + current.benefitBaseRateLatest, 0);

      this.officePremium = this.totalBasePremium / (1 - this.commissionFeePercentage);
      const commissionFee = this.officePremium - this.totalBasePremium;
      const adminFee = this.officePremium * this.adminFeePercentage;

      this.intermediaryServiceFee = commissionFee;
      this.installmentPremium = this.totalBasePremium + commissionFee + adminFee;
      this.installmentPremium = +(this.installmentPremium.toFixed(1));

      let multiplier = 0;
      multiplier = paymentFrequency === PaymentFrequencyEnum.Annually ? 12 :
        paymentFrequency === PaymentFrequencyEnum.BiAnnually ? 6 :
          paymentFrequency === PaymentFrequencyEnum.Quarterly ? 3 : 0;

      if (multiplier === 0) {
        this.form.patchValue({
          paymentFrequency: PaymentFrequencyEnum.Monthly
        });
      } else if (multiplier === 12) {
        this.form.patchValue({
          paymentFrequency: PaymentFrequencyEnum.Annually
        });
      } else if (multiplier === 6) {
        this.form.patchValue({
          paymentFrequency: PaymentFrequencyEnum.BiAnnually
        });
      } else if (multiplier === 3) {
        this.form.patchValue({
          paymentFrequency: PaymentFrequencyEnum.Quarterly
        });
      }

      if (multiplier > 0) {
        this.installmentPremium = this.installmentPremium * multiplier;
        this.totalBasePremium = this.totalBasePremium * multiplier;
      }

      this.form.patchValue({
        totalBasePremium: this.totalBasePremium.toFixed(2),
        totalOfficePremium: this.installmentPremium.toFixed(2)
      });
    }
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

  getBenefits(productOption: ProductOption) {
    if (productOption && productOption.id) {
      this.isLoading$.next(true);
      this.benefits = [];
      this.productOptionService.getBenefitsForOption(productOption.id).subscribe(
        data => {
          this.model.mainMember.benefits.forEach(b => {
            const benefit = data.find(s => s.id === b.id);
            if (benefit) {
              b.benefitName = benefit.name;
              this.benefits.push(b);
            }
          });
          if (this.model.spouse) {
            this.model.spouse.forEach(spouse => {
              spouse.benefits = spouse.benefits.filter(b => b.rolePlayerName === spouse.displayName);
              spouse.benefits.forEach(b => {
                const benefit = data.find(s => s.id === b.id);
                if (benefit) {
                  b.benefitName = benefit.name;
                  b.rolePlayerName = b.rolePlayerName;
                  this.benefits.push(b);
                }

              });
            });
          }
          if (this.model.children) {
            this.model.children.forEach(child => {
              child.benefits = child.benefits.filter(b => b.rolePlayerName === child.displayName);
              child.benefits.forEach(b => {
                const benefit = data.find(s => s.id === b.id);
                if (benefit) {
                  b.benefitName = benefit.name;
                  b.rolePlayerName = b.rolePlayerName;
                  this.benefits.push(b);
                }
              });
            });
          }
          if (this.model.extendedFamily) {
            this.model.extendedFamily.forEach(member => {
              member.benefits = member.benefits.filter(b => b.rolePlayerName === member.displayName);
              member.benefits.forEach(b => {
                const benefit = data.find(s => s.id === b.id);
                if (benefit) {
                  b.benefitName = benefit.name;
                  b.rolePlayerName = b.rolePlayerName;
                  this.benefits.push(b);
                }
              });
            });
          }
          this.getSourceData(this.benefits);
          this.isLoading$.next(false);
          this.patchFormValues();
        }
      );
    }
  }

  getSourceData(benefits: RolePlayerBenefit[]) {
    this.isLoading$.next(true);
    this.dataSource.data = benefits;
    this.isLoading$.next(false);
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
    this.form.patchValue({
      paymentFrequency: this.model.mainMember.policies[0].paymentFrequency,
      commissionFee: this.commissionFeePercentage * 100,
      adminFee: this.adminFeePercentage * 100
    });
    this.calculateTotalPremium(this.model.mainMember.policies[0].paymentFrequency);
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
}
