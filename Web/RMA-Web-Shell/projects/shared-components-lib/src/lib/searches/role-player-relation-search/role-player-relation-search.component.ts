import { Component, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayerRelationSearchDataSource } from './role-player-relation-search.datasource';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { RolePlayerRelation } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer-relation';

@Component({
    selector: 'role-player-relation-search',
    templateUrl: './role-player-relation-search.component.html',
    styleUrls: ['./role-player-relation-search.component.css']
})
export class RolePlayerRelationSearchComponent extends PermissionHelper implements OnChanges {
    @Input() fromRolePlayer: RolePlayer;
    @Input() rolePlayerType: RolePlayerTypeEnum;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: RolePlayerRelationSearchDataSource;
    selectedRolePlayer: RolePlayer;

    showForm: boolean;

    constructor(
        private readonly rolePlayerService: RolePlayerService,
    ) {
        super();
        this.dataSource = new RolePlayerRelationSearchDataSource(this.rolePlayerService);
    }
    ngOnChanges(changes: SimpleChanges): void {
        this.getData();
    }

    getData() {
        this.dataSource.fromRolePlayerId = +this.fromRolePlayer.rolePlayerId;
        this.dataSource.rolePlayerTypeId = +this.rolePlayerType;
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, '');
    }

    rolePlayerSelected(rolePlayer: RolePlayer) {
        this.selectedRolePlayer = rolePlayer;
        this.toggleForm();
    }

    reset() {
        if (this.showForm) {
            this.toggleForm();
        }

        this.selectedRolePlayer = null;
        this.getData();
    }

    getRolePlayerType(rolePlayerType: RolePlayerTypeEnum): string {
        return this.formatLookup(RolePlayerTypeEnum[rolePlayerType]);
    }


    ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
        return Object.keys(anyEnum)
            .filter(StringIsNumber)
            .map(key => anyEnum[key]);
    }

    formatLookup(lookup: string): string {
        if (!lookup) { return 'N/A'; }
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'displayName', show: true },
            { def: 'uniqueIdentifier', show: true },
            { def: 'actions', show: true }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    toggleForm() {
        this.showForm = !this.showForm;
    }

    add() {
        const rolePlayer = new RolePlayer();

        rolePlayer.toRolePlayers = [];
        const relation = new RolePlayerRelation();
        relation.fromRolePlayerId = this.fromRolePlayer.rolePlayerId;
        relation.rolePlayerTypeId = +RolePlayerTypeEnum.Beneficiary;
        rolePlayer.toRolePlayers.push(relation);

        this.selectedRolePlayer = rolePlayer;

        this.toggleForm();
    }
}
