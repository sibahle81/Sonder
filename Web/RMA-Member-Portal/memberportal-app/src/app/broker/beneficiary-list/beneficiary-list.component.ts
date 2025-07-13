import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { ValidationResult } from 'src/app/shared/components/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'src/app/shared/components/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Case } from 'src/app/shared/models/case';
import { RolePlayer } from 'src/app/shared/models/roleplayer';
import { RolePlayerListComponent } from '../role-player-list/role-player-list.component';
import { CaseType } from 'src/app/shared/enums/case-type.enum';

@Component({
  selector: 'beneficiary-list',
  templateUrl: './beneficiary-list.component.html',
  styleUrls: ['./beneficiary-list.component.css']
})
export class BeneficiaryListComponent extends WizardDetailBaseComponent<Case> implements AfterViewInit {

  @ViewChild('beneficiaries') beneficiaryList: RolePlayerListComponent;
  timer: any;
  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: FormBuilder
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void { }

  ngAfterViewInit(): void {
    this.populateBeneficiaryList();
  }

  getAllPolicyRolePlayers(): RolePlayer[] {
    const roleplayers = this.model.beneficiaries;
    // Add the main member:
    const beneficiary = roleplayers.find(rp => rp.rolePlayerId === this.model.mainMember.rolePlayerId);
    if (!beneficiary) {
      roleplayers.push(this.model.mainMember);
    }

    /*

    DO NOT REMOVE! We might have to add all roleplayers over 18 to the beneficiary list at some stage.

    // Update manual entry values
    this.model.spouse.forEach(m => m.person.manualBeneficiary = false);
    this.model.children.forEach(m => m.person.manualBeneficiary = false);
    this.model.extendedFamily.forEach(m => m.person.manualBeneficiary = false);
    // Add other family members older than 18.
    roleplayers.push(...this.model.spouse.filter(rp => (roleplayers.map(b => b.rolePlayerId)).indexOf(rp.rolePlayerId) < 0));
    roleplayers.push(...this.model.children.filter(rp => (roleplayers.map(b => b.rolePlayerId)).indexOf(rp.rolePlayerId) < 0));
    roleplayers.push(...this.model.extendedFamily.filter(rp => (roleplayers.map(b => b.rolePlayerId)).indexOf(rp.rolePlayerId) < 0));
    */

    return roleplayers;
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      id: new FormControl()
    });
  }

  populateForm(): void {
    this.populateBeneficiaryList();
  }

  populateModel(): void {
    this.readForm();
  }

  populateBeneficiaryList() {
    if (this.beneficiaryList && this.model) {
      this.form.patchValue({ id: this.model.id });
      this.beneficiaryList.isWizard = this.isWizard;
      if (this.model.caseTypeId === CaseType.MemberRelations) {
        this.beneficiaryList.setLinkedMembers(this.getAllPolicyRolePlayers(), this.canEdit, this.isReadonly);
        this.beneficiaryList.addMainMemberPolicies(this.model.mainMember.policies);
      } else {
        this.beneficiaryList.setLinkedMembers(this.model.beneficiaries, this.canEdit, this.isReadonly);
      }
      this.beneficiaryList.showChildOptions = false;
      this.validateData();
    } else {
      if (this.beneficiaryList && this.model) {
        this.beneficiaryList.loadLinkedMembers(this.model.mainMember.rolePlayerId, this.canEdit, this.isReadonly);
      }
    }
  }

  readForm(): void {
    if (this.beneficiaryList && this.model) {
      this.model.beneficiaries = this.beneficiaryList.getLinkedMembers(this.mainMemberId());

      const mainMember = this.model.beneficiaries.find(c => c.person && c.person.rolePlayerId === this.model.mainMember.rolePlayerId);
      if (mainMember && this.model.mainMember.preferredCommunicationTypeId !== mainMember.preferredCommunicationTypeId) {
        mainMember.preferredCommunicationTypeId = this.model.mainMember.preferredCommunicationTypeId;
      }
    }
  }

  mainMemberId(): number {
    return this.model.mainMember ? this.model.mainMember.rolePlayerId : 0;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model.caseTypeId !== CaseType.MemberRelations && this.model.caseTypeId !== CaseType.GroupPolicyMember) {
      this.validateData();
    }
    if (this.beneficiaryList) {
      validationResult.errorMessages = this.beneficiaryList.errors;
      validationResult.errors = validationResult.errorMessages.length;
    }

    return validationResult;
  }

  removeBeneficiary(rolePlayer: RolePlayer): void {
    if (!rolePlayer.person) { return; }

    this.removeFromList(this.model.spouse, rolePlayer);
    this.removeFromList(this.model.children, rolePlayer);
    this.removeFromList(this.model.extendedFamily, rolePlayer);
  }

  removeFromList(list: RolePlayer[], rolePlayer: RolePlayer) {
    if (!list && list.length === 0) { return; }
    const members = list.filter(m => m.person && m.person.idType === rolePlayer.person.idType && m.person.idNumber === rolePlayer.person.idNumber);
    members.forEach(m => m.person.isBeneficiary = false);
  }

  validateData() {
    if (this.beneficiaryList) {
      // 1. At least one beneficiary; main member + one more
      // 2. If member only policy, another beneficiary must be added.
      // 3. Children under 18 cannot be beneficiaries.
      // 4. Contact details required for beneficiaries.
      this.readForm();
      this.beneficiaryList.errors = [];
      if (this.model.caseTypeId !== 10 && this.model.beneficiaries.length !== 2) {
        this.beneficiaryList.errors.push('There must be two beneficiaries including the main member.');
      } else {
        this.model.beneficiaries.forEach(b => {
          if (this.getAge(b.person.dateOfBirth) < 18) {
            this.beneficiaryList.errors.push(`${b.displayName} is a minor and cannot be a beneficiary.`);
          } else if (!b.preferredCommunicationTypeId) {
            const mainMember = this.model.beneficiaries.find(c => c.person && c.person.idNumber === this.model.mainMember.person.idNumber);
            if (this.model.mainMember.preferredCommunicationTypeId && mainMember) {
              b.preferredCommunicationTypeId = this.model.mainMember.preferredCommunicationTypeId;
            } else {
              this.beneficiaryList.errors.push(`Preferred communication type is required for ${b.displayName}.`);
            }
          } else {
            switch (b.preferredCommunicationTypeId) {
              case 1: // Email
                if (this.getValue(b.emailAddress) === '') {
                  this.beneficiaryList.errors.push(`Email address is required for ${b.displayName}.`);
                }
                break;
              case 2: // Phone
                if (this.getValue(b.tellNumber) === '' && this.getValue(b.cellNumber) === '') {
                  this.beneficiaryList.errors.push(`Contact number is required for ${b.displayName}.`);
                }
                break;
              case 3: // Sms
                if (this.getValue(b.cellNumber) === '') {
                  this.beneficiaryList.errors.push(`Mobile number is required for ${b.displayName}.`);
                }
                break;
            }
          }
        });
      }
    }
  }

  getValue(value: string) {
    if (!value) { return ''; }
    return value.trim();
  }

  getAge(dateOfBirth: Date): number {
    const today = new Date();
    const dob = new Date(dateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const birthDay = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (birthDay > today) { age--; }
    return age;
  }
}
