import { Component, EventEmitter, Input, OnChanges, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { VopdStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/vopd-status.enum';
import { BeneficiaryService } from 'projects/clientcare/src/app/policy-manager/shared/Services/beneficiary.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { BehaviorSubject } from 'rxjs';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { HolisticBeneficiaryContainerComponent } from '../holistic-container-beneficiary/holistic-beneficiary-container/holistic-beneficiary-container.component';
import { BeneficiaryListDataSource } from './beneficiary-list.datasource';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { DiagnosticGroupEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/diagnostic-group-enum';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'beneficiary-list',
  templateUrl: './beneficiary-list.component.html',
  styleUrls: ['./beneficiary-list.component.css']
})
export class BeneficiaryListComponent extends UnSubscribe implements OnChanges {

  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false;
  @Input() isWizard = false;
  @Input() allowSelection = false; // optional: will default to false which means no select option
  @Input() title = 'Beneficiaries'; // optional: pass in a custom title else the default will be selected

  @Output() beneficiaryEmit = new EventEmitter<RolePlayer>();
  @Output() beneficiariesSelectedEmit: EventEmitter<RolePlayer[]> = new EventEmitter();

  selectedBeneficiaries: RolePlayer[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource: BeneficiaryListDataSource;
  currentQuery: any;
  beneficiary: RolePlayer;
  selectedBeneficiary: RolePlayer;
  diagnosticGroupEnum: DiagnosticGroupEnum;
  drg00 = DiagnosticGroupEnum.DRG00;

  public isBeneficiariesLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public beneficiaries: RolePlayer[] = [];
  menus: { title: string, action: string, disable: boolean }[];

  hasViewPermission = false;
  hasEditPermission = false;
  hasDeletePermission = false;
  diagnosticId = 0;

  hasAddPermission = false;
  currentUser : User;

  constructor(
    private readonly beneficiaryService: BeneficiaryService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly dialog: MatDialog,
    private readonly authService: AuthService
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.hasViewPermission = this.userHasPermission('View Beneficiary');
    this.hasEditPermission = this.userHasPermission('Edit Beneficiary Details');
    this.hasDeletePermission = this.userHasPermission('Delete Beneficiary Details');
    this.hasAddPermission = this.userHasPermission('Add Beneficiary');

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new BeneficiaryListDataSource(this.beneficiaryService, this.rolePlayerService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    this.diagnosticId = this.personEvent.physicalDamages && this.personEvent.physicalDamages[0]?.icd10DiagnosticGroupId ? this.personEvent.physicalDamages[0]?.icd10DiagnosticGroupId : 0;

    this.getData();
    this.getWizardData();
  }

  getData() {
    if (!this.isWizard) {
      this.currentQuery = this.personEvent.rolePlayer.rolePlayerId;
      this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
      this.autoSelect();
    }
  }

  getWizardData() {
    if (this.isWizard) {
      if (!this.personEvent.physicalDamages) {
        this.personEvent.physicalDamages = [];
      }
      this.dataSource.getWizardData(this.personEvent.beneficiaries, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
    }
  }

  getVOPDStatus(id: number) {
    if (id > 0) {
      return this.formatText(VopdStatusEnum[id]);
    }
  }

  getRelationName(rolePlayerType: BeneficiaryTypeEnum): string {
    return rolePlayerType ? this.formatText(BeneficiaryTypeEnum[rolePlayerType]) : 'N/A';
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'N/A';
  }

  filterBeneficiaryMenu(item: RolePlayer) {
    this.menus = null;
    this.menus =
      [
        { title: 'View/Edit', action: 'view/edit', disable: false },
        { title: 'Delete', action: 'delete', disable: false }
      ];
  }

  showDetail($event: RolePlayer) {
    this.selectedBeneficiary = $event;
    this.beneficiaryEmit.emit($event);
  }

  openDeleteBeneficiaryDialog(item: RolePlayer) {
    if (item) {
      const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
        width: '40%',
        disableClose: true,
        data: {
          title: 'Delete Beneficiary',
          text: 'Are you sure you want to delete beneficiary ' + item.displayName + '?'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (this.isWizard) {
            this.dataSource.data.data.splice(this.dataSource.data.data.indexOf(item), 1);
          } else {
            let index = this.personEvent.rolePlayer.toRolePlayers.find(a => a.fromRolePlayerId === item.rolePlayerId)
            if (index !== null) {
              this.rolePlayerService.deleteRolePlayerRelation(index).subscribe(result => {
                if (result) {
                  this.getData();
                }
              });
            }
          }
        }
      });
    }
  }

  openViewBeneficiaryDialog(item: RolePlayer, isReadOnly: boolean): void {
    const dialogRef = this.dialog.open(HolisticBeneficiaryContainerComponent, {
      width: '70%',
      maxHeight: '750px',
      disableClose: true,
      data: {
        beneficiary: item,
        personEvent: this.personEvent,
        isReadOnly: isReadOnly,
        isWizard: false,
        mode: ModeEnum.View,
        title: 'Beneficiary Details'
      }
    });
  }

  openAddBeneficiaryDialog(): void {
    const dialogRef = this.dialog.open(HolisticBeneficiaryContainerComponent, {
      width: '70%',
      maxHeight: '750px',
      disableClose: true,
      data: {
        beneficiary: new RolePlayer(),
        personEvent: this.personEvent,
        isReadOnly: false,
        isWizard: false,
        mode: ModeEnum.Edit,
        title: 'Beneficiary Details'
      }
    });
    dialogRef.afterClosed().subscribe(data => {
      this.getData();
      this.getWizardData();
    });
  }

  openEditBeneficiaryDialog(row: RolePlayer, isReadOnly: boolean): void {
    const dialogRef = this.dialog.open(HolisticBeneficiaryContainerComponent, {
      width: '70%',
      maxHeight: '750px',
      disableClose: true,
      data: {
        beneficiary: row,
        personEvent: this.personEvent,
        isReadOnly: isReadOnly,
        isWizard: false,
        mode: isReadOnly ? ModeEnum.View : ModeEnum.Edit,
        isEdit: false,
        title: 'Beneficiary Details'
      }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (!isReadOnly) {
        this.getData();
        this.getWizardData();
      }
    });
  }

  autoSelect() {
    this.dataSource.hasBeneficiary$.subscribe(result => {
      if (result) {
        if (!this.selectedBeneficiary) {
          this.selectedBeneficiary = this.dataSource.data.data[0];
          this.showDetail(this.selectedBeneficiary);
        }
      }
    })
  }

  beneficiarySelected(rolePlayer: RolePlayer) {
    if (!this.selectedBeneficiaries) { this.selectedBeneficiaries = []; }

    if (this.allowSelection) {
      let index = this.selectedBeneficiaries.findIndex(a => a.rolePlayerId === rolePlayer.rolePlayerId);
      if (index > -1) {
        this.selectedBeneficiaries.splice(index, 1);
      } else {
        this.selectedBeneficiaries.push(rolePlayer);
      }
    } else {
      if (this.selectedBeneficiaries.length > 0) {
        this.selectedBeneficiaries[0] = rolePlayer;
      } else {
        this.selectedBeneficiaries.push(rolePlayer);
      }
    }

    this.beneficiariesSelectedEmit.emit(this.selectedBeneficiaries);
  }

  isSelected($event: RolePlayer): boolean {
    return !this.selectedBeneficiaries ? false : this.selectedBeneficiaries.some(s => s.rolePlayerId == $event.rolePlayerId)
  }

  reset() {
    this.selectedBeneficiaries = [];
    this.beneficiariesSelectedEmit.emit(this.selectedBeneficiaries);
  }

  getDisplayedColumns() {

    const columnDefinitions = [
      { def: 'selectMultiple', show: this.allowSelection },
      { def: 'beneficiaryName', show: true },
      { def: 'beneficiaryLastName', show: true },
      { def: 'idNumber', show: true },
      { def: 'relation', show: true },
      { def: 'actions', show: true }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }
}
