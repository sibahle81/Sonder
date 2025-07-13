import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { HealthCareProvider } from '../models/healthCare-provider';

@Injectable({
  providedIn: 'root'
})
export class MediCareService {
  private apiUrl = 'medi/api/medi';
  private apiLookupUrl = 'medi/api/medi/lookup';

  constructor(
    private readonly commonService: CommonService) {
  }

  /* #region fetch methods */


  // public getClaim(claimNumber: string): Observable<Claim> {
  //   const claim = new Claim();
  //   claim.claimId = 23;
  //   claim.fileReferenceNumber = '';
  //   return of(claim);
  //   // return this.commonService.get<Claim>(claimNumber, `${this.apiUrl}/GetClaim`);
  // }

  /*
  filterICD10Code(filter:string):Observable<WorkItemICD10CodeModel[]> {
    return this.commonService.getAll<WorkItemICD10CodeModel[]>(`${this.apiUrl}/FilterICD10Code/${filter}`);
  }

  addCompCareFirstMedicalReport(request:any): Observable<any> {
    return this.commonService.add(request, `${this.apiUrl}/AddCompCareFirstMedicalReport`);
  }

  // Lookup
  getWorkItemTypes(): Observable<WorkItemTypeModel[]> {
    return this.commonService.getAll<WorkItemTypeModel[]>(`${this.apiLookupUrl}/GetWorkItemTypes`);
  }

  getWorkItemState(): Observable<WorkItemStateModel[]> {
    return this.commonService.getAll<WorkItemStateModel[]>(`${this.apiLookupUrl}/GetWorkItemStates`);
  }

  getAllICD10Codes(): Observable<WorkItemICD10CodeModel[]> {
    return this.commonService.getAll<WorkItemICD10CodeModel[]>(`${this.apiLookupUrl}/GetAllICD10Codes`);
  }

  getAllICD10CodeDescriptions(): Observable<string[]> {
    return this.commonService.getAll<string[]>(`${this.apiLookupUrl}/GetAllICD10CodeDescriptions`);
  }

  getAllTreatmentTypes(): Observable<WorkItemTreatmentTypeModel[]> {
    return this.commonService.getAll<WorkItemTreatmentTypeModel[]>(`${this.apiLookupUrl}/GetAllTreatmentTypes`);
  }

  // Non-lookup

  getWorkItem(workItemId:number): Observable<WorkItemModel> {
    return this.commonService.add(workItemId, `${this.apiUrl}/GetWorkItem`);
  }

  getWorkItems(): Observable<WorkItemModel[]> {
    return this.commonService.getAll<WorkItemModel[]>(`${this.apiUrl}/GetWorkItems`);
  }

  //Paging
  getWorkItemsTop(workItemId:number): Observable<WorkItemModel[]> {
    return this.commonService.getAllpot1(workItemId,`${this.apiUrl}/GetWorkItemsTop`);
  }

  getWorkItemType001(workItemId: number): Observable<WorkItemType001Model> {
    return this.commonService.add(workItemId, `${this.apiUrl}/GetWorkItemType001`);
  }

  editWorkItem(workItem: WorkItemModel): Observable<boolean> {
    return this.commonService.edit(workItem, `${this.apiUrl}/EditWorkItem`);
  }

  addWorkItem(workItem: WorkItemModel): Observable<number> {
    return this.commonService.add(workItem, `${this.apiUrl}/AddWorkItem`);
  }

  editWorkItemPatient(patient: WorkItemPersonModel): Observable<any> {
    return this.commonService.edit(patient, `${this.apiUrl}/EditWorkItemPatient`);
  }

  addWorkItemPatient(patient: WorkItemPersonModel): Observable<any> {
    return this.commonService.add(patient, `${this.apiUrl}/AddWorkItemPatient`);
  }

  editWorkItemClaim(claim: WorkItemClaimModel): Observable<any> {
    return this.commonService.edit(claim, `${this.apiUrl}/EditWorkItemClaim`);
  }

  addWorkItemClaim(claim: WorkItemClaimModel): Observable<any> {
    return this.commonService.add(claim, `${this.apiUrl}/AddWorkItemClaim`);
  }

  editWorkItemInjury(injury: WorkItemInjuryModel): Observable<any> {
    return this.commonService.edit(injury, `${this.apiUrl}/EditWorkItemInjury`);
  }

  addWorkItemInjury(injury: WorkItemInjuryModel): Observable<any> {
    return this.commonService.add(injury, `${this.apiUrl}/AddWorkItemInjury`);
  }

  editWorkItemTreatment(treatment: WorkItemTreatmentModel): Observable<any> {
    return this.commonService.edit(treatment, `${this.apiUrl}/EditWorkItemTreatment`);
  }

  addWorkItemTreatment(treatment: WorkItemTreatmentModel): Observable<any> {
    return this.commonService.add(treatment, `${this.apiUrl}/AddWorkItemTreatment`);
  }


  editWorkItemDeclaration(declaration: WorkItemDeclarationModel): Observable<any> {
    return this.commonService.edit(declaration, `${this.apiUrl}/EditWorkItemDeclaration`);
  }

  addWorkItemDeclaration(declaration: WorkItemPersonModel): Observable<any> {
    return this.commonService.add(declaration, `${this.apiUrl}/AddWorkItemDeclaration`);
  }

  editWorkItemProvider(provider: WorkItemProviderModel): Observable<any> {
    return this.commonService.edit(provider, `${this.apiUrl}/EditWorkItemProvider`);
  }

  addWorkItemProvider(provider: WorkItemProviderModel): Observable<any> {
    return this.commonService.add(provider, `${this.apiUrl}/AddWorkItemProvider`);
  }

  addWorkItemClaimRequest(requestModel: WorkItemClaimRequestModel): Observable<any> {
    return this.commonService.add(requestModel, `${this.apiUrl}/AddWorkItemClaimRequest`);
  }

  addWorkItemClaimResponse(responseModel: WorkItemClaimResponseModel): Observable<WorkItemClaimModel> {//return type so that we populate the form fields
    return this.commonService.add(responseModel, `${this.apiUrl}/AddWorkItemClaimResponse`);
  }

  addWorkItemFirstMedicalReportRequest(requestModel: WorkItemFirstMedicalReportRequestModel): Observable<any> {
    return this.commonService.add(requestModel, `${this.apiUrl}/AddWorkItemFirstMedicalReportRequest`);
  }

  addWorkItemFirstMedicalReportResponse(responseModel: WorkItemFirstMedicalReportResponseModel): Observable<any> {
    return this.commonService.add(responseModel, `${this.apiUrl}/AddWorkItemFirstMedicalReportResponse`);
  }

  syncWorkItemTreatmentTypes(icd10Codes: WorkItemTreatmentTypeModel[]): Observable<any> {
    return this.commonService.add(icd10Codes, `${this.apiUrl}/SyncWorkItemTreatmentTypes`);
  }

  syncWorkItemICD10Codes(icd10Codes: WorkItemICD10CodeModel[]): Observable<any> {
    return this.commonService.add(icd10Codes, `${this.apiUrl}/SyncWorkItemICD10Codes`);
  }

  deleteAllWorkItemTreatmentTypes(workItemId: number): Observable<any> {
    return this.commonService.add(workItemId, `${this.apiUrl}/DeleteAllWorkItemTreatmentTypes`);
  }

  deleteAllWorkItemICD10Codes(workItemId: number): Observable<any> {
    return this.commonService.add(workItemId, `${this.apiUrl}/DeleteAllWorkItemICD10Codes`);
  }
*/

}


