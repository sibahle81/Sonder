import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { EmployeeInsuredCategoryModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/employee-insured-category-model';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';

import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { GroupRiskPolicyCaseService } from 'projects/clientcare/src/app/policy-manager/shared/Services/group-risk-policy-case.service';


@Injectable({
  providedIn: 'root'
})
export class PersonEmploymentBenefitDetailsDataSource extends PagedDataSource<EmployeeInsuredCategoryModel> {

  employerRolePlayerId: number;
  employeeRolePlayerId: number;
  benefitsCaregories: EmployeeInsuredCategoryModel[];

  constructor(
    private readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'startDate', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'startDate';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.groupRiskPolicyCaseService.getPagedEmployeeInsuredCategories(+this.employerRolePlayerId, +this.employeeRolePlayerId, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
        this.data = result as PagedRequestResult<EmployeeInsuredCategoryModel>;
        this.data.page = pageNumber;
        this.data.pageSize = pageSize;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
    }); 
  }
}
