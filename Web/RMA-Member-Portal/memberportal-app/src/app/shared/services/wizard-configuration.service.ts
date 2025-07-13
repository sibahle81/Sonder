import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { ConstantApi } from '../constants/constant';
import { WizardConfiguration } from '../models/wizard-configuration.model';



@Injectable({
  providedIn: 'root'
})
export class WizardConfigurationService {

  constructor(
    private readonly commonService: CommonService) {
  }

  getWizardConfiguration(id: number): Observable<WizardConfiguration> {
    return this.commonService.get<WizardConfiguration>(id, ConstantApi.WizardConfigurationApiUrl + '/GetConfiguration');
  }
}
