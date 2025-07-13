import { Component, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { PersonEmployment } from 'projects/clientcare/src/app/policy-manager/shared/entities/person-employment';
import { PersonEmploymentSearchDataSource } from './person-employment-search.datasource';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BehaviorSubject } from 'rxjs';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ClientItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/client-item-type-enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'person-employment-search',
    templateUrl: './person-employment-search.component.html',
    styleUrls: ['./person-employment-search.component.css']
})

export class PersonEmploymentSearchComponent extends PermissionHelper implements OnChanges {
    viewAuditPermission = 'View Audits';

    @Input() employerRolePlayer: RolePlayer; // optional: employment within the employer results will be filtered else all employment for the employee will be returned
    @Input() employeeRolePlayer: RolePlayer; // required: employee that you are searching for employment results
    @Input() isReadOnly: boolean;

    @Output() employmentSelectedEmit = new EventEmitter<PersonEmployment>();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

    dataSource: PersonEmploymentSearchDataSource;

    showForm = false;

    selectedEmployment: PersonEmployment;
    personEmployment: PersonEmployment;

    designationTypes: Lookup[];

    isEdit: boolean;

    constructor(
        private readonly rolePlayerService: RolePlayerService,
        private readonly lookupService: LookupService,
        public dialog: MatDialog
    ) {
        super();
        this.dataSource = new PersonEmploymentSearchDataSource(this.rolePlayerService);
    }

    getDesignationTypes() {
        this.lookupService.getDesignationTypes('').subscribe(results => {
            this.designationTypes = results;
            this.isLoading$.next(false);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.getDesignationTypes();
        if (this.employeeRolePlayer && this.employeeRolePlayer.rolePlayerId > 0) {
            this.getData();
        }
    }

    getData() {
        this.dataSource.employerRolePlayerId = this.employerRolePlayer ? this.employerRolePlayer.rolePlayerId : 0;
        this.dataSource.employeeRolePlayerId = this.employeeRolePlayer ? this.employeeRolePlayer.rolePlayerId : 0;
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, '');
    }

    employmentSelected(personEmployment: PersonEmployment) {
        if (personEmployment == this.selectedEmployment) {
            this.selectedEmployment = null;
        } else {
            this.selectedEmployment = personEmployment;
        }

        this.employmentSelectedEmit.emit(this.selectedEmployment);
    }

    view(personEmployment: PersonEmployment) {
        this.isEdit = false;
        this.personEmployment = personEmployment;
        this.toggleForm();
    }

    edit(personEmployment: PersonEmployment) {
        this.isEdit = true;
        this.personEmployment = personEmployment;
        this.toggleForm();
    }

    add() {
        this.personEmployment = null;
        this.isEdit = true;
        this.toggleForm();
    }

    close($event: boolean) {
        this.toggleForm();
        const refresh = $event;

        if (refresh) {
            this.personEmployment = null;
            this.getData();
        }
    }

    toggleForm() {
        this.showForm = !this.showForm;
    }

    ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
        return Object.keys(anyEnum)
            .filter(StringIsNumber)
            .map(key => anyEnum[key]);
    }

    getDesignationTypeName(designationTypeId: number) {
        if (this.designationTypes && this.designationTypes.length > 0) {
            const designation = this.designationTypes.find(s => s.id == designationTypeId);
            if (designation && designation.name != '') {
                return this.formatLookup(designation.name);
            }
        }
    }

    formatLookup(lookup: string) {
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'employerRolePlayerId', show: !this.employerRolePlayer && this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10 },
            { def: 'employeeNumber', show: true },
            { def: 'designationTypeId', show: true },
            { def: 'rmaEmployeeRefNum', show: true },
            { def: 'employeeIndustryNumber', show: true },
            { def: 'startDate', show: true },
            { def: 'endDate', show: true },
            { def: 'actions', show: true }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    openAuditDialog(personEmployment: PersonEmployment) {
        const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
            width: '70%',
            data: {
                serviceType: ServiceTypeEnum.ClientManager,
                clientItemType: ClientItemTypeEnum.PersonEmployment,
                itemId: personEmployment.personEmpoymentId,
                heading: 'Employment Audit',
                propertiesToDisplay: [
                    'EmployeeNumber', 'StartDate', 'EndDate', 'IsTraineeLearnerApprentice', 'IsSkilled', 'YearsInIndustry', 'YearsInPresentOccupation',
                    'PatersonGradingId', 'RmaEmployeeRefNum', 'EmployeeIndustryNumber', 'DesignationTypeId'
                ],
            },
        });
    }
}
