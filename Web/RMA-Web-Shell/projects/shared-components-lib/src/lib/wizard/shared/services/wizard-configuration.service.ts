import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { WizardConfiguration } from './../models/wizard-configuration';

@Injectable({
  providedIn: 'root'
})
export class WizardConfigurationService {
  private apiUrl = 'bpm/api/WizardConfiguration';

  constructor(
    private readonly commonService: CommonService) {
  }

  getWizardConfiguration(id: number): Observable<WizardConfiguration> {
    return this.commonService.get<WizardConfiguration>(id, this.apiUrl +"/GetConfiguration");
  }

  getWizardConfigurationByIds(wizardConfigIds: string): Observable<WizardConfiguration[]> {
    if (wizardConfigIds != null && wizardConfigIds !== '') {
      const param = encodeURIComponent(wizardConfigIds);
      return this.commonService.getAll<WizardConfiguration[]>(`${this.apiUrl}/GetWizardConfigurationByIds/${param}`);
    }
  }
}
