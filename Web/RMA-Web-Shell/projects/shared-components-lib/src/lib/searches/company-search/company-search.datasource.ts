import { Injectable } from '@angular/core';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { Company } from 'projects/clientcare/src/app/policy-manager/shared/entities/company';
import { CompanyLevelEnum } from 'projects/shared-models-lib/src/lib/enums/company-level-enum';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CompanySearchDataSource extends PagedDataSource<Company> {

  rolePlayerId: number;
  companyLevelId: number;

  constructor(
    private readonly memberService: MemberService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'rolePlayerId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('rolePlayerId')) {
      orderBy = 'rolePlayerId';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'rolePlayerId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';
    if (!this.rolePlayerId) { this.rolePlayerId = -1; }
    if (!this.companyLevelId) { this.companyLevelId = -1; }

    this.memberService.getPagedCompanies(this.companyLevelId, this.rolePlayerId, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<Company>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
