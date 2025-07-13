import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { MedicalSwitchBatchSearchPersonEvent } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-switch-batch-search-person-event';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { MedicalReportModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/medicalReport.model';

@Injectable({
  providedIn: 'root'
})
export class MedicalInvoiceClaimService {
  private apiUrl = 'clm/api/MedicalInvoiceClaim';

  constructor(
    private readonly commonService: CommonService) {
  }

  validateMedicalBenefit(claimId: number, invoiceDate): Observable<boolean> {
    return this.commonService.getAll<boolean>(this.apiUrl + `/ValidateMedicalBenefit/${claimId}/${invoiceDate}`);
  }
  
  getSearchMedicalSwitchBatchPersonEvent(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<MedicalSwitchBatchSearchPersonEvent>> {
    const url = `${this.apiUrl}/GetSearchMedicalSwitchBatchPersonEvent/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}`;
    let medicalSwitchBatchUnmappedParams: MedicalSwitchBatchSearchPersonEvent = JSON.parse(query);
    return this.commonService.postGeneric<MedicalSwitchBatchSearchPersonEvent, PagedRequestResult<MedicalSwitchBatchSearchPersonEvent>>(url, medicalSwitchBatchUnmappedParams);
  }

  getPersonEventAccidentDetailsByEventId(EventId: number): Observable<any> {
    return this.commonService.getAll<any>(this.apiUrl + `/GetPersonEventAccidentDetailsByEventId/${EventId}`);
  }

  addSickNote(medicalReportModel: MedicalReportModel): Observable<boolean> {
    return this.commonService.postGeneric<MedicalReportModel, boolean>(`${this.apiUrl}/CreateClaimMedicalReport`, medicalReportModel);
  }

  getClaimMedicalReport(personEventId: number): Observable<MedicalReportModel[]> {
    return this.commonService.getAll<MedicalReportModel[]>(this.apiUrl + `/GetClaimMedicalReport/${personEventId}`);
  }

  getSickNoteByMedicalReportId(medicalReportId: number): Observable<MedicalReportModel> {
    return this.commonService.get<MedicalReportModel>(medicalReportId, this.apiUrl + `/GetSickNoteByMedicalReportId`);
  }

  updateSickNote(medicalReportModel: MedicalReportModel): Observable<boolean> {
    return this.commonService.edit<MedicalReportModel>(medicalReportModel, this.apiUrl + `/UpdateSickNote`);
  }
}
