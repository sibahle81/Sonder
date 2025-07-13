import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { DocumentSet } from '../models/document-set.model';
import { UploadFile } from '../models/upload-file.model';
import { ConstantApi } from '../constants/constant';

// import { UploadFile } from '.// upload-file.class';

/** @description The upload service manages uploads. */
@Injectable()
export class UploadService {

    constructor(
        private readonly commonService: CommonService) {
    }

    GetDocumentsBySetAndKey(docSetId: number, keys: any): Observable<DocumentSet> {
        return this.commonService.getBy<DocumentSet>(docSetId, keys, `${ConstantApi.DocumentApiUrl}/GetDocumentsBySetAndKey`);
    }

    GetDocumentBinary(docId: number, DocUri: any): Observable<DocumentSet> {
        return this.commonService.getBy<DocumentSet>(docId, DocUri, `${ConstantApi.DocumentApiUrl}/GetDocumentBinary`);
    }

    uploadFile(filesFormData: FormData): Observable<UploadFile[]> {
        return this.commonService.postFile<UploadFile>(filesFormData, `${ConstantApi.UploadsApiUrl}/SaveUploadMemberPortal`);
    }

    SaveDocumentBinary(filesFormData: FormData): Observable<Document[]> {
        return this.commonService.SaveDocumentBinary<Document[]>(filesFormData, `${ConstantApi.DocumentApiUrl}/SaveBinary`);
    }

    deleteFile(file: UploadFile) {
        return this.commonService.remove(file.id, ConstantApi.UploadsApiUrl);
    }


    // Below methods are old methods, needs to be deleted
    /**
     * @description Upload files using the form Data object
     */
    uploadFileText(filesFormData: FormData): Observable<UploadFile[]> {
        return this.commonService.postFileText<UploadFile>(filesFormData, `${ConstantApi.UploadsApiUrl}/SaveUploadMemberPortal`);
    }
    /**
     * @description Get the Raw Formta for the upoaded files
     */
    getUploadFile(token: any): Observable<UploadFile> {
        return this.commonService.get<UploadFile>(token, `${ConstantApi.UploadsApiUrl}/ByToken`);
    }

    getUploadFileData(token: any): Observable<UploadFile> {
        return this.commonService.getAll<UploadFile>(`${ConstantApi.UploadsApiUrl}/Object/${token}/true`);
    }

    getFileInformation(token: any): Observable<UploadFile> {
        return this.commonService.get<UploadFile>(token, `${ConstantApi.UploadsApiUrl}/Token`);
    }

}
