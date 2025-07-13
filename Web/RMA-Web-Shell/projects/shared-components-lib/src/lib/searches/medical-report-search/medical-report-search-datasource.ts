import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';

export class MedicalReportSearchDataSource extends PagedDataSource<MedicalReportForm> {

    claimId: number;
    healthCareProviderId: number;

    constructor(
        private readonly medicalFormService: MedicalFormService
    ) {        
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'medicalReportFormId', sortDirection: string = 'asc', searchTerm: string) {
        this.loadingSubject.next(true);

        this.claimId = this.claimId ? this.claimId : 0;
        this.healthCareProviderId = this.healthCareProviderId ? this.healthCareProviderId : 0;

        this.medicalFormService.getPagedMedicalReports(searchTerm, pageNumber, pageSize, orderBy, sortDirection, this.claimId, this.healthCareProviderId).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.data = result as PagedRequestResult<MedicalReportForm>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }
}
