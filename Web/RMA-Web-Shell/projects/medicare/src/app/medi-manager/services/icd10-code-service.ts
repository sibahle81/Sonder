import { Injectable } from '@angular/core';
import { ICD10CodeEntity } from 'projects/claimcare/src/app/claim-manager/shared/entities/icd10-code-model';
import { EventTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/event-type-enum';
import { ICD10CodeModel } from 'projects/shared-components-lib/src/lib/icd10-code-filter-dialog/icd10-code-model';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';
import { ICD10Category } from '../models/icd10-category';
import { ICD10Code } from '../models/icd10-code';
import { ICD10DiagnosticGroup } from '../models/icd10-diagnostic-group';
import { ICD10SubCategory } from '../models/icd10-sub-category';


@Injectable({
  providedIn: 'root'
})
export class ICD10CodeService {
  private apiUrlMedicare = 'med/api/ICD10Code';

  constructor(
    private readonly commonService: CommonService) {
  }

  filterICD10Code(filter: string): Observable<ICD10CodeModel[]> {
    return this.commonService.getAll<ICD10CodeModel[]>(`${this.apiUrlMedicare}/FilterICD10Code/${filter}`);
  }

  getICD10CodeById(icd10CodeId: number): Observable<ICD10Code> {
    return this.commonService.getAll<ICD10Code>(`${this.apiUrlMedicare}/GetICD10CodeById/${icd10CodeId}`);
  }

  getICD10SubCategoriesByEventTypeDRGAndCategory(model: ICD10CodeEntity): Observable<ICD10SubCategory[]> {
    return this.commonService.postGeneric<ICD10CodeEntity, ICD10SubCategory[]>(`${this.apiUrlMedicare}/GetICD10SubCategoriesByEventTypeDRGAndCategory`, model);
  }

  getICD10DiagonosticGroupsByEventType(eventType: EventTypeEnum): Observable<ICD10DiagnosticGroup[]> {
    return this.commonService.getAll<ICD10DiagnosticGroup[]>(`${this.apiUrlMedicare}/GetICD10DiagonosticGroupsByEventType/${eventType}`);
  }

  getICD10CategoriesByEventTypeAndDiagnosticGroup(model: ICD10CodeEntity): Observable<ICD10Category[]> {
    return this.commonService.postGeneric<ICD10CodeEntity, ICD10Category[]>(`${this.apiUrlMedicare}/GetICD10CategoriesByEventTypeAndDiagnosticGroup`, model);
  }

  getICD10CodesByEventTypeDRGAndSubCategory(model: ICD10CodeEntity): Observable<ICD10Code[]> {
    return this.commonService.postGeneric<ICD10CodeEntity, ICD10Code[]>(`${this.apiUrlMedicare}/GetICD10CodesByEventTypeDRGAndSubCategory`, model);
  }

  searchICD10Codes(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string, subCategoryId: number, eventType: EventTypeEnum): Observable<PagedRequestResult<ICD10Code>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ICD10Code>>(`${this.apiUrlMedicare}/SearchICD10Codes/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${subCategoryId}/${eventType}/${urlQuery}`);
  }

  getICD10SubCategoriesByEventType(eventType: EventTypeEnum): Observable<ICD10SubCategory[]> {
    return this.commonService.getAll<ICD10SubCategory[]>(`${this.apiUrlMedicare}/GetICD10SubCategoriesByEventType/${eventType}`);
  }

  getICD10Codes(icd10CodeIds: string): Observable<ICD10Code[]> {
    return this.commonService.getAll<ICD10Code[]>(`${this.apiUrlMedicare}/GetICD10Codes/${icd10CodeIds}`);
  }

  pagedICD10CodeClaims(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, eventType: EventTypeEnum, query: string): Observable<PagedRequestResult<ICD10Code>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ICD10Code>>(`${this.apiUrlMedicare}/PagedICD10CodeClaims/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${eventType}/${urlQuery}`);
  }

  getICD10CodesDescription(icd10CodesLines: string[]): Observable<ICD10Code[]> {
    const url = `${this.apiUrlMedicare}/GetICD10CodesDescription`;
    return this.commonService.postGeneric<string[], ICD10Code[]>(url, icd10CodesLines);
  }

  getICD10SubCategoryListByEventType(eventType: EventTypeEnum): Observable<ICD10SubCategory[]> {
    return this.commonService.getAll<ICD10SubCategory[]>(`${this.apiUrlMedicare}/GetICD10SubCategoryListByEventType/${eventType}`);
  }

  getPagedICD10SubCategories(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<ICD10SubCategory>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<ICD10SubCategory>>(`${this.apiUrlMedicare}/GetPagedICD10SubCategories/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  CheckICD10CodeMatchInjurygrouping( icd10Codes: string, personEventId: number, healthCareProviderId: number): Observable<{icD10Code: string, isClinicalCode:boolean, isCauseCode:boolean, isValid:boolean, description: string}[]> {
    return this.commonService.getAll<{icD10Code: string, isClinicalCode:boolean, isCauseCode:boolean, isValid:boolean, description: string}[]>(`${this.apiUrlMedicare}/CheckICD10CodeMatchInjurygrouping/${icd10Codes}/${personEventId}/${healthCareProviderId}`);
  }
}
