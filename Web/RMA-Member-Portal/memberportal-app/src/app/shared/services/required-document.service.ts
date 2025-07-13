import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { ConstantApi } from '../constants/constant';
import { DocumentCategory } from '../models/document-category';
import { DocumentCategoryType } from '../models/document-category-type';
import { RequiredDocument } from '../models/required-document';


@Injectable()
export class RequiredDocumentService {

  constructor(
    private readonly commonService: CommonService) {
  }

  getRequiredDocument(id: any): Observable<RequiredDocument> {
    return this.commonService.get<RequiredDocument>(id, ConstantApi.RequiredDocumentApi);
  }

  getRequiredDocuments(): Observable<RequiredDocument[]> {
    return this.commonService.getAll<RequiredDocument[]>(ConstantApi.RequiredDocumentApi);
  }

  addRequiredDocument(requiredDocument: RequiredDocument): Observable<number> {
    return this.commonService.add<RequiredDocument>(requiredDocument, ConstantApi.RequiredDocumentApi);
  }

  editRequiredDocument(requiredDocument: RequiredDocument): Observable<boolean> {
    return this.commonService.edit<RequiredDocument>(requiredDocument, ConstantApi.RequiredDocumentApi);
  }

  deleteRequiredDocument(requiredDocument: RequiredDocument): Observable<boolean> {
    return this.commonService.remove(requiredDocument.id, ConstantApi.RequiredDocumentApi);
  }

  getDocumentCategories(): Observable<DocumentCategory[]> {
    return this.commonService.getAll<DocumentCategory[]>(ConstantApi.DocumentCategoryApi);
  }

  getDocumentCategoryTypes(): Observable<DocumentCategoryType[]> {
    return this.commonService.getAll<DocumentCategoryType[]>(ConstantApi.DocumentCategoryTypeApi);
  }

  generateDocumentNumber(documentNumberType: string): Observable<string> {
    const now = new Date();
    const api = `${ConstantApi.GenerateDocumentApi}/GenerateCode?documentNumberType=${documentNumberType}&identifier=${now.getTime()}`;
    return this.commonService.getString(api);
  }
}
