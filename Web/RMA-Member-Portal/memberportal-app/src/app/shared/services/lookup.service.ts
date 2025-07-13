// wiki: http:// bit.ly/2B31K3B
// The lookup service gets lookups from master data.

import { Injectable } from '@angular/core';

import { CommonService } from '../../core/services/common/common.service';
// tslint:disable-next-line: import-blacklist
import { ConstantApi } from '../constants/constant';
import { Lookup } from '../models/lookup.model';
import { BankBranch } from '../models/bank-branch';
import { Bank } from '../models/bank';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'


/** @description The lookup service gets lookups from master data. */
@Injectable()
export class LookupService {
  constructor(
    private readonly commonService: CommonService) {
  }

  /**
   * @description Gets lookup data by a controller name and any parameters.
   * @param string controllerName The name of the api controller to call.
   * @param string param Any aditional parameters that will be passed.
   */
  getLookupWithUrl(apiUrl: string): Observable<Lookup[]> {
    return this.commonService.getAll<any[]>(apiUrl)
      .map(anyType => anyType.map(lookup => new Lookup(lookup.id, lookup.name)));
  }

  getLookup(controller: string): Observable<Lookup[]> {
    const apiUrl = this.getLookupUrl(controller);
    return this.commonService.getAll<Lookup[]>(apiUrl);
  }

  getBankLookup(controller: string): Observable<Bank[]> {
    const apiUrl = `${ConstantApi.BankUrl}`
    return this.commonService.getAll<Bank[]>(apiUrl);
  }

  getUserRegistrationLookup(controller: string): Observable<Lookup[]> {
    const apiUrl = this.getUserRegistrationLookupUrl(controller);
    return this.commonService.getAll<Lookup[]>(apiUrl);
  }

  private getLookupUrl(controller: string): string {
    const apiUrl = `${ConstantApi.LookupUrl}/${controller}`;
    return apiUrl;
  }

  private getUserRegistrationLookupUrl(controller: string): string {
    const apiUrl = `${ConstantApi.UserRegistration}/${controller}`;
    return apiUrl;
  }

  getLookupConnectionUrl(apiUrl: string, id: number): Observable<Lookup[]> {
    return this.commonService.get<any[]>(id, apiUrl)
      // tslint:disable-next-line: no-bitwise
      .map(anyType => anyType.map(lookup => new Lookup(lookup | lookup.id, lookup.name)));
  }

  getBankAccountTypes(): Observable<Lookup[]> {
    return this.getLookup('BankAccountType');
  }

  getCoverTypes(): Observable<Lookup[]> {
    return this.getLookup('CoverType');
  }

  getCommunicationTypes(): Observable<Lookup[]> {
    return this.getLookup('CommunicationType');
  }

  getInsuredLifeRemovalReasons(): Observable<Lookup[]> {
    return this.getLookup('InsureLifeCancelReason');
  }

  getInsurers(): Observable<Lookup[]> {
    return this.getLookup('Insurers');
  }

  getPaymentFrequencies(): Observable<Lookup[]> {
    return this.getLookup('PaymentFrequency');
  }

  getCountries(): Observable<Lookup[]> {
    return this.getUserRegistrationLookup('GetCountries');
  }

  getPaymentMethods(): Observable<Lookup[]> {
    return this.getLookup('PaymentMethod');
  }

  getLocations(): Observable<Lookup[]> {
    return this.getUserRegistrationLookup('GetStateProvincesByCountry');
  }

  getStateProvincesByCountry(countryId: any): Observable<Lookup[]> {
    if (countryId == null || countryId === '') { countryId = 3; }
    return this.getUserRegistrationLookup(`GetStateProvincesByCountry/${countryId}`);
  }

  getBanks(): Observable<Bank[]> {
    return this.getBankLookup('Bank');
  }

  /**
* Able to reach GetBanks backend method without any authentication ( to avoid HTTP 401 Unauthorized client error response status code).
* @returns List of banks as result.
*/
  getBanksAnon(): Observable<Lookup[]> {
    return this.getUserRegistrationLookup('GetBanks');
  }

  getCityByProvinceId(provinceId: any): Observable<Lookup[]> {
    if (provinceId == null || provinceId === '') { provinceId = 3; }
    return this.getUserRegistrationLookup(`GetCityByProvince/${provinceId}`);
  }

  getBankBranches(): Observable<BankBranch[]> {
    const apiUrl = `mdm/api/BankBranch`;
    return this.commonService.getAll<BankBranch[]>(apiUrl);
  }

  /**
* Able to reach GetBankBranches backend method without any authentication ( to avoid HTTP 401 Unauthorized client error response status code).
* @returns List of BankBranch as result.
*/
  getBankBranchesAnon(): Observable<Lookup[]> {
    return this.getUserRegistrationLookup('GetBankBranches');
  }

  getLookupConnectionTable(name: string, id: number): Observable<Lookup[]> {
    const apiUrl = `${ConstantApi.LookupConnectionTable}/${name}`;
    return this.commonService.get<Lookup[]>(id, apiUrl);
  }

  getItemByKey(key: string): Observable<string> {
    return this.commonService.getString(`${ConstantApi.ConfigurationApiUrl}/GetModuleSetting/${key}`);
  }

  getItemByKeyAnon(key: string): Observable<string> {
    return this.commonService.getString(`${ConstantApi.ConfigurationApiUrl}/GetModuleSettingAnon/${key}`);
  }

  getUserItemByKey(key: string): Observable<string> {
    return this.commonService.getString(`${ConstantApi.UserRegistration}/GetModuleSetting/${key}`);
  }

  getAddressTypes(): Observable<Lookup[]> {
    return this.getLookup('AddressType');
  }

  getUserRegistrationAddressTypes(): Observable<Lookup[]> {
    return this.getUserRegistrationLookup('AddressType');
  }

  getIdTypes(): Observable<Lookup[]> {
    return this.getLookup('IdType');
  }

  getIndustryClasses(): Observable<Lookup[]> {
    return this.getLookup('IndustryClass');
  }

  getUserRegistrationIdTypes(): Observable<Lookup[]> {
    return this.getUserRegistrationLookup('IdType');
  }

  getCities(): Observable<Lookup[]> {
    return this.getUserRegistrationLookup('City');
  }

  getPolicyCancelReasons(): Observable<Lookup[]> {
    return this.getLookup('PolicyCancelReason');
  }

  isFeatureFlagSettingEnabled(key: string): Observable<boolean> {
    return this.commonService.getBoolean(`${ConstantApi.ConfigurationApiUrl}/IsFeatureFlagSettingEnabled/${key}`);
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
}
