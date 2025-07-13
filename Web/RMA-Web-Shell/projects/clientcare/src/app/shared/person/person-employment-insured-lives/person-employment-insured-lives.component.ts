
import { Component, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from "@angular/material/table";
//import { PersonEmploymentBenefitDetailsDataSource } from './person-employment-benefit-details.datasource';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { GroupRiskPolicyCaseService } from 'projects/clientcare/src/app/policy-manager/shared/Services/group-risk-policy-case.service';
import { EmployeeOtherInsuredlifeModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/employee-other-insured-life-model';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { PersonEmployment } from 'projects/clientcare/src/app/policy-manager/shared/entities/person-employment';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { GenderEnum } from 'projects/shared-models-lib/src/lib/enums/gender-enum';
import { NationalityEnum } from 'projects/shared-models-lib/src/lib/enums/nationality-enum';
import { TitleEnum } from 'projects/shared-models-lib/src/lib/enums/title-enum';
@Component({
  selector: 'person-employment-insured-lives',
  templateUrl: './person-employment-insured-lives.component.html',
  styleUrls: ['./person-employment-insured-lives.component.css']
})
export class PersonEmploymentInsuredLivesComponent  extends PermissionHelper implements OnChanges {
    @Input() employerRolePlayer: RolePlayer; // required: employment within the employer results will be filtered else all employment for the employee will be returned
    @Input() employeeRolePlayer: RolePlayer; // required: employee that you are searching for employment results
    @Input() personEmployment: PersonEmployment; 
    @Input() isReadOnly: boolean;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    
    selectedEmployeeOtherInsuredlife: EmployeeOtherInsuredlifeModel;
    employeeOtherInsuredlife: EmployeeOtherInsuredlifeModel;
    showForm = false;
    isEdit: boolean;
    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

    public dataSource = new MatTableDataSource<EmployeeOtherInsuredlifeModel>();

    constructor(
        private readonly rolePlayerService: RolePlayerService,
        private readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService,
        private readonly lookupService: LookupService,
        public dialog: MatDialog
    ) {
        super();
    }

    ngOnInit()
    {
        if(this.employeeRolePlayer && this.employerRolePlayer)
        {
            this.getPersonEmploymentDetails(this.employeeRolePlayer.rolePlayerId, this.employerRolePlayer.rolePlayerId);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.getData();
    }

    view(employeeOtherInsuredlife: EmployeeOtherInsuredlifeModel) {
        this.isEdit = false;
        this.employeeOtherInsuredlife = employeeOtherInsuredlife;
        this.toggleForm();
    }

    edit(employeeOtherInsuredlife: EmployeeOtherInsuredlifeModel) {
        this.isEdit = true;
        this.employeeOtherInsuredlife = employeeOtherInsuredlife;
        this.toggleForm();
    }

    add() {
        this.employeeOtherInsuredlife = null;
        this.isEdit = true;
        this.toggleForm();
    }

    close($event: boolean) {
        this.toggleForm();
        const refresh = $event;
        if (refresh) {
            this.employeeOtherInsuredlife = null;
            this.getData();
        }
    }

    save($event: EmployeeOtherInsuredlifeModel)
    {
        this.toggleForm();
        if($event){
            this.getData();
        }
    }

    getData() {
        if (this.employeeRolePlayer && this.employeeRolePlayer.rolePlayerId > 0 && this.employerRolePlayer && this.employerRolePlayer.rolePlayerId > 0) {
            this.getEmployeeOtherInsuredlivesByEmployer(this.employeeRolePlayer.rolePlayerId, this.employerRolePlayer.rolePlayerId);
        }
    }

    getRolePlayerType(rolePlayerTypeEnum: RolePlayerTypeEnum): string {
        return this.formatText(RolePlayerTypeEnum[rolePlayerTypeEnum]);
    }

    getGender(genderEnum: GenderEnum): string {
        return this.formatText(GenderEnum[genderEnum]);
    }

    getNationality(nationalityEnum: NationalityEnum): string {
        return this.formatText(NationalityEnum[nationalityEnum]);
    }

    formatText(text: string): string {
        return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'relationship', show: true },
            { def: 'name', show: true },
            { def: 'surname', show: true },
            { def: 'dateOfBirth', show: true },
            { def: 'effectiveDate', show: false },
            { def: 'employeeJoinDate', show: false },
            { def: 'gender', show: true },
            { def: 'nationality', show: true },
            { def: 'actions', show: true }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    toggleForm() {
        this.showForm = !this.showForm;
    }

    getEmployeeOtherInsuredlivesByEmployer(employeeRolePlayer: number, employerRolePlayer: number) {
        this.isLoading$.next(true);
        this.groupRiskPolicyCaseService.getEmployeeOtherInsuredLives(employeeRolePlayer, employerRolePlayer).subscribe(result => {           
            if(result){
                this.dataSource.data = result;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.isLoading$.next(false);
            }
          }); 
    }

    getPersonEmploymentDetails(employeeRoleplayerId: number, employerRolePlayerId: number) {
        this.isLoading$.next(true);
        let sub = this.rolePlayerService.getPersonEmployment(employeeRoleplayerId, employerRolePlayerId).subscribe(result => {
            if (result) {
                this.personEmployment = result;
                this.isLoading$.next(false);
            }
        });
    }


}
