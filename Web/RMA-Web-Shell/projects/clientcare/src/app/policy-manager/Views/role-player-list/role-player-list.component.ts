import { Component, OnInit, Input, ViewChild, Output, EventEmitter, OnChanges, AfterViewInit, SimpleChanges, createPlatform } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import 'src/app/shared/extensions/date.extensions';
import 'src/app/shared/extensions/string.extensions';

import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { RolePlayerPersonDialogComponent } from '../role-player-person-dialog/role-player-person-dialog.component';
import { RolePlayerService } from '../../shared/Services/roleplayer.service';
import { RolePlayerType } from '../../shared/entities/roleplayer-type';
import { RolePlayer } from '../../shared/entities/roleplayer';
import { Person } from '../../shared/entities/person';
import { RemoveInsuredLifeNoteComponent } from '../remove-insured-life-note/remove-insured-life-note.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PolicyListDialogComponent } from '../policy-list-dialog/policy-list-dialog.component';
import { PolicyManageReason } from '../../shared/entities/policy-manage-reason';
import { PolicyInsuredLife } from '../../shared/entities/policy-insured-life';
import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { RolePlayerRelation } from '../../shared/entities/roleplayer-relation';
import { RolePlayerBenefit } from '../../shared/entities/role-player-benefit';
import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';
import { RolePlayerRelationLife } from '../../shared/entities/roleplayer-relation-life';

@Component({
  selector: 'role-player-list',
  templateUrl: './role-player-list.component.html',
  styleUrls: ['./role-player-list.component.css']
})
export class RolePlayerListComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() title: string;
  @Input() showVopd: boolean;
  @Input() showBeneficiary: boolean;
  @Input() isBeneficiaryView: boolean = false;
  @Input() rolePlayerTypeIds: number[];
  @Input() policyId: number;
  @Input() isWizard: boolean;
  @Input() canEditManual = true;
  @Input() showStartDate = true;
  @Input() showBenefitAllocation = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @Output() addPerson = new EventEmitter();
  @Output() rolePlayerAdded = new EventEmitter<RolePlayer>();
  @Output() rolePlayerRemoved = new EventEmitter<RolePlayer>();
  @Output() rolePlayerModified = new EventEmitter<RolePlayer>();
  @Output() insuredLifeRemoved = new EventEmitter<RolePlayer>();
  @Output() removalNoteAdded = new EventEmitter<PolicyManageReason>();
  @Output() validateBenefitSplit = new EventEmitter();

  @Input() modelSpouses: RolePlayer[] = [];
  @Input() modelChildren: RolePlayer[] = [];
  @Input() modelExtendedFamily: RolePlayer[] = [];
  @Input() modelPolicyStatus: PolicyStatusEnum;

  datasource = new MatTableDataSource<RolePlayer>();
  rolePlayerPolicies: RolePlayerPolicy[] = [];
  allRolePlayerTypes: RolePlayerType[] = [];
  rolePlayerTypes: RolePlayerType[] = [];
  rolePlayers: RolePlayer[] = [];
  permitPolicyChanges = false;
  maintainPolicyCase = false;
  continuationCase = false;
  isReadOnly: boolean;
  canEdit: boolean;
  errors: string[];
  removalReason: number;
  removalEffectiveDate: Date;
  showChildOptions = false;
  showJoinDates = false;
  showJoinDate = false;
  canAdd = true;
  defaultDate: Date;
  selectedBenefit: number;

  displayedColumns = ['beneficiary', 'displayName', 'idNumber', 'verified', 'dateOfBirth', 'age', 'relation', 'emailAddress', 'cellNumber', 'split'];

  get canAddRemove(): boolean {
    return this.canEdit && !this.isReadOnly;
  }

  get disableSlider(): boolean {
    if (this.isReadOnly) { return true; }
    return !this.isWizard;
  }

  constructor(
    private readonly rolePlayerService: RolePlayerService,
    private readonly confirmservice: ConfirmationDialogsService,
    private readonly alertService: AlertService,
    private dialogBox: MatDialog,
  ) { }

  ngAfterViewInit() {
    if (this.showStartDate) {
      this.displayedColumns.push('policyStartDate');
      this.displayedColumns.push('endDate');
    }
    this.displayedColumns.push('actions');
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.permitPolicyChanges = false;
    if (this.modelPolicyStatus) {
      switch (this.modelPolicyStatus) {
        case PolicyStatusEnum.Active:
        case PolicyStatusEnum.Continued:
        case PolicyStatusEnum.PendingFirstPremium:
        case PolicyStatusEnum.Reinstated:
        case PolicyStatusEnum.FreeCover:
          this.permitPolicyChanges = true;
          break;
        case PolicyStatusEnum.Paused:
          this.permitPolicyChanges = this.continuationCase;
          break;
        default:
          this.permitPolicyChanges = false;
      }
    }
  }

  ngOnInit(): void {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
    // tslint:disable-next-line: deprecation
    this.rolePlayerService.getRolePlayerTypeIsRelation().subscribe({
      next: (data) => {
        this.allRolePlayerTypes = data;
        this.rolePlayerTypes = data.filter(rp => this.rolePlayerTypeIds.indexOf(rp.rolePlayerTypeId) >= 0);
      }
    });
  }

  addMainMemberPolicies(policies: RolePlayerPolicy[]) {
    this.rolePlayerPolicies = policies;
  }

  addMainMember(member: RolePlayer) {

    if (this.rolePlayers && this.rolePlayers.find(s => s.person.idNumber === member.person.idNumber)) {
      return;
    }

    const person = member.person;
    const rolePlayer = new RolePlayer();
    rolePlayer.person = new Person();

    rolePlayer.displayName = member.displayName;
    rolePlayer.rolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
    rolePlayer.person.isAlive = true;
    rolePlayer.person.manualBeneficiary = false;
    rolePlayer.person.firstName = person.firstName;
    rolePlayer.person.surname = person.surname;
    rolePlayer.person.idType = person.idType;

    this.rolePlayers.push(rolePlayer);
    this.datasource.data = this.rolePlayers;
    this.addPerson.emit(null);
    this.notifyRolePlayerAdded(rolePlayer);
  }

  setLinkedMembers(members: RolePlayer[], canEdit: boolean, isReadOnly: boolean) {
    this.canEdit = canEdit;
    this.isReadOnly = isReadOnly;

    if (this.maintainPolicyCase) {
      this.rolePlayers = members;
    } else {
      const today = new Date();
      this.rolePlayers = members.filter(m => !m.endDate || (new Date(m.endDate) > today || m.endDate.toString() === '0001-01-01T00:00:00'));
    }

    if (this.rolePlayers) {
      this.datasource.data = this.rolePlayers;
    } else {
      this.datasource.data = [];
    }
  }

  loadLinkedMembers(rolePlayerId: number, canEdit: boolean, isReadOnly: boolean): void {
    this.canEdit = canEdit;
    this.isReadOnly = isReadOnly;
    // tslint:disable-next-line: deprecation
    this.rolePlayerService.getLinkedRolePlayers(rolePlayerId, this.rolePlayerTypeIds).subscribe({
      next: (data) => {
        data.forEach(rp => {
          rp.fromRolePlayers = rp.fromRolePlayers.filter(r => this.rolePlayerTypeIds.indexOf(r.rolePlayerTypeId) >= 0);
        });
        this.rolePlayers = data;
        this.datasource.data = this.rolePlayers;
      }
    });
  }

  getLinkedMembers(mainMemberId: number): RolePlayer[] {
    if (!this.rolePlayers) { return; }
    this.rolePlayers.forEach(
      rp => {
        if (rp.fromRolePlayers && rp.person) {
          rp.person.dateOfBirth = this.fixDateOfBirth(new Date(rp.person.dateOfBirth));
          rp.person.age = this.calculateAge(rp.person.dateOfBirth, new Date(rp.joinDate ? rp.joinDate : new Date()));
          rp.fromRolePlayers.forEach(
            frp => {
              frp.toRolePlayerId = mainMemberId;
              frp.fromRolePlayerId = rp.rolePlayerId ? rp.rolePlayerId : 0;
            }
          );
        }
      }
    );
    return this.rolePlayers;
  }

  calculateAge(dob: Date, atDate: Date): number {
    let years = atDate.getFullYear() - dob.getFullYear();
    const birthDay = new Date(atDate.getFullYear(), dob.getMonth(), dob.getDate());
    if (birthDay > atDate) { years--; }
    return years;
  }

  private fixDateOfBirth(date: Date): Date {
    const today = new Date();
    const timeZoneOffset = today.getTimezoneOffset();
    const adjustMinutes = (timeZoneOffset === 0) ? 0 : -timeZoneOffset;
    date.setHours(0, adjustMinutes, 0, 0);
    return date;
  }

  getIdNumber(rolePlayer: RolePlayer): string {
    if (String.isNullOrEmpty(rolePlayer.person.idNumber)) {
      rolePlayer.person.idNumber = rolePlayer.person.passportNumber;
    }
    return rolePlayer.person.idNumber;
  }

  getAge(rolePlayer: RolePlayer) {
    if (!rolePlayer.person) {
      return String.Empty;
    }

    const age = this.getPersonAge(rolePlayer.person);
    return (age.years > 0) ? `${age.years} years` : `${age.months} months`;
  }

  isLifeBeneficiary(rolePlayer: RolePlayer): boolean {
    if (rolePlayer.fromRolePlayers?.length > 0) {
      return rolePlayer.fromRolePlayers[0].rolePlayerRelationLife?.rolePlayerRelationId > 0;
    }
    return false;
  }

  setFuneralBenefitSplit($event, rolePlayer: RolePlayer) {
    if (!this.isBeneficiaryView) { return; }
    const input = this.getBenefitSplitInput($event);
    if (rolePlayer.fromRolePlayers[0].rolePlayerTypeId === RolePlayerTypeEnum.MainMemberSelf) {
      rolePlayer.fromRolePlayers[0].allocationPercentage = 100;
      input.value = 100;
    } else {
      rolePlayer.fromRolePlayers[0].allocationPercentage = input.value;
    }
    if (this.validateBenefitSplit) {
      this.validateBenefitSplit.emit();
    }
  }

  setLifeBenefitSplit($event: any, rolePlayer: RolePlayer) {
    if (!this.isBeneficiaryView) { return; }
    const input = this.getBenefitSplitInput($event);
    if (!rolePlayer.fromRolePlayers[0].rolePlayerRelationLife) {
      rolePlayer.fromRolePlayers[0].rolePlayerRelationLife = new RolePlayerRelationLife();
      rolePlayer.fromRolePlayers[0].rolePlayerRelationLife.rolePlayerRelationId = rolePlayer.fromRolePlayers[0].id;
    }
    rolePlayer.fromRolePlayers[0].rolePlayerRelationLife.allocationPercentage = input.value;
  }

  private getBenefitSplitInput($event: any): any {
    const input = $event.target;
    // Check values that are typed in - min & max do not prevent typed values
    if (input.value > 100) { input.value = 100; }
    if (input.value < 0) { input.value = 0; }
    return input;
  }

  getBenefitValue(rolePlayer: RolePlayer): number {
    if (!this.isBeneficiaryView) { return; }
    const relation = this.getRolePlayerRelation(rolePlayer);
    if (!relation) { return 0; }
    if (relation.rolePlayerTypeId === RolePlayerTypeEnum.MainMemberSelf) {
      return 100;
    }
    const benefit = relation.allocationPercentage;
    return benefit === undefined ? 0 : benefit;
  }

  getFuneralBenefitSplit(rolePlayer: RolePlayer): number {
    if (!this.isBeneficiaryView) { return; }
    const relation = this.getRolePlayerRelation(rolePlayer);
    if (!relation) { return 0; }
    const benefit = relation.allocationPercentage;
    return benefit === undefined ? 0 : benefit;
  }

  getLifeBenefitSplit(rolePlayer: RolePlayer): number {
    if (!this.isBeneficiaryView) { return; }
    const relation = this.getRolePlayerRelation(rolePlayer);
    if (!relation) { return 0; }
    const benefit = relation.rolePlayerRelationLife?.allocationPercentage;
    return benefit === undefined ? 0 : benefit;
  }

  private getRolePlayerRelation(rolePlayer: RolePlayer): RolePlayerRelation {
    if (!rolePlayer) { return null; }
    if (!rolePlayer.fromRolePlayers) { return null; }
    if (rolePlayer.fromRolePlayers.length === 0) { return null; }
    const relation = rolePlayer.fromRolePlayers[0];
    if (!relation) { return null; }
    return relation;
  }

  isMainMember(rolePlayer: RolePlayer): boolean {
    if (rolePlayer.fromRolePlayers?.length > 0) { return false; }
    return rolePlayer.fromRolePlayers[0].rolePlayerTypeId === RolePlayerTypeEnum.MainMemberSelf;
  }

  isMinorChild(rolePlayer: RolePlayer): boolean {
    if (!rolePlayer.person) { return true; }
    const age = this.getPersonAge(rolePlayer.person);
    return age.years < 18;
  }

  getPersonAge(person: Person): any {
    const personAge = { years: 0, months: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dob = new Date(person.dateOfBirth);
    dob.setHours(0, 0, 0, 0);

    let years = today.getFullYear() - dob.getFullYear();
    const birthDay = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (birthDay > today) { years--; }
    personAge.years = years;

    if (years <= 0) {
      let months = 0;

      if (today.getMonth() >= dob.getMonth()) {
        months = today.getMonth() - dob.getMonth();
      } else {
        months = (today.getMonth() + 12) - dob.getMonth();
      }
      if (months === 12) { months--; }

      if (months < 2) {
        const timeBetween = today.getTime() - dob.getTime();
        const daysBetween = timeBetween / (1000 * 3600 * 24);
        if (daysBetween < 31) {
          months = 0;
        }
      }
      personAge.months = months;
    }
    return personAge;
  }

  canShowSlider(rolePlayer: RolePlayer): boolean {
    if (!this.isBeneficiaryView) { return false; }
    if (!rolePlayer) { return false; }
    if (!rolePlayer.fromRolePlayers) { return false; }
    if (rolePlayer.fromRolePlayers.length === 0) { return false; }
    return rolePlayer.fromRolePlayers[0].rolePlayerTypeId !== RolePlayerTypeEnum.MainMemberSelf;
  }

  getRelation(rolePlayer: RolePlayer): string {
    if (!rolePlayer.fromRolePlayers || rolePlayer.fromRolePlayers.length === 0) { return ''; }
    let relation = this.allRolePlayerTypes.find(r => r.rolePlayerTypeId === rolePlayer.fromRolePlayers[0].rolePlayerTypeId);

    if (!relation && rolePlayer.fromRolePlayers && rolePlayer.fromRolePlayers[0].rolePlayerTypeId === RolePlayerTypeEnum.MainMemberSelf) {
      relation = new RolePlayerType();
      relation.rolePlayerTypeId = 10;
      relation.name = 'Main Member (self)';
    }
    return relation ? relation.name : '';
  }

  selectBeneficiary(event: any, rolePlayer: RolePlayer): void {
    rolePlayer.person.isBeneficiary = event.checked;
  }

  addRelation(): void {
    const rolePlayer = new RolePlayer();
    rolePlayer.person = new Person();

    rolePlayer.rolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Person;
    rolePlayer.person = new Person();
    rolePlayer.person.isAlive = true;
    rolePlayer.person.manualBeneficiary = true;
    rolePlayer.isDeleted = false;
    const config: MatDialogConfig = this.getDialogConfig(rolePlayer);
    const dialog = this.dialogBox.open(RolePlayerPersonDialogComponent, config);
    // tslint:disable-next-line: deprecation
    dialog.afterClosed().subscribe({
      next: (data: RolePlayer) => {
        if (data) {
          // Deny if there is another person in the list with the same rolePlayerId
          let duplicates = this.rolePlayers.filter(r => r.rolePlayerId > 0 && r.rolePlayerId === data.rolePlayerId);
          if (duplicates.length > 0) {
            this.alertService.error('The person already exists in the member list.', 'Duplicate Member');
            return;
          }

          // Deny if there is another person with the same ID number && DOB in the list
          duplicates = this.rolePlayers.filter(r => r.person.idNumber === data.person.idNumber);
          if (duplicates.length > 0) {
            this.alertService.error(`The person with ID number ${data.person.idNumber} already exists in the member list.`, 'Duplicate Member');
            return;
          }

          if (this.isBeneficiaryView) {
            data.fromRolePlayers[0].allocationPercentage = 0;
          }
          this.rolePlayers.push(data);
          this.datasource.data = this.rolePlayers;
          this.addPerson.emit(null);
          this.notifyRolePlayerAdded(rolePlayer);
        }
        if (this.rolePlayerPolicies) {
          rolePlayer.policies = this.rolePlayerPolicies;
          rolePlayer.policies.forEach(p => {
            p.policyInceptionDate = new Date();
          });
        }
      }
    });
  }

  canEditRolePlayer(rolePlayer: RolePlayer): boolean {
    if (!rolePlayer) { return false; }
    if (!rolePlayer.person) { return false; }

    if (this.isBeneficiaryView) {
      if (!rolePlayer.person.manualBeneficiary) { return false; }
    }

    if (!this.isWizard) { return false; }
    if (this.isReadOnly) { return false; }

    return this.canEdit;
  }

  editPerson(rolePlayer: RolePlayer, row: number): void {
    const copy = { ...rolePlayer } as RolePlayer;
    const benefits = { ...rolePlayer.benefits } as RolePlayerBenefit[];
    const dialog = this.dialogBox.open(RolePlayerPersonDialogComponent, this.getDialogConfig(copy));
    // tslint:disable-next-line: deprecation
    dialog.afterClosed().subscribe({
      next: (data) => {
        if (data) {
          var idx = this.rolePlayers.findIndex(r => r === rolePlayer);
          if (idx >= 0) {
            this.rolePlayers[idx] = { ...data };
            this.rolePlayers[idx].fromRolePlayers[0].allocationPercentage = copy.fromRolePlayers[0]?.allocationPercentage;
            this.rolePlayers[idx].benefits = [];
            this.rolePlayers[idx].benefits.push(benefits[0] as RolePlayerBenefit);
            this.datasource.data = this.rolePlayers;
            this.addPerson.emit(null);
            this.notifyRolePlayerModified(this.rolePlayers[idx]);
          }
        }
      }
    });
  }

  editPolicies(rolePlayer: RolePlayer, row: number): void {
    this.rolePlayerPolicies.forEach(p => {
      if (rolePlayer.policies) {
        const policy = rolePlayer.policies.find(rp => rp.policyId === p.policyId);
        p.selected = policy ? true : false;
      }
    });
    const dialog = this.dialogBox.open(PolicyListDialogComponent, this.getPolicyConfig(rolePlayer.rolePlayerId, this.rolePlayerPolicies));
    // tslint:disable-next-line: deprecation
    dialog.afterClosed().subscribe({
      next: (policies: RolePlayerPolicy[]) => {
        if (policies) {
          rolePlayer.policies = policies.filter(p => p.selected);
          for (const policy of policies) {
            // tslint:disable-next-line:triple-equals
            const mainPolicy = this.rolePlayerPolicies.find(p => p.policyId == policy.policyId);
            if (policy.selected) {
              // tslint:disable-next-line:triple-equals
              let life = mainPolicy.insuredLives.find(il => il.rolePlayerId == rolePlayer.rolePlayerId);
              if (!life) {
                life = new PolicyInsuredLife();
                life.policyId = policy.policyId;
                life.rolePlayerId = rolePlayer.rolePlayerId;
                life.rolePlayerTypeId = rolePlayer.rolePlayerTypeId;
                life.rolePlayerTypeId = rolePlayer.fromRolePlayers[0].rolePlayerTypeId;
                life.startDate = policy.policyInceptionDate;
                mainPolicy.insuredLives.push(life);
              } else {
                life.startDate = policy.policyInceptionDate;
                life.rolePlayerTypeId = rolePlayer.rolePlayerTypeId;
              }
            } else {
              // tslint:disable-next-line:triple-equals
              mainPolicy.insuredLives = mainPolicy.insuredLives.filter(il => il.rolePlayerId != rolePlayer.rolePlayerId);
            }
          }
        }
      }
    });
  }

  getPolicyConfig(roleplayerId: number, policies: RolePlayerPolicy[]): MatDialogConfig {
    const config = new MatDialogConfig();
    config.disableClose = true;
    config.data = {
      showJoinDate: this.showJoinDates,
      roleplayerId,
      policies
    };
    return config;
  }

  removeRelation(rolePlayer: RolePlayer): void {
    if (this.policyId === 0 || this.title === 'Beneficiaries') {
      // Policy does not exist yet, just remove the member from the list
      this.removeRolePlayerFromList(rolePlayer);
    } else if (rolePlayer.rolePlayerId === 0) {
      // The member was never on the policy, just remove the member from the list
      this.removeRolePlayerFromList(rolePlayer);
    } else {
      // Policy and member exist, get a removal reason and date
      this.removeRelationWithNote(rolePlayer);
    }
  }

  undoRemoveRelation(rolePlayer: RolePlayer): void {
    if (rolePlayer) {
      const idx = this.rolePlayers.findIndex(r => r.rolePlayerId === rolePlayer.rolePlayerId);
      if (idx >= 0) {
        this.rolePlayers[idx].isDeleted = false;
        this.rolePlayers[idx].endDate = null;
        this.rolePlayers[idx].insuredLifeRemovalReason = null;
      }
    }
  }

  getDialogConfig(rolePlayer: RolePlayer): MatDialogConfig {
    const config = new MatDialogConfig();
    const canEdit = this.canEditRolePlayer(rolePlayer);
    config.disableClose = true;
    config.data = {
      rolePlayer,
      rolePlayerTypes: this.rolePlayerTypes,
      canAddEdit: canEdit,
      showChildOptions: this.showChildOptions,
      showJoinDate: this.showJoinDate,
      joinDate: this.defaultDate
    };
    return config;
  }

  notifyRolePlayerAdded(rolePlayer: RolePlayer) {
    this.rolePlayerAdded.emit(rolePlayer);
  }

  notifyRolePlayerRemoved(rolePlayer: RolePlayer) {
    this.rolePlayerRemoved.emit(rolePlayer);
  }

  notifyRolePlayerModified(rolePlayer: RolePlayer) {
    this.rolePlayerModified.emit(rolePlayer);
  }

  removeRelationWithNote(rolePlayer: RolePlayer) {
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);
    const dialog = this.dialogBox.open(RemoveInsuredLifeNoteComponent, this.getRemoveDialogConfig(rolePlayer));
    // tslint:disable-next-line: deprecation
    dialog.afterClosed().subscribe({
      next: (data) => {
        if (data) {
          let endDate = new Date(data.effectiveDate);
          endDate = endDate.getCorrectUCTDate();
          rolePlayer.isDeleted = true;
          rolePlayer.modifiedDate = dtm;
          this.notifyInsuredLifeRemoved(rolePlayer);
          this.notifyRemovalNoteAdded(data.reason, endDate);
        }
      }
    });
  }

  getRemoveDialogConfig(rolePlayer: RolePlayer): MatDialogConfig {
    const config = new MatDialogConfig();
    config.disableClose = true;
    config.data = {
      rolePlayer,
      minEffectiveDate: rolePlayer.joinDate,
      canAddEdit: this.canAddRemove
    };
    return config;
  }

  notifyInsuredLifeRemoved(rolePlayer: RolePlayer) {
    this.insuredLifeRemoved.emit(rolePlayer);
  }

  notifyRemovalNoteAdded(reason: number, effectiveDate: Date) {
    const insuredLifeRemovalReason = new PolicyManageReason(new Date(effectiveDate), reason);
    this.removalNoteAdded.emit(insuredLifeRemovalReason);
  }

  removeRolePlayerFromList(rolePlayer: RolePlayer) {
    this.confirmservice.confirmWithoutContainer(`Remove Relation`,
      `Are you sure you want to remove ${rolePlayer.displayName}?`,
      // tslint:disable-next-line: deprecation
      'Center', 'Center', 'Yes', 'No').subscribe({
        next: (result) => {
          if (result) {
            const idx = this.rolePlayers.findIndex(r => r === rolePlayer);
            if (idx >= 0) {
              this.rolePlayers.splice(idx, 1);
              this.datasource.data = this.rolePlayers;
              this.notifyRolePlayerRemoved(rolePlayer);
              this.addPerson.emit();
            }
          }
        }
      });
  }

  getPolicyStartDate(row: RolePlayer): Date {
    if (!row) { return null; }
    let startDate: Date;
    if (row.previousInsurerRolePlayers && row.previousInsurerRolePlayers.length > 0) {
      const count = row.previousInsurerRolePlayers.length;
      startDate = row.previousInsurerRolePlayers[count - 1].policyStartDate;
    }

    if (!startDate && row.joinDate) {
      startDate = Date.getActualDate(row.joinDate);
      return startDate;
    }

    return startDate ? new Date(startDate) : null;
  }

  getPolicyEndDate(row: RolePlayer): Date {
    if (!row) { return null; }
    const endDate = row.endDate ? Date.getActualDate(row.endDate) : null;
    if (endDate && endDate.getFullYear() > 1800) {
      return endDate;
    }
    return null;
  }
}
