import { PreAuthLevelOfCare } from 'projects/medicare/src/app/preauth-manager/models/preauth-levelofcare';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { ClinicalUpdate } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update.interface';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { TreatmentPlan } from 'projects/medicare/src/app/hospital-visit-manager/models/treament-plan.interface';
import { TreatmentProtocol } from 'projects/medicare/src/app/hospital-visit-manager/models/treament-protocol.interface';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ClinicalUpdateService {
    private apiUrl = 'med/api/medical';
    private apiUrlAuth = 'med/api/Preauthorisation';

    constructor(
        private readonly commonService: CommonService) { }

    getClinicalUpdate(clinicalUpdateId: number): Observable<ClinicalUpdate> {
        return this.commonService.getAll<ClinicalUpdate>(this.apiUrlAuth + `/GetClinicalUpdate/${clinicalUpdateId}`);
    }

    getPreAuthClinicalUpdates(preAuthId: number): Observable<PagedRequestResult<ClinicalUpdate>> {
        return this.commonService.getAll<PagedRequestResult<ClinicalUpdate>>(`${this.apiUrlAuth}/GetPreAuthClinicalUpdates/${preAuthId}`);
    }

    getClinicalUpdatesList(searchValue: any): Observable<PagedRequestResult<ClinicalUpdate>> {
        return this.commonService.getAll<PagedRequestResult<ClinicalUpdate>>(`${this.apiUrlAuth}/GetClinicalUpdatesList/${searchValue}`);
    }

    getClinicalUpdates(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<ClinicalUpdate>> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<PagedRequestResult<ClinicalUpdate>>(`${this.apiUrlAuth}/GetClinicalUpdatesData/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
    }

    getAuthorisedPreAuths(personEventId: number): Observable<PreAuthorisation> {
        return this.commonService.getAll<PreAuthorisation>(`${this.apiUrlAuth}/GetAuthorisedPreAuths/${personEventId}`);
    }

    addClinicalUpdate(clinicalUpdate: ClinicalUpdate): Observable<number> {
        return this.commonService.postGeneric<ClinicalUpdate, number>(this.apiUrlAuth + `/AddClinicalUpdate`, clinicalUpdate);
    }

    updateClinicalUpdate(clinicalUpdate: ClinicalUpdate): Observable<number> {
        return this.commonService.postGeneric<ClinicalUpdate, number>(this.apiUrlAuth + `/UpdateClinicalUpdate`, clinicalUpdate);
    }

    DeleteClinicalUpdate(clinicalUpdate: number): void {
        this.commonService.postGeneric<number, null>(`${this.apiUrlAuth}/DeleteClinicalUpdate`, clinicalUpdate)
    }

    getTreatmentPlans(): Observable<TreatmentPlan> {
        return this.commonService.getAll<TreatmentPlan>(`${this.apiUrl}/GetTreatmentPlans`);
    }

    getTreatmentProtocols(): Observable<TreatmentProtocol[]> {
        return this.commonService.getAll<TreatmentProtocol[]>(`${this.apiUrl}/GetTreatmentProtocols`);
    }

    getLevelOfCareList(): Observable<PreAuthLevelOfCare[]> {
        return this.commonService.getAll<PreAuthLevelOfCare[]>(this.apiUrl + `/GetLevelOfCare`);
    }
}

