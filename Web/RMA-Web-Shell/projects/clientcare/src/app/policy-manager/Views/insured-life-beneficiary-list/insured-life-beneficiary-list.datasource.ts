import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { BeneficiaryService } from '../../shared/Services/beneficiary.service';
import { Beneficiary } from '../../shared/entities/beneficiary';
import { map } from 'rxjs/operators';

@Injectable()
export class InsuredLifeBeneficiaryListDatasource extends Datasource {

    constructor(
        private readonly appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly beneficiaryService: BeneficiaryService) {
        super(appEventsManager, alertService);
    }

    getData(insuredLifeId: any): void {
        if (insuredLifeId == null || insuredLifeId === 0) { return; }

        this.beneficiaryService.getBeneficiariesByInsuredLife(insuredLifeId).subscribe(
            data => {
                this.isLoading = false;
                this.dataChange.next(data);
            },
            error => this.showError(error)
        );
    }

    connect(): Observable<Beneficiary[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.renderedData = this.getSortedData(this.data);
            return this.renderedData;
        }));
    }
}
