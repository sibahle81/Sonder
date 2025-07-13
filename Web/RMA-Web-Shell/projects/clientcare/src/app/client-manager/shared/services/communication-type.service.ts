import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommunicationType } from '../Entities/communication-type';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

@Injectable()
export class CommunicationTypeService{
    private apiMasterData = 'mdm/api';

    constructor(private readonly commonService: CommonService) {
             
    }

    getCommunicationTypes(): Observable<CommunicationType[]> {
        return this.commonService.getAll<CommunicationType[]>(`${this.apiMasterData}/CommunicationType`);
    }
}