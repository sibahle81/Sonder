import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { UniqueValidationRequest } from './unique-validation-request';
import { Observable } from 'rxjs';

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

  checkExists(table: string, field: string, serviceType: ServiceTypeEnum, value: string, optionalValue: string = 'default'): Observable<boolean> {
    let apiUrl = this.defaultApiUrl;
    const uniqueValidationRequest = new UniqueValidationRequest(field, table, value, optionalValue);
    switch (serviceType) {
      case ServiceTypeEnum.ProductManager:
          apiUrl = this.productApiUrl;
          break;
      case ServiceTypeEnum.ClientManager:
          apiUrl = this.clientApiUrl;
          break;
      case ServiceTypeEnum.PolicyManager:
          apiUrl = this.policyApiUrl;
          break;
        default:
          apiUrl = this.defaultApiUrl;
          break;
    }
    return this.commonService.postGeneric<UniqueValidationRequest, boolean>(apiUrl, uniqueValidationRequest);
  }

}
