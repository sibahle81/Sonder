import { Component, ViewChild, Input } from '@angular/core';
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
import { ProductOption } from 'src/app/shared/models/product-option';
import { RolePlayer } from 'src/app/shared/models/roleplayer';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { UserIdleService } from 'src/app/shared/services/user-idle/user-idle.service';
import { RolePlayerBenefitsExtendedComponent } from '../role-player-benefits-extended/role-player-benefits-extended.component';
import { RolePlayerListComponent } from '../role-player-list/role-player-list.component';
import { CaseType } from 'src/app/shared/enums/case-type.enum';


@Component({
  selector: 'extended-family-list',
  templateUrl: './extended-family-list.component.html',
  styleUrls: ['./extended-family-list.component.css']
})
export class ExtendedFamilyListComponent extends WizardDetailBaseComponent<Case> {

  @ViewChild('family') familyList: RolePlayerListComponent;
  @ViewChild(RolePlayerBenefitsExtendedComponent) memberBenefits: RolePlayerBenefitsExtendedComponent;

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

  canBackDate = false;
  modelPolicyId = 0;
  modelExtendedFamily: RolePlayer[] = [];
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

  onLoadLookups(): void { }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      id: new FormControl()
    });
  }

  checkWizard() { return this.isWizard; }

  populateForm(): void {
    this.lookupService.getItemByKey('AllowNewPolicyBackDate').subscribe(
      setting => {
        this.canBackDate = setting.toLowerCase() === 'true';
        this.populateExtendedFamilyForm();
      }
    );
  }

  populateExtendedFamilyForm(): void {
    if (this.model.caseTypeId === CaseType.MemberRelations) {
      this.familyList.addMainMemberPolicies(this.model.mainMember.policies);
    }
    this.form.patchValue({ id: this.model.id });
    if (this.model) {
      this.familyList.isWizard = this.isWizard;
      this.familyList.showChildOptions = false;
      this.familyList.defaultDate = this.model.mainMember.policies && this.model.mainMember.policies.length > 0 ? this.model.mainMember.policies[0].policyInceptionDate : null;

      switch (this.model.caseTypeId) {
        case CaseType.IndividualNewBusiness:
          this.familyList.showJoinDate = true; // this.canBackDate && this.model.clientReference && this.model.clientReference !== '';
          break;
        case CaseType.MemberRelations:
          this.familyList.showJoinDates = true;
          break;
        case CaseType.MaintainPolicyChanges:
          this.familyList.showJoinDate = true;
          break;
        case CaseType.GroupPolicyMember:
          this.familyList.showJoinDate = true;
          break;
      }

      if (this.model[0]) {
        this.selectedProductOption = this.model[0].productOption;
      }
      this.familyList.setLinkedMembers(this.model.extendedFamily, this.canEdit, this.isReadonly);

      if (this.memberBenefits) {
        this.memberBenefits.isWizard = this.isWizard;
        this.memberBenefits.isReadOnly = this.isReadonly;
        this.memberBenefits.loadBenefits(this.model.mainMember.policies[0].productOptionId).then(
          data => {
            this.memberBenefits.addMembers(this.model.extendedFamily);
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
    this.addBeneficiaries();
    this.removeBeneficiaries();
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

  rolePlayerAdded(event: any) {
    this.addedRolePlayer = event;
    if (this.memberBenefits) {
      this.model.extendedFamily = this.familyList.getLinkedMembers(this.mainMemberId());
      this.memberBenefits.addMembers(this.model.extendedFamily);
    }
  }

  rolePlayerRemoved(event: any) {
    this.removedRolePlayer = event;
    if (this.memberBenefits) {
      this.model.extendedFamily = this.familyList.getLinkedMembers(this.mainMemberId());
      this.memberBenefits.addMembers(this.model.extendedFamily);
    }
  }

  rolePlayerModified(event: any) {
    this.modifiedRolePlayer = event;
    if (this.memberBenefits) {
      this.model.extendedFamily = this.familyList.getLinkedMembers(this.mainMemberId());
      this.memberBenefits.addMembers(this.model.extendedFamily);
    }
  }

  updateModel($event: Case) {
    this.model = $event;
  }
}
