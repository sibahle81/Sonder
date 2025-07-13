import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CampaignService } from 'projects/admin/src/app/campaign-manager/shared/services/campaign-service';
import { Campaign } from 'projects/admin/src/app/campaign-manager/shared/entities/campaign';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';

export class CampaignSearchDataSource extends PagedDataSource<Campaign> {

    constructor(
        private readonly campaignService: CampaignService) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'Name', sortDirection: string = 'asc', query: string = '') {
        this.loadingSubject.next(true);

        this.campaignService.searchCampaigns(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.data = result as PagedRequestResult<Campaign>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }ng 

}
