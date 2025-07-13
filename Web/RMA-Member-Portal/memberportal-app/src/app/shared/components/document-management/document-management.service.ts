import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { DocumentSetEnum } from '../../enums/document-set.enum';
import { AdditionalDocument } from '../../models/additional-document.model';
import { DocumentsRequest } from '../../models/documents-request.model';
import { MailAttachment } from '../../models/email-attachment.model';

import { Document } from 'src/app/shared/components/document-management/document';
import { DocumentType } from 'src/app/shared/common//document-type';
import { GenericDocument } from '../../models/generic-document';


@Injectable()
export class DocumentManagementService {
  private DocumentIndexApiUrl = 'scn/api/Document/Document';
  private ClaimCareApiUrl = 'clm/api/claim';
  constructor(
    private readonly commonService: CommonService) {
  }

  GetDocumentsBySetAndKey(documentRequest: DocumentsRequest): Observable<Document[]> {
    return this.commonService.GetDocumentsBySetAndKey<DocumentsRequest, Document[]>(`${this.DocumentIndexApiUrl}/GetDocumentsBySetAndKey`, documentRequest);
  }

  GetDocumentBinary(docId: number): Observable<Document> {
    return this.commonService.get<Document>(docId, `${this.DocumentIndexApiUrl}/GetDocumentBinary`);
  }

  UploadDocument(document: Document): Observable<Document> {
    return this.commonService.UploadDocument<Document>(document, `${this.DocumentIndexApiUrl}/SaveUploadMemberPortal`);
  }

  UpdateDocument(documents: Document): Observable<boolean> {
    return this.commonService.edit<Document>(documents, `${this.DocumentIndexApiUrl}/UpdateDocument`);
  }

  GetAllDocumentsTypeNotInDocuments(documentsSet: DocumentSetEnum): Observable<DocumentType[]> {
    return this.commonService.get<DocumentType[]>(documentsSet, `${this.DocumentIndexApiUrl}/GetAllDocumentsTypeNotInDocuments`);
  }

  AddAdditionalDocuments(additionalDocument: AdditionalDocument): Observable<boolean> {
    return this.commonService.addReturnsBoolean<AdditionalDocument>(additionalDocument, `${this.ClaimCareApiUrl}/RequestAdditionalDocuments`);
  }

  OutstandingDocuments(documentRequest: DocumentsRequest): Observable<Document[]> {
    return this.commonService.GetDocumentsBySetAndKey<DocumentsRequest, Document[]>(`${this.DocumentIndexApiUrl}/GetAllDocumentsNotRecieved`, documentRequest);
  }

  RequestOutstandingDocuments(additionalDocument: AdditionalDocument): Observable<boolean> {
    return this.commonService.addReturnsBoolean<AdditionalDocument>(additionalDocument, `${this.ClaimCareApiUrl}/RequestOutstandingDocuments`);
  }

  GetDocumentsToDownload(documentTypeId: number): Observable<MailAttachment[]> {
    return this.commonService.getAll<MailAttachment[]>(`${this.ClaimCareApiUrl}/GetDocumentsToDownload/${documentTypeId}`);
  }

  DownloadAdditionalDocumentEmailTemplate(additionalDocument: AdditionalDocument): Observable<MailAttachment> {
    return this.commonService.postReturnObject<MailAttachment>(`${this.ClaimCareApiUrl}/DownloadAdditionalDocumentEmailTemplate`, additionalDocument);
  }

  getDocumentsByKey(keyName: string, keyValue: string): Observable<GenericDocument[]> {
    return this.commonService.getAll<GenericDocument[]>(`${this.DocumentIndexApiUrl}/GetDocumentsByKey/${keyName}/${keyValue}`);
  }

  getDocumentTypesBySetId(documentsSet: DocumentSetEnum): Observable<DocumentType[]> {
    return this.commonService.get<DocumentType[]>(documentsSet, `${this.DocumentIndexApiUrl}/GetDocumentTypeBySetId`);
  }

  updateDocumentGeneric(documents: GenericDocument): Observable<boolean> {
    return this.commonService.postGeneric<GenericDocument, boolean>(`${this.DocumentIndexApiUrl}/UpdateDocumentGeneric`, documents);
  }
}
