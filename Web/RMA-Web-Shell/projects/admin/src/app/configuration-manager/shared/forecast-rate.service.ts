import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { ForecastRate } from './forecast-rate';

@Injectable()
export class ForecastRateService {

  private apiUrl = 'bill/api/billing/Billing';
  dialogData: any;

  constructor(
    private readonly commonService: CommonService) {
  }

  getDialogData() {
    return this.dialogData;
  }

  addRate (forecastRate: ForecastRate): void {
    this.dialogData = forecastRate;
  }

  getLatestPrimeRate(): Observable<ForecastRate> {
    return this.commonService.getAll<ForecastRate>(`${this.apiUrl}/`);
  }

  getAllForecastRates(): Observable<ForecastRate[]> {
    return this.commonService.getAll<ForecastRate[]>(`${this.apiUrl}/forecastRates`);
  }

  addForecastRate(forecastRate: ForecastRate): Observable<number> {
    return this.commonService.postGeneric<ForecastRate, number>(`${this.apiUrl}/updateForecastRates`, forecastRate);
  }

}
