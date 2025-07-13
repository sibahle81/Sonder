import { Injectable } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { Announcement } from 'projects/shared-models-lib/src/lib/common/announcement';
import { AnnouncementService } from 'projects/shared-services-lib/src/lib/services/announcement/announcement.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';

@Injectable()
export class AnnouncementsDataSource extends PagedDataSource<Announcement> {

    constructor(
        private readonly announcementService: AnnouncementService
    ) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'name', sortDirection: string = 'asc') {
        this.loadingSubject.next(true);

        this.announcementService.getPagedAnnouncements(pageNumber, pageSize, orderBy, sortDirection).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.data = result as PagedRequestResult<Announcement>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }
}
