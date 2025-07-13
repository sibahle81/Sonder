import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { ValidationResult } from 'src/app/shared/components/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'src/app/shared/components/wizard/views/wizard-detail-base/wizard-detail-base.component';

import { CoverMemberTypeEnum } from 'src/app/shared/enums/cover-member-type-enum';
import { PolicyStatus } from 'src/app/shared/enums/policy-status.enum';
import { RolePlayerTypeEnum } from 'src/app/shared/enums/role-player-type-enum';
import { Case } from 'src/app/shared/models/case';
import { PolicyManageReason } from 'src/app/shared/models/policy-manage-reason';
import { RolePlayer } from 'src/app/shared/models/roleplayer';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { UserIdleService } from 'src/app/shared/services/user-idle/user-idle.service';
import { RolePlayerBenefitsChildComponent } from '../role-player-benefits-child/role-player-benefits-child.component';
import { RolePlayerBenefitsSpouseComponent } from '../role-player-benefits-spouse/role-player-benefits-spouse.component';
import { RolePlayerListComponent } from '../role-player-list/role-player-list.component';
import { CaseType } from 'src/app/shared/enums/case-type.enum';


@Component({
  selector: 'spouse-children-list',
  templateUrl: './spouse-children-list.component.html',
  styleUrls: ['./spouse-children-list.component.css']
})
export class SpouseChildrenListComponent extends WizardDetailBaseComponent<Case> {

  @ViewChild('spouse') spouseList: RolePlayerListComponent;
  @ViewChild('children') childList: RolePlayerListComponent;

  @ViewChild(RolePlayerBenefitsSpouseComponent) spouseBenefits: RolePlayerBenefitsSpouseComponent;
  @ViewChild(RolePlayerBenefitsChildComponent) childBenefits: RolePlayerBenefitsChildComponent;

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
  modelPolicyStatus: PolicyStatus;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly lookupService: LookupService,
    private readonly idleService: UserIdleService
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.idleService.stopWatching();
  }

  onLoadLookups(): void {
    this.isMatSort$.subscribe(result => {
      if (result) {
        setTimeout(() => {
          this.sort = this.sort;
          this.paginator = this.paginator;
        })
      }
    })
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      id: new FormControl()
    });
  }

  populateForm(): void {
    this.lookupService.getItemByKey('AllowNewPolicyBackDate').subscribe(
      setting => {
        this.canBackDate = setting.toLowerCase() === 'true';
        this.populateSpouseChildrenForm();
      }
    );
  }

  populateSpouseChildrenForm(): void {
    this.form.patchValue({ id: this.model.id });
    if (this.model) {
      this.spouseList.isWizard = this.isWizard;
      this.spouseList.showChildOptions = false;
      this.spouseList.defaultDate = this.model.mainMember.policies && this.model.mainMember.policies.length > 0 ? this.model.mainMember.policies[0].policyInceptionDate : null;

      this.childList.isWizard = this.isWizard;
      this.childList.showChildOptions = true;
      this.childList.defaultDate = this.model.mainMember.policies && this.model.mainMember.policies.length > 0 ? this.model.mainMember.policies[0].policyInceptionDate : null;

      switch (this.model.caseTypeId) {
        case CaseType.IndividualNewBusiness:
        case CaseType.MemberRelations:
        case CaseType.MaintainPolicyChanges:
        case CaseType.GroupPolicyMember:
          this.spouseList.showJoinDate = true;
          this.childList.showJoinDate = true;
          break;
      }

      if (this.model.caseTypeId === CaseType.MemberRelations) {
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
        this.spouseBenefits.isReadOnly = this.isReadonly;
        this.spouseBenefits.loadBenefits(this.model.mainMember.policies[0].productOptionId).then(
          data => {
            this.spouseBenefits.addMembers(this.model.spouse);
          }
        );
      }
      if (this.childBenefits) {
        this.childBenefits.isWizard = this.isWizard;
        this.childBenefits.isReadOnly = this.isReadonly;
        this.childBenefits.loadBenefits(this.model.mainMember.policies[0].productOptionId).then(
          data => {
            this.childBenefits.addMembers(this.model.children);
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
    this.addBeneficiaries(rolePlayers);
    this.removeBeneficiaries(rolePlayers);
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
      this.spouseBenefits.addMembers(this.model.spouse);
    }
  }

  spouseModified(event: any) {
    if (this.spouseBenefits) {
      this.model.spouse = this.spouseList.getLinkedMembers(this.mainMemberId());
      this.spouseBenefits.addMembers(this.model.spouse);
    }
  }

  spouseRemoved(event: any) {
    if (this.spouseBenefits) {
      this.model.spouse = this.spouseList.getLinkedMembers(this.mainMemberId());
      this.spouseBenefits.addMembers(this.model.spouse);
    }
  }

  childAdded(event: any) {
    this.addedRolePlayer = event;
    if (this.childBenefits) {
      this.childBenefits.addMembers(this.model.children);
    }
  }

  childModified(event: any) {
    this.addedRolePlayer = event;
    if (this.childBenefits) {
      this.childBenefits.addMembers(this.model.children);
    }
  }

  childRemoved(event: any) {
    this.addedRolePlayer = event;
    if (this.childBenefits) {
      this.childBenefits.addMembers(this.model.children);
    }
  }

  insuredLifeRemoved(event: any) {
    this.removedInsuredLife = event as RolePlayer;
    let roleplayer;
    const removedInsuredLifeRolePlayerId = this.removedInsuredLife.person.rolePlayerId;
    this.model.children.forEach(c => {
      if (c.person.rolePlayerId === removedInsuredLifeRolePlayerId) {
        roleplayer = c;
      }
    });
    this.model.spouse.forEach(c => {
      if (c.person.rolePlayerId === removedInsuredLifeRolePlayerId) {
        roleplayer = c;
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
