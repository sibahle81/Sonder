import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';


import { MemberService} from '../services/member.service';
import { MemberSearch } from '../models/member-search';

export class MemberSearchDataSource extends PagedDataSource<MemberSearch> {
  constructor(private readonly memberService: MemberService) {
      super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'CreatedDate', sortDirection: string = 'desc', query: string = '') {
      this.loadingSubject.next(true);
      pageNumber = pageNumber ? pageNumber : 1;
      pageSize = pageSize ? pageSize : 5;
      orderBy = orderBy ? orderBy : 'CreatedDate';
      sortDirection = sortDirection ? sortDirection : 'desc';
      this.memberService.getPagedMembers(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
              catchError(() => of([])),
              finalize(() => this.loadingSubject.next(false))
          ).subscribe(result => {
              this.data = result as PagedRequestResult<MemberSearch>;
              this.dataSubject.next(this.data.data);
              this.rowCountSubject.next(this.data.rowCount);
          });
  }
}
