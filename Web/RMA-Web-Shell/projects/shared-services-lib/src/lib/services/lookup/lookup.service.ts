// wiki: http:// bit.ly/2B31K3B
// The lookup service gets lookups from master data.

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { LookupItem } from '../../../../../shared-models-lib/src/lib/lookup/lookup-item';
import { Lookup } from '../../../../../shared-models-lib/src/lib/lookup/lookup';
import { BankBranch } from 'projects/shared-models-lib/src/lib/lookup/bank-branch';
import { ModuleSetting } from 'projects/shared-models-lib/src/lib/common/module-setting';
import { map } from 'rxjs/operators';
import { LookupValue } from 'projects/shared-models-lib/src/lib/lookup/lookup-value';

/** @description The lookup service gets lookups from master data. */
@Injectable()
export class LookupService {

  constructor(
    private readonly commonService: CommonService) {
  }

  private getLookupUrl(controller: string): string {
    const apiUrl = `mdm/api/Lookup/${controller}`;
    return apiUrl;
  }

  private getApiUrl(controller: string): string {
    const apiUrl = `mdm/api/${controller}`;
    return apiUrl;
  }

  getLookup(controller: string): Observable<Lookup[]> {
    const apiUrl = this.getLookupUrl(controller);
    return this.commonService.getAll<Lookup[]>(apiUrl);
  }

  getList(controller: string): Observable<Lookup[]> {
    const apiUrl = this.getApiUrl(controller);
    return this.commonService.getAll<Lookup[]>(apiUrl);
  }

  getLookupItem(controller: string): Observable<LookupItem[]> {
    const apiUrl = this.getApiUrl(controller);
    return this.commonService.getAll<LookupItem[]>(apiUrl);
  }

  getLookupValue(controller: string): Observable<LookupValue> {
    const apiUrl = this.getApiUrl(controller);
    return this.commonService.getAll<LookupValue>(apiUrl);
  }

  /**
   * @description Gets lookup data by a controller name and any parameters.
   * @param string controllerName The name of the api controller to call.
   * @param string param Any aditional parameters that will be passed.
   */
  getLookupWithUrl(apiUrl: string): Observable<Lookup[]> {
    return this.commonService.getAll<any[]>(apiUrl)
      .pipe(map(anyType => anyType.map(lookup => new Lookup(lookup.id, lookup.name))));
  }

  /**
   * @description Gets lookup data by a connection name and id.
   * @param string name The lookup connection name.
   * @param number id The lookup connection id.
   */

  getLookupConnectionTable(name: string, id: number): Observable<Lookup[]> {
    const apiUrl = `mdm/api/${name}`;
    return this.commonService.get<Lookup[]>(id, apiUrl);
  }

  getLookupConnectionUrl(apiUrl: string, id: number): Observable<Lookup[]> {
    return this.commonService.get<any[]>(id, apiUrl)
      // tslint:disable-next-line: no-bitwise
      .pipe(map(anyType => anyType.map(lookup => new Lookup(lookup | lookup.id, lookup.name))));
  }

  getCampaignAudienceTypes(): Observable<LookupItem[]> {
    return this.getLookupItem('CampaignAudienceType');
  }

  getIndustries(): Observable<Lookup[]> {
    return this.getList('Industry');
  }

  getCountries(): Observable<Lookup[]> {
    return this.getList('Country');
  }

  getStateProvinces(): Observable<Lookup[]> {
    return this.getList('StateProvince');
  }

  getStateProvincesByCountry(countryId: any): Observable<Lookup[]> {
    if (countryId == null || countryId === '') { countryId = 3; }
    return this.getList(`StateProvince/${countryId}`);
  }

  getBanks(): Observable<Lookup[]> {
    return this.getList('Bank');
  }

  getCities(): Observable<Lookup[]> {
    return this.getList('City');
  }

  getCitiesByProvince(provinceId: any): Observable<Lookup[]> {
    if (provinceId == null || provinceId === '') { provinceId = 3; }
    return this.getList(`City/${provinceId}`);
  }

  getLocations(): Observable<Lookup[]> {
    return this.getList('Location');
  }

  getRmaBranches(): Observable<Lookup[]> {
    return this.getList('ClaimBranch');
  }

  getSkillCategories(): Observable<Lookup[]> {
    return this.getList('SkillCategory');
  }

  getSICCodes(): Observable<Lookup[]> {
    return this.getList('NatureOfBusiness');
  }

  getNatureOfBusinessDescription(code: string): Observable<string> {
    const apiUrl = this.getApiUrl(`NatureOfBusiness/Description/${code}`);
    return this.commonService.getAll<string>(apiUrl);
  }

  getIndustriesByClass(id: number): Observable<Lookup[]> {
    const apiUrl = this.getApiUrl('IndustryClass');
    return this.commonService.get<Lookup[]>(id, apiUrl);
  }

  getBankBranch(id: number): Observable<Lookup[]> {
    const apiUrl = this.getApiUrl('BankBranch');
    return this.commonService.get<Lookup[]>(id, apiUrl);
  }

  getCityById(cityId: number): Observable<Lookup> {
    const apiUrl = this.getApiUrl('City');
    return this.commonService.get<Lookup>(cityId, `${apiUrl}/GetCityById`);
  }

  getBankBranches(): Observable<BankBranch[]> {
    const apiUrl = this.getApiUrl(`BankBranch`);
    return this.commonService.getAll<BankBranch[]>(apiUrl);
  }

  getBranchesByBank(bankId: number): Observable<Lookup[]> {
    return this.commonService.get<Lookup[]>(bankId, 'Branch/Bank');
  }

  getBank(id: number): Observable<Lookup[]> {
    const apiUrl = this.getApiUrl('Bank');
    return this.commonService.get<Lookup[]>(id, apiUrl);
  }

  getUserRoles(): Observable<Lookup[]> {
    const apiUrl = `sec/api/Role`;
    return this.commonService.getAll<Lookup[]>(apiUrl);
  }

  getRoles(): Observable<Lookup[]> {
    const apiUrl = `sec/api/Role`;
    return this.commonService.getAll<Lookup[]>(apiUrl);
  }

  getBenefits(): Observable<Lookup[]> {
    const apiUrl = 'clc/api/Product/Benefit';
    return this.commonService.getAll<Lookup[]>(apiUrl);
  }

  getAddressTypes(): Observable<Lookup[]> {
    return this.getLookup('AddressType');
  }

  getApprovalTypes(): Observable<Lookup[]> {
    return this.getLookup('ApprovalType');
  }

  getBankAccountServiceTypes(): Observable<Lookup[]> {
    return this.getLookup('BankAccountServiceType');
  }

  getBankAccountTypes(): Observable<Lookup[]> {
    return this.getLookup('BankAccountType');
  }

  getBeneficiaryTypes(): Observable<Lookup[]> {
    return this.getLookup('BeneficiaryType');
  }

  getBeneficiaryTypesById(ids: number[]): Observable<Lookup[]> {
    const idList = ids.map(id => `id=${id}`).join('&');
    const url = `${this.getLookupUrl('BeneficiaryTypes')}?${idList}`;
    return this.commonService.getAll<Lookup[]>(url);
  }

  getBenefitTypes(): Observable<Lookup[]> {
    return this.getLookup('BenefitType');
  }

  getBrokerageTypes(): Observable<Lookup[]> {
    return this.getLookup('BrokerageType');
  }

  getBrokerHouseTypes(): Observable<Lookup[]> {
    return this.getLookup('BrokerHouseType');
  }

  getCampaignCategories(): Observable<Lookup[]> {
    return this.getLookup('CampaignCategory');
  }

  getCampaignItemTypes(): Observable<Lookup[]> {
    return this.getLookup('CampaignItemType');
  }

  getCampaignStatuses(): Observable<Lookup[]> {
    return this.getLookup('CampaignStatus');
  }

  getCampaignTypes(): Observable<Lookup[]> {
    return this.getLookup('CampaignType');
  }

  getCancellationReasons(): Observable<Lookup[]> {
    return this.getLookup('CancellationReason');
  }

  getCaseStatuses(): Observable<Lookup[]> {
    return this.getLookup('CaseStatus');
  }

  getClaimTypes(): Observable<Lookup[]> {
    return this.getLookup('ClaimType');
  }

  getClaimTypesByEventAndParentInsuranceType(eventType: number, parentInsuranceId: number): Observable<Lookup[]> {
    return this.getLookup(`GetClaimTypesByEventAndParentInsuranceType/${eventType}/${parentInsuranceId}`);
  }

  getClaimTypesByEvent(eventType: number): Observable<Lookup[]> {
    return this.getLookup(`GetClaimTypesByEvent/${eventType}`);
  }

  getClientItemTypes(): Observable<Lookup[]> {
    return this.getLookup('ClientItemType');
  }

  getClientStatuses(): Observable<Lookup[]> {
    return this.getLookup('ClientStatus');
  }

  getClientTypes(): Observable<Lookup[]> {
    return this.getLookup('ClientType');
  }

  getCommunicationTypes(): Observable<Lookup[]> {
    return this.getLookup('CommunicationType');
  }

  getContactTypes(): Observable<Lookup[]> {
    return this.getLookup('ContactType');
  }

  getCoverMemberTypes(): Observable<Lookup[]> {
    return this.getLookup('CoverMemberType');
  }

  getCoverTypes(): Observable<Lookup[]> {
    return this.getLookup('CoverType');
  }

  getCoverTypesByIds(ids: number[]): Observable<Lookup[]> {
    const coverTypeIds = ids.map(id => `id=${id}`).join('&');
    const url = `mdm/api/CoverType/GetCoverTypesByIds?${coverTypeIds}`;
    return this.commonService.getAll<Lookup[]>(url);
  }
  getCoverTypesByProduct(product: string): Observable<Lookup[]> {
    const urlproduct = encodeURIComponent(product);
    const url = `mdm/api/CoverType/GetCoverTypesByProduct/${urlproduct}`;
    return this.commonService.getAll<Lookup[]>(url);
  }
  getPaymentFrequencyByIds(ids: number[]): Observable<Lookup[]> {
    const paymentFrequency = ids.map(id => `id=${id}`).join('&');
    const url = `mdm/api/PaymentMethod/GetPaymentFrequencyByIds?${paymentFrequency}`;
    return this.commonService.getAll<Lookup[]>(url);
  }

  getDeathTypes(): Observable<Lookup[]> {
    return this.getLookup('DeathType');
  }

  getDebitOrderRejectionReasons(): Observable<Lookup[]> {
    return this.getLookup('DebitOrderRejectionReason');
  }

  getDebitOrderStatuses(): Observable<Lookup[]> {
    return this.getLookup('DebitOrderStatus');
  }

  getDecisions(): Observable<Lookup[]> {
    return this.getLookup('Decision');
  }

  getDeclarationStatuses(): Observable<Lookup[]> {
    return this.getLookup('DeclarationStatus');
  }

  getDeclarationTypes(): Observable<Lookup[]> {
    return this.getLookup('DeclarationType');
  }

  getDocumentCategories(): Observable<Lookup[]> {
    return this.getLookup('DocumentCategory');
  }

  getDocumentCategoryTypes(): Observable<Lookup[]> {
    return this.getLookup('DocumentCategoryType');
  }

  getDocumentTypes(): Observable<Lookup[]> {
    return this.getLookup('DocumentType');
  }

  getEarningStatuses(): Observable<Lookup[]> {
    return this.getLookup('EarningStatus');
  }

  getEarningsTypes(): Observable<Lookup[]> {
    return this.getLookup('EarningsType');
  }

  getEarningsTypesById(ids: number[]): Observable<Lookup[]> {
    const idList = ids.map(id => `id=${id}`).join('&');
    const url = `${this.getLookupUrl('EarningsTypes')}?${idList}`;
    return this.commonService.getAll<Lookup[]>(url);
  }

  getEnquiryQueryTypes(): Observable<Lookup[]> {
    return this.getLookup('EnquiryQueryType');
  }

  getEventTypes(): Observable<Lookup[]> {
    return this.getLookup('EventType');
  }

  getFormLetterTypes(): Observable<Lookup[]> {
    return this.getLookup('FormLetterType');
  }

  getIdTypes(): Observable<Lookup[]> {
    return this.getLookup('IdType');
  }

  getImportStatuses(): Observable<Lookup[]> {
    return this.getLookup('ImportStatus');
  }

  getImportTypes(): Observable<Lookup[]> {
    return this.getLookup('ImportType');
  }

  getIndustryClasses(): Observable<Lookup[]> {
    return this.getLookup('IndustryClass');
  }

  getInsureLifeCancelReasons(): Observable<Lookup[]> {
    return this.getLookup('InsureLifeCancelReason');
  }

  getItemTypes(): Observable<Lookup[]> {
    return this.getLookup('ItemType');
  }

  getLanguages(): Observable<Lookup[]> {
    return this.getLookup('Language');
  }

  getLeadClientStatuses(): Observable<Lookup[]> {
    return this.getLookup('LeadClientStatus');
  }

  getLeadItemTypes(): Observable<Lookup[]> {
    return this.getLookup('LeadItemType');
  }

  getMedicalReportTypes(): Observable<Lookup[]> {
    return this.getLookup('MedicalReportType');
  }

  getMedicalReportTypesById(ids: number[]): Observable<Lookup[]> {
    const idList = ids.map(id => `id=${id}`).join('&');
    const url = `${this.getLookupUrl('MedicalReportTypes')}?${idList}`;
    return this.commonService.getAll<Lookup[]>(url);
  }

  getMembershipTypes(): Observable<Lookup[]> {
    return this.getLookup('MembershipType');
  }

  getNotificationTemplateTypes(): Observable<Lookup[]> {
    return this.getLookup('NotificationTemplateType');
  }

  getPaymentAllocationStatuses(): Observable<Lookup[]> {
    return this.getLookup('PaymentAllocationStatus');
  }

  getPaymentArrangementStatuses(): Observable<Lookup[]> {
    return this.getLookup('PaymentArrangementStatus');
  }

  getPaymentFrequencies(): Observable<Lookup[]> {
    return this.getLookup('PaymentFrequency');
  }

  getPaymentMethods(): Observable<Lookup[]> {
    return this.getLookup('PaymentMethod');
  }

  getPaymentRejectionTypes(): Observable<Lookup[]> {
    return this.getLookup('PaymentRejectionType');
  }

  getPaymentStatuses(): Observable<Lookup[]> {
    return this.getLookup('PaymentStatus');
  }

  getPaymentTypes(): Observable<Lookup[]> {
    return this.getLookup('PaymentType');
  }

  getPhoneTypes(): Observable<Lookup[]> {
    return this.getLookup('PhoneType');
  }

  getPolicyItemTypes(): Observable<Lookup[]> {
    return this.getLookup('PolicyItemType');
  }

  getPolicyStatuses(): Observable<Lookup[]> {
    return this.getLookup('PolicyStatus');
  }

  getProductClasses(): Observable<Lookup[]> {
    return this.getLookup('ProductClass');
  }

  getProductItemTypes(): Observable<Lookup[]> {
    return this.getLookup('ProductItemType');
  }

  getProductStatuses(): Observable<Lookup[]> {
    return this.getLookup('ProductStatus');
  }

  getProductTypes(): Observable<Lookup[]> {
    return this.getLookup('ProductType');
  }

  getCoverOptionTypes(): Observable<Lookup[]> {
    return this.getLookup('CoverOptionTypes');
  }

  getQuoteStatuses(): Observable<Lookup[]> {
    return this.getLookup('QuoteStatus');
  }

  getRateStatuses(): Observable<Lookup[]> {
    return this.getLookup('RateStatus');
  }

  getRateTypes(): Observable<Lookup[]> {
    return this.getLookup('RateType');
  }

  getRecipientTypes(): Observable<Lookup[]> {
    return this.getLookup('RecipientType');
  }

  getRegions(): Observable<Lookup[]> {
    return this.getLookup('Region');
  }

  getRepRoles(): Observable<Lookup[]> {
    return this.getLookup('RepRole');
  }

  getRepTypes(): Observable<Lookup[]> {
    return this.getLookup('RepType');
  }

  getRulesItemTypes(): Observable<Lookup[]> {
    return this.getLookup('RulesItemType');
  }

  getRuleTypes(): Observable<Lookup[]> {
    return this.getLookup('RuleType');
  }

  getSecurityItemTypes(): Observable<Lookup[]> {
    return this.getLookup('SecurityItemType');
  }

  getServiceTypes(): Observable<Lookup[]> {
    return this.getLookup('ServiceType');
  }

  getSkillSubCategories(): Observable<Lookup[]> {
    return this.getLookup('SkillSubCategory');
  }

  getTaskScheduleFrequencies(): Observable<Lookup[]> {
    return this.getLookup('TaskScheduleFrequency');
  }

  getTemplateTypes(): Observable<Lookup[]> {
    return this.getLookup('TemplateType');
  }

  getTitles(): Observable<Lookup[]> {
    return this.getLookup('Title');
  }

  getTransactionTypes(): Observable<Lookup[]> {
    return this.getLookup('TransactionType');
  }

  getSuspiciousTransactionTypes(): Observable<Lookup[]> {
    return this.getLookup('SuspiciousTransactionType');
  }


  getWordProcessingDocumentTypes(): Observable<Lookup[]> {
    return this.getLookup('WordProcessingDocumentType');
  }

  getWorkPools(): Observable<Lookup[]> {
    return this.getLookup('WorkPool');
  }

  getItemByKey(key: string): Observable<string> {
    return this.commonService.getString(`mdm/api/Configuration/GetModuleSetting/${key}`);
  }

  updateModuleSetting(moduleSetting: ModuleSetting): Observable<string> {
    return this.commonService.postGeneric<ModuleSetting, string>(`mdm/api/Configuration/SetModuleSetting`, moduleSetting);
  }

  GetModuleSettingByKeyList(keyList: ModuleSetting): Observable<ModuleSetting[]> {
    return this.commonService.postGeneric<ModuleSetting, ModuleSetting[]>(`mdm/api/Configuration/GetModuleSettingByKeyList`, keyList);
  }

  getManagePolicyTypes(): Observable<Lookup[]> {
    return this.getList('ManagePolicyType');
  }

  getInsuredLifeRemovalReasons(): Observable<Lookup[]> {
    return this.getList('InsuredLifeRemovalReason');
  }

  getPolicyCancelReasons(): Observable<Lookup[]> {
    return this.getList('PolicyCancelReason');
  }

  getCoidPolicyCancelReasons(): Observable<Lookup[]> {
    return this.getList('CoidCancellationReason');
  }

  getInvoiceStatuses(): Observable<Lookup[]> {
    return this.getLookup('InvoiceStatus');
  }

  getInsuredLifeStatuses(): Observable<Lookup[]> {
    return this.getLookup('InsuredLifeStatus');
  }

  getRolePlayerTypes(): Observable<Lookup[]> {
    return this.getLookup('RolePlayerType');
  }

  getWithHoldingReasons(): Observable<Lookup[]> {
    return this.getLookup('CommissionWithholdingReason');
  }

  getCommissionActions(): Observable<Lookup[]> {
    return this.getLookup('CommissionActionType');
  }

  getRefundReasons(): Observable<Lookup[]> {
    return this.getLookup('RefundReason');
  }

  getInsurers(): Observable<Lookup[]> {
    return this.getLookup('Insurers');
  }

  getBodySides(): Observable<Lookup[]> {
    return this.getLookup('BodySideAffected');
  }

  getInjurySeverities(): Observable<Lookup[]> {
    return this.getLookup('InjurySeverity');
  }

  getWorkOptions(): Observable<Lookup[]> {
    return this.getLookup('WorkOptions');
  }

  getAuthenticationTypes(): Observable<Lookup[]> {
    return this.getLookup('AuthenticationType');
  }

  getUserProfiletypes(): Observable<Lookup[]> {
    return this.getLookup('UserProfileTypes');
  }

  getPortalTypes(): Observable<Lookup[]> {
    return this.getLookup('PortalTypes');
  }

  getMedicalFormReportTypes(): Observable<Lookup[]> {
    return this.getLookup('MedicalFormReportType');
  }

  getMedicalReportCategories(): Observable<Lookup[]> {
    return this.getLookup('MedicalReportCategory');
  }

  getWorkItemStates(): Observable<Lookup[]> {
    return this.getLookup('WorkItemState');
  }

  getReinstateReason(): Observable<Lookup[]> {
    return this.getLookup('GetReInstateReason');
  }

  getLocationCategories(): Observable<Lookup[]> {
    return this.getLookup('GetLocationCategory');
  }

  getContactDesignationType(): Observable<Lookup[]> {
    return this.getLookup('GetContactDesignationType');
  }

  getContactInformationType(): Observable<Lookup[]> {
    return this.getLookup('GetContactInformationType');
  }

  getGenders(): Observable<Lookup[]> {
    return this.getLookup('GetGenders');
  }

  getMarriageTypes(): Observable<Lookup[]> {
    return this.getLookup('GetMarriageTypes');
  }

  getMaritalStatus(): Observable<Lookup[]> {
    return this.getLookup('GetMaritalStatus');
  }

  getNationalities(): Observable<Lookup[]> {
    return this.getLookup('GetNationalities');
  }

  getDaysOffWork(): Observable<Lookup[]> {
    return this.getLookup('DaysOffWork');
  }

  getDebitOrderTypes(): Observable<Lookup[]> {
    return this.getLookup('DebitOrderType');
  }

  getWizardStatuses(): Observable<Lookup[]> {
    return this.getLookup('WizardStatus');
  }

  GetClaimLiabilityStatuses(): Observable<Lookup[]> {
    return this.getLookup('ClaimLiabilityStatus');
  }

  getUploadedFilesProcessingStatuses(): Observable<Lookup[]> {
    return this.getLookup('UploadedFileProcessingStatus');
  }

  getLedgerStatusChangeReasons(): Observable<Lookup[]> {
    return this.getLookup('LedgerStatusChangeReasons');
  }

  getLedgerStatuses(): Observable<Lookup[]> {
    return this.getLookup('LedgerStatuses');
  }

  getInterestProvisionedStatuses(): Observable<Lookup[]> {
    return this.getLookup('InterestProvisionedStatus');
  }

  getEntryTypes(): Observable<Lookup[]> {
    return this.getLookup('EntryTypes');
  }

  getEntryChangeReasons(): Observable<Lookup[]> {
    return this.getLookup('EntryChangeReasons');
  }

  getScheduleTypes(): Observable<Lookup[]> {
    return this.getLookup('ScheduleTypes');
  }

  getEntryStatuses(): Observable<Lookup[]> {
    return this.getLookup('EntryStatuses');
  }

  getPopulationGroups(): Observable<Lookup[]> {
    return this.getLookup('PopulationGroups');
  }

  getIncreaseTypes(): Observable<Lookup[]> {
    return this.getLookup('IncreaseTypes');
  }

  getIncreaseLegislativeValues(): Observable<Lookup[]> {
    return this.getLookup('IncreaseLegislativeValues');
  }

  getPreAuthTypes(): Observable<Lookup[]> {
    return this.getLookup('PreAuthType');
  }

  getPreAuthStatuses(): Observable<Lookup[]> {
    return this.getLookup('PreAuthStatus');
  }

  getMedicalInvoiceStatuses(): Observable<Lookup[]> {
    return this.getLookup('MedicalInvoiceStatuses');
  }

  getMedicalPractitionerTypes(): Observable<Lookup[]> {
    return this.getLookup('MedicalPractitionerTypes');
  }

  getAdditionalTaxTypes(): Observable<Lookup[]> {
    return this.getLookup('AdditionalTaxTypes');
  }

  getDebtorStatuses(): Observable<Lookup[]> {
    return this.getLookup('DebtorStatuses');
  }

  getCommissionStatuses(): Observable<Lookup[]> {
    return this.getLookup('CommissionStatus');
  }

  getClaimInvoiceTypes(): Observable<Lookup[]> {
    return this.getLookup('ClaimInvoiceType');
  }

  getPeriodChangeReasons(): Observable<Lookup[]> {
    return this.getLookup('GetPeriodChangeReasons');
  }

  getDesignationTypes(filter :string): Observable<Lookup[]> {
    if(filter.length > 2){
    return this.getLookup(`GetDesignationTypes?filter=${filter}`);
    }
    else
    {
      return this.getLookup(`GetDesignationTypes`);
    }
  }

  getProductCategory(): Observable<Lookup[]> {
    return this.getLookup('ProductCategories');
  }

  getGroupCoverAmountOptions(): Observable<Lookup[]> {
    return this.getLookup('GroupCoverAmountOptions');
  }

  getCommutationSchedules(): Observable<Lookup[]> {
    return this.getLookup('CommutationSchedules');
  }

  getCommutationReasons(): Observable<Lookup[]> {
    return this.getLookup('CommutationReasons');
  }

  getUnderwrittenOptions(): Observable<Lookup[]> {
    return this.getLookup('UnderwrittenOptions');
  }

  getPolicyHolderOptions(): Observable<Lookup[]> {
    return this.getLookup('PolicyHolderOptions');
  } 

  getPersonInsuredCategoryStatuses(): Observable<Lookup[]> {
    return this.getLookup('PersonInsuredCategoryStatuses');
  } 

  getOptionTypes(brokerageType: string, effectiveDate: Date): Observable<Lookup[]> {
    return this.getLookup(`OptionType/${brokerageType}/${effectiveDate.toISOString()}`);
  }

  getPolicyOnboardOptions(): Observable<Lookup[]> {
    return this.getLookup('PolicyOnboardOptions');
  } 
  
  getClaimTypesByEventAndProductCategory(eventType: number, parentInsuranceId: number,  productCategoryType: number): Observable<Lookup[]> {
    return this.getLookup(`GetClaimTypesByEventAndProductCategory/${eventType}/${parentInsuranceId}/${productCategoryType}`);
  }
  
  getPMPRegions(): Observable<Lookup[]> {
    return this.getLookup('GetPMPRegions');
  }

  getLookUpValueByLookupTypeEnum(rateType: number, serviceDate: Date): Observable<LookupValue> {
    const apiUrl = this.getApiUrl('Lookup');
    const isoDate = serviceDate.toISOString();
    const apiParams = `${rateType}/${isoDate}`;
    return this.commonService.get<LookupValue>(apiParams, `${apiUrl}/GetLookUpValueByLookupTypeEnum`);
  }

  getDocumentRefreshReasons(): Observable<Lookup[]> {
    return this.getLookup('DocumentRefreshReasons');
  } 

  getRolePlayerItemQueryTypes(): Observable<Lookup[]> {
    return this.getLookup('RolePlayerItemQueryTypes');
  }

  getRolePlayerQueryItemTypes(): Observable<Lookup[]> {
    return this.getLookup('RolePlayerQueryItemTypes');
  }

  getRolePlayerItemQueryCategories(): Observable<Lookup[]> {
    return this.getLookup('RolePlayerItemQueryCategories');
  }
  
  getRolePlayerItemQueryStatuses(): Observable<Lookup[]> {
    return this.getLookup('RolePlayerItemQueryStatuses');
  }
}
