import { Component, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { RolePlayerListComponent } from '../role-player-list/role-player-list.component';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { Case } from '../../shared/entities/case';
import { CoverMemberTypeEnum } from 'projects/shared-models-lib/src/lib/enums/cover-member-type-enum';
import { PolicyManageReason } from '../../shared/entities/policy-manage-reason';
import { CaseTypeEnum } from '../../shared/enums/case-type.enum';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { UserIdleService } from 'projects/shared-services-lib/src/lib/services/user-idle/user-idle.service';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { RolePlayerBenefitsSpouseComponent } from '../role-player-benefits-spouse/role-player-benefits-spouse.component';
import { RolePlayerBenefitsChildComponent } from '../role-player-benefits-child/role-player-benefits-child.component';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { RefundTypeEnum } from 'projects/fincare/src/app/shared/enum/refund-type.enum';
import { InsuredLifeStatusEnum } from '../../shared/enums/insured-life-status.enum';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';

@Component({
  selector: 'spouse-children-list',
  templateUrl: './spouse-children-list.component.html',
  styleUrls: ['./spouse-children-list.component.css']
})
export class SpouseChildrenListComponent extends WizardDetailBaseComponent<Case> {

  @ViewChild('spouse', { static: true }) spouseList: RolePlayerListComponent;
  @ViewChild('children', { static: true }) childList: RolePlayerListComponent;

  @ViewChild(RolePlayerBenefitsSpouseComponent, { static: true }) spouseBenefits: RolePlayerBenefitsSpouseComponent;
  @ViewChild(RolePlayerBenefitsChildComponent, { static: true }) childBenefits: RolePlayerBenefitsChildComponent;

  spouseCoverMemberType = CoverMemberTypeEnum.Spouse;
  childCoverMemberType = CoverMemberTypeEnum.Child;

  roleplayerContext: RolePlayerTypeEnum[] = [RolePlayerTypeEnum.Spouse, RolePlayerTypeEnum.Child];

  addedRolePlayer: RolePlayer;
  removedRolePlayer: RolePlayer;
  modifiedRolePlayer: RolePlayer;
  removedInsuredLife: RolePlayer;
  canBackDate = false;
  modelPolicyId = 0;
  timer: any;
  modelChildren: RolePlayer[] = [];
  modelSpouses: RolePlayer[] = [];
  modelPolicyStatus: PolicyStatusEnum;
  isCFP = false;
  isValuePlus = false; 
  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly idleService: UserIdleService
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.idleService.stopWatching();
  }

  onLoadLookups(): void { }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      id: new UntypedFormControl()
    });
  }

  populateForm(): void {
    this.isValuePlus = (this.model.mainMember.policies[0].productOption.product.productClassId === ProductClassEnum.ValuePlus);
    this.populateSpouseChildrenForm();
    this.lookupService.getItemByKey('AllowNewPolicyBackDate').subscribe(
      setting => {
        this.canBackDate = setting.toLowerCase() === 'true';
      }
    );
  }

  populateSpouseChildrenForm(): void {

    let canAddMembers = true;

    if (this.model.mainMember.policies[0].policyLifeExtension) {
      if (this.model.mainMember.policies[0].policyLifeExtension.policyId >= 0) {
        canAddMembers = false;
      }
    }

    this.form.patchValue({ id: this.model.id });
    if (this.model) {
      this.spouseList.isWizard = this.isWizard;
      this.spouseList.showChildOptions = false;
      this.spouseList.maintainPolicyCase = this.model.caseTypeId === CaseTypeEnum.MaintainPolicyChanges;
      this.spouseList.defaultDate = this.model.mainMember.policies && this.model.mainMember.policies.length > 0 ? this.model.mainMember.policies[0].policyInceptionDate : null;
      this.spouseList.continuationCase = this.model.caseTypeId === CaseTypeEnum.ContinuePolicy;
      this.spouseList.canAdd = canAddMembers;

      this.childList.isWizard = this.isWizard;
      this.childList.showChildOptions = true;
      this.childList.maintainPolicyCase = this.model.caseTypeId === CaseTypeEnum.MaintainPolicyChanges;
      this.childList.defaultDate = this.model.mainMember.policies && this.model.mainMember.policies.length > 0 ? this.model.mainMember.policies[0].policyInceptionDate : null;
      this.childList.continuationCase = this.model.caseTypeId === CaseTypeEnum.ContinuePolicy;
      this.childList.canAdd = canAddMembers;

      switch (this.model.caseTypeId) {
        case CaseTypeEnum.IndividualNewBusiness:
        case CaseTypeEnum.MemberRelations:
        case CaseTypeEnum.MaintainPolicyChanges:
        case CaseTypeEnum.GroupPolicyMember:
        case CaseTypeEnum.ContinuePolicy:
          this.spouseList.showJoinDate = true;
          this.childList.showJoinDate = true;
          break;
      }

      if (this.model.caseTypeId === CaseTypeEnum.MemberRelations) {
        this.spouseList.addMainMemberPolicies(this.model.mainMember.policies);
        this.childList.addMainMemberPolicies(this.model.mainMember.policies);
      }

      this.spouseList.setLinkedMembers(this.model.spouse, this.canEdit, this.isReadonly);
      this.childList.setLinkedMembers(this.model.children, this.canEdit, this.isReadonly);
      if (this.model.children) {
        this.modelChildren = this.model.children;
      }
      if (this.model.spouse) {
        this.modelSpouses = this.model.spouse;
      }

      if (this.model.mainMember) {
        if (this.model.mainMember.policies) {
          this.modelPolicyId = this.model.mainMember.policies[0].policyId;
          this.modelPolicyStatus = this.model.mainMember.policies[0].policyStatus;
        }
      }
      if (this.spouseBenefits) {
        this.spouseBenefits.isWizard = this.isWizard;
        this.spouseBenefits.isReadOnly = this.isWizard ? this.isReadonly : true;
        if (this.model.mainMember.policies[0].policyLifeExtension != null && this.model.mainMember.policies[0].policyLifeExtension != undefined) {
          this.isCFP = true;
        }
        this.spouseBenefits.loadBenefits(this.model.mainMember.policies[0].productOptionId).then(
          data => {
            this.spouseBenefits.addMembers(this.model.spouse, this.isCFP);
          }
        );
      }
      if (this.childBenefits) {
        this.childBenefits.isWizard = this.isWizard;
        this.childBenefits.isReadOnly = this.isWizard ? this.isReadonly : true;
        if (this.model.mainMember.policies[0].policyLifeExtension != null && this.model.mainMember.policies[0].policyLifeExtension != undefined) {
          this.isCFP = true;
        }
        this.childBenefits.loadBenefits(this.model.mainMember.policies[0].productOptionId).then(
          data => {
            this.childBenefits.addMembers(this.model.children, this.isCFP);
          }
        );
      }
    } else {
      this.spouseList.loadLinkedMembers(this.mainMemberId(), this.canEdit, this.isReadonly);
      this.childList.loadLinkedMembers(this.mainMemberId(), this.canEdit, this.isReadonly);
    }
  }

  populateModel(): void {
    this.model.spouse = this.spouseList.getLinkedMembers(this.mainMemberId());
    this.model.children = this.childList.getLinkedMembers(this.mainMemberId());
    if (this.spouseBenefits) {
      if (!this.model.spouse) { this.model.spouse = []; }
      this.model.spouse = this.spouseBenefits.populateModel(this.model, this.model.spouse);
    }
    if (this.childBenefits) {
      if (!this.model.children) { this.model.children = []; }
      this.model.children = this.childBenefits.populateModel(this.model, this.model.children);
    }
    this.updateBeneficiaries(this.model.spouse);
    this.updateBeneficiaries(this.model.children);
  }

  updateBeneficiaries(rolePlayers: RolePlayer[]) {
    if (!this.isValuePlus){
      this.addBeneficiaries(rolePlayers);
      this.removeBeneficiaries(rolePlayers);
    }
  }

  removeBeneficiaries(rolePlayers: RolePlayer[]) {
    const list: RolePlayer[] = JSON.parse(JSON.stringify(rolePlayers.filter(rp => rp.person && !rp.person.isBeneficiary)));
    list.forEach(rp => {
      const idx = this.model.beneficiaries.findIndex(b => b.person && b.person.idNumber === rp.person.idNumber);
      if (idx >= 0) {
        this.model.beneficiaries.splice(idx, 1);
      }
    });
  }

  addBeneficiaries(rolePlayers: RolePlayer[]) {
    const list: RolePlayer[] = JSON.parse(JSON.stringify(rolePlayers.filter(rp => rp.person && rp.person.isBeneficiary)));
    list.forEach(rp => {
      const idx = this.model.beneficiaries.findIndex(b => b.person && b.person.idNumber === rp.person.idNumber);
      const rolePlayer = Object.assign({}, rp);
      rolePlayer.person.manualBeneficiary = false;
      if (idx >= 0) {
        this.model.beneficiaries[idx] = rolePlayer;
      } else {
        this.model.beneficiaries.push(rolePlayer);
      }
    });
  }

  mainMemberId(): number {
    return this.model.mainMember ? this.model.mainMember.rolePlayerId : 0;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.spouseBenefits) {
      this.spouseBenefits.validateModel(this.model.spouse, validationResult);
    }
    if (this.childBenefits) {
      this.childBenefits.validateModel(this.model.children, validationResult);
    }
    return validationResult;
  }

  validateSpouse() { }

  validateChildren() { }

  spouseAdded(event: any) {
    if (this.spouseBenefits) {
      this.model.spouse = this.spouseList.getLinkedMembers(this.mainMemberId());
      this.spouseBenefits.addMembers(this.model.spouse, this.isCFP);
    }
  }

  spouseModified(rolePlayer: any) {
    if (this.spouseBenefits) {
      this.model.spouse = this.spouseList.getLinkedMembers(this.mainMemberId());
      this.spouseBenefits.addMembers(this.model.spouse, this.isCFP);
    }
    let idx = this.model.beneficiaries?.findIndex(s => 
      (s.rolePlayerId > 0 && s.rolePlayerId === rolePlayer.rolePlayerId)
      || (s.rolePlayerId === 0 && s.person?.idNumber === rolePlayer.person?.idNumber)
    );
    if (idx >= 0) {
      rolePlayer.isBeneficiary = true;
      this.model.beneficiaries[idx] = {...rolePlayer};
    }
  }

  spouseRemoved(event: any) {
    if (this.spouseBenefits) {
      this.model.spouse = this.spouseList.getLinkedMembers(this.mainMemberId());
      this.spouseBenefits.addMembers(this.model.spouse, this.isCFP);
    }
  }

  childAdded(event: any) {
    this.addedRolePlayer = event;
    if (this.childBenefits) {
      this.childBenefits.addMembers(this.model.children, this.isCFP);
    }
  }

  childModified(rolePlayer: any) {
    this.modifiedRolePlayer = rolePlayer;
    if (this.childBenefits) {
      this.childBenefits.addMembers(this.model.children, this.isCFP);
    }
     let idx = this.model.beneficiaries?.findIndex(s => 
      (s.rolePlayerId > 0 && s.rolePlayerId === rolePlayer.rolePlayerId)
      || (s.rolePlayerId === 0 && s.person?.idNumber === rolePlayer.person?.idNumber)
    );
    if (idx >= 0) {
      rolePlayer.isBeneficiary = true;
      this.model.beneficiaries[idx] = {...rolePlayer};
    }
  }

  childRemoved(event: any) {
    this.addedRolePlayer = event;
    if (this.childBenefits) {
      this.childBenefits.addMembers(this.model.children, this.isCFP);
    }
  }

  insuredLifeRemoved(event: any) {
    let roleplayer: RolePlayer;
    this.removedInsuredLife = event as RolePlayer;
    const removedInsuredLifeRolePlayerId = this.removedInsuredLife.person.rolePlayerId;

    this.model.children.forEach(c => {
      if (c.person.rolePlayerId === removedInsuredLifeRolePlayerId) {
        if (c.endDate != this.removedInsuredLife.endDate) {
          this.model.mainMember.policies[0].eligibleForRefund = true;
          this.model.mainMember.policies[0].refundType = RefundTypeEnum.PolicyInception;
        }
        roleplayer = c;
      }
    });
    this.model.spouse.forEach(c => {
      if (c.person.rolePlayerId === removedInsuredLifeRolePlayerId) {
        if (c.endDate != this.removedInsuredLife.endDate) {
          this.model.mainMember.policies[0].eligibleForRefund = true;
          this.model.mainMember.policies[0].refundType = RefundTypeEnum.PolicyInception;
        }
        roleplayer = c;
      }
    });
    this.model.mainMember.policies[0].insuredLives.forEach(c => {
      if (c.rolePlayerId === removedInsuredLifeRolePlayerId) {
        c.insuredLifeStatus = InsuredLifeStatusEnum.Cancelled;
        c.endDate = this.removedInsuredLife.endDate;
      }
    });
    if (roleplayer) {
      roleplayer.modifiedDate = event.modifiedDate;
      roleplayer.isDeleted = event.isDeleted;
    }
  }

  removalNoteAdded(event: PolicyManageReason) {
    let roleplayer: RolePlayer;
    const removedInsuredLifeRolePlayerId = this.removedInsuredLife.fromRolePlayers[0].fromRolePlayerId;
    this.model.children.forEach(c => {
      if (c.fromRolePlayers[0].fromRolePlayerId === removedInsuredLifeRolePlayerId) {
        roleplayer = c;
      }
    });
    this.model.spouse.forEach(c => {
      if (c.fromRolePlayers[0].fromRolePlayerId === removedInsuredLifeRolePlayerId) {
        roleplayer = c;
      }
    });
    roleplayer.endDate = event.effectiveDate;
    roleplayer.insuredLifeRemovalReason = event.reason;
  }
}
