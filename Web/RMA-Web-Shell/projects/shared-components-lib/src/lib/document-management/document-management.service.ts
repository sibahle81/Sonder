import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Document } from './document';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { DocumentsRequest } from './documents-request';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentType } from 'projects/shared-models-lib/src/lib/common/document-type';
import { AdditionalDocument } from './additional-document';
import { MailAttachment } from 'projects/shared-services-lib/src/lib/services/email-request/email-attachment';
import { DocumentSetDocumentType } from 'projects/shared-models-lib/src/lib/common/document-set-document-type';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { GenericDocument } from '../models/generic-document';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';

@Injectable()
export class DocumentManagementService {

  private DocumentIndexApiUrl = 'scn/api/Document/Document';
  private ClaimCareApiUrl = 'clm/api/claim';
  private apiUrlInvoice = 'med/api/Invoice';
  private policyDocumentApiUrl = 'clc/api/Policy/PolicyDocument';

  constructor(
    private readonly commonService: CommonService) {
  }

  GetDocumentsBySetAndKey(documentRequest: DocumentsRequest): Observable<Document[]> {
    return this.commonService.postGeneric<DocumentsRequest, Document[]>(`${this.DocumentIndexApiUrl}/GetDocumentsBySetAndKey`, documentRequest);
  }

  GetDocumentBinary(docId: number): Observable<Document> {
    return this.commonService.get<Document>(docId, `${this.DocumentIndexApiUrl}/GetDocumentBinary`);
  }

  UploadDocument(document: Document): Observable<Document> {
    return this.commonService.postGeneric<Document, Document>(`${this.DocumentIndexApiUrl}/SaveUpload`, document);
  }

  UpdateDocument(documents: Document): Observable<boolean> {
    return this.commonService.edit<Document>(documents, `${this.DocumentIndexApiUrl}/UpdateDocument`);
  }

  GetAllDocumentsTypeNotInDocuments(documentsSet: DocumentSetEnum): Observable<DocumentType[]> {
    return this.commonService.get<DocumentType[]>(documentsSet, `${this.DocumentIndexApiUrl}/GetAllDocumentsTypeNotInDocuments`);
  }

  AddAdditionalDocuments(additionalDocument: AdditionalDocument): Observable<boolean> {
    return this.commonService.postGeneric<AdditionalDocument, boolean>(`${this.ClaimCareApiUrl}/RequestAdditionalDocuments`, additionalDocument);
  }

  OutstandingDocuments(documentRequest: DocumentsRequest): Observable<Document[]> {
    return this.commonService.postGeneric<DocumentsRequest, Document[]>(`${this.DocumentIndexApiUrl}/GetAllDocumentsNotRecieved`, documentRequest);
  }

  RequestOutstandingDocuments(additionalDocument: AdditionalDocument): Observable<boolean> {
    return this.commonService.postGeneric<AdditionalDocument, boolean>(`${this.ClaimCareApiUrl}/RequestOutstandingDocuments`, additionalDocument);
  }

  GetDocumentsToDownload(documentTypeId: number): Observable<MailAttachment[]> {
    return this.commonService.getAll<MailAttachment[]>(`${this.ClaimCareApiUrl}/GetDocumentsToDownload/${documentTypeId}`);
  }

  DownloadAdditionalDocumentEmailTemplate(additionalDocument: AdditionalDocument): Observable<MailAttachment> {
    return this.commonService.postGeneric<AdditionalDocument, MailAttachment>(`${this.ClaimCareApiUrl}/DownloadAdditionalDocumentEmailTemplate`, additionalDocument);
  }

  GetDocumentsTypesByDocumentSet(documentsSet: DocumentSetEnum): Observable<DocumentSetDocumentType[]> {
    return this.commonService.get<DocumentSetDocumentType[]>(documentsSet, `${this.DocumentIndexApiUrl}/GetDocumentsTypeByDocumentSet`);
  }

  GetCombinedDocumentsTypeByDocumentSet(documentsSet1: DocumentSetEnum, documentsSet2: DocumentSetEnum): Observable<DocumentSetDocumentType[]>{
    return this.commonService.getAll<DocumentSetDocumentType[]>(`${this.DocumentIndexApiUrl}/GetCombinedDocumentsTypeByDocumentSet/${documentsSet1}/${documentsSet2}`);
  }

  GetDocumentTypesBySetId(documentsSet: DocumentSetEnum): Observable<DocumentType[]> {
    return this.commonService.get<DocumentType[]>(documentsSet, `${this.DocumentIndexApiUrl}/GetDocumentTypeBySetId`);
  }

  GetDocumentById(documentId: number): Observable<Document> {
    return this.commonService.get<Document>(documentId, `${this.DocumentIndexApiUrl}/GetDocumentById`);
  }

  GetDocumentTypeTemplateForPersonEvent(docTypeId: number,personEventId: number): Observable<MailAttachment[]> {
    return this.commonService.getByIds<MailAttachment[]>(docTypeId, personEventId, `${this.ClaimCareApiUrl}/GetDocumentTypeTemplateForPersonEvent`);
  }

  AutoReinstateMedicalInvoice(invoiceId: number, tebaInvoiceId: number, personEventId: number): Observable<boolean> {
    return this.commonService.getAll(`${this.apiUrlInvoice}/AutoReinstateMedicalInvoice/${invoiceId}/${tebaInvoiceId}/${personEventId}`);
  }

  getPagedDocumentsByKey(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<GenericDocument>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<GenericDocument>>(`${this.DocumentIndexApiUrl}/GetPagedDocumentsByKey/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getDocumentsByKey(keyName: string, keyValue: string): Observable<GenericDocument[]> {
    return this.commonService.getAll<GenericDocument[]>(`${this.DocumentIndexApiUrl}/GetDocumentsByKey/${keyName}/${keyValue}`);
  }

  updateDocumentGeneric(documents: GenericDocument): Observable<boolean> {
    return this.commonService.postGeneric<GenericDocument, boolean>(`${this.DocumentIndexApiUrl}/UpdateDocumentGeneric`, documents);
  }

  createPolicyWelcomePack(policyNumber: string): Observable<boolean> {
    const url = `${this.policyDocumentApiUrl}/CreatePolicyWelcomePack/${policyNumber}`;
    return this.commonService.getAll(url);
  }

  refreshPolicyDocument(policyNumber: string, documentType: number, documentRefreshReasonId: number): Observable<boolean> {
    const url = `${this.policyDocumentApiUrl}/RefreshPolicyDocument/${policyNumber}/${documentType}/${documentRefreshReasonId}`;
    return this.commonService.getAll(url);
  }
}
