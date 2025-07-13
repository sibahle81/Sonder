import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BeneficiarySearchV2DataSource } from './beneficiary-search-V2.datasource';
import { BeneficiaryService } from 'projects/clientcare/src/app/policy-manager/shared/Services/beneficiary.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';

@Component({
    selector: 'beneficiary-search-V2',
    templateUrl: './beneficiary-search-V2.component.html',
    styleUrls: ['./beneficiary-search-V2.component.css']
})

export class BeneficiarySearchV2Component extends UnSubscribe implements OnInit, OnChanges {
    @Input() title = 'Search Beneficiary';
    @Input() personEvent: PersonEventModel;
    @Input() triggerReset: boolean;

    @Output() beneficiarySelectedEmit: EventEmitter<RolePlayer> = new EventEmitter();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    selectedBeneficiary: RolePlayer;
    dataSource: BeneficiarySearchV2DataSource;

    constructor(
        private readonly beneficiaryService: BeneficiaryService
    ) {
        super();
        this.dataSource = new BeneficiarySearchV2DataSource(this.beneficiaryService);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.triggerReset) {
            this.reset();
        }

        if(this.personEvent) {
            this.getData();
        }
    }

    ngOnInit() {
        this.configureSearch();
    }

    configureSearch() {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.personEvent.rolePlayer.rolePlayerId.toString());
    }

    formatLookup(lookup: string) {
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    beneficiarySelected(beneficiary: RolePlayer) {
        this.selectedBeneficiary = beneficiary;
        this.beneficiarySelectedEmit.emit(this.selectedBeneficiary);
    }

    reset() {
        this.selectedBeneficiary = null;
        this.beneficiarySelectedEmit.emit(this.selectedBeneficiary);

        if (this.dataSource.data && this.dataSource.data.data) {
            this.dataSource.data.data = null;
        }
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'beneficiaryName', show: true },
            { def: 'beneficiaryLastName', show: true },
            { def: 'idNumber', show: true },
            { def: 'relation', show: true },
            { def: 'action', show: true }
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
}
