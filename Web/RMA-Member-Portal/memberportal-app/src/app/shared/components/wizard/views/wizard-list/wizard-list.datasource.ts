import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { Datasource } from 'src/app/shared-utilities/datasource/datasource';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Wizard } from '../../shared/models/wizard';
import { WizardStatus } from '../../shared/models/wizard-status.enum';
import { WizardService } from '../../shared/services/wizard.service';

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
                const openWizards = data.filter(wizard => wizard.wizardStatusId === WizardStatus.InProgress
                    || wizard.wizardStatusId === WizardStatus.AwaitingApproval);
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
