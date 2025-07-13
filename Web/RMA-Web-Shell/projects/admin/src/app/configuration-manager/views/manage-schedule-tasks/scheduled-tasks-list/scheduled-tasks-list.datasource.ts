import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { DatePipe } from '@angular/common';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { map } from 'rxjs/operators';
import { ScheduledTasksService } from '../../../shared/scheduled-task.service';
import { ScheduledTask } from '../../../shared/scheduled-task';

@Injectable()
export class ScheduledTasksDataSource extends Datasource {

    owner: string = null;
    constructor(
        private readonly alertService: AlertService,
        appEventsManager: AppEventsManager,
        private readonly scheduledTasksService: ScheduledTasksService,
        private readonly datePipe: DatePipe,
    ) {
        super(appEventsManager, alertService);
        this.defaultSortColumn = 'name';
    }

    getData() {
        this.startLoading('Loading scheduled tasks...');

        this.loadScheduledTasks();
    }

    loadScheduledTasks(): void {
        this.scheduledTasksService.getScheduledTasks().subscribe(
            data => {
                console.log(data);
                this.dataChange.next(data);
                this.stopLoading();
            },
            error => {
                this.showError(error);
            }
        );
    }

    connect(): Observable<ScheduledTask[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];
        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: ScheduledTask) => {
                const searchStr = (item.scheduledTaskType.description).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });
            const sortedData = this.getSortedData(this.filteredData.slice());
            return sortedData;
        }));
    }
}
