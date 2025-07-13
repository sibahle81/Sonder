import { Injectable } from "@angular/core";
import { CommonService } from "projects/shared-services-lib/src/lib/services/common/common.service";
import { Observable } from "rxjs";
import { TaxRebate } from "../models/tax-rebate.model";
import { AdditionalTax } from "../../pensioncase-manager/models/additional-tax.model";
import { CalculateTaxRequest } from "../models/calculate-tax-request.model";
import { CalculateTaxResponse } from "../models/calculate-tax-response.model";
import { TaxRate } from "../models/tax-rate.model";


@Injectable({
  providedIn: 'root'
})
export class PensionTaxService {

  private apiUrl = 'pen/api/PensionTax';

  taxRebates = [
    {
      year : 2023,
      primary: 16425,
      secondary: 9000,
      tertiary: 2997
    },
    {
      year : 2022,
      primary: 15714,
      secondary: 8613,
      tertiary: 2871
    },
    {
      year : 2021,
      primary: 14958,
      secondary: 8199,
      tertiary: 2736
    },
    {
      year : 2020,
      primary: 14220,
      secondary: 7794,
      tertiary: 2601
    },
    {
      year : 2019,
      primary: 14067,
      secondary: 7713,
      tertiary: 2574
    }

  ]

  constructor(
    private readonly commonService: CommonService) {
  }

  public getTaxRebates(): Observable<TaxRebate[]> {
    return this.commonService.getAll<TaxRebate[]>(`${this.apiUrl}/GetTaxRebates`);
  }

  public getTaxRebatesByYear(year: number): Observable<TaxRebate> {
    return this.commonService.getAll<TaxRebate>(`${this.apiUrl}/GetTaxRebatesByYear/${year}`);
  }

  public getTaxRates(searchString): Observable<TaxRate[]> {
    return this.commonService.getAll<TaxRate[]>(`${this.apiUrl}/GetTaxRates/${searchString}`);
  }

  public calculateTax(calculateTaxRequest: CalculateTaxRequest): Observable<CalculateTaxResponse> {
    return this.commonService.postGeneric<CalculateTaxRequest, CalculateTaxResponse>(`${this.apiUrl}/CalculateTax`, calculateTaxRequest);
  }

  public getAdditionalTax(ledger: number): Observable<AdditionalTax> {
    return this.commonService.getAll<AdditionalTax>(`${this.apiUrl}/GetAdditionalTax/${ledger}`);
  }
}
