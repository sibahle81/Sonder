import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { UploadFile } from './upload-file.class';
import { Document } from '../document-management/document';
import { DocumentSet } from 'projects/shared-models-lib/src/lib/common/DocumentSet';

/** @description The upload service manages uploads. */
@Injectable()
export class UploadService {
    private apiUrl = 'mdm/api/Uploads';
    private DocumentIndexApiUrl = 'scn/api/Document/Document';

    constructor(
        private readonly commonService: CommonService) {
    }

    GetDocumentsBySetAndKey(docSetId: number, keys: any): Observable<DocumentSet> {
        return this.commonService.getBy<DocumentSet>(docSetId, keys, `${this.DocumentIndexApiUrl}/GetDocumentsBySetAndKey`);
    }

    GetDocumentBinary(docId: number, DocUri: any): Observable<DocumentSet> {
        return this.commonService.getBy<DocumentSet>(docId, DocUri, `${this.DocumentIndexApiUrl}/GetDocumentBinary`);
    }

    uploadFile(filesFormData: FormData): Observable<UploadFile[]> {
        return this.commonService.postGeneric<FormData, UploadFile[]>(`${this.apiUrl}/SaveUpload`, filesFormData);
    }

    SaveDocumentBinary(filesFormData: FormData): Observable<Document[]> {
        return this.commonService.SaveDocumentBinary<Document[]>(filesFormData, `${this.DocumentIndexApiUrl}/SaveBinary`);
    }

    deleteFile(file: UploadFile) {
        return this.commonService.remove(file.id, this.apiUrl);
    }


    // Below methods are old methods, needs to be deleted
    /**
     * @description Upload files using the form Data object
     */
    uploadFileText(filesFormData: FormData): Observable<UploadFile[]> {
        return this.commonService.postGeneric<FormData, UploadFile[]>(`${this.apiUrl}/SaveUpload`, filesFormData);
    }
    /**
     * @description Get the Raw Formta for the upoaded files
     */
    getUploadFile(token: any): Observable<UploadFile> {
        return this.commonService.get<UploadFile>(token, `${this.apiUrl}/ByToken`);
    }

    getUploadFileData(token: any): Observable<UploadFile> {
        return this.commonService.getAll<UploadFile>(`${this.apiUrl}/Object/${token}/true`);
    }

    getFileInformation(token: any): Observable<UploadFile> {
        return this.commonService.get<UploadFile>(token, `${this.apiUrl}/Token`);
    }

}
