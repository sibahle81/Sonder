import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { DebtorNoteTypeEnum } from '../../shared/enum/debtor-note-type.enum';
import { PolicyProductCategory } from '../models/policy-product-category';
import { DebtorProductBalance } from '../models/debtor-product-balance';
import { AutoAllocationAccount } from '../models/auto-account-allocation';
import { InterestIndicator } from '../models/InterestIndicator';
import { BulkManualAllocation } from '../models/imports/bulk-manual-allocation';
import { DebtorProductCategoryBalance } from '../models/debtor-product-category-balance';
import { DebtorOpenCreditTransaction } from '../models/debtor-open-credit-transaction';
import { DebtorStatusEnum } from '../../shared/enum/debtor-status.enum';
import { BulkWriteOffModel } from '../models/bulk-write-off';
import { LegalCommissionRecon } from '../../shared/models/legal-recon';
import { LegalHandOverDetail } from '../models/legal-hand-over-detail';
import { FileUploadResponse } from '../models/file-upload-response';
import { AllocatePolicyPayment } from '../models/allocate-policy-payment';
import { TransferPaymentFromPolicyToPolicyRequest } from '../models/transfer-payment-from-policy-to-policy-request';
import { ReversePolicyPaymentRequest } from '../models/reverse-policy-payment-request';
import { PolicyPaymentTransaction } from '../models/policy-payment-transaction';
import { PolicyBillingTransaction } from '../models/policy-billing-transactions';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  private apiUrl = 'bill/api/billing/Billing';
  private allocationUrl = 'bill/api/billing/BillingDataExchange';
  private paymentAllocationUrl = 'bill/api/billing/PaymentAllocation';

  constructor(private readonly commonService: CommonService) { }
  selectedRoleplayerId$: BehaviorSubject<number> = new BehaviorSubject(null);

  getAllBillingNotesByRoleplayerId(roleplayerId: number): Observable<Note[]> {
    return this.commonService.getAll<Note[]>(`${this.apiUrl}/GetAllBillingNotesByRoleplayerId/${roleplayerId}`);
  }

  addNote(request: Note): Observable<number> {
    return this.commonService.postGeneric<Note, number>(`${this.apiUrl}/AddNewNote`, request);
  }

  getBillingNotesByRoleplayerId(roleplayerId: number): Observable<Note[]> {
    return this.commonService.getAll<Note[]>(`${this.apiUrl}/getBillingNotesByRoleplayerId/${roleplayerId}`);
  }

  getBillingNotesByRoleplayerIdAndType(roleplayerId: number, noteType: DebtorNoteTypeEnum): Observable<Note[]> {
    return this.commonService.getAll<Note[]>(`${this.apiUrl}/getBillingNotesByRoleplayerIdAndType/${roleplayerId}/${noteType}`);
  }

  getPolicyProductCategoriesByRoleplayerId(roleplayerId: number): Observable<PolicyProductCategory[]> {
    return this.commonService.getAll<PolicyProductCategory[]>(`${this.apiUrl}/GetPolicyProductCategoriesByRoleplayerId/${roleplayerId}`);
  }

  getProductBalancesByPolicyIds(roleplayerId: number, policyIds: number[]): Observable<DebtorProductBalance[]> {
    return this.commonService.postGeneric<any, DebtorProductBalance[]>(`${this.apiUrl}/GetProductBalancesByPolicyIds`, { roleplayerId, policyIds });
  }

  getAutoAllocationAccounts(): Observable<AutoAllocationAccount[]> {
    return this.commonService.getAll<AutoAllocationAccount[]>(`${this.apiUrl}/GetAutoAllocationAccounts`);
  }

  addAllocationAccounts(accounts: AutoAllocationAccount[]): Observable<boolean> {
    return this.commonService.postGeneric<any, boolean>(`${this.apiUrl}/AddAllocationAccounts`, accounts);
  }

  getBillingInterestIndicatorByRolePlayerId(roleplayerId: number): Observable<InterestIndicator> {
    return this.commonService.getAll<InterestIndicator>(`${this.apiUrl}/GetBillingInterestIndicatorByRolePlayerId/${roleplayerId}`);
  }

  getDebtorProductCategoryBalances(roleplayerId: number): Observable<DebtorProductCategoryBalance[]> {
    return this.commonService.getAll<DebtorProductCategoryBalance[]>(`${this.apiUrl}/GetDebtorProductCategoryBalances/${roleplayerId}`);
  }

  getDebtorOpenCreditTransactions(roleplayerId: number): Observable<DebtorOpenCreditTransaction[]> {
    return this.commonService.getAll<DebtorOpenCreditTransaction[]>(`${this.apiUrl}/GetDebtorOpenCreditTransactions/${roleplayerId}`);
  }

  updateTheDebtorStatus(rolePlayerId: number, debtorStatus: DebtorStatusEnum): Observable<boolean[]> {
    return this.commonService.postGeneric<any, boolean[]>(`${this.apiUrl}/UpdateTheDebtorStatus`, { rolePlayerId, debtorStatus });
  }


  //API Call in billing for now needs to be a new service
  processBillingAllocation(bulkManualAllocations: BulkManualAllocation[]): Observable<BulkManualAllocation[]> {
    return this.commonService.postGeneric<BulkManualAllocation[], BulkManualAllocation[]>(`${this.allocationUrl}/PostData`, bulkManualAllocations);
  }

  getProcessedErrorBillingAllocations(fileId: number): Observable<BulkManualAllocation[]> {
    return this.commonService.getAll<BulkManualAllocation[]>(`${this.allocationUrl}/GetDataById/${fileId}`);
  }

  getDebtorsByCompanyBranch(industryClassId: number, companyNumber: number, branchNumber: number): Observable<{ roleplayerId: number, finPayeNumber: string, displayName: string }[]> {
    return this.commonService.getAll<{ roleplayerId: number, finPayeNumber: string, displayName: string }[]>(`${this.apiUrl}/GetDebtorsByCompanyBranch/${industryClassId}/${companyNumber}/${branchNumber}`);
  }
  getBrachesByCompany(companyNumber: number): Observable<{ branchNumber: number, branchName: string }[]> {
    return this.commonService.getAll<{ branchNumber: number, branchName: string }[]>(`${this.apiUrl}/getBrachesByCompany/${companyNumber}`);
  }
  getCompanies(): Observable<{ companyNumber: number, companyName: string }[]> {
    return this.commonService.getAll<{ companyNumber: number, companyName: string }[]>(`${this.apiUrl}/GetCompanies`);
  }

  getDebtorsByCompanyBranchAndDate(companyNumber: number, branchNumber: number, startDate: Date, endDate: Date): Observable<{ roleplayerId: number, finPayeNumber: string, displayName: string, industryClassId: number }[]> {
    return this.commonService.getAll<{ roleplayerId: number, finPayeNumber: string, displayName: string, industryClassId: number }[]>(`${this.apiUrl}/GetDebtorsByCompanyBranchAndDate/${companyNumber}/${branchNumber}/${startDate.toISOString()}/${endDate.toISOString()}`);
  }

  importPremiumTransaction(fileContent: any): Observable<FileUploadResponse> {
    const url = `${this.apiUrl}/ImportSpreadsheetPremiumTransactions`;
    return this.commonService.postGeneric<any, FileUploadResponse>(url, fileContent);
  }

  getUploadedWriteOffLists(startDate: Date, endDate: Date): Observable<any[]> {
    return this.commonService.getAll<{ companyNumber: number, companyName: string }[]>(`${this.apiUrl}/GetUploadedWriteOffLists/${startDate.toISOString()}/${endDate.toISOString()}`);
  }

  getWriteOffListDetails(fileId: number): Observable<any[]> {
    return this.commonService.getAll<{ companyNumber: number, companyName: string }[]>(`${this.apiUrl}/GetWriteOffListDetails/${fileId}`);
  }

  uploadWriteOffList(writeOffs: BulkWriteOffModel[],  fileName: string): Observable<number> {
    const url = `${this.apiUrl}/uploadWriteOffList`;
    return this.commonService.postGeneric<any, number>(url, { data: writeOffs, fileName });
  }

  updateDebtorCategoryStatus(roleplayerId: number, productCategoryTypeId: number, statusId:number): Observable<boolean[]> {
    return this.commonService.postGeneric<any, boolean[]>(`${this.apiUrl}/UpdateDebtorProductCategoryStatus`, { roleplayerId, productCategoryTypeId, statusId});
  }

   searchAllowedAllocationToDebtorAccount(finPayeNumber: string): Observable<string[]> {
    return this.commonService.getAll<string[]>(`${this.apiUrl}/SearchAllowedAllocationToDebtorAccount/${finPayeNumber}`);
  }

  uploadHandoverRecon(recons: LegalCommissionRecon[]): Observable<number> {
    const url = `${this.apiUrl}/UploadHandoverRecon`;
    return this.commonService.postGeneric<any, number>(url, recons);
  }

  bulkDebtorHandover(handOverDetail: LegalHandOverDetail[], fileName: string): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.apiUrl}/BulkDebtorHandover`, {details:handOverDetail, fileName});
  }

  getAttorneysForRecon(): Observable<string[]> {
    return this.commonService.getAll<string[]>(`${this.apiUrl}/GetAttorneysForRecon`);
  }
  allocatePaymentToPolicy(request: AllocatePolicyPayment): Observable<boolean> {
    return this.commonService.postGeneric<AllocatePolicyPayment, boolean>(`${this.paymentAllocationUrl}/AllocatePaymentToPolicy`, request);
  }

  getEmployerPoliciesByRoleplayerId(roleplayerId: number, billingDate: string): Observable<PolicyBillingTransaction[]> {
    return this.commonService.getAll<PolicyBillingTransaction[]>(`${this.apiUrl}/GetDebtorsPolicyBillingInvoice/${roleplayerId}/${billingDate}`);
  }

  transferPaymentFromPolicyToPolicy(request: TransferPaymentFromPolicyToPolicyRequest): Observable<boolean> {
    return this.commonService.postGeneric<TransferPaymentFromPolicyToPolicyRequest, boolean>(`${this.paymentAllocationUrl}/TransferPaymentFromPolicyToPolicy`, request);
  }

  reversePayments(request: ReversePolicyPaymentRequest): Observable<boolean> {
    return this.commonService.postGeneric<ReversePolicyPaymentRequest, boolean>(`${this.paymentAllocationUrl}/ReversePolicyPayment`, request);
  }

  getPolicyBillingTransactions(policyId: number, billingMonth: Date): Observable<PolicyPaymentTransaction> {
    return this.commonService.getAll<PolicyPaymentTransaction>(`${this.paymentAllocationUrl}/GetPolicyPaymentTransactions/${policyId}/${billingMonth.toISOString()}`);
  }
}