import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { BenefitService } from '../services/benefit.service';
import { BenefitUploadErrorAudit } from '../models/benefit-upload-error-audit';

export class BenefitsUploadDataSource extends PagedDataSource<BenefitUploadErrorAudit> {
  constructor(private readonly benefitService: BenefitService) {
      super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'CreatedDate', sortDirection: string = 'desc', query: string = '') {
      this.loadingSubject.next(true);
      pageNumber = pageNumber ? pageNumber : 1;
      pageSize = pageSize ? pageSize : 5;
      orderBy = orderBy ? orderBy : 'CreatedDate';
      sortDirection = sortDirection ? sortDirection : 'desc';
      this.benefitService.searchUploadBenefitsErrorAudit(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
              catchError(() => of([])),
              finalize(() => this.loadingSubject.next(false))
          ).subscribe(result => {
              this.data = result as PagedRequestResult<BenefitUploadErrorAudit>;
              this.dataSubject.next(this.data.data);
              this.rowCountSubject.next(this.data.rowCount);
          });
  }
}
