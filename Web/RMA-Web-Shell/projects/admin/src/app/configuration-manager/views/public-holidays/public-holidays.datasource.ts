import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { PublicHoliday } from '../../shared/public-holiday';
import { PublicHolidayService } from '../../shared/public-holiday.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { DatePipe } from '@angular/common';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { map } from 'rxjs/operators';

@Injectable()
export class PublicHolidayDataSource extends Datasource {

    owner: string = null;
    constructor(
        private readonly alertService: AlertService,
        appEventsManager: AppEventsManager,
        private readonly publicHolidayService: PublicHolidayService,
        private readonly datePipe: DatePipe,
    ) {
        super(appEventsManager, alertService);
        this.defaultSortColumn = 'name';
    }

    getData() {
        this.startLoading('Loading public holidays...');

        this.loadAllHolidays();
    }

    loadAllHolidays(): void {
        this.publicHolidayService.getPublicHolidays().subscribe(
            data => {
                this.dataChange.next(data);
                this.stopLoading();
            },
            error => {
                this.showError(error);
            }
        );
    }

    connect(): Observable<PublicHoliday[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];
        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: PublicHoliday) => {
                const searchStr = (item.name).toLowerCase() + this.datePipe.transform(item.holidayDate, 'dd-MM-yyyy');
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });
            const sortedData = this.getSortedData(this.filteredData.slice());
            return sortedData;
        }));
    }
}
