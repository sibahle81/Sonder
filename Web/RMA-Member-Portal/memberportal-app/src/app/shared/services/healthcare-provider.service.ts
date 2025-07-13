import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HealthCareProvider } from '../models/healthcare-provider';
import { CommonService } from '../../core/services/common/common.service';
import { HealthCareProviderModel } from '../models/healthare-provider-model';

@Injectable({
  providedIn: 'root'
})
export class HealthCareProviderService {
  private apiUrl = 'med/api/healthcareprovider';

  constructor(
    private readonly commonService: CommonService) {
  }

  searchHealthCareProviderByPracticeNumber(practiceNumber: string): Observable<HealthCareProvider> {
    return this.commonService.getAll<HealthCareProvider>(`${this.apiUrl}/SearchHealthCareProviderByPracticeNumber/${practiceNumber}`);
  }

  searchHealthCareProviderByPracticeNumberQueryParam(practiceNumber: string): Observable<HealthCareProviderModel> {
    const urlQuery = encodeURIComponent(practiceNumber);
    return this.commonService.getAll<HealthCareProviderModel>(`${this.apiUrl}/SearchHealthCareProviderByPracticeNumberQueryParam?practiceNumber=${urlQuery}`)

  }

}
