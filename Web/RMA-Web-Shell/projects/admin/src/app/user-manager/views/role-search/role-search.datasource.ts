import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { RoleService } from 'projects/shared-services-lib/src/lib/services/security/role/role.service';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { map } from 'rxjs/operators';

@Injectable()
export class RoleSearchDataSource extends Datasource {

    constructor(
        private readonly appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly roleService: RoleService) {
        super(appEventsManager, alertService);
        this.isLoading = false;
    }

    clearData(): void {
        this.dataChange.next(new Array());
    }

    getData(query: string): void {
        this.isLoading = true;
        this.roleService.searchRoles(query).subscribe(roles => {
            this.dataChange.next(roles);
            this.isLoading = false;
        });
    }

    connect(): Observable<Role[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Role) => {
                const searchStr = item.name.toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
