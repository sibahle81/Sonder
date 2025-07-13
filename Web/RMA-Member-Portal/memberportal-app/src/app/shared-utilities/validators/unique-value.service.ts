import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonService } from '../../core/services/common/common.service';
import { ServiceType } from '../../shared/enums/service-type.enum';
import { UniqueValidationRequest } from './unique-validation-request';
@Injectable({
  providedIn: 'root'
})
export class UniqueValueService {
  private readonly defaultApiUrl = 'sec/api/UniqueValidation';
  private readonly productApiUrl = 'clc/api/Product/UniqueValidation';
  private readonly clientApiUrl = 'clc/api/Client/UniqueValidation';
  private readonly policyApiUrl = 'clc/api/Policy/UniqueValidation';
  constructor(
    private readonly commonService: CommonService) {
  }

  checkExists(table: string, field: string, serviceType: ServiceType, value: string, optionalValue: string = 'default'): Observable<boolean> {
    let apiUrl = this.defaultApiUrl;
    const uniqueValidationRequest = new UniqueValidationRequest(field, table, value, optionalValue);
    switch (serviceType) {
      case ServiceType.ProductManager:
          apiUrl = this.productApiUrl;
          break;
      case ServiceType.ClientManager:
          apiUrl = this.clientApiUrl;
          break;
      case ServiceType.PolicyManager:
          apiUrl = this.policyApiUrl;
          break;
        default:
          apiUrl = this.defaultApiUrl;
          break;
    }
    return this.commonService.add(uniqueValidationRequest, apiUrl);
  }

}
