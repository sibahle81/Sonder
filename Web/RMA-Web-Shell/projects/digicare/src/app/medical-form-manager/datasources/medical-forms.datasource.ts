import { Injectable } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { MedicalReportFormDetail } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form-detail';
import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';

@Injectable()
export class MedicalFormsDataSource extends PagedDataSource<MedicalReportFormDetail> {

    constructor(
        private readonly medicalFormService: MedicalFormService
    ) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'medicalReportFormId', sortDirection: string = 'asc', createdby: string) {
        this.loadingSubject.next(true);

        this.medicalFormService.getPagedMedicalReportFormsByCreatedBy(createdby, pageNumber, pageSize, orderBy, sortDirection).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.data = result as PagedRequestResult<MedicalReportFormDetail>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }
}
