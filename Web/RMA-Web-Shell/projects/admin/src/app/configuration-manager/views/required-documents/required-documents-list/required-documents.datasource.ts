import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { RequiredDocument } from '../../../shared/required-document';
import { RequiredDocumentService } from '../../../shared/required-document.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { DatePipe } from '@angular/common';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { map } from 'rxjs/operators';

@Injectable()
export class RequiredDocumentDataSource extends Datasource {

    owner: string = null;
    constructor(
        alertService: AlertService,
        appEventsManager: AppEventsManager,
        private readonly requiredDocumentService: RequiredDocumentService,
        private readonly datePipe: DatePipe,
    ) {
        super(appEventsManager, alertService);
        this.defaultSortColumn = 'name';
    }

    getData() {
        this.startLoading('Loading required documents...');

        this.loadRequiredDocuments();
    }

    loadRequiredDocuments(): void {
        this.requiredDocumentService.getRequiredDocuments().subscribe(
            data => {
                this.dataChange.next(data);
                this.stopLoading();
            },
            error => {
                this.showError(error);
            }
        );
    }


    connect(): Observable<RequiredDocument[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];
        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: RequiredDocument) => {
                const searchStr = (item.name) + (item.module) + (item.documentCategoryName);
                return searchStr.indexOf(this.filter) !== -1;
            });
            const sortedData = this.getSortedData(this.filteredData.slice());
            return sortedData;
        }));
    }
}
