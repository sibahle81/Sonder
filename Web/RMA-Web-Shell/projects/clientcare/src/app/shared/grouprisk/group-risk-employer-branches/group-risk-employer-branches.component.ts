import { BehaviorSubject } from 'rxjs';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { Company } from 'projects/clientcare/src/app/policy-manager/shared/entities/company';
import { GroupRiskPolicyCaseModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/group-risk-policy-case-model';
import { MemberStatusEnum } from 'projects/shared-models-lib/src/lib/enums/member-status-enum';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';

import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';

@Component({
selector: 'employer-branches',
templateUrl: './group-risk-employer-branches.component.html',
styleUrls: ['./group-risk-employer-branches.component.css']
})
export class GroupRiskEmployerBranchesComponent extends PermissionHelper implements OnChanges {
addPermission = 'Add Member';
editPermission = 'Edit Member';
viewPermission = 'View Member';
viewAuditPermission = 'View Audits';

@Input() model: GroupRiskPolicyCaseModel;
@Input() rolePlayerId: number;
@Input() isWizard: boolean;
@Input() isReadOnly = false;

isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
branches: RolePlayer[];
showSearch: boolean;

rolePlayerTypeIds: number[] = [+RolePlayerTypeEnum.Branch];
dataSource = new MatTableDataSource<RolePlayer>();

@ViewChild(MatPaginator, { static: false }) set paginator(value: MatPaginator)
{
    if (this.dataSource) 
    {
        this.dataSource.paginator = value;
    }
}

constructor(private readonly memberService: MemberService,
    private readonly rolePlayerService: RolePlayerService
) {
    super();
}

ngOnChanges(changes: SimpleChanges): void {
    if (this.rolePlayerId) {
        this.getBranches();
        }
}

getBranches() {
    this.isLoading$.next(true);
    if (this.rolePlayerId) {
        this.rolePlayerService.getLinkedRolePlayers(this.rolePlayerId, this.rolePlayerTypeIds).subscribe({
            next: (data) => {
              data.forEach(rp => {
                rp.fromRolePlayers = rp.fromRolePlayers.filter(r => this.rolePlayerTypeIds.indexOf(r.rolePlayerTypeId) >= 0);
              });
              this.branches = data;
              this.populateBranchesTable();
              this.isLoading$.next(false);
            }
        });     

    } 
    else {
        this.isLoading$.next(false);
    }
}

showMoreInformation(item: RolePlayer){

}

populateBranchesTable() {
    this.dataSource = new MatTableDataSource(this.branches);
    this.dataSource.paginator = this.paginator;
}


getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'code', show: true },
      { def: 'name', show: true },
      { def: 'idPassportNumber', show: true },
      { def: 'type', show: true },
      { def: 'status', show: true },
      { def: 'actions', show: true }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
}


getBranchStatus(branchStatus: MemberStatusEnum): string {
    return this.formatText(MemberStatusEnum[branchStatus]);
}

getClientType(clientType: ClientTypeEnum): string {
    return this.formatText(ClientTypeEnum[clientType]);
}

formatText(text: string): string {
    if (!text) { return ''; }
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
}
}
