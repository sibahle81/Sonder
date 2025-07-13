import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { Datasource } from 'src/app/shared-utilities/datasource/datasource';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Wizard } from '../../shared/models/wizard';
import { WizardService } from '../../shared/services/wizard.service';

@Injectable()
export class UserWizardListDatasource extends Datasource {
    filterOnLinkedItemId: number;
    parameter: string;

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly wizardService: WizardService) {
        super(appEventsManager, alertService);
    }

    getData(wizardConfigIds: string, linkedItemId?: number): void {
        this.startLoading('  ...loading your tasks...please wait');
        this.isLoading = true;

        this.wizardService.getUserWizards(wizardConfigIds, false).subscribe(
            data => {
                data.forEach(item => {
                    if (item.createdDate == item.modifiedDate) {
                        item.wizardStatusText = 'New';
                    }
                });
                if (linkedItemId > 0) {
                    const values = data.filter(a => a.linkedItemId == linkedItemId); // Please leave the double equals as is
                    this.dataChange.next(values);
                } else {
                    this.dataChange.next(data);
                }

                this.stopLoading();
                this.isLoading = false;
            });
    }

    connect(): Observable<Wizard[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Wizard) => {
                const searchStr = (item.name + item.type + item.createdBy + item.wizardStatusText).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
