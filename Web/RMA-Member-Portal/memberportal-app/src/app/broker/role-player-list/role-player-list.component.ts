import { Component, OnInit, Input, ViewChild, Output, EventEmitter, OnChanges } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogsService } from 'src/app/shared/components/confirm-message/confirm-message.service';
import { PolicyStatus } from 'src/app/shared/enums/policy-status.enum';
import { Person } from 'src/app/shared/models/person';
import { PolicyInsuredLife } from 'src/app/shared/models/policy-insured-life';
import { PolicyManageReason } from 'src/app/shared/models/policy-manage-reason';
import { RolePlayerPolicy } from 'src/app/shared/models/role-player-policy';
import { RolePlayer } from 'src/app/shared/models/roleplayer';
import { RolePlayerType } from 'src/app/shared/models/roleplayer-type';
import { RolePlayerService } from 'src/app/shared/services/roleplayer.service';
import { PolicyListDialogComponent } from '../policy-list-dialog/policy-list-dialog.component';
import { RemoveInsuredLifeNoteComponent } from '../remove-insured-life-note/remove-insured-life-note.component';
import { RolePlayerPersonDialogComponent } from '../role-player-person-dialog/role-player-person-dialog.component';


@Component({
  selector: 'role-player-list',
  templateUrl: './role-player-list.component.html',
  styleUrls: ['./role-player-list.component.css']
})
export class RolePlayerListComponent implements OnInit, OnChanges {

  @Input() title: string;
  @Input() showVopd: boolean;
  @Input() showBeneficiary: boolean;
  @Input() rolePlayerTypeIds: number[];
  @Input() policyId: number;
  @Input() isWizard = false;
  @Input() canEditManual = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Output() addPerson = new EventEmitter();
  @Output() rolePlayerAdded = new EventEmitter<RolePlayer>();
  @Output() rolePlayerRemoved = new EventEmitter<RolePlayer>();
  @Output() rolePlayerModified = new EventEmitter<RolePlayer>();
  @Output() insuredLifeRemoved = new EventEmitter<RolePlayer>();
  @Output() removalNoteAdded = new EventEmitter<PolicyManageReason>();

  @Input() modelSpouses: RolePlayer[] = [];
  @Input() modelChildren: RolePlayer[] = [];
  @Input() modelExtendedFamily: RolePlayer[] = [];
  @Input() modelPolicyStatus: PolicyStatus;
  permitPolicyChanges = true;

  datasource = new MatTableDataSource<RolePlayer>();
  rolePlayerPolicies: RolePlayerPolicy[] = [];
  allRolePlayerTypes: RolePlayerType[] = [];
  rolePlayerTypes: RolePlayerType[] = [];
  rolePlayers: RolePlayer[] = [];
  isReadOnly: boolean;
  canEdit: boolean;
  errors: string[];
  removalReason: number;
  removalEffectiveDate: Date;
  showChildOptions = false;
  showJoinDates = false;
  showJoinDate = false;
  defaultDate: Date;

  displayedColumns = ['beneficiary', 'displayName', 'idNumber', 'verified', 'dateOfBirth', 'age', 'relation', 'emailAddress', 'cellNumber', 'policyStartDate', 'actions'];

  get canAddRemove(): boolean {
    return this.canEdit && !this.isReadOnly;
  }

  constructor(
    private readonly rolePlayerService: RolePlayerService,
    private readonly confirmservice: ConfirmationDialogsService,
    private dialogBox: MatDialog
  ) { }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if (this.modelPolicyStatus) {
      if (this.modelPolicyStatus === PolicyStatus.PendingContinuation || this.modelPolicyStatus === PolicyStatus.Continued || this.modelPolicyStatus === PolicyStatus.Paused || this.modelPolicyStatus === PolicyStatus.PremiumWaivered) {
        this.permitPolicyChanges = false;
      }
    }
  }

  ngOnInit(): void {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
    this.rolePlayerService.getRolePlayerTypeIsRelation().subscribe(
      data => {
        this.allRolePlayerTypes = data;
        this.rolePlayerTypes = data.filter(rp => this.rolePlayerTypeIds.indexOf(rp.rolePlayerTypeId) >= 0);
      }
    );
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

    rolePlayer.displayName = member.displayName;
    rolePlayer.person.isAlive = true;
    rolePlayer.person.manualBeneficiary = false;
    rolePlayer.person.firstName = person.firstName;
    rolePlayer.person.surname = person.surname;
    rolePlayer.person.idType = person.idType;

    this.rolePlayers.push(rolePlayer);
    this.datasource.data = [...this.rolePlayers];
    this.addPerson.emit(null);
    this.notifyRolePlayerAdded(rolePlayer);
  }

  setLinkedMembers(members: RolePlayer[], canEdit: boolean, isReadOnly: boolean) {
    this.canEdit = canEdit;
    this.isReadOnly = isReadOnly;
    this.rolePlayers = members;
    if (this.rolePlayers) {
      this.datasource.data = [...this.rolePlayers];
    } else {
      this.datasource.data = [];
    }
  }

  loadLinkedMembers(rolePlayerId: number, canEdit: boolean, isReadOnly: boolean): void {
    this.canEdit = canEdit;
    this.isReadOnly = isReadOnly;
    this.rolePlayerService.getLinkedRolePlayers(rolePlayerId, this.rolePlayerTypeIds).subscribe(
      (data: RolePlayer[]) => {
        data.forEach(rp => {
          rp.fromRolePlayers = rp.fromRolePlayers.filter(r => this.rolePlayerTypeIds.indexOf(r.rolePlayerTypeId) >= 0);
        });
        this.rolePlayers = data;
        this.datasource.data = [...this.rolePlayers];
      }
    );
  }

  getLinkedMembers(mainMemberId: number): RolePlayer[] {
    if (!this.rolePlayers) { return; }
    this.rolePlayers.forEach(
      rp => {
        if (rp.fromRolePlayers) {
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

  getIdNumber(rolePlayer: RolePlayer): string {
    if (!rolePlayer.person.idNumber || rolePlayer.person.idNumber === '') {
      rolePlayer.person.idNumber = rolePlayer.person.passportNumber;
    }
    return rolePlayer.person.idNumber;
  }

  getAge(rolePlayer: RolePlayer) {
    if (!rolePlayer.person) { return ''; }
    const age = this.getPersonAge(rolePlayer.person);
    return (age.years > 0) ? `${age.years} years` : `${age.months} months`;
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

  getRelation(rolePlayer: RolePlayer): string {
    if (!rolePlayer.fromRolePlayers || rolePlayer.fromRolePlayers.length === 0) { return ''; }
    let relation = this.allRolePlayerTypes.find(r => r.rolePlayerTypeId === rolePlayer.fromRolePlayers[0].rolePlayerTypeId);

    if (!relation && rolePlayer.fromRolePlayers[0].rolePlayerTypeId === 10) {
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
    rolePlayer.person.isAlive = true;
    rolePlayer.person.manualBeneficiary = true;
    rolePlayer.isDeleted = false;
    const dialog = this.dialogBox.open(RolePlayerPersonDialogComponent, this.getDialogConfig(rolePlayer));
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.rolePlayers.push(data);
        this.datasource.data = [...this.rolePlayers];
        this.addPerson.emit(null);
        this.notifyRolePlayerAdded(rolePlayer);
      }
      if (this.rolePlayerPolicies) {
        rolePlayer.policies = this.rolePlayerPolicies;
        rolePlayer.policies.forEach(p => {
          p.policyInceptionDate = new Date();
        });
      }
    });
  }

  canEditRolePlayer(rolePlayer: RolePlayer): boolean {
    if (!this.canEdit) { return false; }
    if (this.isReadOnly) { return false; }
    if (this.canEditManual) {
      return true;
    }
    if (!rolePlayer) { return false; }
    if (!rolePlayer.person) { return false; }
    return true;
  }

  editPerson(rolePlayer: RolePlayer, row: number): void {
    const copy = Object.assign({}, rolePlayer);
    const dialog = this.dialogBox.open(RolePlayerPersonDialogComponent, this.getDialogConfig(copy));
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.rolePlayers[row] = Object.assign({}, data);
        this.datasource.data = [...this.rolePlayers];
        this.addPerson.emit(null);
        this.notifyRolePlayerModified(rolePlayer);
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

    dialog.afterClosed().subscribe((policies: RolePlayerPolicy[]) => {
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
              life.rolePlayerTypeId = rolePlayer.fromRolePlayers[0].rolePlayerTypeId;
              life.startDate = policy.policyInceptionDate;
              mainPolicy.insuredLives.push(life);
            } else {
              life.startDate = policy.policyInceptionDate;
            }
          } else {
            // tslint:disable-next-line:triple-equals
            mainPolicy.insuredLives = mainPolicy.insuredLives.filter(il => il.rolePlayerId != rolePlayer.rolePlayerId);
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

  removeRelation(rolePlayer: RolePlayer, row: number): void {
    if (rolePlayer.person && rolePlayer.person.rolePlayerId > 0 && this.policyId === 0) {// new business capture where roleplayer exists in the db
      this.removeRelationWithNote(rolePlayer, row);
    } else if (rolePlayer.person && rolePlayer.person.rolePlayerId > 0 && this.policyId > 0) {
      if (this.checkIfInTheModelAndNeedsNoteForReMoval(rolePlayer)) {
        // maintain policy where roleplayer exists in the db but "next" clicked
        this.removeRelationWithNote(rolePlayer, row);
      } else {    // maintain policy where roleplayer exists in the db but "next" NOT clicked
        this.doNormalRemovalWithoutEffectiveDateDialog(rolePlayer, row);
      }
    } else {
      this.doNormalRemovalWithoutEffectiveDateDialog(rolePlayer, row);
    }
  }

  getDialogConfig(rolePlayer: RolePlayer): MatDialogConfig {
    const config = new MatDialogConfig();
    const canEdit = this.canEditRolePlayer(rolePlayer);
    config.disableClose = true;
    config.width = '40%';
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

  removeRelationWithNote(rolePlayer: RolePlayer, row: number) {
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);
    const dialog = this.dialogBox.open(RemoveInsuredLifeNoteComponent, this.getRemoveDialogConfig(rolePlayer));
    dialog.afterClosed().subscribe((data: PolicyManageReason) => {
      if (data) {
        rolePlayer.isDeleted = true;
        rolePlayer.modifiedDate = dtm;
        this.notifyInsuredLifeRemoved(rolePlayer);
        this.notifyRemovalNoteAdded(data.reason, data.effectiveDate);
      }
    });
  }

  getRemoveDialogConfig(rolePlayer: RolePlayer): MatDialogConfig {
    const config = new MatDialogConfig();
    config.disableClose = true;
    config.width = '900px';
    config.height = 'auto';
    config.data = {
      rolePlayer,
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

  doNormalRemovalWithoutEffectiveDateDialog(rolePlayer: RolePlayer, row: number) {
    this.confirmservice
      .confirmWithoutContainer(`Remove Relation`,
        `Are you sure you want to remove ${rolePlayer.displayName}?`,
        'Center', 'Center', 'Yes', 'No').subscribe(result => {
          if (result) {
            this.rolePlayers.splice(row, 1);
            this.datasource.data = [...this.rolePlayers];
            this.notifyRolePlayerRemoved(rolePlayer);
            this.addPerson.emit();
          }
        });
  }

  checkIfInTheModelAndNeedsNoteForReMoval(rolePlayer: RolePlayer) {
    let rolePlayerExistsInModel = false;
    if (this.modelChildren) {
      if (this.modelChildren.length > 0) {
        this.modelChildren.forEach(c => {
          if ((c.person.rolePlayerId === rolePlayer.person.rolePlayerId)) {
            if (c.fromRolePlayers[0].fromRolePlayerId > 0) {
              rolePlayerExistsInModel = true;
              return;
            } else {
              rolePlayerExistsInModel = false;
              return;
            }
          }
        });
      }
    }
    if (this.modelSpouses) {
      if (this.modelSpouses.length > 0) {
        this.modelSpouses.forEach(c => {
          if ((c.person.rolePlayerId === rolePlayer.person.rolePlayerId)) {
            if (c.fromRolePlayers[0].fromRolePlayerId > 0) {
              rolePlayerExistsInModel = true;
              return;
            } else {
              rolePlayerExistsInModel = false;
              return;
            }
          }
        });
      }
    }

    if (this.modelExtendedFamily) {
      if (this.modelExtendedFamily.length > 0) {
        this.modelExtendedFamily.forEach(c => {
          if ((c.person.rolePlayerId === rolePlayer.person.rolePlayerId)) {
            if (c.fromRolePlayers[0].fromRolePlayerId > 0) {
              rolePlayerExistsInModel = true;
              return;
            } else {
              rolePlayerExistsInModel = false;
              return;
            }
          }
        });
      }
    }
    return rolePlayerExistsInModel;
  }

  getPolicyStartDate(row: RolePlayer): Date {
    if (!row) { return null; }
    let startDate: Date;

    if (row.previousInsurerRolePlayers && row.previousInsurerRolePlayers.length > 0) {
      const count = row.previousInsurerRolePlayers.length;
      startDate = row.previousInsurerRolePlayers[count - 1].policyStartDate;
    }
    if (!startDate) {
      if (row.joinDate !== new Date()) {
        startDate = null;
      } else { startDate = row.joinDate; }
    }
    if (startDate) {
      startDate = new Date(startDate);
    } else {
      startDate = null;
    }
    return startDate;
  }
}
