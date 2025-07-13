import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LegalApiService {

  private details = new BehaviorSubject<any[]>([]);
  constructor(private http: HttpClient, private comms: CommonService) { }

  getLegalRecoveryDetails(key: string, params: any): Observable<any> {
    let tempParam: string = params.page + '/' + params.pageSize + '/' + params.orderBy + '/' + params.sortDirection + '/' + params.search;
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareRecoveryReferences/${key}/${tempParam}`)
  }

  fetchLegalHeadDetails(key: string, params: any): Observable<any> {
    let tempParam: string = params.page + '/' + params.pageSize + '/' + params.orderBy + '/' + params.sortDirection + '/' + params.search;
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareRecoveryLegalHead/${key}/${tempParam}`)
  }

  getLegalTribunalDetails(key: string, params: any): Observable<any> {
    let tempParam: string = params.page + '/' + params.pageSize + '/' + params.orderBy + '/' + params.sortDirection + '/' + params.search;
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareReferenceTribunal/${key}/${tempParam}`)
  }

  getLegalCareUserInformation(id: number): Observable<any> {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareUserInformation/${id}`)
  }

  getLegalCareActionLogs(id: string, key: string): Observable<any> {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareActionLogs/${id}/Recovery`)
  }

  getLegalCareActionLogsRec(id: number, modId: number): Observable<any> {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareActionLogs/${id}/${modId}`)
  }

  getLegalCareAttorneyInvoices(id: string, params: any): Observable<any> {
    let tempParam: string = params.page + '/' + params.pageSize + '/' + params.orderBy + '/' + params.sortDirection + '/' + params.search;
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareAttorneyInvoice/${id}/${tempParam}`)
  }

  getLegalRecoveredPayment(id: string, params: any): Observable<any> {
    let tempParam: string = params.page + '/' + params.pageSize + '/' + params.orderBy + '/' + params.sortDirection + '/' + params.search;
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareRecoveredPayments/${id}/${tempParam}`)
  }

  getLegalCareAccessRoles(id: string): Observable<any> {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareAccessRoles/${id}`)
  }

  getAssignAttorneyList(moduleId: string, pGroupId: string): Observable<any> {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareAssignAttourneyList/${moduleId}/${pGroupId}`)
  }

  getCollectionsAttorneyList() {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareCollectionAttourneyList`)
  }

  fetchLegalRefferenceCollection(key: string, params: any, attorneyId: number = 0): Observable<any> {
    let tempParam: string = params.page + '/' + params.pageSize + '/' + params.orderBy + '/' + params.sortDirection + '/' + params.search + '/' + attorneyId;
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareReferenceCollection/${key}/${tempParam}`)
  }

  getLegalCollectionUserInformation(id: string): Observable<any> {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareCollectionUserInformation/${id}`)
  }

  getLegalCareAttorneyList(modId: string, permId: string): Observable<any> {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareAssignTribunalAttourneyList/${modId}/${permId}`)
  }

  getAssignedAcknowledgeAttorney(modId: string, permId): Observable<any> {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareSavedTransactionRecords`)
  }

  AssignLegalCareTribunalAssignId(data: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/AssignLegalCareTribunalAssignId`, data)
  }

  addLegalCareActionLogs(data: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/AddLegalCareActionLog`, data)
  }

  AckLegalCareTribunalId(id: string): Observable<any> {
    return this.comms.postWithNoData(`legal/api/LegalCareRecovery/UpdateLegalcareTribunalAcknowledgeStatus/${id}`)
  }

  getAssessmentDepartmentList(searchtext: string): Observable<any> {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareDepartmentList/${searchtext}`)
  }

  getAssessmentDepartmentUserList(id: number): Observable<any> {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareDepartmentUserList/${id}`)
  }

  getDocumentPackList(id: string, params: any): Observable<any> {
    let tempParam: string = params.page + '/' + params.pageSize + '/' + params.orderBy + '/' + params.sortDirection + '/' + params.search;
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareObjectionDocumentPack/${id}/${tempParam}`)
  }

  sendNotes(data: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/AddLegalcareNotes`, data)
  }

  submitPotentialRecovery(data: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/UpdateLegalcarePotentialRecovery`, data)
  }

  updateRecoveryStatus(data: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/UpdateLegalcareRecoveryStatus`, data)
  }

  addLegalCareInvoice(data: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/legalcarerecovery/AddLegalCareInvoice`, data)
  }

  addRecoveredPaymentDetails(data: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/legalcarerecovery/UploadLegalcareAttourneyRecoveredPaymentDetails`, data)
  }

  submitAssignAttorney(data: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/AssignLegalCareRecoveryAssignId`, data)
  }

  submitAssignAttorneyCollection(data: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/AssignLegalCareCollectionAssignId`, data)
  }
  updateLegalCareReRecoveryStatus(id: number, key: string): Observable<any> {
    return this.comms.postWithNoData(`legal/api/LegalCareRecovery/UpdateLegalCareRecoveryHeadStatus/${id}/${key}`)
  }

  updateRecoveryAckStatus(id: string): Observable<any> {
    return this.comms.postWithNoData(`legal/api/legalcarerecovery/UpdateLegalcareRecoveryAcknowledgeStatus/${id}`)
  }

  addRecoveredPayment(data: any): Observable<any> {
    return this.comms.postGeneric(`legal/api/LegalCareRecovery/GetLegalCareRecoveredPayments`, data)
  }

  deleteDocumentFromPack(id: number): Observable<any> {
    return this.comms.postWithNoData(`legal/api/LegalCareRecovery/DeleteLegalCareObjectionDocument/${id}`)
  }

  deleteRecoveryDocumentFromPack(id: number): Observable<any> {
    return this.comms.postWithNoData(`legal/api/LegalCareRecovery/DeleteLegalCareRecoveryDocument/${id}`)
  }

  getRecoveryLegalDetails(): Observable<any[]> {
    return this.details.asObservable();
  }

  searchMeetingAttendee(searchText: any): Observable<any> {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareSearchUserList/${searchText}`)
  }

  getTribunalMeeting(endPoint: any, params: any, id: number): Observable<any> {
    let tempParam: string = params.page + '/' + params.pageSize + '/' + params.orderBy + '/' + params.sortDirection + '/' + params.search;
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareReferenceTribunalMeeting/${id}/${endPoint}/${tempParam}`)
  }

  getLegalCareAssessment(id: number): Observable<any> {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareAssessment/${id}`)
  }

  AddTribunalAssessment(data: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/AddTribunalAssessment`, data)
  }

  getLegalCareUserList(): Observable<any> {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareUserList`)
  }

  getScheduleOrCompletedMeetings(endpoint: string): Observable<any> {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareReferenceTribunalMeeting/${endpoint}`)
  }

  getLegalCareSearchUserList(endpoint: string): Observable<any> {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareSearchUserList/${endpoint}`)
  }

  getMeetingAttendees(id: string): Observable<any> {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareTribunalMeetingAttendy/${id}`)
  }

  deleteTribunalMeeting(id: string): Observable<any> {
    return this.comms.postWithNoData(`legal/api/LegalCareRecovery/DeleteLegalCareTribunalMeeting/${id}`)
  }

  addJudgementDecision(data: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/AddLegalcareTribunalJudgementDecision`, data)
  }

  addRecoveryDocumentPack(data: any,id: string): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/${id}`, data)
  }

  addRecoveryClaimForm(data: any, id: number): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/SaveUploadDocumentClaimFormLegalCare/${id}`, data)
  }

  addAttorneyInstructions(data: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/AddLegalCareAttorneyInstruction`, data)
  }

  addScheduleMeeting(data: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/ScheduleLegalcareTribunalMeeting`, data)
  }
  editScheduleMeeting(meetingId: number, updatedData: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/UpdateLegalcareTribunalMeetingDetails`, updatedData);
  }
  deleteAPIRecvPayment(id: number): Observable<any> {
    return this.comms.postWithNoData(`legal/api/LegalCareRecovery/DeleteLegalCareRecoveredPayment/${id}`)
  }

  deleteAPIInvoice(id: number): Observable<any> {
    return this.comms.postWithNoData(`legal/api/LegalCareRecovery/DeleteLegalCareInvoice/${id}`)
  }

  deleteClaimForm(id: number): Observable<any> {
    return this.comms.postWithNoData(`legal/api/LegalCareRecovery/DeleteLegalCareMeetingClaimForm/${id}`)
  }

  updateMeetingAttendance(status: boolean, id: string) {
    return this.comms.postWithNoData(`legal/api/LegalCareRecovery/UpdateLegalCareMeetingAttendyAttendance/${id}/${status}`)
  }

  uploadLegalCareDocument(data: any, key: string): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/SaveUploadDocumentClaimFormLegalCare`, data)
  }

  uploadDocumentInCollectionNotes(id: number,data: any): Observable<any>{
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/SaveUploadDocumentCollectionNotesLegalCare/${id}`,data)
  }

  uploadLegalcareDocumentPack(api: string,data: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/${api}`, data)
  }

  createLegalCareDocumentPack(api: string,data: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/${api}`, data)
  }

  getLegalcareSavedRefferalData(id: number): Observable<any> {
    return this.comms.getAll<any>(`legal/api/LegalCareRecovery/GetLegalCareSavedRefferalData/${id}`)
  }

  updateLegalCareRecovery(data: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/UpdateLegalCareRecoveryDocumentPack`, data)
  }

  updateLegalCareTribunalDocPack(data: any): Observable<any> {
    return this.comms.postGeneric<any, any>(`legal/api/LegalCareRecovery/UpdateLegalCareObjectionDocumentPack`, data)
  }

  getLegalcareAttorneyInstructions(id: number): Observable<any> {
    return this.comms.getAll(`legal/api/LegalCareRecovery/GetLegalCareAttourneyInstruction/${id}`)
  }

  getLegalcareAttorneyInstructionsForDocPack(id: number): Observable<any> {
    return this.comms.getAll(`legal/api/LegalCareRecovery/GetLegalCareAttourneyInstructionDocPack/${id}`)
  }

  getLegalCareAttourneyInstructionDocPackName(id: number): Observable<any> {
    return this.comms.getAll(`legal/api/LegalCareRecovery/GetLegalCareAttourneyInstructionDocPackName/${id}`)
  }


  getLegalCareTribunalDocPack(id: number): Observable<any> {
    return this.comms.getAll(`legal/api/LegalCareRecovery/GetLegalCareTribunalDocPack/${id}`)
  }

  getDebtCareInvoiceDocument(id: number): Observable<any> {
    return this.comms.getAll(`legal/api/LegalCareRecovery/GetDebtCareInvoiceDocument/${id}`)
  }

}
