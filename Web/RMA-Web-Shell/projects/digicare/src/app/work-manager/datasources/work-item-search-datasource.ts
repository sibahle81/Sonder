import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { catchError, finalize } from 'rxjs/operators';
import { DigiCareService } from 'projects/digicare/src/app/digi-manager/services/digicare.service';
import { WorkItem } from 'projects/digicare/src/app/work-manager/models/work-item';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';

export class WorkItemSearchDataSource extends PagedDataSource<WorkItem> {
  constructor(private readonly digiService: DigiCareService) {
          super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'modifiedDate', sortDirection: string = 'desc', query: string = ''): void {

      this.loadingSubject.next(true);

      this.digiService.search(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
          catchError(() => of([])),
          finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
          this.data = result as PagedRequestResult<WorkItem>;
          this.dataSubject.next(this.data.data);
          this.rowCountSubject.next(this.data.rowCount);
      });
  }
}
