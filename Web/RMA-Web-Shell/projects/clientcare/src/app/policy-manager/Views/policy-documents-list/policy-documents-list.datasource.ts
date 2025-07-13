import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { PolicyDocumentService } from '../../shared/Services/policy-document.service';
import { RequiredDocumentService } from 'projects/admin/src/app/configuration-manager/shared/required-document.service';
import { UploadDocument } from '../../shared/entities/upload-documents';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class PolicyDocumentsListDataSource extends Datasource {


    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,

        private readonly policyDocumentService: PolicyDocumentService,
        private readonly requiredDocumentService: RequiredDocumentService) {
        super(appEventsManager, alertService);
    }

    getData(policyId: number) {
        this.isLoading = true;
        this.processData(policyId);
    }

    connect(): Observable<UploadDocument[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            if (this.filteredData != null) {
            this.filteredData = this.data.slice().filter((item: UploadDocument) => {
                const searchStr = (item.name + item.requiredDocumentName + item.createdBy).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());
            return sortedData;
        }}));
    }


    processData(policyId: number): any {
        if (!policyId) { return; }
        this.policyDocumentService.getPolicyDocuments(policyId).subscribe(documents => {
            this.requiredDocumentService.getRequiredDocuments().subscribe(requiredDocs => {
                documents.forEach(doc => {
                    const requiredDocument = requiredDocs.find(rDoc => rDoc.id === doc.requiredDocumentId);
                    doc.requiredDocumentName = requiredDocument ? requiredDocument.name : 'N/a';
                });
                this.isLoading = false;
                this.dataChange.next(documents);
            });
        });
    }
}
