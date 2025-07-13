import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { Wizard } from '../../shared/models/wizard';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { WizardService } from '../../shared/services/wizard.service';
import { map } from 'rxjs/operators';
import { WizardStatus } from '../../shared/models/wizard-status.enum';

@Injectable()
export class WizardListDatasource extends Datasource {
    parameter: string;

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly wizardService: WizardService) {
        super(appEventsManager, alertService);
    }

    getData(): void {
        this.startLoading('Loading wizards...');
        this.isLoading = true;
        this.wizardService.getWizardsByType(this.parameter).subscribe(
            data => {
                const openWizards = data.filter(wizard => wizard.wizardStatusId === WizardStatus.InProgress || wizard.wizardStatusId === WizardStatus.AwaitingApproval);
                this.dataChange.next(openWizards);
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
                const searchStr = (item.name + item.wizardStatus + item.lockedReason + item.modifiedByDisplayName).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
