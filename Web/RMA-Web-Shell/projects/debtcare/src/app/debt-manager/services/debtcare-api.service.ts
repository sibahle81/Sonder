import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';
import { payloadEmail } from '../models/shared/interfaces/payload-email.interface';
import { addActionLog } from '../models/shared/interfaces/add-actionlog.interface';

@Injectable({
  providedIn: 'root'
})
export class DebtcareApiService {

  constructor(private commonService: CommonService) { }

  getDebtcareCollectionsAgentDetails(key: string,params: any,assignedId: number = 0, collectionStatusId: number=0,ptpValue: number = 0): Observable<any> {
    let tempParam: string = params?.page + '/' + params?.pageSize + '/' + params?.orderBy + '/' + params?.sortDirection + '/' + params?.search;
    let dateParam: string = params?.dateDetails?.fromDate + '/' + params?.dateDetails?.toDate
    return this.commonService.getAll<any>(`debt/api/debtors/GetDebtCareAgentInformation/${key}/${assignedId}/${collectionStatusId}/${dateParam}/${ptpValue}/${tempParam}`)
  }

  getDebtcareCollectionsTeamLeaderDetails(key: string, params: any): Observable<any> {
    let tempParam: string = params.page + '/' + params.pageSize + '/' + params.orderBy + '/' + params.sortDirection + '/' + params.search;
    return this.commonService.getAll<any>(`debt/api/debtors/GetDebtCareTeamLeaderInformation/${key}/${tempParam}`)
  }

  getDebtCareCollectionAgentInformation(id: string): Observable<any> {
    return this.commonService.getAll(`debt/api/Debtors/GetDebtCareUserInformation/${id}`)
  }

  getDebtCareCollectionAgentActionLogs(id: number,policyId: number): Observable<any> {
    return this.commonService.getAll(`debt/api/Debtors/GetDebtCareActionLog/${id}/${policyId}`)
  }

  getInvoiceData(id: string, params: any): Observable<any> {
    let tempParam: string = params.page + '/' + params.pageSize + '/' + params.orderBy + '/' + params.sortDirection + '/' + params.search;
    return this.commonService.getAll<any>(`debt/api/Debtors/GetDebtCareInvoice/${id}/${tempParam}`)

  }

  getAssignAgentList(): Observable<any> {
    return this.commonService.getAll(`debt/api/Debtors/GetDebtCareReAssignAgentList`)
  }

  getSignDocs(id: number,policyId: number): Observable<any> {
    return this.commonService.getAll(`debt/api/Debtors/GetDebtCareSignedDoc/${id}/${policyId}`)
  }

  getDebtCareSMS(id: number,policyId: number): Observable<any> {
    return this.commonService.getAll<any>(`debt/api/Debtors/GetDebtCareSMS/${id}/${policyId}`)
  }

  sendMessageToLocalServer(data: any): Observable<any> {
    return this.commonService.postGeneric<any, any>(`debt/api/debtors/DebtCareSendSMS`, data)
  }

  getUpdateStatusDetails(finpayeeId: number, policyId: number): Observable<any> {
    return this.commonService.getAll<any>(`debt/api/Debtors/GetDebtCareStatusUpdate/${finpayeeId}/${policyId}`)
  }

  getDebtCareSMSHistory(id: any,policyId: number, mobile: any): Observable<any> {
    return this.commonService.getAll<any>(`debt/api/Debtors/GetDebtCareSMSHistory/${id}/${policyId}/${mobile}`)
  }

  getDebtAgeAnalysis(id: number): Observable<any> {
    return this.commonService.getAll<any>(`debt/api/Debtors/GetDebtAgeAnalysisIntrestAmount/${id}`)
  }

  getDebtCareInvoiceDocument(invToken: string): Observable<any> {
    return this.commonService.getAll(`debt/api/Debtors/GetDebtCareInvoiceDocument/${invToken}`)
  }

  reAssignAgent(data: any): Observable<any> {
    return this.commonService.postGeneric('debt/api/debtors/DebtCareReAssignAgentId', data)
  }
  multipleReAssignAgent(data: any): Observable<any> {
    return this.commonService.postGeneric('debt/api/debtors/DebtCareMultiReAssignAgentId', data)
  }

  postEmailData(payload: any): Observable<any> {
    return this.commonService.postGeneric(`debt/api/debtors/AddDebtCareEmailLog`, payload)
  }

  addEmailActionLogs(payload: addActionLog): Observable<any> {
    return this.commonService.postGeneric('debt/api/debtors/AddDebtCareActionLog', payload)
  }

  postEmailData2(payload: any): Observable<any> {
    return this.commonService.postGeneric(`cmp/api/SendEmail/Send`, payload)
  }

  postEmailDebtcare(payload: payloadEmail): Observable<any> {
    return this.commonService.postGeneric(`debt/api/Debtors/DebtCareSendEmail`, payload)
  }

  addDebtcareSignDocument(payload: any): Observable<any> {
    return this.commonService.postGeneric(`debt/api/debtors/AddDebtCareSignDocument`, payload)
  }

  deleteSignDocument(id: string): Observable<any> {
    return this.commonService.postWithNoData(`debt/api/Debtors/DeleteDebtCareSignedDocument/${id}`)
  }

  DebtCareInvoiceTransactionJob(): Observable<any> {
    return this.commonService.postWithNoData(`debt/api/Debtors/DebtCareAssignPendingInvoiceToCollectionAgent`)
  }

  debtcareUpdateBrokenPTP(): Observable<any> {
    return this.commonService.postWithNoData('debt/api/Debtors/DebtCareUpdateBrokenPTP')
  }

  uploadDocument(data: any): Observable<any> {
    return this.commonService.postGeneric<any, any>(`debt/api/debtors/SaveUploadDocumentDebtCare`, data)
  }

  getDebtcareReport(details:any): Observable<any>{
    return this.commonService.getAll(`debt/api/debtors/GetDebtCareReportBookAge/${details.reportType}/${details.bookClass}/All/${details.status}/${details.fromDateValue}/${details.toDateValue}/${details.search}/${details.collection_agent}`)
  }

}
