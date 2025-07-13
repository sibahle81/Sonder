import { Component, Input, OnChanges, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { BeneficiaryPagedListDataSource } from './beneficiary-paged-list.datasource';
import { PagedParams } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/paged-parameters';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { BeneficiaryService } from 'projects/clientcare/src/app/policy-manager/shared/Services/beneficiary.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { BehaviorSubject } from 'rxjs';
import { DefaultConfirmationDialogComponent } from '../../dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'beneficiary-paged-list',
  templateUrl: './beneficiary-paged-list.component.html',
  styleUrls: ['./beneficiary-paged-list.component.css']
})
export class BeneficiaryPagedListComponent extends UnSubscribe implements OnChanges {

  @Input() personEvent: PersonEventModel;

  @Output() emitSelectedBeneficiary: EventEmitter<{beneficiary: RolePlayer; mode: string; isReadOnly: boolean}> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: BeneficiaryPagedListDataSource;
  currentQuery: any;
  params = new PagedParams();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
  constructor(
    private readonly beneficiaryService: BeneficiaryService,
    private readonly alertService: ToastrManager,
    private readonly rolePlayerService: RolePlayerService,
    private readonly dialog: MatDialog,
  ) {
    super();
   }

  ngOnChanges() {
    if (this.personEvent) {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource = new BeneficiaryPagedListDataSource(this.beneficiaryService);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      this.currentQuery = this.personEvent.rolePlayer.rolePlayerId;
      this.getData();
    }
  }

  getData() {
    this.setParams();
    this.dataSource.getData(this.params.pageIndex, this.params.pageSize, this.params.orderBy, this.params.direction, this.params.currentQuery);
  }

  setParams() {
    this.params.pageIndex = this.paginator.pageIndex ? this.paginator.pageIndex + 1 : 1;
    this.params.pageSize = this.paginator.pageSize ? this.paginator.pageSize : 5;
    this.params.orderBy = this.sort.active && this.sort.active !== undefined ? this.sort.active : 'createdDate';
    this.params.direction = this.sort.direction ? this.sort.direction : 'desc';
    this.params.currentQuery = this.currentQuery ? this.currentQuery : '';
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'beneficiaryName', show: true },
      { def: 'beneficiaryLastName', show: true },
      { def: 'idNumber', show: true },
      { def: 'relation', show: true },
      { def: 'actions', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  getRelationName(rolePlayerType: BeneficiaryTypeEnum): string {
    return rolePlayerType ? this.formatText(BeneficiaryTypeEnum[rolePlayerType]) : 'N/A';
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'N/A';
  }

  showDetail($event: RolePlayer, mode: string, isReadOnly: boolean) {
    const beneficiary = $event;
    this.emitSelectedBeneficiary.emit({beneficiary, mode, isReadOnly });
  }

  onRemove($event: RolePlayer, mode: string) {
    const beneficiary = $event;
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Delete Beneficiary',
        text: 'Are you sure you want to delete beneficiary ' + beneficiary.displayName + '?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let rolePlayerRelation = this.personEvent.rolePlayer.toRolePlayers.find(a => a.fromRolePlayerId === beneficiary.rolePlayerId)
        if (rolePlayerRelation !== null) {
          this.rolePlayerService.deleteRolePlayerRelation(rolePlayerRelation).subscribe(result => {
            if (result) {
              this.alertService.successToastr('Beneficiary has been removed successfully.');
              this.getData();
            }
          });
        }
      }
    });
  }
}
