import { Injectable } from '@angular/core';
import { Observable, merge, of } from 'rxjs';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { map } from 'rxjs/operators';
import { ValidityChecksService } from './validity-checks.service';
import { ValidityCheckType } from 'projects/shared-models-lib/src/lib/enums/validity-check-type.enum';
import { ValidityCheckSet } from 'projects/shared-models-lib/src/lib/common/validity-checkset';
import { ValidityChecksetRequest } from 'projects/shared-models-lib/src/lib/common/validity-checkset-request';
import { ValidityCheckCategory } from 'projects/shared-models-lib/src/lib/common/validity-check-category';

@Injectable()
export class ValidityChecksDatasource extends Datasource {
    statusMsg: string;
    checksFound = false;

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly validityChecksService: ValidityChecksService
    ) {
        super(appEventsManager, alertService);
    }

    getData(validityChecksetRequest: ValidityChecksetRequest): void {
        this.isLoading = true;
        this.statusMsg = 'Loading ' + validityChecksetRequest.checkType + ' checks ...';
        this.validityChecksService.getValidityCheckCategories(validityChecksetRequest.checkType).subscribe(
            data => {
                let validityCheckCategories: ValidityCheckCategory[] = [];
                if (!validityChecksetRequest.isReadonly) {
                    validityCheckCategories = data;
                    validityCheckCategories.forEach(category => {
                        category.validityCheckSets.forEach(validityCheck => {
                    if (validityChecksetRequest.selectedChecksetIds.indexOf(validityCheck.id) >= 0) {
                        validityCheck.isChecked = true;
                    } else {
                        validityCheck.isChecked = false;
                    }
                });
                });
                } else {
                    let categoryForModel: ValidityCheckCategory;
                    let validityChecksetForModel: ValidityCheckSet;
                    data.forEach(category => {
                        categoryForModel = new ValidityCheckCategory();
                        categoryForModel.validityCheckSets = [];
                        category.validityCheckSets.forEach(validityCheck => {
                        if (validityChecksetRequest.modelChecksetIds.indexOf(validityCheck.id) >= 0) {
                            validityChecksetForModel = new ValidityCheckSet();
                            validityChecksetForModel.description = validityCheck.description;
                            validityChecksetForModel.tooltip = validityCheck.tooltip;
                            if (validityChecksetRequest.selectedChecksetIds.indexOf(validityCheck.id) >= 0) {
                             validityChecksetForModel.isChecked = true;
                        } else {
                            validityChecksetForModel.isChecked = false;
                        }
                            categoryForModel.validityCheckSets.push(validityChecksetForModel);
                    }
                    });
                        validityCheckCategories.push(categoryForModel);
                    });
                }

                let totalValidityChecks = 0;
                validityCheckCategories.forEach(x => {
                  totalValidityChecks += x.validityCheckSets.length;
                });
                this.checksFound = totalValidityChecks > 0;

                this.dataChange.next(validityCheckCategories);
                this.stopLoading();
                this.statusMsg = '';
            });
    }

    connect(): Observable<ValidityCheckSet[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: ValidityCheckSet) => {

                const searchStr = (item.description).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
