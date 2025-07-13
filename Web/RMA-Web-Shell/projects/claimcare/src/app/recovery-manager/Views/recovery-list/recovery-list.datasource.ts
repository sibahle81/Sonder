import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { map } from 'rxjs/operators';
import { ClaimCareService } from '../../../claim-manager/Services/claimcare.service';
import { ClaimsRecoveryModel } from '../../shared/entities/claims-recovery-model';
import { User } from 'projects/shared-models-lib/src/lib/security/user';

@Injectable()
export class RecoveryListDatasource extends Datasource {
    filterOnLinkedItemId: number;
    parameter: string;
    claimsRecoveries: ClaimsRecoveryModel[];
    hasData = false;
    recoveryId = 0;

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly claimService: ClaimCareService) {
        super(appEventsManager, alertService);
    }

    getData(currentUser: User): void {
        this.startLoading(`Loading Recoveries for ${currentUser.name}...`);

        // Get method then call the below
        this.claimService.getAssessorRecoveries(currentUser.email).subscribe(
            data => {
                this.claimsRecoveries = data;
                this.dataChange.next(data);
                this.stopLoading();
                this.hasData = true;
            },
            error => {
                this.showError(error);
            }
        );
    }

    getLegalRecoveries(currentUser: User, workPoolId: number): void {
        this.startLoading(`Loading Recoveries for ${currentUser.name}...`);

        // Get method then call the below
        this.claimService.getLegalRecoveries(workPoolId).subscribe(
            data => {
                this.claimsRecoveries = data;
                this.dataChange.next(data);
                this.stopLoading();
                this.hasData = true;
            },
            error => {
                this.showError(error);
            }
        );
    }

    connect(): Observable<ClaimsRecoveryModel[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: ClaimsRecoveryModel) => {
                const searchStr = '';
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
