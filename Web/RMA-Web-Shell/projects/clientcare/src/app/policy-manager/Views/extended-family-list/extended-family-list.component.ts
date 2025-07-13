import { Component, ViewChild, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { CoverMemberTypeEnum } from 'projects/shared-models-lib/src/lib/enums/cover-member-type-enum';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { RolePlayerListComponent } from '../role-player-list/role-player-list.component';
import { ProductOption } from '../../../product-manager/models/product-option';
import { Case } from '../../shared/entities/case';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { CaseTypeEnum } from '../../shared/enums/case-type.enum';
import { UserIdleService } from 'projects/shared-services-lib/src/lib/services/user-idle/user-idle.service';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { RolePlayerBenefitsExtendedComponent } from '../role-player-benefits-extended/role-player-benefits-extended.component';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { PolicyManageReason } from '../../shared/entities/policy-manage-reason';
import { RefundTypeEnum } from 'projects/fincare/src/app/shared/enum/refund-type.enum';
import { InsuredLifeStatusEnum } from '../../shared/enums/insured-life-status.enum';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';

@Component({
  selector: 'extended-family-list',
  templateUrl: './extended-family-list.component.html',
  styleUrls: ['./extended-family-list.component.css']
})
export class ExtendedFamilyListComponent extends WizardDetailBaseComponent<Case> {

  @ViewChild('family', { static: true }) familyList: RolePlayerListComponent;
  @ViewChild(RolePlayerBenefitsExtendedComponent, { static: true }) memberBenefits: RolePlayerBenefitsExtendedComponent;

  coverMemberType = CoverMemberTypeEnum.ExtendedFamily;
  selectedProductOption: ProductOption;

  roleplayerContext: RolePlayerTypeEnum[] = [
    RolePlayerTypeEnum.Aunt,
    RolePlayerTypeEnum.Brother,
    RolePlayerTypeEnum.BrotherInlaw,
    RolePlayerTypeEnum.Cousin,
    RolePlayerTypeEnum.Daughter,
    RolePlayerTypeEnum.DaughterInlaw,
    RolePlayerTypeEnum.Extended,
    RolePlayerTypeEnum.Father,
    RolePlayerTypeEnum.FatherInlaw,
    RolePlayerTypeEnum.Friend,
    RolePlayerTypeEnum.GrandChild,
    RolePlayerTypeEnum.Grandparent,
    RolePlayerTypeEnum.Husband,
    RolePlayerTypeEnum.Mother,
    RolePlayerTypeEnum.MotherInlaw,
    RolePlayerTypeEnum.Nephew,
    RolePlayerTypeEnum.Niece,
    RolePlayerTypeEnum.Other,
    RolePlayerTypeEnum.Parent,
    RolePlayerTypeEnum.ParentInlaw,
    RolePlayerTypeEnum.Sister,
    RolePlayerTypeEnum.SisterInlaw,
    RolePlayerTypeEnum.Son,
    RolePlayerTypeEnum.SonInlaw,
    RolePlayerTypeEnum.Uncle,
    RolePlayerTypeEnum.Wife
  ];

  addedRolePlayer: RolePlayer;
  removedRolePlayer: RolePlayer;
  modifiedRolePlayer: RolePlayer;
  removedInsuredLife: RolePlayer;

  canBackDate = false;
  modelPolicyId = 0;
  modelExtendedFamily: RolePlayer[] = [];
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

  checkWizard() { return this.isWizard; }

  populateForm(): void {
    this.populateExtendedFamilyForm();
    this.isValuePlus = (this.model.mainMember.policies[0].productOption.product.productClassId === ProductClassEnum.ValuePlus);
    
    this.lookupService.getItemByKey('AllowNewPolicyBackDate').subscribe(
      setting => {
        this.canBackDate = setting.toLowerCase() === 'true';
      }
    );
  }

  populateExtendedFamilyForm(): void {

    let canAddMembers = true;
    if (this.model.mainMember.policies[0].policyLifeExtension) {
      if (this.model.mainMember.policies[0].policyLifeExtension.policyId >= 0) {
        canAddMembers = false;
      }
    }

    if (this.model.caseTypeId === CaseTypeEnum.MemberRelations) {
      this.familyList.addMainMemberPolicies(this.model.mainMember.policies);
    }

    this.form.patchValue({ id: this.model.id });
    if (this.model) {
      this.familyList.isWizard = this.isWizard;
      this.familyList.showChildOptions = false;
      this.familyList.maintainPolicyCase = this.model.caseTypeId === CaseTypeEnum.MaintainPolicyChanges;
      this.familyList.defaultDate = this.model.mainMember.policies && this.model.mainMember.policies.length > 0 ? this.model.mainMember.policies[0].policyInceptionDate : null;
      this.familyList.continuationCase = this.model.caseTypeId === CaseTypeEnum.ContinuePolicy;
      this.familyList.canAdd = canAddMembers;

      switch (this.model.caseTypeId) {
        case CaseTypeEnum.IndividualNewBusiness:
        case CaseTypeEnum.MemberRelations:
        case CaseTypeEnum.MaintainPolicyChanges:
        case CaseTypeEnum.GroupPolicyMember:
        case CaseTypeEnum.ContinuePolicy:
          this.familyList.showJoinDate = true;
          break;
      }

      if (this.model[0]) {
        this.selectedProductOption = this.model[0].productOption;
      }
      this.familyList.setLinkedMembers(this.model.extendedFamily, this.canEdit, this.isReadonly);

      if (this.memberBenefits) {
        this.memberBenefits.isWizard = this.isWizard;
        this.memberBenefits.isReadOnly = this.isWizard ? this.isReadonly : true;
        if (this.model.mainMember.policies[0].policyLifeExtension != null && this.model.mainMember.policies[0].policyLifeExtension != undefined) {
          this.isCFP = true;
        }
        this.memberBenefits.loadBenefits(this.model.mainMember.policies[0].productOptionId).then(
          data => {
            this.memberBenefits.addMembers(this.model.extendedFamily, this.isCFP);
          }
        );
      }
      if (this.model.extendedFamily) {
        this.modelExtendedFamily = this.model.extendedFamily;
      }
      if (this.model.mainMember) {
        if (this.model.mainMember.policies) {
          this.modelPolicyId = this.model.mainMember.policies[0].policyId;
          this.modelPolicyStatus = this.model.mainMember.policies[0].policyStatus;
        }
      }
    } else {
      this.familyList.loadLinkedMembers(this.model.mainMember.rolePlayerId, this.canEdit, this.isReadonly);
    }
  }

  populateModel(): void {
    if (this.memberBenefits) {
      this.model.extendedFamily = this.memberBenefits.populateModel(this.model, this.model.extendedFamily);
    }
    this.model.extendedFamily = this.familyList.getLinkedMembers(this.mainMemberId());
    this.updateBeneficiaries();
  }

  updateBeneficiaries(): void {
    if (!this.isValuePlus){
      this.addBeneficiaries();
      this.removeBeneficiaries();
    }
  }

  removeBeneficiaries() {
    const list: RolePlayer[] = JSON.parse(JSON.stringify(this.model.extendedFamily.filter(rp => rp.person && !rp.person.isBeneficiary)));
    list.forEach(rp => {
      const idx = this.model.beneficiaries.findIndex(b => b.person && b.person.idNumber === rp.person.idNumber);
      if (idx >= 0) {
        this.model.beneficiaries.splice(idx, 1);
      }
    });
  }

  addBeneficiaries() {
    const list: RolePlayer[] = JSON.parse(JSON.stringify(this.model.extendedFamily.filter(rp => rp.person && rp.person.isBeneficiary)));
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
    if (this.memberBenefits) {
      this.memberBenefits.validateModel(this.model.extendedFamily, validationResult);
    }
    return validationResult;
  }

  validateFamily() { }

  rolePlayerAdded(rolePlayer: any) {
    this.addedRolePlayer = rolePlayer;
    if (this.memberBenefits) {
      this.model.extendedFamily = this.familyList.getLinkedMembers(this.mainMemberId());
      this.memberBenefits.addMembers(this.model.extendedFamily, this.isCFP);
    }
  }

  rolePlayerModified(rolePlayer: any) {
    this.modifiedRolePlayer = rolePlayer;
    if (this.memberBenefits) {
      this.model.extendedFamily = this.familyList.getLinkedMembers(this.mainMemberId());
      this.memberBenefits.addMembers(this.model.extendedFamily, this.isCFP);
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

  updateModel($event: Case) {
    this.model = $event;
  }

  rolePlayerRemoved(event: any) {
    this.removedRolePlayer = event;
    if (this.memberBenefits) {
      this.model.extendedFamily = this.familyList.getLinkedMembers(this.mainMemberId());
      this.memberBenefits.addMembers(this.model.extendedFamily, this.isCFP);
    }
  }

  insuredLifeRemoved(event: any) {
    let roleplayer: RolePlayer;
    this.removedInsuredLife = event as RolePlayer;
    const removedInsuredLifeRolePlayerId = this.removedInsuredLife.person.rolePlayerId;
    this.model.extendedFamily.forEach(c => {
      if (c.person.rolePlayerId === removedInsuredLifeRolePlayerId) {
        if (c.endDate != this.removedInsuredLife.endDate) {
          this.model.mainMember.policies[0].eligibleForRefund = true;
          this.model.mainMember.policies[0].refundType = RefundTypeEnum.PolicyInception;
        }
        roleplayer = c;
      }
    });
    this.model.mainMember.policies[0].insuredLives.forEach(
      life => {
        if (life.rolePlayerId === removedInsuredLifeRolePlayerId) {
          life.insuredLifeStatus = InsuredLifeStatusEnum.Cancelled;
          life.endDate = this.removedInsuredLife.endDate;
        }
      }
    );
    if (roleplayer) {
      roleplayer.modifiedDate = event.modifiedDate;
      roleplayer.isDeleted = event.isDeleted;
    }
  }

  removalNoteAdded(event: PolicyManageReason) {
    let roleplayer: RolePlayer;
    const removedInsuredLifeRolePlayerId = this.removedInsuredLife.fromRolePlayers[0].fromRolePlayerId;
    this.model.extendedFamily.forEach(c => {
      if (c.fromRolePlayers[0].fromRolePlayerId === removedInsuredLifeRolePlayerId) {
        roleplayer = c;
      }
    });
    roleplayer.endDate = event.effectiveDate;
    roleplayer.insuredLifeRemovalReason = event.reason;
  }
}
