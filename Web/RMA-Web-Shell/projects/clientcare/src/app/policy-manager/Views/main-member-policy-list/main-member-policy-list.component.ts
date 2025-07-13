import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';
import { MemberBenefit } from '../../shared/entities/member-benefit';
import { Case } from '../../shared/entities/case';
import { Benefit } from '../../../product-manager/models/benefit';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { ProductOption } from '../../../product-manager/models/product-option';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { BenefitSearchComponent } from '../../../product-manager/views/benefit-search/benefit-search.component';
import { BenefitRate } from '../../../product-manager/models/benefit-benefitRate';

@Component({
  selector: 'main-member-policy-list',
  templateUrl: './main-member-policy-list.component.html',
  styleUrls: ['./main-member-policy-list.component.css']
})
export class MainMemberPolicyListComponent extends WizardDetailBaseComponent<Case> {

  displayedColumns = ['memberName', 'productOption', 'benefitName', 'benefitAmount', 'basePremium'];

  policies: RolePlayerPolicy[] = [];
  paymentFrequencies: Lookup[] = [];
  productOptions: ProductOption[] = [];
  memberBenefits = new Object();
  premiums = new Object();
  isLoading = true;

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly lookupService: LookupService,
    private readonly productOptionService: ProductOptionService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void {
    this.lookupService.getPaymentFrequencies().subscribe(
      data => {
        this.paymentFrequencies = data;
      }
    );
  }

  createForm(id: number): void { }

  populateForm(): void {
    this.productOptionService.getProductOptionByProductId(this.model.productId).subscribe(
      options => {
        this.productOptions = options;
        this.policies = this.model.mainMember.policies ? this.model.mainMember.policies : [];
        this.loadPolicyDetails();
        this.isLoading = false;
      }
    );
  }

  loadPolicyDetails(): void {
    if (!this.policies || this.policies.length === 0) { return; }
    for (const policy of this.policies) {
      const memberBenefits: MemberBenefit[] = [];
      memberBenefits.push(...this.getMemberBenefits(policy.policyId, this.model.mainMember, 1));
      if (this.model.spouse && this.model.spouse.length > 0) {
        for (const spouse of this.model.spouse) {
          memberBenefits.push(...this.getMemberBenefits(policy.policyId, spouse, 2));
        }
      }
      if (this.model.children && this.model.children.length > 0) {
        for (const child of this.model.children) {
          memberBenefits.push(...this.getMemberBenefits(policy.policyId, child, 3));
        }
      }
      if (this.model.extendedFamily && this.model.extendedFamily.length > 0) {
        for (const member of this.model.extendedFamily) {
          memberBenefits.push(...this.getMemberBenefits(policy.policyId, member, 4));
        }
      }
      this.memberBenefits[policy.policyId] = memberBenefits;
    }
  }

  populateModel(): void { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  getBenefits(policyId: number): MemberBenefit[] {
    return this.memberBenefits[policyId];
  }

  getMemberBenefits(policyId: number, rolePlayer: RolePlayer, coverMemberType: number): MemberBenefit[] {
    const benefits: MemberBenefit[] = [];
    const policies = this.model.mainMember.policies.filter(p => p.policyId === policyId);
    if (!policies || policies.length === 0) { return benefits; }
    for (const policy of policies) {
      const productOption = this.getProductOption(policy.productOptionId);
      for (const benefit of policy.benefits) {
        if (benefit.coverMemberType === coverMemberType) {
          console.log('add this benefit:', benefit);
          if (benefit.benefitRates) {
            this.addPremium(policyId, benefit.benefitRates.find(br => br.benefitRateStatusText === 'Current'));
          }
          benefits.push(this.getBenefit(policyId, rolePlayer.displayName, productOption, benefit));
        }
      }
    }
    return benefits;
  }

  getBenefit(policyId: number, member: string, productOption: ProductOption, benefit: Benefit): MemberBenefit {
    const rate = benefit.benefitRates ? benefit.benefitRates.find(br => br.benefitRateStatusText === 'Current') : null;
    const memberBenefit = new MemberBenefit();
    memberBenefit.policyId = policyId;
    memberBenefit.memberName = member;
    memberBenefit.productOption = productOption.description;
    memberBenefit.benefitName = `${benefit.code}: ${benefit.name}`;
    memberBenefit.benefitAmount = rate ? rate.benefitAmount : 0.0;
    memberBenefit.basePremium = rate ? rate.baseRate : 0.0;
    return memberBenefit;
  }

  addPremium(policyId: number, benefitRate: BenefitRate): void {
    if (benefitRate) {
      if (this.premiums[policyId]) {
        this.premiums[policyId] += benefitRate.baseRate;
      } else {
        this.premiums[policyId] = benefitRate.baseRate;
      }
    }
  }

  getProductOption(productOptionId: number): ProductOption {
    const option = this.productOptions.find(po => po.id === productOptionId);
    return option === undefined ? { id: 0, name: 'unknown' } as ProductOption : option;
  }

  getBasePremium(policy: RolePlayerPolicy): number {
    return this.premiums[policy.policyId] ? this.premiums[policy.policyId] : 0.00;
  }

  getInstallmentPremium(policy: RolePlayerPolicy): number {
    const premium = this.getBasePremium(policy);
    const officePremium = premium / (1 - policy.commissionPercentage);
    const commission = officePremium - premium;
    const adminFee = officePremium * policy.adminPercentage;
    const installmentPremium = premium + commission + adminFee;
    return +(installmentPremium.toFixed(2));
  }

  getPaymentFrequency(paymentFrequenceId: number): string {
    const freq = this.paymentFrequencies.find(p => p.id === paymentFrequenceId);
    return freq === undefined ? 'unknown' : freq.name;
  }
}
