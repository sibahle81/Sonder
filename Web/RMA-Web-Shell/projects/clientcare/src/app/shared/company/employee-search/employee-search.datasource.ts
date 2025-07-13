import { Injectable } from '@angular/core';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { PersonEmployment } from 'projects/clientcare/src/app/policy-manager/shared/entities/person-employment';
import { EmployeeSearchRequest } from 'projects/shared-models-lib/src/lib/member/employee-search-request';
import { PagedRequest } from 'projects/shared-models-lib/src/lib/pagination/PagedRequest';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmployeeSearchDataSource extends PagedDataSource<PersonEmployment> {

  // additional filters
  employerRolePlayerId: number;

  constructor(
    private readonly memberService: MemberService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'modifiedDate', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);

    const pagedRequest = new PagedRequest();
    pagedRequest.orderBy = orderBy ? orderBy : 'modifiedDate';
    pagedRequest.page = pageNumber ? pageNumber : 1;
    pagedRequest.pageSize = pageSize ? pageSize : 5;
    pagedRequest.searchCriteria = query ? query : '';
    pagedRequest.isAscending = sortDirection == 'asc';

    const employeeSearchRequest = new EmployeeSearchRequest();
    employeeSearchRequest.employerRolePlayerId = this.employerRolePlayerId;

    employeeSearchRequest.pagedRequest = pagedRequest;

    this.memberService.getPagedEmployees(employeeSearchRequest).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<PersonEmployment>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
