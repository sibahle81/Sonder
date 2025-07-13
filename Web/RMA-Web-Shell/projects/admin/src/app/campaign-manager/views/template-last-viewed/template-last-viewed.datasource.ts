import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { Template } from '../../shared/entities/template';
import { TemplateService } from '../../shared/services/template-service';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { map } from 'rxjs/operators';

@Injectable()
export class TemplateLastViewedDataSource extends Datasource {

    constructor(
        alertService: AlertService,
        appEventsManager: AppEventsManager,
        private readonly templateService: TemplateService
    ) {
        super(appEventsManager, alertService);
        this.defaultSortColumn = 'dateViewed';
        this.defaultSortDirection = 'desc';
    }

    getData() {
        this.startLoading('Loading templates...');
        this.templateService.getLastViewedTemplates().subscribe(
            data => {
                this.dataChange.next(data);
                this.stopLoading();
            },
            error => {
                this.showError(error);
            }
        );
    }

    connect(): Observable<Template[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange
        ];
        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Template) => {
                const searchStr = (`${item.name}|${item.templateType}`).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });
            const sortedData = this.getSortedData(this.filteredData.slice());
            return sortedData;
        }));
    }
}
