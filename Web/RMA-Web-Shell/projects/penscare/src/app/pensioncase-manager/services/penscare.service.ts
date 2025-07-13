import { Injectable } from '@angular/core';
import { forkJoin, Observable, Subject, Subscription } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Person } from 'projects/shared-components-lib/src/lib/models/person.model';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { PenscareLookups } from '../../shared-penscare/models/penscare-lookups';
import { InitiatePensionCaseData } from '../../shared-penscare/models/initiate-pensioncase-data.model';
import { PensionLedger } from 'projects/shared-components-lib/src/lib/models/pension-ledger.model';
import { PensionCase, PensionClaim } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';
import { PensCareNote } from '../../shared-penscare/models/penscare-note';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { Pagination } from 'projects/shared-models-lib/src/lib/pagination/pagination';
import { CorrectiveEntry } from 'projects/shared-components-lib/src/lib/models/corrective-entry.model';
import { LedgerBankingDetail } from 'projects/shared-components-lib/src/lib/models/ledger-banking-details.model';
import { PensionCaseModel } from '../../shared-penscare/models/pension-case-model';

@Injectable({
  providedIn: 'root'
})
export class PensCareService {
  private apiUrl = 'pen/api/PensionCase';
  private recipients: Person[] = [];
  private beneficiaries: Person[] = [];
  private emitChangeSource = new Subject<any>();
  private updateRecipientModelSource = new Subject<InitiatePensionCaseData>();
  private updateBeneficiaryModelSource = new Subject<InitiatePensionCaseData>();
  private lookupsLoaded = false;
  private lookupsSubscription: Subscription;
  private penscareLookupsCache: PenscareLookups;

  changeEmmited$ = this.emitChangeSource.asObservable();
  updateRecipientModelEmmited$ = this.updateRecipientModelSource.asObservable();
  updateBeneficiaryModelEmmited$ = this.updateBeneficiaryModelSource.asObservable();

  constructor(
    private readonly commonService: CommonService,
    private lookupService: LookupService) {
  }

  emitChange(change: string) {
    this.emitChangeSource.next(change);
  }

  emitUpdateRecipientModel(model: InitiatePensionCaseData) {
    this.updateRecipientModelSource.next(model);
  }

  emitUpdateBeneficiaryModel(model: InitiatePensionCaseData) {
    this.updateBeneficiaryModelSource.next(model);
  }

  getRecipients(): Person[] {
    return this.recipients;
  }

  setRecipients(recipients: Person[]) {
    this.recipients = recipients;
  }

  getBeneficiaries(): Person[] {
    return this.beneficiaries;
  }

  setBeneficiaries(beneficiaries: Person[]) {
    this.beneficiaries = beneficiaries;
  }

  getPensCareLookupsCache(): PenscareLookups {
    return this.penscareLookupsCache
  }

  setPensCareLookupsCache(pensCareLookupsCache: PenscareLookups) {
    this.penscareLookupsCache = pensCareLookupsCache;
  }

  loadLookupsCache() {
    if(!this.penscareLookupsCache) {
      this.lookupsLoaded = true

      let genders = this.lookupService.getGenders();
      let languages = this.lookupService.getLanguages();
      let provinces = this.lookupService.getStateProvinces();
      let maritalStatus = this.lookupService.getMaritalStatus();
      let idTypes = this.lookupService.getIdTypes();
      let countries = this.lookupService.getCountries();
      let beneficiaryTypes = this.lookupService.getBeneficiaryTypes();
      let titles =  this.lookupService.getTitles();
      let communicationTypes = this.lookupService.getCommunicationTypes();
      let benefitTypes = this.lookupService.getBenefitTypes();
      let populationGroups = this.lookupService.getPopulationGroups();
      let marriageTypes = this.lookupService.getMarriageTypes();
      let designationTypes = this.lookupService.getDesignationTypes('');
      this.lookupsSubscription = forkJoin([genders,
        languages,
        provinces,
        maritalStatus,
        idTypes,
        countries,
        beneficiaryTypes,
        titles,
        communicationTypes,
        benefitTypes,
        populationGroups,
        marriageTypes,
        designationTypes
      ]).subscribe(
        responseList => {
          this.setPensCareLookupsCache({
            genders: responseList[0],
            languages : responseList[1],
            provinces : responseList[2],
            maritalStatus : responseList[3],
            idTypes : responseList[4],
            countries : responseList[5],
            beneficiaryTypes : responseList[6],
            titles : responseList[7],
            communicationTypes : responseList[8],
            benefitTypes: responseList[9],
            populationGroups: responseList[10],
            marriageTypes: responseList[11],
            designationTypes: responseList[12]
          });
          this.emitChange('lookupsCacheLoaded');
        }
      );
    } else {
      this.emitChange('lookupsCacheLoaded');
    }
  }

  public getPensionLedgersByPensionCaseId(id: number): Observable<PensionLedger[]> {
    return this.commonService.get<PensionLedger[]>(id, `${this.apiUrl}/GetPensionLedgers`);
  }

  public getCommutationLedgersId(id: number): Observable<PensionLedger[]> {
    return this.commonService.get<PensionLedger[]>(id, `${this.apiUrl}/GetCommutationLedgersById`);
  }

  public getPensionCase(id: number): Observable<PensionCase> {
    return this.commonService.get<PensionCase>(id, `${this.apiUrl}/GetPensionCaseData`);
  }

  public getPensionerByPensionCaseId(id: number): Observable<Person> {
    return this.commonService.get<Person>(id, `${this.apiUrl}/GetPensionerData`);
  }

  public getBeneficiariesByPensionCaseId(id: number): Observable<Person[]> {
    return this.commonService.get<Person[]>(id, `${this.apiUrl}/GetBeneficiariesData`);
  }

  public getRecipientsByPensionCaseId(id: number): Observable<Person[]> {
    return this.commonService.get<Person[]>(id, `${this.apiUrl}/GetRecipientsData`);
  }

  public getBankingDetailsByPensionCaseId(id: number): Observable<RolePlayerBankingDetail[]> {
    return this.commonService.get<RolePlayerBankingDetail[]>(id, `${this.apiUrl}/GetBankingDetailsData`);
  }

  public getNotes(id: number, itemType: string): Observable<PensCareNote[]> {
    return this.commonService.get<PensCareNote[]>(itemType, `${this.apiUrl}/GetNotes/${id}`);
  }

  public getBeneficiaryDetails(id: number): Observable<Person> {
    return this.commonService.get<Person>(id, `${this.apiUrl}/GetBeneficiaryById`);
  }

  public getRecipientDetails(id: number): Observable<Person> {
    return this.commonService.get<Person>(id, `${this.apiUrl}/GetRecipientById`);
  }

  public getClaimsByPensionCaseId(id: number): Observable<PensionClaim[]> {
    return this.commonService.getAll<PensionClaim[]>(`${this.apiUrl}/GetClaimsData/${id}/false`);
  }

  public GetPensionCaseClaimsByPensionCaseId(id: number): Observable<PensionClaim[]> {
    return this.commonService.get<PensionClaim[]>(id, `${this.apiUrl}/GetPensionCaseClaimsByPensionCase`);
  }  

  public searchPensionCaseCorrectiveEntriesPagingPagedRequestResult(query: string, pagination: Pagination, pensionCaseId: number): Observable<PagedRequestResult<CorrectiveEntry>> {
    const searchTerm = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<CorrectiveEntry>>(`${this.apiUrl}/GetCorrectiveEntriesByPensionCase/${pagination.pageNumber}/${pagination.pageSize}/pensionCaseId/${!pagination.isAscending ? 'asc' : 'desc'}/${pensionCaseId}/${searchTerm}` );
  }

  public getBankingMulitpleDetails() {
    return this.commonService.getAll<LedgerBankingDetail[]>(`${this.apiUrl}/GetMultipleBankingDetails/` );
  }

  public searchPensionCases(query: string, pagination: Pagination): Observable<PagedRequestResult<PensionCaseModel>> {
    const searchTerm = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<PensionCaseModel>>(`${this.apiUrl}/GetPensionCases/${pagination.pageNumber}/${pagination.pageSize}/${searchTerm}`);
  }
}
