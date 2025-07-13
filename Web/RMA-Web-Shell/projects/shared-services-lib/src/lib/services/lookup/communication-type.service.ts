import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { CommunicationType } from '../../../../../shared-models-lib/src/lib/lookup/communication-type';

@Injectable()
export class CommunicationTypeService {
    private apiMasterData = 'mdm/api';

    constructor(private readonly commonService: CommonService) {

    }

    getCommunicationTypes(): Observable<CommunicationType[]> {
        return this.commonService.getAll<CommunicationType[]>(`${this.apiMasterData}/CommunicationType`);
    }
}
