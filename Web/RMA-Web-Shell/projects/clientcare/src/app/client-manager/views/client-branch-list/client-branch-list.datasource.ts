import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { BranchService } from '../../shared/services/branch.service';
import { Branch } from '../../shared/Entities/branch';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { map } from 'rxjs/operators';

@Injectable()
export class ClientBranchListDatasource extends Datasource {
    branches: Branch[];

    constructor(
        private readonly appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly branchService: BranchService) {
        super(appEventsManager, alertService);
    }

    getData(clientId: number): void {
        if (clientId == null || clientId === 0) {
            this.isLoading = false;
            return;
        }

        this.branchService.getBranchesByClient(clientId).subscribe(
            branches => {
                this.branches = branches;
                this.isLoading = false;
                this.dataChange.next(branches);
            });
    }

    connect(): Observable<Branch[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Branch) => {

                const searchStr = (item.name ).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
