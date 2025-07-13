import { Injectable } from '@angular/core';
import { FinalMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-medical-report-form';
import { FirstMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-medical-report-form';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';
import { Claim } from '../shared/entities/funeral/claim.model';
import { MedicalReportFormWizardDetail } from '../shared/entities/medical-report-form-wizard-detail';
import { PersonEventModel } from '../shared/entities/personEvent/personEvent.model';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { ClaimHearingAssessment } from '../shared/entities/claim-hearing-assessment';

@Injectable({
  providedIn: 'root'
})
export class AccidentService {
  private apiUrl = 'clm/api/Accident';

  constructor(
    private readonly commonService: CommonService) {
  }

  SetMedicalReportFields(personEvent: PersonEventModel): Observable<FirstMedicalReportForm> {
    return this.commonService.postGeneric<PersonEventModel, FirstMedicalReportForm>(`${this.apiUrl}/SetMedicalReportFields`, personEvent);
  }

  AutoAcceptDocuments(personEvent: PersonEventModel): Observable<boolean> {
    return this.commonService.edit(personEvent , `${this.apiUrl}/AutoAcceptDocuments/`);
  }

  UpdateAccidentClaimStatus(claim: Claim): Observable<boolean> {
    return this.commonService.edit(claim , `${this.apiUrl}/UpdateAccidentClaimStatus/`);
  }

  SetProgressMedicalReportFields(progressMedicalReport: ProgressMedicalReportForm): Observable<ProgressMedicalReportForm> {
    return this.commonService.postGeneric<ProgressMedicalReportForm, ProgressMedicalReportForm>(`${this.apiUrl}/SetProgressMedicalReportFields`, progressMedicalReport);
  }

  UpdateFirstMedicalReportForm(firstMedicalReport: FirstMedicalReportForm): Observable<FirstMedicalReportForm> {
    return this.commonService.postGeneric<FirstMedicalReportForm, FirstMedicalReportForm>(`${this.apiUrl}/UpdateFirstMedicalReportForm`, firstMedicalReport);
  }

  UpdateProgressMedicalReportForm(progressMedicalReport: ProgressMedicalReportForm): Observable<ProgressMedicalReportForm> {
    return this.commonService.postGeneric<ProgressMedicalReportForm, ProgressMedicalReportForm>(`${this.apiUrl}/UpdateProgressMedicalReportForm`, progressMedicalReport);
  }

  UpdateFinalMedicalReportForm(finalMedicalReport: FinalMedicalReportForm): Observable<FinalMedicalReportForm> {
    return this.commonService.postGeneric<FinalMedicalReportForm, FinalMedicalReportForm>(`${this.apiUrl}/UpdateFinalMedicalReportForm`, finalMedicalReport);
  }

  SetFinalMedicalReportFields(finalMedicalReport: FinalMedicalReportForm): Observable<FinalMedicalReportForm> {
    return this.commonService.postGeneric<FinalMedicalReportForm, FinalMedicalReportForm>(`${this.apiUrl}/SetFinalMedicalReportFields`, finalMedicalReport);
  }

  ValidateFirstMedicalReportSTP(firstMedicalReportForm: FirstMedicalReportForm): Observable<FirstMedicalReportForm> {
    return this.commonService.postGeneric<FirstMedicalReportForm, FirstMedicalReportForm>(`${this.apiUrl}/ValidateFirstMedicalReportSTP`, firstMedicalReportForm);
  }

  ValidateFirstMedicalReport(firstMedicalReportForm: FirstMedicalReportForm): Observable<FirstMedicalReportForm> {
    return this.commonService.postGeneric<FirstMedicalReportForm, FirstMedicalReportForm>(`${this.apiUrl}/ValidateFirstMedicalReport`, firstMedicalReportForm);
  }

  ValidateProgressMedicalReportSTP(progressMedicalReport: ProgressMedicalReportForm): Observable<ProgressMedicalReportForm> {
    return this.commonService.postGeneric<ProgressMedicalReportForm, ProgressMedicalReportForm>(`${this.apiUrl}/ValidateProgressMedicalReportSTP`, progressMedicalReport);
  }

  ValidateProgressMedicalReport(progressMedicalReport: ProgressMedicalReportForm): Observable<ProgressMedicalReportForm> {
    return this.commonService.postGeneric<ProgressMedicalReportForm, ProgressMedicalReportForm>(`${this.apiUrl}/ValidateProgressMedicalReport`, progressMedicalReport);
  }

  ValidateFinalMedicalReportSTP(finalMedicalReport: FinalMedicalReportForm): Observable<FinalMedicalReportForm> {
    return this.commonService.postGeneric<FinalMedicalReportForm, FinalMedicalReportForm>(`${this.apiUrl}/ValidateFinalMedicalReportSTP`, finalMedicalReport);
  }

  ValidateFinalMedicalReport(finalMedicalReport: FinalMedicalReportForm): Observable<FinalMedicalReportForm> {
    return this.commonService.postGeneric<FinalMedicalReportForm, FinalMedicalReportForm>(`${this.apiUrl}/ValidateFinalMedicalReport`, finalMedicalReport);
  }

  GetProgressMedicalReportForms(personEventId: number): Observable<ProgressMedicalReportForm[]> {
    return this.commonService.getAll<ProgressMedicalReportForm[]>(`${this.apiUrl}/GetProgressMedicalReportForms/${personEventId}`);
  }

  GetFirstMedicalReportForms(personEventId: number): Observable<FirstMedicalReportForm[]> {
    return this.commonService.getAll<FirstMedicalReportForm[]>(`${this.apiUrl}/GetFirstMedicalReportForms/${personEventId}`);
  }
  
  getFirstMedicalReportForm(personEventId: number): Observable<FirstMedicalReportForm> {
    return this.commonService.getAll<FirstMedicalReportForm>(`${this.apiUrl}/GetFirstMedicalReportForm/${personEventId}`);
  }

  GetFinalMedicalReportForm(personEventId: number): Observable<FinalMedicalReportForm> {
    return this.commonService.getAll<FinalMedicalReportForm>(`${this.apiUrl}/GetFinalMedicalReportForm/${personEventId}`);
  }
  GetFinalMedicalReportForms(personEventId: number): Observable<FinalMedicalReportForm[]> {
    return this.commonService.getAll<FinalMedicalReportForm[]>(`${this.apiUrl}/GetFinalMedicalReportForms/${personEventId}`);
  }

  RemoveMedicalReportForm(medicalReportFormWizardDetail: MedicalReportFormWizardDetail) {
    return this.commonService.postGeneric<MedicalReportFormWizardDetail, null>(`${this.apiUrl}/RemoveMedicalReportForm`, medicalReportFormWizardDetail);
  }

  GetMedicalFormDocumentId(personEventId: number, workItemId: number, medicalFormReportType: number): Observable<number> {
    return this.commonService.getAll<number>(`${this.apiUrl}/GetMedicalFormDocumentId/${personEventId}/${workItemId}/${medicalFormReportType}`);
  }

  RemoveMedicalReportFormByDocumentId(personEventId: number, documentId: number): Observable<number> {
    return this.commonService.getAll<number>(`${this.apiUrl}/RemoveFirstMedicalReportForm/${personEventId}/${documentId}`);
  }

  ReopenClaim(personEvent: PersonEventModel) {
    return this.commonService.postGeneric<PersonEventModel, null>(`${this.apiUrl}/ReopenClaim`, personEvent);
  }

  removePersonEventFromSTP(personEventId: number, note: Note): Observable<number> {
    return this.commonService.postGeneric<Note, number>(`${this.apiUrl}/RemovePersonEventFromSTP/${personEventId}`, note);
  }

  rerunSTPIntegrationMessage(serviceBusMessageId: number): Observable<number> {
    return this.commonService.getAll<number>(`${this.apiUrl}/RerunSTPIntegrationMessage/${serviceBusMessageId}`);
  }

  addClaimHearingAssessment(claimHearingAssessment: ClaimHearingAssessment): Observable<boolean> {
    return this.commonService.postGeneric<ClaimHearingAssessment, boolean>(`${this.apiUrl}/AddClaimHearingAssessment`, claimHearingAssessment);
  }

  updateClaimHearingAssessment(claimHearingAssessment: ClaimHearingAssessment): Observable<boolean> {
    return this.commonService.postGeneric<ClaimHearingAssessment, boolean>(`${this.apiUrl}/UpdateClaimHearingAssessment`, claimHearingAssessment);
  }

  getTotalHearingLossPercentage(frequency: number, lossLeftEar: number, lossRightEar: number): Observable<number> {
    return this.commonService.getAll<number>(`${this.apiUrl}/CalculateNihlPercentage/${frequency}/${lossLeftEar}/${lossRightEar}`);
  }

  generateClaimsForPolicies(policies: Policy[], personEventId: number) {
    return this.commonService.postGeneric<Policy[], number>(`${this.apiUrl}/GenerateClaimsForPolicies/${personEventId}`, policies);
  }
  
  updateFirstMedicalReportStatus(personEventId: number, documentStatus: DocumentStatusEnum): Observable<boolean> {
    return this.commonService.getAll<boolean>(`${this.apiUrl}/UpdateFirstMedicalReportStatus/${personEventId}/${documentStatus}`);
  }
  
  getFirstMedicalReportFormByReportType(personEventId: number, reportTypeId: number): Observable<FirstMedicalReportForm> {
    return this.commonService.getAll<FirstMedicalReportForm>(`${this.apiUrl}/GetFirstMedicalReportFormByReportType/${personEventId}/${reportTypeId}`);
  }
}

