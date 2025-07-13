import { PremiumListingTransaction } from './../entities/premium-listing-transaction';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { RuleRequestResult } from 'projects/shared-components-lib/src/lib/rules-engine/shared/models/rule-request-result';
import { ImportInsuredLivesRequest } from '../entities/import-insured-lives-request';
import { InsuredLivesSummary } from '../entities/insured-lives-summary';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PremiumPaymentFile } from '../entities/premium-payment-file';
import { PremiumPaymentExceptions } from '../entities/premium-payment-exceptions';
import { PremiumListingMember } from '../entities/premium-listing-member';

@Injectable({
  providedIn: 'root'
})
export class PremiumListingService {

  private apiPremiumListing = 'clc/api/Policy/PremiumListing/';
  private apiBilling = 'bill/api/billing/Transaction/';
  private apiInsuredLives = 'clc/api/RolePlayer/RolePlayerPolicy/';

  constructor(private readonly commonService: CommonService) { }

  public getValidationErrors(fileIdentifier: string): Observable<RuleRequestResult> {
    const url = this.apiPremiumListing + 'GroupPolicyImportErrors/' + fileIdentifier;
    return this.commonService.getAll<RuleRequestResult>(url);
  }

  public importInsuredLives(request: ImportInsuredLivesRequest): Observable<InsuredLivesSummary> {
    const api = `${this.apiPremiumListing}ImportGroupPolicyMembers`;
    return this.commonService.postGeneric<ImportInsuredLivesRequest, InsuredLivesSummary>(api, request);
  }

  public getPolicyId(fileIdentifier: string): Observable<string> {
    const url = this.apiPremiumListing + 'GroupPolicyId/' + fileIdentifier;
    return this.commonService.getString(url);
  }

  public getUploadMessage(fileIdentifier: string): Observable<string> {
    const url = this.apiPremiumListing + 'UploadMessage/' + fileIdentifier;
    return this.commonService.getString(url);
  }

  public getPremiumListingTransactions(policyId: number): Observable<PremiumListingTransaction[]> {
    const url = this.apiBilling + 'GetPremiumListingTransactions/' + policyId;
    return this.commonService.getAll<PremiumListingTransaction[]>(url);
  }

  public getPremiumListingTransactionsForPolicy(policyId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string): Observable<PagedRequestResult<PremiumListingTransaction>> {
    const url = this.apiBilling + `PremiumListingTransactionsForPolicy/${policyId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}`;
    return this.commonService.getAll<PagedRequestResult<PremiumListingTransaction>>(url);
  }

  public getPremiumListingTransactionTotal(policyId: number): Observable<number> {
    const url = this.apiBilling + `PremiumListingTransactionsTotal/${policyId}`;
    return this.commonService.getAll<number>(url);
  }

  public uploadPayments(content: any, fileName: string): Observable<number> {
    const url = `${this.apiPremiumListing}UploadPayments`;
    return this.commonService.postGeneric<any, number>(url, { data: content.data, fileName });
  }

  public importPolicyInsuredLives(request: ImportInsuredLivesRequest): Observable<InsuredLivesSummary> {
    const api = `${this.apiInsuredLives}ImportPolicyInsuredLives`;
    return this.commonService.postGeneric<ImportInsuredLivesRequest, InsuredLivesSummary>(api, request);
  }

  public getInsuredLivesValidationErrors(fileIdentifier: string): Observable<RuleRequestResult> {
    const url = this.apiInsuredLives + 'InsuredLivesImportErrors/' + fileIdentifier;
    return this.commonService.getAll<RuleRequestResult>(url);
  }

  public uploadBulkPaymentListing(unalloctedPaymentId: number, content: any): Observable<number> {
    const url = `${this.apiPremiumListing}UploadBulkPaymentListing/${unalloctedPaymentId}`;
    return this.commonService.postGeneric<any, number>(url, content);
  }

  public validatePremiumListingFile(content: any): Observable<number> {
    const url = `${this.apiPremiumListing}UploadPayments`;
    return this.commonService.postGeneric<any, number>(url, content);
  }

  getPremiumListingPaymentFiles(data: any): Observable<PremiumPaymentFile[]> {
    return this.commonService.getAll<PremiumPaymentFile[]>(`${this.apiPremiumListing}GetPremiumListingPaymentFiles/${data.statusId}/${data.startDate.toISOString()}/${data.endDate.toISOString()}`);
  }

  public getPremiumPaymentFileExceptions(fileId: string): Observable<PremiumPaymentExceptions[]> {
    const url = this.apiPremiumListing + `getPremiumPaymentFileExceptions/${fileId}`;
    return this.commonService.getAll<PremiumPaymentExceptions[]>(url);
  }

  public ValidatePaymentFile(content: any, fileName: string): Observable<number> {
    const url = `${this.apiPremiumListing}ValidatePaymentFile`;
    return this.commonService.postGeneric<any, number>(url, { data: content.data, fileName });
  }

  public UploadPremiumPaymentsWithFileLinking(content: any, fileName: string, transactionLinkId: number): Observable<number> {
    const url = `${this.apiPremiumListing}UploadPremiumPaymentsWithFileLinking`;
    return this.commonService.postGeneric<any, number>(url, { data: content.data, fileName, TransactionLinkedId: transactionLinkId });
  }

  public ReversePremiumPayments(linkedTransactionId : number): Observable<number> {
    const url = `${this.apiPremiumListing}ReverseLastPremiumPayments/${linkedTransactionId}`;
    return this.commonService.postGeneric<any, number>(url, {TransactionLinkedId: linkedTransactionId });
  }

  public getPremiumListingMembers(pageNumber: number, pageSize: number, fileIdentifier: string) : Observable<PagedRequestResult<PremiumListingMember>> {
    const url = `${this.apiPremiumListing}GetPremiumListingMembers/${pageNumber}/${pageSize}/Id/asc/${fileIdentifier}`;
    return this.commonService.getAll<PagedRequestResult<PremiumListingMember>>(url);
  }

  public allocatePremiumPayments( fileId: number, transactionLinkId: number,  balance:number): Observable<number> {
    const url = `${this.apiPremiumListing}AllocatePremiumPayments`;
    return this.commonService.postGeneric<any, number>(url, {linkedTransactionId: transactionLinkId, fileId, balance });
  }

  public getPremiumPaymentFile(fileId: number): Observable<PremiumPaymentFile> {
    const url = `${this.apiPremiumListing}GetPremiumPaymentFile/${fileId}`;
    return this.commonService.getAll<PremiumPaymentFile>(url);
  }

  getPremiumListingPaymentFilesByDate(startDate:Date, endDate: Date, policyNumber:string): Observable<PremiumPaymentFile[]> {
    return this.commonService.getAll<PremiumPaymentFile[]>(`${this.apiPremiumListing}GetPremiumListingPaymentFilesByDate/${policyNumber}/${startDate.toISOString()}/${endDate.toISOString()}`);
  }
}
