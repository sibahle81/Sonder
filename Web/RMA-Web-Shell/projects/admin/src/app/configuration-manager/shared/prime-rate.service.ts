import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { PrimeRate } from './prime-rate';

@Injectable()
export class PrimeRateService {

  private apiUrl = 'mdm/api/PrimeRate';
  dialogData: any;

  constructor(
    private readonly commonService: CommonService) {
  }

  getDialogData() {
    return this.dialogData;
  }

  addRate (primeRate: PrimeRate): void {
    this.dialogData = primeRate;
  }

  getLatestPrimeRate(): Observable<PrimeRate> {
    return this.commonService.getAll<PrimeRate>(`${this.apiUrl}/`);
  }

  getHistory(): Observable<PrimeRate[]> {
    return this.commonService.getAll<PrimeRate[]>(`${this.apiUrl}/history`);
  }

  addPrimeRate(primeRate: PrimeRate): Observable<number> {
    return this.commonService.postGeneric<PrimeRate, number>(this.apiUrl, primeRate);
  }

}
