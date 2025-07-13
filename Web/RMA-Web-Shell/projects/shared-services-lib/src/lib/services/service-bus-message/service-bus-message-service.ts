import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { ServiceBusMessage } from 'projects/shared-models-lib/src/lib/common/service-bus-message';

@Injectable()
export class ServiceBusMessageService {

  private apiServiceBus = `mdm/api/ServiceBusMessage`;

  constructor(
    private readonly commonService: CommonService) {
  }

  getUnProcessedSTPMessages(): Observable<ServiceBusMessage[]> {
    return this.commonService.getAll<ServiceBusMessage[]>(`${this.apiServiceBus}/GetUnProcessedSTPMessages`);
  }

}

