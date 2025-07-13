import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { RequiredDocument } from './required-document';
import { DocumentCategory } from './document-category';
import { DocumentCategoryType } from './document-category-type';

@Injectable()
export class RequiredDocumentService {

  private apiUrl = 'mdm/api/DocumentCategory';
  private apiRequiredUrl = 'mdm/api/RequiredDocument';
  private apiDocCategoryTypedUrl = 'mdm/api/DocumentCategoryType';
  private apiGenerateDocumentUrl = 'mdm/api/GenerateDocument';
  constructor(
    private readonly commonService: CommonService) {
  }

  getRequiredDocument(id: any): Observable<RequiredDocument> {
    return this.commonService.get<RequiredDocument>(id, this.apiRequiredUrl);
  }

  getRequiredDocuments(): Observable<RequiredDocument[]> {
    return this.commonService.getAll<RequiredDocument[]>(this.apiRequiredUrl);
  }

  addRequiredDocument(requiredDocument: RequiredDocument): Observable<number> {
    return this.commonService.postGeneric<RequiredDocument, number>(this.apiRequiredUrl, requiredDocument);
  }

  editRequiredDocument(requiredDocument: RequiredDocument): Observable<boolean> {
    return this.commonService.edit<RequiredDocument>(requiredDocument, this.apiRequiredUrl);
  }

  deleteRequiredDocument(requiredDocument: RequiredDocument): Observable<boolean> {
    return this.commonService.remove(requiredDocument.id, this.apiRequiredUrl);
  }

  getDocumentCategories(): Observable<DocumentCategory[]> {
    return this.commonService.getAll<DocumentCategory[]>(this.apiUrl);
  }

  getDocumentCategoryTypes(): Observable<DocumentCategoryType[]> {
    return this.commonService.getAll<DocumentCategoryType[]>(this.apiDocCategoryTypedUrl);
  }

  generateDocumentNumber(documentNumberType: string): Observable<string> {
    const now = new Date();
    const api = `${this.apiGenerateDocumentUrl}/GenerateCode?documentNumberType=${documentNumberType}&identifier=${now.getTime()}`;
    return this.commonService.getString(api);
  }
}
