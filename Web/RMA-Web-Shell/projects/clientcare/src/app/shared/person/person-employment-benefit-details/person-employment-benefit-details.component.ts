import { Component, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import {MatTableDataSource} from "@angular/material/table";

import { PersonEmploymentBenefitDetailsDataSource } from './person-employment-benefit-details.datasource';

import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { GroupRiskPolicyCaseService } from 'projects/clientcare/src/app/policy-manager/shared/Services/group-risk-policy-case.service';

import { EmployeeInsuredCategoryModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/employee-insured-category-model';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { PersonEmployment } from 'projects/clientcare/src/app/policy-manager/shared/entities/person-employment';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';


@Component({
  selector: 'person-employment-benefit-details',
  templateUrl: './person-employment-benefit-details.component.html',
  styleUrls: ['./person-employment-benefit-details.component.css']
})
export class PersonEmploymentBenefitDetailsComponent extends PermissionHelper implements OnChanges {
    @Input() employerRolePlayer: RolePlayer; // required: employment within the employer results will be filtered else all employment for the employee will be returned
    @Input() employeeRolePlayer: RolePlayer; // required: employee that you are searching for employment results
    @Input() personEmployment: PersonEmployment; 
    @Input() isReadOnly: boolean;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    selectedEmployeeInsuredBenefit: EmployeeInsuredCategoryModel;
    employeeInsuredBenefit: EmployeeInsuredCategoryModel;
    showForm = false;
    isEdit: boolean;

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

    public dataSource = new MatTableDataSource<EmployeeInsuredCategoryModel>();

    groupedInsuredBenefitSumAssured:  {group: string, data: EmployeeInsuredCategoryModel[]}[];



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

    view(employeeInsuredBenefit: EmployeeInsuredCategoryModel) {
        this.isEdit = false;
        this.isReadOnly = true;
        this.employeeInsuredBenefit = employeeInsuredBenefit;
        this.toggleForm();
    }

    edit(employeeInsuredBenefit: EmployeeInsuredCategoryModel) {
        this.isEdit = true;
        this.isReadOnly = false;
        this.employeeInsuredBenefit = employeeInsuredBenefit;
        this.toggleForm();
    }

    add() {
        this.employeeInsuredBenefit = null;
        this.isEdit = false;
        this.isReadOnly = false;
        this.toggleForm();
    }

    close($event: boolean) {
        this.toggleForm();
        const refresh = $event;

        if (refresh) {
            this.employeeInsuredBenefit = null;
            this.getData();
        }
    }

    save($event: EmployeeInsuredCategoryModel)
    {
        this.toggleForm();
        
        if($event){
            this.getData();
        }
    }

    getData() {
        if (this.employeeRolePlayer && this.employeeRolePlayer.rolePlayerId > 0 && this.employerRolePlayer && this.employerRolePlayer.rolePlayerId > 0) {
            this.GetEmployeeInsuredBenefitCategoriesByEmployer(this.employeeRolePlayer.rolePlayerId, this.employerRolePlayer.rolePlayerId);
        }
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'policyName', show: true },
            { def: 'benefitName', show: true },
            { def: 'effectiveDate', show: true },
            { def: 'dateJoinedPolicy', show: true },
            { def: 'annualSalary', show: true },
            { def: 'benefitCategoryName', show: true },
            { def: 'potentialCoverAmount', show: true },
            { def: 'potentialWaiverAmount', show: true },
            { def: 'actualCoverAmount', show: true },
            { def: 'actualWaiverAmount', show: true },
            { def: 'medicalPremWaiverAmount', show: true },
            { def: 'actions', show: true }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    toggleForm() {
        this.showForm = !this.showForm;
    }

    setEffectiveDate(personInsuredCategoryEffectiveDate:Date, insuredSumAssuredEffectiveDate:Date): Date
    {
        if(personInsuredCategoryEffectiveDate >= insuredSumAssuredEffectiveDate){
            return personInsuredCategoryEffectiveDate;
        }
        else
        {
            return insuredSumAssuredEffectiveDate;
        }
    }

    getEmployeeInsuredBenefitCategories(employeeRolePlayer: number) {
        this.isLoading$.next(true);
        this.groupRiskPolicyCaseService.getEmployeeInsuredCategories(employeeRolePlayer).subscribe(result => {           
            if(result){
                this.dataSource.data = result;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.isLoading$.next(false);
            }
          });
    }

    GetEmployeeInsuredBenefitCategoriesByEmployer(employeeRolePlayer: number, employerRolePlayer: number) {
        this.isLoading$.next(true);
        this.groupRiskPolicyCaseService.getEmployeeInsuredCategoriesByEmployer(employeeRolePlayer, employerRolePlayer).subscribe(result => {           
            if(result){
                this.dataSource.data = result;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.groupedInsuredBenefitSumAssured = this.getGroups();
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

    getGroups() {
        const groups: { [key: string]: EmployeeInsuredCategoryModel[] } = this.dataSource.data.reduce((acc, element) => {
          if (!acc[element.personName]) {
            acc[element.personName] = [];
          }
          acc[element.personName].push(element);
          return acc;
        }, {} as { [key: string]: EmployeeInsuredCategoryModel[] });
        return Object.keys(groups).map(group => ({ group, data: groups[group] }));
    }
    
    getRelation(relationId: number): string {
        const statusText = RolePlayerTypeEnum[relationId];
        return statusText.replace(/([A-Z])/g, ' $1').trim();
    }
      
}
