    import { Injectable } from '@angular/core';
    import { Observable, of } from 'rxjs';
    import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
    import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
    import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
    import { MedicalReportFormDetail } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form-detail';
    import { MedicalReportQueryParams } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-report-query-params';
    import { FirstMedicalReportForm } from '../models/first-medical-report-form';
    import { ProgressMedicalReportForm } from '../models/progress-medical-report-form';
    import { FinalMedicalReportForm } from '../models/final-medical-report-form';
    import { FirstDiseaseMedicalReportForm } from '../models/first-disease-medical-report-form';
    import { ProgressDiseaseMedicalReportForm } from '../models/progress-disease-medical-report-form';
    import { FinalDiseaseMedicalReportForm } from '../models/final-disease-medical-report-form';
    import { MedicalReportRejectionReason } from '../models/medical_report_rejection_reason';


    @Injectable({
    providedIn: 'root'
    })
    export class MedicalFormService {
    private apiUrl = 'digi/api/medicalForm';

    constructor(
        private readonly commonService: CommonService) {
    }

    getMedicalReportForms(type: number, name: string, createdBy: string): Observable<MedicalReportForm[]> {
        if (!type)
        type = 0;
        if (this.isEmptyOrUndefined(name))
        name = "0";
        if (this.isEmptyOrUndefined(createdBy))
        createdBy = "0";
        return this.commonService.getAll<MedicalReportForm[]>(this.apiUrl + `/GetMedicalReportForms`);
    }

    getAllMedicalReportForms(): Observable<PagedRequestResult<MedicalReportForm>> {
        return this.commonService.getAll<PagedRequestResult<MedicalReportForm>>(this.apiUrl + `/GetMedicalReportForms`);
    }

    getPagedMedicalReportForms(createdBy: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string) : Observable<PagedRequestResult<MedicalReportForm>> {
        return this.commonService.getAll<PagedRequestResult<MedicalReportForm>>(`${this.apiUrl}/GetPagedMedicalReportForms/${createdBy}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}`);
    }

    getPagedMedicalReports(createdBy: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, claimId: number, healthCareProviderId: number) : Observable<PagedRequestResult<MedicalReportForm>> {
        return this.commonService.getAll<PagedRequestResult<MedicalReportForm>>(`${this.apiUrl}/GetPagedMedicalReports/${createdBy}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${claimId}/${healthCareProviderId}`);
    }

    getMedicalReportForm(id: number): Observable<any> {
        return this.commonService.getAll<any[]>(this.apiUrl + `/GetMedicalReportForm/${id}`);
    }

    getMedicalReportFormByWorkItemId(workItemId: number): Observable<MedicalReportForm> {
        return this.commonService.getAll<MedicalReportForm>(this.apiUrl + `/GetMedicalReportFormByWorkItemId/${workItemId}`);
    }

    getMedicalReportFormsByCreatedBy(createdBy: string): Observable<MedicalReportFormDetail[]> {
        return this.commonService.getAll<MedicalReportFormDetail[]>(this.apiUrl + `/GetMedicalReportFormsByCreatedBy/${createdBy}`);
    }

    getPagedMedicalReportFormsByCreatedBy(createdBy: string, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string): Observable<PagedRequestResult<MedicalReportFormDetail>> {
        return this.commonService.getAll<PagedRequestResult<MedicalReportFormDetail>>(`${this.apiUrl}/GetPagedMedicalReportFormsByCreatedBy/${createdBy}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}`);
    }

    isEmptyOrUndefined(str): boolean {
        return (!str || 0 === str.length || undefined);
    }

    getMedicalReportFormForClaim(medicalReportSystemSourceId: number, personEventId: number, reportTypeId: number): Observable<MedicalReportForm> {
        return this.commonService.getAll<MedicalReportForm>(this.apiUrl + `/GetMedicalReportForm/${medicalReportSystemSourceId}/${personEventId}/${reportTypeId}`);
    }

    getMedicalReportsForInvoice( medicalReportQueryParams:MedicalReportQueryParams): Observable<MedicalReportForm[]> {
        const url = `${this.apiUrl}/GetMedicalReportsForInvoice`;
        return this.commonService.postGeneric<MedicalReportQueryParams, MedicalReportForm[]>(url, medicalReportQueryParams);
    }

    AddFirstMedicalReportForm(firstMedicalReportForm: FirstMedicalReportForm): Observable<FirstMedicalReportForm> {
        return this.commonService.postGeneric<FirstMedicalReportForm, FirstMedicalReportForm>(`${this.apiUrl}/AddFirstMedicalReportForm`, firstMedicalReportForm);
    }

    AddProgressMedicalReportForm(progressMedicalReport: ProgressMedicalReportForm): Observable<ProgressMedicalReportForm> {
        return this.commonService.postGeneric<ProgressMedicalReportForm, ProgressMedicalReportForm>(`${this.apiUrl}/AddProgressMedicalReportForm`, progressMedicalReport);
    }

    AddFinalMedicalReportForm(finalMedicalReport: FinalMedicalReportForm): Observable<FinalMedicalReportForm> {
        return this.commonService.postGeneric<FinalMedicalReportForm, FinalMedicalReportForm>(`${this.apiUrl}/AddFinalMedicalReportForm`, finalMedicalReport);
    }

    AddFirstDiseaseMedicalReportForm(firstDiseaseMedicalReportForm: FirstDiseaseMedicalReportForm): Observable<FirstDiseaseMedicalReportForm> {
        return this.commonService.postGeneric<FirstDiseaseMedicalReportForm, FirstDiseaseMedicalReportForm>(`${this.apiUrl}/AddFirstDiseaseMedicalReportForm`, firstDiseaseMedicalReportForm);
    }

    AddProgressDiseaseMedicalReportForm(progressDiseaseMedicalReport: ProgressDiseaseMedicalReportForm): Observable<ProgressDiseaseMedicalReportForm> {
        return this.commonService.postGeneric<ProgressDiseaseMedicalReportForm, ProgressDiseaseMedicalReportForm>(`${this.apiUrl}/AddProgressDiseaseMedicalReportForm`, progressDiseaseMedicalReport);
    }

    AddFinalDiseaseMedicalReportForm(finalDiseaseMedicalReport: FinalDiseaseMedicalReportForm): Observable<FinalDiseaseMedicalReportForm> {
        return this.commonService.postGeneric<FinalDiseaseMedicalReportForm, FinalDiseaseMedicalReportForm>(`${this.apiUrl}/AddFinalDiseaseMedicalReportForm`, finalDiseaseMedicalReport);
    }

    UpdateFirstMedicalReportForm(firstMedicalReportForm: FirstMedicalReportForm): Observable<boolean> {
        return this.commonService.postGeneric<FirstMedicalReportForm, boolean>(`${this.apiUrl}/UpdateFirstMedicalReportForm`, firstMedicalReportForm);
    }

    UpdateFirstDiseaseMedicalReportForm(firstDiseaseMedicalReportForm: FirstDiseaseMedicalReportForm): Observable<boolean> {
        return this.commonService.postGeneric<FirstDiseaseMedicalReportForm, boolean>(`${this.apiUrl}/UpdateFirstDiseaseMedicalReportForm`, firstDiseaseMedicalReportForm);
    }

    UpdateProgressMedicalReportForm(progressMedicalReportForm: ProgressMedicalReportForm): Observable<boolean> {
        return this.commonService.postGeneric<ProgressMedicalReportForm, boolean>(`${this.apiUrl}/UpdateProgressMedicalReportForm`, progressMedicalReportForm);
    }

    UpdateProgressDiseaseMedicalReportForm(progressDiseaseMedicalReport: ProgressDiseaseMedicalReportForm): Observable<boolean> {
        return this.commonService.postGeneric<ProgressDiseaseMedicalReportForm, boolean>(`${this.apiUrl}/UpdateProgressDiseaseMedicalReportForm`, progressDiseaseMedicalReport);
    }

    UpdateFinalMedicalReportForm(finalMedicalReportForm: FinalMedicalReportForm): Observable<boolean> {
        return this.commonService.postGeneric<FinalMedicalReportForm, boolean>(`${this.apiUrl}/UpdateFinalMedicalReportForm`, finalMedicalReportForm);
    }

    UpdateFinalDiseaseMedicalReportForm(finalDiseaseMedicalReport: FinalDiseaseMedicalReportForm): Observable<boolean> {
        return this.commonService.postGeneric<FinalDiseaseMedicalReportForm, boolean>(`${this.apiUrl}/UpdateFinalDiseaseMedicalReportForm`, finalDiseaseMedicalReport);
    }

    GetFirstMedicalReportAccidentByPersonEventId(personEventId: number): Observable<FirstMedicalReportForm[]> {
        return this.commonService.getAll<FirstMedicalReportForm[]>(this.apiUrl + `/GetFirstMedicalReportAccidentByPersonEventId/${personEventId}`);
    }

    GetProgressMedicalReportAccidentByPersonEventId(personEventId: number): Observable<ProgressMedicalReportForm[]> {
        return this.commonService.getAll<ProgressMedicalReportForm[]>(this.apiUrl + `/GetProgressMedicalReportAccidentByPersonEventId/${personEventId}`);
    }

    GetFinalMedicalReportAccidentByPersonEventId(personEventId: number): Observable<FinalMedicalReportForm[]> {
        return this.commonService.getAll<FinalMedicalReportForm[]>(this.apiUrl + `/GetFinalMedicalReportAccidentByPersonEventId/${personEventId}`);
    }

    GetFirstMedicalReportDiseaseByPersonEventId(personEventId: number): Observable<FirstDiseaseMedicalReportForm[]> {
        return this.commonService.getAll<FirstDiseaseMedicalReportForm[]>(this.apiUrl + `/GetFirstMedicalReportDiseaseByPersonEventId/${personEventId}`);
    }

    GetProgressMedicalReportDiseaseByPersonEventId(personEventId: number): Observable<ProgressDiseaseMedicalReportForm[]> {
        return this.commonService.getAll<ProgressDiseaseMedicalReportForm[]>(this.apiUrl + `/GetProgressMedicalReportDiseaseByPersonEventId/${personEventId}`);
    }

    GetFinalMedicalReportDiseaseByPersonEventId(personEventId: number): Observable<FinalDiseaseMedicalReportForm[]> {
        return this.commonService.getAll<FinalDiseaseMedicalReportForm[]>(this.apiUrl + `/GetFinalMedicalReportAccidentByPersonEventId/${personEventId}`);
    }

    IsDuplicateMedicalReportForm(medicalReportForm: MedicalReportForm): Observable<boolean> {
        return this.commonService.postGeneric<MedicalReportForm, boolean>(`${this.apiUrl}/IsDuplicateMedicalReportForm`, medicalReportForm);
    }

    GetMedicalReportRejectionReasonList(): Observable<MedicalReportRejectionReason[]> {
        return this.commonService.getAll<MedicalReportRejectionReason[]>(this.apiUrl + `/GetMedicalReportRejectionReasonList`);
    }

    UpdateMedicalReportForm(medicalReportForm: MedicalReportForm): Observable<number> {
        return this.commonService.postGeneric<MedicalReportForm, number>(`${this.apiUrl}/UpdateMedicalReportForm`, medicalReportForm);
    }
}
