import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UploadDocument } from '../entities/upload-documents';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

@Injectable()
export class PolicyDocumentService {

    private apiPolicyDocument = 'clc/api/Policy/PolicyDocument';

    constructor(
        private readonly commonService: CommonService) {
    }

    addDocument(document: UploadDocument): Observable<number> {
        const apiUrl = this.commonService.getApiUrl( `${this.apiPolicyDocument}`);

        return this.commonService.postGeneric<UploadDocument, number>(apiUrl, document);
    }

    deleteDocuments(id: number): Observable<boolean> {
        return this.commonService.remove(id, `${this.apiPolicyDocument}`);
    }

    getPolicyDocuments(id: number): Observable<UploadDocument[]> {
        return this.commonService.get<UploadDocument[]>(id, `${this.apiPolicyDocument}`);
    }
}
