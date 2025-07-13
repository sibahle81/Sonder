import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { HealthCareProvider } from '../models/healthcare-provider';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreAuthPractitionerTypeSetting } from 'projects/medicare/src/app/preauth-manager/models/preAuth-PractitionerType-Setting';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';
import { HealthcareProviderAccessRights } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider-access-rights';
import { isNullOrUndefined } from 'util';
import { first } from 'rxjs/operators';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { HealthCareProviderV2 } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/medical-service-provider.model';
import { HealthCareProviderModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/healthare-provider-model';

@Injectable({
  providedIn: 'root'
})
export class HealthcareProviderService {
  private apiUrl = 'med/api/healthcareprovider';
  healthCareProvider: HealthCareProvider;
  preAuthPractitionerTypeSetting: PreAuthPractitionerTypeSetting;
  healthcareProviderPreAuthAccessRights: HealthcareProviderAccessRights;

  constructor(
    private readonly commonService: CommonService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly mediCarePreAuthService: MediCarePreAuthService
  ) {
  }

  getHealthCareProviderById(healthCareProviderId: number): Observable<HealthCareProvider> {
    return this.commonService.get<HealthCareProvider>(healthCareProviderId, `${this.apiUrl}/GetHealthCareProviderById`);
  }

  GetHealthCareProviders(): Observable<HealthCareProvider[]> {
    return this.commonService.getAll<HealthCareProvider[]>(`${this.apiUrl}/GetHealthCareProviders`);
  }

  setCurentHealthCareProviderDetailsAndAcessRights(healthCareProvider: HealthCareProvider, preAuthPractitionerTypeSetting: PreAuthPractitionerTypeSetting, healthcareProviderPreAuthAccessRights: HealthcareProviderAccessRights) {
    this.healthCareProvider = healthCareProvider;
    this.preAuthPractitionerTypeSetting = preAuthPractitionerTypeSetting;
    this.healthcareProviderPreAuthAccessRights = healthcareProviderPreAuthAccessRights;
  }

  getCurrentHealthCareProvider(): HealthCareProvider {
    return this.healthCareProvider;
  }

  search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<HealthCareProvider>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<HealthCareProvider>>(`${this.apiUrl}/Search/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  filterHealthCareProviders(filter: string): Observable<HealthCareProvider[]> {
    return this.commonService.getAll<HealthCareProvider[]>(`${this.apiUrl}/FilterHealthCareProviders/${filter}`);
  }

  searchHealthCareProvidersForInvoiceReports(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<HealthCareProvider>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<HealthCareProvider>>(`${this.apiUrl}/SearchHealthCareProvidersForInvoiceReports/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getHealthCareProviderAgreedTariff(healthCareProviderId: number, isChronic: boolean, serviceDate: string): any {
    return this.commonService.getAll<any>(`${this.apiUrl}/GetHealthCareProviderAgreedTariff/${healthCareProviderId}/${isChronic}/${serviceDate}`);
  }

  getHealthCareProviderAgreedTariffTypeIds(healthCareProviderId: number, isChronic: boolean, serviceDate: string): Observable<string> {
    return this.commonService.getString(`${this.apiUrl}/GetHealthCareProviderAgreedTariffTypeIds/${healthCareProviderId}/${isChronic}/${serviceDate}`);
  }

  searchHealthCareProviderByPracticeNumber(practiceNumber: string): Observable<HealthCareProviderModel> {
    return this.commonService.getAll<HealthCareProviderModel>(`${this.apiUrl}/SearchHealthCareProviderByPracticeNumber/${practiceNumber}`);
  }

  // <--Check if search tearm is a Hospital -->
  isFHospital(searchTerm: string): Observable<boolean> {
    const filter = encodeURIComponent(searchTerm);
    return this.commonService.getAll<boolean>(`${this.apiUrl}/IsHcpHospital/${filter}`);
  }

  getJvHealthCareProviders(): Observable<HealthCareProviderModel[]> {
    return this.commonService.getAll<HealthCareProviderModel[]>(`${this.apiUrl}/GetJvHealthCareProviders`);
  }

  searchHealthCareProviderByPracticeNumberQueryParam(practiceNumber: string): Observable<HealthCareProviderModel> {
    const urlQuery = encodeURIComponent(practiceNumber);
    return this.commonService.getAll<HealthCareProviderModel>(`${this.apiUrl}/SearchHealthCareProviderByPracticeNumberQueryParam?practiceNumber=${urlQuery}`)
    
  }

  GetCurrentUserPractitionerTypeSetting(): PreAuthPractitionerTypeSetting {
    let completed = false;
    var currentUser = this.authService.getCurrentUser();
    let currentUserHCPs: UserHealthCareProvider[];
    this.userService.getUserHealthCareProviders(currentUser.email).pipe(first()).subscribe((x) => {
      currentUserHCPs = x;
    },
      (error) => {
      },
      () => {
        if (!isNullOrUndefined(currentUserHCPs) && currentUserHCPs.length > 0) {
          this.filterHealthCareProviders(currentUserHCPs[0].practiceNumber).pipe(first())
            .subscribe(healthCareProviders => {
              if (!isNullOrUndefined(healthCareProviders) && healthCareProviders.length > 0) {
                this.healthCareProvider = healthCareProviders[0];
              }
            },
              () => { },
              () => {
                if (!isNullOrUndefined(this.healthCareProvider)) {
                  let preAuthPractitionerTypeSetting;
                  this.mediCarePreAuthService.getPreAuthPractitionerTypeSetting(PreauthTypeEnum.Hospitalization, this.healthCareProvider.providerTypeId).pipe(first()).subscribe(
                    (result) => {
                      preAuthPractitionerTypeSetting = result as unknown as PreAuthPractitionerTypeSetting;
                    },
                    (error) => { completed = true; },
                    () => {
                      completed = true;
                      if (!isNullOrUndefined(preAuthPractitionerTypeSetting)) {
                        this.preAuthPractitionerTypeSetting = preAuthPractitionerTypeSetting;
                      }
                    }
                  );
                }
              }
            );
        }
      }
    );
    return this.preAuthPractitionerTypeSetting;
  }

  getPagedHealthCareProviders(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<HealthCareProvider>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<HealthCareProvider>>(`${this.apiUrl}/GetPagedHealthCareProviders/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  addHealthCareProvider(healthCareProvider: HealthCareProviderV2): Observable<number> {
    return this.commonService.postGeneric<HealthCareProviderV2, number>(`${this.apiUrl}/AddHealthCareProvider`, healthCareProvider);
  }

  editHealthCareProvider(healthCareProvider: HealthCareProviderV2): Observable<boolean> {
    return this.commonService.edit(healthCareProvider, this.apiUrl + `/EditHealthCareProvider`);
  }

}
