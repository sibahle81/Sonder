import { InputModalityDetector } from '@angular/cdk/a11y';
import { Component, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';

import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { CaseTypeEnum } from '../../shared/enums/case-type.enum';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { Case } from '../../shared/entities/case';

import { RolePlayerListComponent } from '../role-player-list/role-player-list.component';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { RolePlayerRelation } from '../../shared/entities/roleplayer-relation';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { RuleItem } from 'projects/shared-models-lib/src/lib/common/ruleItem';

@Component({
  selector: 'beneficiary-list',
  templateUrl: './beneficiary-list.component.html',
  styleUrls: ['./beneficiary-list.component.css']
})
export class BeneficiaryListComponent extends WizardDetailBaseComponent<Case> {

  @ViewChild('beneficiaries', { static: true }) beneficiaryList: RolePlayerListComponent;
  modelPolicyStatus: PolicyStatusEnum;
  mainMember: RolePlayer;
  myValuePlus: boolean = false;
  ruleItem: RuleItem;
  addBeneficiary: boolean = true;

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,    
    private readonly productOptionService: ProductOptionService,
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void { }

  createForm(id: number): void { }

  populateForm(): void {
    if (!this.model) { return; }
    this.beneficiaryList.isWizard = this.isWizard;
    this.beneficiaryList.showChildOptions = false;
    this.beneficiaryList.continuationCase = this.model.caseTypeId === CaseTypeEnum.ContinuePolicy;

    if (this.model.mainMember) {
      if (this.model.mainMember.policies && this.model.mainMember.policies.length > 0) {
        this.modelPolicyStatus = this.model.mainMember.policies[0].policyStatus;
      }
    }

    this.myValuePlus = this.model.mainMember.policies[0].productOption.product.productClassId === ProductClassEnum.ValuePlus;
    this.mainMember = this.model.newMainMember ? this.model.newMainMember : this.model.mainMember;

    this.productOptionService.getProductOptionRuleByCode(this.model.mainMember.policies[0].productOptionId, 'POPTBF01').subscribe(item => {
      this.ruleItem = item;
      this.addBeneficiary = this.getBeneficiaryRule(this.ruleItem, true);
      
      const beneficiaries = this.getBeneficiaries();
      this.beneficiaryList.setLinkedMembers(beneficiaries, this.canEdit, this.isReadonly);
      this.validateData();
      
  });  
    
  }

  private getBeneficiaries(): RolePlayer[] {
    if (!this.myValuePlus) {
      //Check for beneficiary rule
      if(this.addBeneficiary) {
        // Add the main member automatically if not already in the list
        const idx = this.model.beneficiaries
          .findIndex(b => (b.rolePlayerId > 0 && b.rolePlayerId === this.mainMember.rolePlayerId)
            || (b.rolePlayerId <= 0 && b.person?.idNumber === this.mainMember.person?.idNumber));
        // Add the main member if they aren't in the list
        if (idx >= 0) {        
            this.model.beneficiaries[idx].fromRolePlayers[0].rolePlayerTypeId = RolePlayerTypeEnum.MainMemberSelf;
            this.model.beneficiaries[idx].fromRolePlayers[0].allocationPercentage = 100;        
        } else {
          const beneficiary = Object.assign({}, this.model.newMainMember ? this.model.newMainMember : this.model.mainMember) as RolePlayer;
          beneficiary.policies = [];
          beneficiary.fromRolePlayers = [];
          beneficiary.fromRolePlayers.push(this.getNewRolePlayerRelation(this.mainMember, RolePlayerTypeEnum.MainMemberSelf));
          this.model.beneficiaries.unshift(beneficiary);
        }
      }
      else
      {
        const idx = this.model.beneficiaries
        .findIndex(b => (b.rolePlayerId > 0 && b.rolePlayerId === this.mainMember.rolePlayerId)
          || (b.rolePlayerId <= 0 && b.person?.idNumber === this.mainMember.person?.idNumber));
      if (idx >= 0) {
        this.model.beneficiaries.splice(idx, 1);
      }
      }
    } else {
      const idx = this.model.beneficiaries
        .findIndex(b => (b.rolePlayerId > 0 && b.rolePlayerId === this.mainMember.rolePlayerId)
          || (b.rolePlayerId <= 0 && b.person?.idNumber === this.mainMember.person?.idNumber));
      if (idx >= 0) {
        this.model.beneficiaries.splice(idx, 1);
      }
    }
    // Remove other main members in the list (applies to continuation cases)
    if (this.beneficiaryList.continuationCase) {
      let i = 0;
      while (i < this.model.beneficiaries.length) {
        const member = this.model.beneficiaries[i];
        if (member.person?.idNumber != this.mainMember.person?.idNumber && this.isMainMember(member)) {
          this.model.beneficiaries.splice(i, 1);
        } else {
          i++;
        }
      }
    }
    return this.model.beneficiaries;
  }

  private isMainMember(member: RolePlayer): boolean {
    if (!member.fromRolePlayers) { return false; }
    if (member.fromRolePlayers.length === 0) { return false; }
    const idx = member.fromRolePlayers?.findIndex(b => b.rolePlayerTypeId == RolePlayerTypeEnum.MainMemberSelf);
    return idx >= 0;
  }

  populateModel(): void {
    const beneficiaries = this.beneficiaryList.getLinkedMembers(this.mainMember.rolePlayerId);

    for (let member of beneficiaries) {
      // Update the allocation percentages in the other categories as well,
      // otherwise the changes don't persevere
      this.updateMemberAllocations(member, this.model.spouse);
      this.updateMemberAllocations(member, this.model.children);
      this.updateMemberAllocations(member, this.model.extendedFamily);
    }
    // Clone the members to the beneficiaries
    this.model.beneficiaries = [];
    beneficiaries.forEach(b => {
      const beneficiary = Object.assign({}, b) as RolePlayer;

      beneficiary.policies = null;
      beneficiary.benefits = null;
      this.model.beneficiaries.push(beneficiary);
    });
  }

  private updateMemberAllocations(member: RolePlayer, members: RolePlayer[]) {
    const roleplayer = members.find(m => (m.rolePlayerId > 0 && m.rolePlayerId === member.rolePlayerId)
      || (m.rolePlayerId <= 0 && m.person?.idNumber === member.person.idNumber));
    if (roleplayer && roleplayer.fromRolePlayers && roleplayer.fromRolePlayers.length > 0) {
      roleplayer.fromRolePlayers[0].allocationPercentage = member.fromRolePlayers[0].allocationPercentage;
    }
  }

  private getNewRolePlayerRelation(rolePlayer: RolePlayer, rolePlayerTypeId: RolePlayerTypeEnum): RolePlayerRelation {
    const relation = new RolePlayerRelation();
    relation.fromRolePlayerId = rolePlayer.rolePlayerId;
    relation.toRolePlayerId = this.mainMember.rolePlayerId;
    relation.rolePlayerTypeId = rolePlayerTypeId;
    relation.policyId = this.model.mainMember.policies[0].policyId;
    relation.allocationPercentage = rolePlayerTypeId === RolePlayerTypeEnum.MainMemberSelf ? 100 : 0;
    return relation;
  }

  private hasBeneficiaryRelation(member: RolePlayer): boolean {
    if (!member.fromRolePlayers) { return false; }
    if (member.fromRolePlayers.length === 0) { return false; }
    return member.fromRolePlayers[0].rolePlayerTypeId === RolePlayerTypeEnum.Beneficiary;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model.caseTypeId !== CaseTypeEnum.MemberRelations && this.model.caseTypeId !== CaseTypeEnum.GroupPolicyMember) {
      this.validateData();
    }
    validationResult.errorMessages = this.beneficiaryList.errors;
    validationResult.errors = validationResult.errorMessages.length;
    return validationResult;
  }

  validateData() {
    this.beneficiaryList.errors = [];

    // Do not validate group policy beneficiaries
    if (this.model.caseTypeId === CaseTypeEnum.GroupNewBusiness) { return; }
    if (this.model.caseTypeId === CaseTypeEnum.GroupPolicyMember) { return; }

    // 1. Children under 18 cannot be beneficiaries.
    this.model.beneficiaries.forEach(b => {
      if (b.person && this.getAge(b.person.dateOfBirth) < 18) {
        this.beneficiaryList.errors.push(`${b.displayName} is a minor and cannot be a beneficiary.`);
      }
    });

    // 2. Contact details required for beneficiaries.
    this.model.beneficiaries.forEach(b => {
      if (!b.preferredCommunicationTypeId) {
        this.beneficiaryList.errors.push(`Preferred communication type is required for ${b.displayName}.`);
      } else {
        switch (b.preferredCommunicationTypeId) {
          case CommunicationTypeEnum.Email:
            if (String.isNullOrEmpty(b.emailAddress)) {
              this.beneficiaryList.errors.push(`Email address is required for ${b.displayName}.`);
            }
            break;
          case CommunicationTypeEnum.Phone:
            if (String.isNullOrEmpty(b.tellNumber)) {
              this.beneficiaryList.errors.push(`Telephone number is required for ${b.displayName}.`);
            }
            break;
          case CommunicationTypeEnum.SMS:
            if (String.isNullOrEmpty(b.cellNumber)) {
              this.beneficiaryList.errors.push(`Mobile number is required for ${b.displayName}.`);
            }
            break;
        }
      }
    });

    // 3. Check that beneficiaries do not repeat
    if (this.model.beneficiaries.length > 1) {
      this.model.beneficiaries.forEach(b => {
        const beneficiaries = this.model.beneficiaries.filter(m => m !== b);
        const duplicates = beneficiaries
          .filter(m => (b.rolePlayerId > 0 && b.rolePlayerId === m.rolePlayerId)
            || (b.rolePlayerId <= 0 && b.person?.idNumber === m.person?.idNumber));
        if (duplicates.length > 0) {
          this.beneficiaryList.errors.push(`${b.displayName} appears in the beneficiary list more than once.`);
        }
      });
    }

    // 4. Make sure benefit allocation percentage adds up to 100% (excluding the main member)
    this.checkBenefitSplit();
  }

  checkBenefitSplit() {
    this.beneficiaryList.errors = [];
    if (this.model.beneficiaries?.length > 0) {
      let splitTotal = 0;
      const mainMember = this.model.newMainMember?.rolePlayerId ? this.model.newMainMember : this.model.mainMember
      const beneficiaries = this.model.beneficiaries.filter(r => r.rolePlayerId !== mainMember.rolePlayerId);
      if (beneficiaries?.length > 0) {
        for (const beneficiary of beneficiaries) {
          if (beneficiary.fromRolePlayers && beneficiary.fromRolePlayers.length > 0) {
            const portion = +beneficiary.fromRolePlayers[0].allocationPercentage;
            splitTotal += portion ? portion : 0;
          }
        }
      } else {
        splitTotal = 100;
      }
      if (splitTotal < 100) {
        this.beneficiaryList.errors.push('Benefit split does not add up to 100%');
      }
      if (splitTotal > 100) {
        this.beneficiaryList.errors.push('Benefit split exceeds 100%');
      }
    }
  }

  private getAge(dateOfBirth: Date): number {
    const today = new Date();
    const dob = new Date(dateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const birthDay = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (birthDay > today) { age--; }
    return age;
  }

  private getBeneficiaryRule(rule: RuleItem, defaultRule: boolean) {
    if (!rule) {
      return defaultRule;
    }  

    if (rule.ruleConfiguration) {
      const formattedJson = rule.ruleConfiguration.replace(/'/g, '"');
      const configs = JSON.parse(formattedJson) as Array<any>;
      if (configs && configs.length > 0) {
        const config = configs[0];
        return config.fieldValue === 1;
      }
    }
    return defaultRule;
  }

  removeBeneficiary(rolePlayer: RolePlayer): void {
    if (!rolePlayer.person) { return; }
    this.removeFromList(this.model.spouse, rolePlayer);
    this.removeFromList(this.model.children, rolePlayer);
    this.removeFromList(this.model.extendedFamily, rolePlayer);
  }

  private removeFromList(list: RolePlayer[], rolePlayer: RolePlayer) {
    if (!list && list.length === 0) { return; }
    const members = list.filter(m => m.person && m.person.idType === rolePlayer.person.idType && m.person.idNumber === rolePlayer.person.idNumber);
    members.forEach(m => m.person.isBeneficiary = false);
  }
}
